import { calculateSchemaSemanticScore, SemanticScoreSummary } from '@teamdigitale/schema-editor-utils';
import { Map } from 'immutable';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useConfiguration } from '../../../configuration';
import { AsyncState } from '../../models';
import { SemanticScoreContext } from './context';

interface SemanticScoreProviderProps extends PropsWithChildren {
  specJson: Map<string, any>;
}

export function SemanticScoreProvider({ specJson, children }: SemanticScoreProviderProps) {
  const [state, setState] = useState<AsyncState<SemanticScoreSummary>>({ status: 'idle' });
  const { sparqlUrl = '' } = useConfiguration();
  const [debouncedSpecJson] = useDebounce(specJson, 5000);

  const calculate = useCallback(async () => {
    try {
      if (!debouncedSpecJson) {
        setState({ status: 'fulfilled', data: undefined });
        return;
      }
      setState({ status: 'pending' });
      const result = await calculateSchemaSemanticScore(debouncedSpecJson.toJS(), { sparqlUrl });
      setState({ status: 'fulfilled', data: result.summary });
    } catch (e) {
      setState({ status: 'error', error: e?.message || e || 'Exception' });
    }
  }, [sparqlUrl]);

  useEffect(() => {
    calculate();
  }, [debouncedSpecJson, calculate]);

  return <SemanticScoreContext.Provider value={{ ...state, calculate }}>{children}</SemanticScoreContext.Provider>;
}
