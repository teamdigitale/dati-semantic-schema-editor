import { useCallback, useEffect, useState } from 'react';

const BASE_URL = 'https://virtuoso-dev-external-service-ndc-dev.apps.cloudpub.testedev.istat.it/sparql';

interface SparqlQueryOptions {
  skip?: boolean;
}

export function useSparqlQuery(query: string, options?: SparqlQueryOptions) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'fulfilled' | 'error'>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<any | undefined>(undefined);

  const callback = useCallback(async (query: string) => {
    try {
      setStatus('pending');
      const endpoint = `${BASE_URL}?format=json&query=${encodeURIComponent(query)}`;
      const response = await fetch(endpoint, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setData(data);
      setStatus('fulfilled');
    } catch (e: any) {
      setError(`${e?.message || e || 'Unknown error'} contacting ${BASE_URL}`);
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
