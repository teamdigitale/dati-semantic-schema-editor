import { fromJS, Map } from 'immutable';
import { resolveJsonldContext, resolvePropertyByJsonldContext } from '../jsonld';
import { resolveOpenAPISpec } from '../openapi';
import { ModelCalculationDetails, Summary } from './models';

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
    SELECT DISTINCT ?fieldUri WHERE {
      VALUES ?fieldUri { ${properties.map((propertyName) => `<${propertyName}>`).join(' ')} }
      ?fieldUri [] [] .
    }
  `;
}

export async function fetchValidSemanticScoreProperties(
  properties: string[],
  options: { sparqlUrl: string },
): Promise<string[]> {
  const sparqlQuery = buildSemanticScoreSparqlQuery(properties);
  const endpoint = `${options.sparqlUrl?.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
  const response = await fetch(endpoint, { cache: 'force-cache' });
  if (!response.ok) {
    return [];
  }
  const sparqlData = await response.json();
  return sparqlData?.results?.bindings?.map((x) => x.fieldUri.value) || [];
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
  let rawModelsCount = 0;
  let positiveScoreModelsCount = 0;
  let schemaSemanticScoreSum = 0;
  const calculationDetails: ModelCalculationDetails[] = [];

  const setSingleModelSemanticScoreValue = ({
    modelName,
    score,
    hasAnnotations,
    validPropertiesPaths,
    invalidPropertiesPaths,
  }: ModelCalculationDetails) => {
    resolvedSpecJson['components']['schemas'][modelName]['x-semantic-score'] = score;
    schemaSemanticScoreSum += score;
    rawModelsCount++;
    if (score > 0) {
      positiveScoreModelsCount++;
    }
    calculationDetails.push({
      modelName,
      score,
      hasAnnotations,
      validPropertiesPaths,
      invalidPropertiesPaths,
    });
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
      setSingleModelSemanticScoreValue({
        modelName: dataModelKey,
        score: 0,
        hasAnnotations: false,
        validPropertiesPaths: [],
        invalidPropertiesPaths: [],
      });
      continue;
    }

    // Extract x-jsonld-context if present
    const jsonldContext = resolveJsonldContext(dataModel)?.get('@context');
    if (!jsonldContext) {
      setSingleModelSemanticScoreValue({
        modelName: dataModelKey,
        score: 0,
        hasAnnotations: false,
        validPropertiesPaths: [],
        invalidPropertiesPaths: [],
      });
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
    let sparqlValidProperties: string[] = [];
    if (unknownPropertiesPaths.length > 0) {
      sparqlValidProperties = await fetchValidSemanticScoreProperties(unknownPropertiesPaths, {
        sparqlUrl: options.sparqlUrl,
      });
    }
    const allValidFieldUris = [...validPropertiesPaths, ...sparqlValidProperties];
    const rawPropertiesPaths = [...validPropertiesPaths, ...unknownPropertiesPaths];
    const rawPropertiesCount = rawPropertiesPaths.length;
    const semanticPropertiesCount = allValidFieldUris.length;
    const score = rawPropertiesCount > 0 ? semanticPropertiesCount / rawPropertiesCount : 0;

    setSingleModelSemanticScoreValue({
      modelName: dataModelKey,
      score,
      hasAnnotations: true,
      validPropertiesPaths: allValidFieldUris,
      invalidPropertiesPaths: rawPropertiesPaths.filter((x) => !allValidFieldUris.includes(x)),
    });
  }

  // Setting schema semantic score (calculated as an average semantic score value)
  if (!resolvedSpecJson['info']) {
    resolvedSpecJson['info'] = {};
  }
  const schemaSemanticScore = Number((rawModelsCount > 0 ? schemaSemanticScoreSum / rawModelsCount : 0).toFixed(2));
  resolvedSpecJson['info']['x-semantic-score'] = schemaSemanticScore;
  resolvedSpecJson['info']['x-semantic-score-timestamp'] = Date.now();

  const summary: Summary = {
    rawModelsCount,
    positiveScoreModelsCount,
    modelsCalculationDetails: calculationDetails,
  };

  return {
    resolvedSpecJson,
    schemaSemanticScore,
    summary,
  };
}
