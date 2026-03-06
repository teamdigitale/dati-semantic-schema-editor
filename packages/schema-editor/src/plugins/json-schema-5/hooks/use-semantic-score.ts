import {
  calculateModelSemanticScore,
  calculateSchemaSemanticScore,
  ModelSummary,
  to32CharString,
} from '@teamdigitale/schema-editor-utils';
import { Map } from 'immutable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConfiguration } from '../../configuration';
import { AsyncState } from '../models';

// For every property it should check if:
// - property is explicitly or implicitly (derived from main class) provided
// - property exists in sparql
// Properties detached are not fetched and their result is zero
export function useSemanticScore(
  dataModelKey: string,
  dataModelValue: Map<any, any>,
  jsonldContext: Map<any, any> | undefined,
): AsyncState<ModelSummary | undefined> {
  const { sparqlUrl } = useConfiguration();
  const [state, setState] = useState<AsyncState<ModelSummary | undefined>>({ status: 'pending' });

  useEffect(() => {
    if (!dataModelKey || !dataModelValue || !sparqlUrl) {
      return setState({ status: 'fulfilled', data: undefined });
    }
    setState({ status: 'pending' });
    calculateModelSemanticScore(dataModelKey, dataModelValue, jsonldContext, { sparqlUrl })
      .then((result) => setState({ status: 'fulfilled', data: result }))
      .catch((e) => setState({ status: 'error', error: e?.message || 'Exception' }));
  }, [dataModelKey, dataModelValue, jsonldContext, sparqlUrl]);

  return state;
}

interface SchemaSemanticScoreResult {
  score?: number;
  isUpdated: boolean;
}

export function useSchemaSemanticScore(specJson: any): Omit<AsyncState<SchemaSemanticScoreResult>, 'data'> & {
  data: SchemaSemanticScoreResult;
  recalculate: () => Promise<void>;
} {
  const { sparqlUrl } = useConfiguration();
  const [state, setState] = useState<AsyncState<Pick<SchemaSemanticScoreResult, 'score'>>>({ status: 'idle' });

  const [lastHash, setLastHash] = useState<string | null>(null);

  const currentHash = useMemo(() => to32CharString(JSON.stringify(specJson)), [specJson]);

  const recalculate = useCallback(async () => {
    try {
      setState({ status: 'pending' });

      // Check url
      if (!sparqlUrl) {
        throw new Error('Sparql url is not set');
      }

      // Calculate schema semantic score
      const { schemaSemanticScore } = await calculateSchemaSemanticScore(specJson, { sparqlUrl });

      // Update hash to give a feedback to the user
      const hash = to32CharString(JSON.stringify(specJson));
      setLastHash(hash);
      setState({ status: 'fulfilled', data: { score: schemaSemanticScore } });
    } catch {
      setState({ status: 'error', error: 'Error calculating schema semantic score' });
    }
  }, [specJson, sparqlUrl]);

  return {
    status: state.status,
    error: state.error,
    data: {
      score: state.data?.score ?? specJson?.['info']?.['x-semantic-score'],
      isUpdated: !!lastHash && !!currentHash && lastHash === currentHash,
    },
    recalculate,
  };
}

export function useSemanticScoreColor(score: number) {
  return useMemo(() => (score > 0.5 ? 'success' : 'warning'), [score]);
}
