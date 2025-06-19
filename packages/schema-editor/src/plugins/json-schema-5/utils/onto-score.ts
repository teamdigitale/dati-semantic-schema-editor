import { fromJS, Map } from 'immutable';
import { resolveJsonldContext } from '../../jsonld-context/resolve-jsonld-context';
import { resolvePropertyByJsonldContext } from './jsonld-resolver';
import { resolveOpenAPISpec } from './openapi-resolver';

export class ResolvedPropertiesGroups {
  valid: string[] = [];
  unknown: string[] = [];
}

export async function determinePropertiesToValidate(jsonldContext: Map<any, any>, propertiesPaths: string[][]) {
  const resolvedProperties = await Promise.all(
    propertiesPaths.map((propertyPath) => resolvePropertyByJsonldContext(jsonldContext, propertyPath)),
  );
  const resolvedPropertiesFieldUris = resolvedProperties.map((x) => x.fieldUri as string);
  const resolvedPropertiesGroups: ResolvedPropertiesGroups = resolvedPropertiesFieldUris.reduce((groups, fieldUri) => {
    if (fieldUri?.startsWith('@')) {
      groups.valid = [...groups.valid.filter((x) => x !== fieldUri), fieldUri];
    } else if (fieldUri) {
      groups.unknown = [...groups.unknown.filter((x) => x !== fieldUri), fieldUri];
    }
    return groups;
  }, new ResolvedPropertiesGroups());

  return resolvedPropertiesGroups;
}

export function buildOntoScoreSparqlQuery(properties: string[]) {
  return `
    SELECT (COUNT(DISTINCT  ?fieldUri) as ?count) WHERE {
      VALUES ?fieldUri { ${properties.map((propertyName) => `<${propertyName}>`).join(' ')} }

      ?fieldUri
        rdfs:range ?class
      .
    }
  `;
}

export async function fetchValidOntoScorePropertiesCount(properties: string[], options: { sparqlUrl: string }) {
  const sparqlQuery = buildOntoScoreSparqlQuery(properties);
  const endpoint = `${options.sparqlUrl?.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
  const response = await fetch(endpoint, { cache: 'force-cache' });
  if (!response.ok) {
    return 0;
  }
  const sparqlData = await response.json();
  return parseInt(sparqlData?.results?.bindings?.[0]?.count?.value || '0');
}

export const calculateGlobalOntoscore = async (specJson: any, options: { sparqlUrl: string }) => {
  const resolvedSpecJson = await resolveOpenAPISpec(specJson);
  const resolvedSpecOrderedMap = fromJS(resolvedSpecJson);

  // Extract all data models from spec
  const dataModels = resolvedSpecOrderedMap.getIn(['components', 'schemas']) as Map<any, any> | undefined;
  if (!dataModels) {
    throw 'No #/components/schemas models provided';
  }

  // Calculate specific and global ontoscores
  let globalOntoScoreModels = 0;
  let globalOntoScoreSum = 0;

  const setOntoscoreValue = (dataModelKey: string, value: number) => {
    resolvedSpecJson['components']['schemas'][dataModelKey]['x-ontoscore'] = value;
    globalOntoScoreSum += value;
    globalOntoScoreModels++;
  };

  // Process every datamodel
  for (const [dataModelKey, dataModel] of dataModels.entries()) {
    // Filter only data models with type "object"
    const isObject = (dataModel.get('type', '') as string | undefined)?.toLowerCase() === 'object';
    if (!isObject) {
      continue;
    }

    // Extract x-jsonld-context if present
    const jsonldContext = resolveJsonldContext(dataModel)?.get('@context');
    if (!jsonldContext) {
      setOntoscoreValue(dataModelKey, 0);
      continue;
    }

    // Determine data model's properties to use for ontoscore calculation
    const propertiesPaths: string[][] =
      dataModel
        .get('properties')
        ?.keySeq()
        .toArray()
        .map((x) => [x]) || [];

    // Determine properties to validate
    const { valid: validPropertiesPaths, unknown: unknownPropertiesPaths } = await determinePropertiesToValidate(
      jsonldContext,
      propertiesPaths,
    );

    // Execute sparql fetch to check if mapped onto-properties are correct
    const sparqlResultCount = await fetchValidOntoScorePropertiesCount(unknownPropertiesPaths, {
      sparqlUrl: options.sparqlUrl,
    });
    const semanticPropertiesCount = validPropertiesPaths.length + sparqlResultCount;
    const rawPropertiesCount = propertiesPaths?.length;
    const score = rawPropertiesCount > 0 ? semanticPropertiesCount / rawPropertiesCount : 0;

    setOntoscoreValue(dataModelKey, score);
  }

  // Setting global onto score (calculated as an average ontoscore value)
  if (!resolvedSpecJson['info']) {
    resolvedSpecJson['info'] = {};
  }
  const globalOntoScore = globalOntoScoreSum / globalOntoScoreModels;
  resolvedSpecJson['info']['x-ontoscore'] = globalOntoScore;

  return {
    resolvedSpecJson,
    globalOntoScore,
  };
};
