import { useEffect, useState } from 'react';
import { useConfiguration } from '../../../configuration';
import { AsyncState } from '../../models/async-state';
import { APICatalog, Linkset, VocabularyCatalogQueryParams } from './vocabularies.models';

export interface Options {
  skip?: boolean;
}

export function useSearchVocabularies(
  params?: VocabularyCatalogQueryParams,
  options?: Options,
): AsyncState<APICatalog> {
  const { vocabulariesApiUrl } = useConfiguration();
  const queryParams = new URLSearchParams();
  Object.entries({ limit: 10, offset: 0, ...params })
    .filter(([, value]) => !!value || value === 0)
    .forEach(([key, value]) => queryParams.append(key, String(value)));
  const queryString = queryParams.toString();

  const [state, setState] = useState<AsyncState<APICatalog>>({ status: 'idle' });

  useEffect(() => {
    let isCancelled = false;

    const runQuery = async () => {
      try {
        if (options?.skip) {
          return;
        }

        setState({ status: 'pending' });
        const response = await fetch(`${vocabulariesApiUrl}/vocabularies?${queryString}`);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        if (isCancelled) {
          return;
        }
        const data: Linkset = await response.json();
        setState({ status: 'fulfilled', data: data?.linkset?.[0] });
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
  }, [vocabulariesApiUrl, queryString, JSON.stringify(options)]);

  return state;
}
