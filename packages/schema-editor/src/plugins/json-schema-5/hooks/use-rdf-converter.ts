import { JsonLdDocument, toRDF } from 'jsonld';
import { useCallback, useEffect, useState } from 'react';
import { AsyncState } from '../models';

export interface JsonLdErrorInfo {
  name?: string;
  message: string;
  details?: {
    code?: string;
    term?: string;
    context?: object;
  };
}

export const useRDFConverter = (jsonldExample: JsonLdDocument) => {
  const [state, setState] = useState<AsyncState<string, JsonLdErrorInfo>>({ status: 'pending' });

  const callback = useCallback(async (jsonldExample: JsonLdDocument) => {
    try {
      if (!jsonldExample) {
        throw new Error('Invalid context or keys');
      }
      setState({ status: 'pending' });
      const result = (await toRDF(jsonldExample, { format: 'application/n-quads' })) as string;
      setState({ data: result, status: 'fulfilled' });
    } catch (e) {
      console.error('RDF conversion error:', e);
      setState({
        status: 'error',
        error: {
          name: e?.name,
          message: e?.message || String(e),
          details: e?.details,
        },
      });
    }
  }, []);

  useEffect(() => {
    callback(jsonldExample);
  }, [callback, jsonldExample]);

  return state;
};
