import { Map } from 'immutable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConfiguration } from '../../configuration';
import { AsyncState } from '../models';
import {
  buildOntoScoreSparqlQuery,
  calculateGlobalOntoscore,
  determinePropertiesToValidate,
  ResolvedPropertiesGroups,
  to32CharString,
} from '../utils';
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

interface GlobalOntoScoreResult {
  score?: number;
  isUpdated: boolean;
}

export function useGlobalOntoScore(
  specJson: any,
): Omit<AsyncState<GlobalOntoScoreResult>, 'data'> & { data: GlobalOntoScoreResult; recalculate: () => Promise<void> } {
  const { sparqlUrl } = useConfiguration();
  const [state, setState] = useState<AsyncState<Pick<GlobalOntoScoreResult, 'score'>>>({ status: 'idle' });

  const [lastHash, setLastHash] = useState<string | null>(null);

  const currentHash = useMemo(() => to32CharString(JSON.stringify(specJson)), [specJson]);

  const recalculate = useCallback(async () => {
    try {
      setState({ status: 'pending' });

      // Check url
      if (!sparqlUrl) {
        throw new Error('Sparql url is not set');
      }

      // Calculate global ontoscore
      const { globalOntoScore } = await calculateGlobalOntoscore(specJson, { sparqlUrl });

      // Update hash to give a feedback to the user
      const hash = to32CharString(JSON.stringify(specJson));
      setLastHash(hash);
      setState({ status: 'fulfilled', data: { score: globalOntoScore } });
    } catch {
      setState({ status: 'error', error: 'Error calculating global ontoscore' });
    }
  }, [specJson, sparqlUrl]);

  return {
    status: state.status,
    error: state.error,
    data: {
      score: state.data?.score,
      isUpdated: !!lastHash && !!currentHash && lastHash === currentHash,
    },
    recalculate,
  };
}

export function useOntoScoreColor(score: number) {
  return useMemo(() => (score > 0.5 ? 'success' : 'warning'), [score]);
}
