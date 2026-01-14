import { fromJS, Map } from 'immutable';
import { resolveJsonldContext } from '../jsonld';
import { resolveOpenAPISpec } from '../openapi';
import { resolvePropertyByJsonldContext } from '../jsonld';

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

export function buildSemanticScoreSparqlQuery(properties: string[]) {
  return `
    SELECT (COUNT(DISTINCT  ?fieldUri) as ?count) WHERE {
      VALUES ?fieldUri { ${properties.map((propertyName) => `<${propertyName}>`).join(' ')} }

      ?fieldUri [] [] .
    }
  `;
}

export async function fetchValidSemanticScorePropertiesCount(properties: string[], options: { sparqlUrl: string }) {
  const sparqlQuery = buildSemanticScoreSparqlQuery(properties);
  const endpoint = `${options.sparqlUrl?.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
  const response = await fetch(endpoint, { cache: 'force-cache' });
  if (!response.ok) {
    return 0;
  }
  const sparqlData = await response.json();
  return parseInt(sparqlData?.results?.bindings?.[0]?.count?.value || '0');
}

export async function calculateSchemaSemanticScore(specJson: any, options: { sparqlUrl: string }) {
  const resolvedSpecJson = await resolveOpenAPISpec(specJson);
  const resolvedSpecOrderedMap = fromJS(resolvedSpecJson);

  // Extract all data models from spec
  const dataModels = resolvedSpecOrderedMap.getIn(['components', 'schemas']) as Map<any, any> | undefined;
  if (!dataModels) {
    throw 'No #/components/schemas models provided';
  }

  // Calculate specific and schema semantic scores
  let schemaSemanticScoreModels = 0;
  let schemaSemanticScoreSum = 0;

  const setSemanticScoreValue = (dataModelKey: string, value: number) => {
    resolvedSpecJson['components']['schemas'][dataModelKey]['x-semantic-score'] = value;
    schemaSemanticScoreSum += value;
    schemaSemanticScoreModels++;
  };

  // Process every datamodel
  for (const [dataModelKey, dataModel] of dataModels.entries()) {
    // Filter only data models with type "object"
    const isObject = (dataModel.get('type', '') as string | undefined)?.toLowerCase() === 'object';
    if (!isObject) {
      continue;
    }

    // Extract x-jsonld-context if present
    if (!dataModel.has('x-jsonld-context')) {
      setSemanticScoreValue(dataModelKey, 0);
      continue;
    }

    // Extract x-jsonld-context if present
    const jsonldContext = resolveJsonldContext(dataModel)?.get('@context');
    if (!jsonldContext) {
      setSemanticScoreValue(dataModelKey, 0);
      continue;
    }

    // Determine data model's properties to use for semantic score calculation
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
    let sparqlResultCount = 0;
    if (unknownPropertiesPaths.length > 0) {
      sparqlResultCount = await fetchValidSemanticScorePropertiesCount(unknownPropertiesPaths, {
        sparqlUrl: options.sparqlUrl,
      });
    }
    const semanticPropertiesCount = validPropertiesPaths.length + sparqlResultCount;
    const rawPropertiesCount = propertiesPaths?.length;
    const score = rawPropertiesCount > 0 ? semanticPropertiesCount / rawPropertiesCount : 0;

    setSemanticScoreValue(dataModelKey, score);
  }

  // Setting schema semantic score (calculated as an average semantic score value)
  if (!resolvedSpecJson['info']) {
    resolvedSpecJson['info'] = {};
  }
  const schemaSemanticScore = Number((schemaSemanticScoreSum / schemaSemanticScoreModels).toFixed(2)); // Force two decimals, while preserving number type
  resolvedSpecJson['info']['x-semantic-score'] = schemaSemanticScore;
  resolvedSpecJson['info']['x-semantic-score-timestamp'] = Date.now();

  return {
    resolvedSpecJson,
    schemaSemanticScore,
  };
}
