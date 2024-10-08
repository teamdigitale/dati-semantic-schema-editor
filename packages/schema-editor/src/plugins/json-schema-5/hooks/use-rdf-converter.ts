import { JsonLdDocument, toRDF } from 'jsonld';
import { useCallback, useEffect, useState } from 'react';
import { AsyncState } from '../models';

export const useRDFConverter = (jsonldExample: JsonLdDocument) => {
  const [state, setState] = useState<AsyncState<string>>({ status: 'pending' });

  const callback = useCallback(async (jsonldExample: JsonLdDocument) => {
    try {
      if (!jsonldExample) {
        throw new Error('Invalid context or keys');
      }

      setState({ status: 'pending' });
      const result = (await toRDF(jsonldExample, { format: 'application/n-quads' })) as string;
      setState({ data: result, status: 'fulfilled' });
    } catch (e) {
      setState({ status: 'error', error: e || 'Exception' });
    }
  }, []);

  useEffect(() => {
    callback(jsonldExample);
  }, [callback, jsonldExample]);

  return state;
};
