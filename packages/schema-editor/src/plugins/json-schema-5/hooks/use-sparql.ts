import { useCallback, useEffect, useState } from 'react';
import { useConfiguration } from '../../configuration';

interface SparqlQueryOptions {
  skip?: boolean;
}

export function useSparqlQuery(query: string, options?: SparqlQueryOptions) {
  const { sparqlUrl } = useConfiguration();
  const [status, setStatus] = useState<'idle' | 'pending' | 'fulfilled' | 'error'>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<any | undefined>(undefined);

  const callback = useCallback(async (query: string) => {
    try {
      setStatus('pending');
      const endpoint = `${sparqlUrl?.trim()}?format=json&query=${encodeURIComponent(query)}`;
      const response = await fetch(endpoint, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setData(data);
      setStatus('fulfilled');
    } catch (e) {
      console.error(e);
      setError(e?.message || e || 'Unknown error');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (options?.skip) return;
    callback(query);
  }, [callback, query]);

  return {
    status,
    data,
    error,
  };
}
