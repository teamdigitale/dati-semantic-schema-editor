import { fromJS, Map } from 'immutable';
import { InClientCache } from '../cache';
import { resolveJsonldContext, resolvePropertyByJsonldContext } from '../jsonld';
import { resolveOpenAPISpec } from '../openapi';
import { ModelSummary, PropertySummary, SemanticScoreSummary } from './models/calculation-details';

const cache = new InClientCache<Promise<string[]>>({
  ttl: 5 * 60 * 1000, // 5 minutes
});

function getCacheKey(properties: string[], sparqlUrl: string): string {
  return `${sparqlUrl}:${properties.sort().join(',')}`;
}

async function determinePropertiesToValidate(
  jsonldContext: Map<any, any>,
  propertiesPaths: string[][],
): Promise<PropertySummary[]> {
  const resolvedProperties: PropertySummary[] = [];
  for (const propertyPath of propertiesPaths) {
    const resolvedProperty = await resolvePropertyByJsonldContext(jsonldContext, propertyPath);
    resolvedProperties.push({
      name: propertyPath.join('.'),
      uri: resolvedProperty.fieldUri ?? null,
      valid: resolvedProperty.fieldUri?.startsWith('@') ?? false,
    });
  }
  return resolvedProperties;
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
  const cacheKey = getCacheKey(properties, options.sparqlUrl);

  // Try to get cached promise (this also cleans up expired entries)
  const cachedPromise = cache.get(cacheKey);
  if (cachedPromise) {
    return cachedPromise;
  }

  // Create new promise for the fetch
  const fetchPromise = (async (): Promise<string[]> => {
    const sparqlQuery = buildSemanticScoreSparqlQuery(properties);
    const endpoint = `${options.sparqlUrl?.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      return [];
    }
    const sparqlData: any = await response.json();
    return sparqlData?.results?.bindings?.map((x) => x.fieldUri.value) || [];
  })();

  // Store promise in cache
  cache.set(cacheKey, fetchPromise);

  // Remove from cache if promise fails, without waiting for ttl expiration
  return fetchPromise.catch((e) => {
    cache.delete(cacheKey);
    throw e;
  });
}

export async function calculateModelSemanticScore(
  dataModelKey: string,
  dataModelValue: Map<any, any>,
  jsonldContext: Map<any, any> | undefined,
  options: { sparqlUrl: string },
): Promise<ModelSummary> {
  // Check required parameters
  if (!dataModelKey || !dataModelValue) {
    throw new Error('Data model key or value is missing');
  }

  // Filter only data models with type "object"
  const isObject = (dataModelValue.get('type', '') as string | undefined)?.toLowerCase() === 'object';
  if (!isObject) {
    throw new Error(`Data model ${dataModelKey} is not an object`);
  }

  // Determine informations
  const hasAnnotations = dataModelValue.has('x-jsonld-context');
  const propertiesPaths: string[][] =
    dataModelValue
      .get('properties')
      ?.keySeq()
      .toArray()
      .map((x) => [x]) || [];

  // Missing x-jsonld-context
  if (!jsonldContext) {
    return {
      name: dataModelKey,
      score: 0,
      hasAnnotations,
      rawPropertiesCount: propertiesPaths.length,
      validPropertiesCount: 0,
      invalidPropertiesCount: propertiesPaths.length,
      properties: propertiesPaths.map((x) => ({ name: x.join('.'), uri: null, valid: false })),
    };
  }

  // Determine properties to validate
  const allPropertiesSummary = await determinePropertiesToValidate(jsonldContext, propertiesPaths);
  const unknownPropertiesSummaryUris = allPropertiesSummary.filter((x) => !x.valid).map((x) => x.uri as string);

  // Execute sparql fetch to check if mapped onto-properties are correct
  if (unknownPropertiesSummaryUris.length > 0) {
    const sparqlValidPropertiesUris = await fetchValidSemanticScoreProperties(unknownPropertiesSummaryUris, {
      sparqlUrl: options.sparqlUrl,
    });
    for (const sparqlValidPropertyUri of sparqlValidPropertiesUris) {
      const propertySummary = allPropertiesSummary.find((x) => x.uri === sparqlValidPropertyUri);
      if (propertySummary) {
        propertySummary.valid = true;
      }
    }
  }

  const rawPropertiesCount = allPropertiesSummary.length;
  const validPropertiesCount = allPropertiesSummary.filter((x) => x.valid === true).length;
  const score = rawPropertiesCount > 0 ? validPropertiesCount / rawPropertiesCount : 0;

  return {
    name: dataModelKey,
    score,
    hasAnnotations,
    rawPropertiesCount,
    validPropertiesCount,
    invalidPropertiesCount: rawPropertiesCount - validPropertiesCount,
    properties: allPropertiesSummary,
  };
}

export async function calculateSchemaSemanticScore(
  specJson: any,
  options: { sparqlUrl: string },
): Promise<{ resolvedSpecJson: any; schemaSemanticScore: number; summary: SemanticScoreSummary }> {
  const resolvedSpecJson = await resolveOpenAPISpec(specJson);
  const resolvedSpecOrderedMap = fromJS(resolvedSpecJson);

  // Extract all data models from spec
  const dataModels = resolvedSpecOrderedMap.getIn(['components', 'schemas']) as Map<any, any> | undefined;
  if (!dataModels) {
    throw 'No #/components/schemas models provided';
  }

  // Calculate specific and schema semantic scores
  let rawModelsCount = 0;
  let schemaSemanticScoreSum = 0;
  const modelsSummary: ModelSummary[] = [];

  // Process every datamodel
  for (const [dataModelKey, dataModel] of dataModels.entries()) {
    // Filter only data models with type "object"
    const isObject = (dataModel.get('type', '') as string | undefined)?.toLowerCase() === 'object';
    if (!isObject) {
      continue;
    }

    // Extract x-jsonld-context
    const jsonldContext = dataModel.has('x-jsonld-context')
      ? resolveJsonldContext(dataModel)?.get('@context')
      : undefined;

    // Calculate model semantic score
    const modelSummary = await calculateModelSemanticScore(dataModelKey, dataModel, jsonldContext, options);
    resolvedSpecJson['components']['schemas'][modelSummary.name]['x-semantic-score'] = modelSummary.score;
    schemaSemanticScoreSum += modelSummary.score;
    rawModelsCount++;
    modelsSummary.push(modelSummary);
  }

  // Final summary
  const summary: SemanticScoreSummary = {
    score: rawModelsCount > 0 ? schemaSemanticScoreSum / rawModelsCount : 0,
    timestamp: Date.now(),
    sparqlEndpoint: options.sparqlUrl,
    models: modelsSummary,
  };

  // Setting schema semantic score (calculated as an average semantic score value)
  if (!resolvedSpecJson['info']) {
    resolvedSpecJson['info'] = {};
  }
  const schemaSemanticScore = Number((rawModelsCount > 0 ? schemaSemanticScoreSum / rawModelsCount : 0).toFixed(2));
  resolvedSpecJson['info']['x-semantic-score'] = schemaSemanticScore;
  resolvedSpecJson['info']['x-semantic-score-timestamp'] = Date.now();

  return {
    resolvedSpecJson,
    schemaSemanticScore,
    summary,
  };
}
