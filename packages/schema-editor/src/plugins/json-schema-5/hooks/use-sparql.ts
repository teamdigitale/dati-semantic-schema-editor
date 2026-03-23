import { useEffect, useState } from 'react';
import { AsyncState } from '../models';

export interface SparqlQueryOptions {
  sparqlUrl: string;
  skip?: boolean;
  format?: string;
}

export function useSparqlQuery<T = any>(query: string, options: SparqlQueryOptions) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'idle' }); // Se cambia la query resetto lo status
  }, [query]);

  useEffect(() => {
    let isCancelled = false;

    const runQuery = async () => {
      try {
        if (options.skip) {
          return;
        }

        setState({ status: 'pending' });
        const endpoint = `${options.sparqlUrl.trim()}?format=${encodeURIComponent(options.format || 'json')}&query=${encodeURIComponent(query)}`;
        const response = await fetch(endpoint, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        if (isCancelled) {
          return;
        }
        const data = await response.json();
        setState({ status: 'fulfilled', data });
      } catch (e) {
        if (isCancelled) {
          return;
        }
        console.error(e);
        setState({ status: 'error', error: e?.message || e || 'Unknown error' });
      }
    };

    runQuery();

    return () => {
      isCancelled = true;
    };
  }, [query, options.skip, options.sparqlUrl, options.format]);

  return state;
}
