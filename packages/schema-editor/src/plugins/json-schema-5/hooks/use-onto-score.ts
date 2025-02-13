import { Map } from 'immutable';
import { useEffect, useState } from 'react';
import { AsyncState } from '../models';
import { buildOntoScoreSparqlQuery, determinePropertiesToValidate, ResolvedPropertiesGroups } from '../utils';
import { useSparqlQuery } from './use-sparql';

interface OntoScoreResult {
  rawPropertiesCount: number;
  semanticPropertiesCount: number;
  score: number;
}

// For every property it should check if:
// - property is explicitly or implicitly (derived from main class) provided
// - property exists in sparql
// Properties detached are not fetched and their result is zero
export function useOntoScore(
  jsonldContext: Map<string, any> | undefined,
  propertiesPaths: string[][] | undefined,
): Omit<AsyncState<OntoScoreResult>, 'data'> & { data: OntoScoreResult } {
  const rawPropertiesCount = propertiesPaths?.length || 0;
  const [resolvedProperties, setResolvedProperties] = useState(new ResolvedPropertiesGroups());

  // Fetch and update countSemantic and countProperties when propertiesToCheck change
  const skipQuery = !resolvedProperties.unknown.length;
  const {
    data: sparqlData,
    status: sparqlStatus,
    error: sparqlError,
  } = useSparqlQuery(buildOntoScoreSparqlQuery(resolvedProperties.unknown), { skip: skipQuery });

  const sparqlResultCount = !skipQuery ? parseInt(sparqlData?.results?.bindings?.[0]?.count?.value || 0) : 0;
  const semanticPropertiesCount = resolvedProperties.valid.length + sparqlResultCount;

  // Set properties to check when jsonldContext or properties change
  useEffect(() => {
    if (!jsonldContext || !propertiesPaths || !rawPropertiesCount) {
      setResolvedProperties(new ResolvedPropertiesGroups());
      return;
    }
    determinePropertiesToValidate(jsonldContext, propertiesPaths)
      .then((groups) => setResolvedProperties(groups))
      .catch(() => setResolvedProperties(new ResolvedPropertiesGroups()));
  }, [jsonldContext, JSON.stringify(propertiesPaths)]);

  return {
    status: sparqlStatus,
    error: sparqlError,
    data: {
      rawPropertiesCount,
      semanticPropertiesCount,
      score: rawPropertiesCount > 0 ? semanticPropertiesCount / rawPropertiesCount : 0,
    },
  };
}
