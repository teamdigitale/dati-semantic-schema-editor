import { useEffect, useState } from 'react';
import { AsyncState } from '../../models/async-state';
import { APICatalog, Linkset, VocabularyCatalogQueryParams } from './vocabularies.models';

export interface Options {
  skip?: boolean;
}

const vocabulariesApiUrl = 'https://vocabularies-api-ndc-dev.apps.cloudpub.testedev.istat.it';

export function useSearchVocabularies(
  params?: VocabularyCatalogQueryParams,
  options?: Options,
): AsyncState<APICatalog> {
  // const { vocabulariesApiUrl } = useConfiguration();
  const queryString = new URLSearchParams(
    Object.entries({ limit: 10, offset: 0, ...params })
      .filter(([key, value]) => !!value || value === 0)
      .map(([key, value]) => `${key}=${value}`)
      .join('&'),
  );

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
  }, [JSON.stringify(params), JSON.stringify(options)]);

  return state;
}
