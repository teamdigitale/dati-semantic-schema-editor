import { useCallback, useEffect, useState } from 'react';
import { useConfiguration } from '../../configuration';
import { AsyncState } from '../models';

interface SparqlQueryOptions {
  skip?: boolean;
}

export function useSparqlQuery<T = any>(query: string, options?: SparqlQueryOptions) {
  const { sparqlUrl } = useConfiguration();
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const callback = useCallback(async () => {
    try {
      if (options?.skip) {
        return;
      }
      setState({ status: 'pending' });
      const endpoint = `${sparqlUrl?.trim()}?format=json&query=${encodeURIComponent(query)}`;
      const response = await fetch(endpoint, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setState({ status: 'fulfilled', data });
    } catch (e) {
      console.error(e);
      setState({ status: 'error', error: e?.message || e || 'Unknown error' });
    }
  }, [query, options?.skip]);

  useEffect(() => {
    setState({ status: 'idle' }); // Se cambia la query resetto lo status
  }, [query]);

  useEffect(() => {
    callback();
  }, [callback]);

  return state;
}
