import { Map } from 'immutable';
import { expand } from 'jsonld';
import { useCallback, useEffect, useState } from 'react';

class JsonLDResolverResult {
  fieldName: string | undefined;
  fieldUri: string | undefined;
  vocabularyUri: string | undefined;
}

export const useJsonLDResolver = (jsonldContext: Map<any, any> | any, keysPath: string[]) => {
  const [state, setState] = useState<{
    data?: JsonLDResolverResult;
    status: 'idle' | 'pending' | 'fulfilled' | 'error';
    error?: string;
  }>({ data: undefined, status: 'pending', error: undefined });
  const keysPathDependency = JSON.stringify(keysPath);

  const callback = useCallback(async (jsonldContext, keysPath) => {
    try {
      setState({ status: 'pending' });

      if (!jsonldContext || !keysPath?.length) {
        throw new Error('Invalid context or keys');
      }

      const context =
        typeof jsonldContext.toJSON !== 'undefined' ? JSON.parse(JSON.stringify(jsonldContext)) : jsonldContext;

      // Validate property path upon context
      let innerContext = context;
      for (let i = 0; i < keysPath.length; i++) {
        const key = keysPath[i];
        if (!innerContext[key]) {
          throw new Error(`Property ${key} not found in inner @context`);
        } else if (i < keysPath.length - 1 && !innerContext[key]['@context']) {
          throw new Error(`Missing inner @context for property ${key}`);
        }
        innerContext = innerContext[key]['@context'];
      }

      // Generating input and extracting expanded data
      const input = keysPath.reduceRight((obj, x, i) => ({ [x]: i < keysPath.length - 1 ? obj : '' }), {});
      const result = await expand({ '@context': context, ...input });

      // Processing extracted data
      let fieldUri: string | undefined = undefined;
      let fieldValue: any = result;
      for (let i = 0; i < keysPath.length; i++) {
        [fieldUri, fieldValue] = Object.entries(fieldValue[0])[0];
      }
      if (!fieldUri || !fieldValue) {
        throw new Error(`No results provided`);
      }

      const fieldName: string = fieldUri.split('/').reverse()[0];
      let vocabularyUri: string = fieldValue[0]['@id'];
      if (vocabularyUri?.endsWith('/')) {
        vocabularyUri = vocabularyUri.substring(0, vocabularyUri.length - 1);
      }

      setState({ status: 'fulfilled', data: { fieldName, fieldUri, vocabularyUri } });
    } catch (e: any) {
      setState({ status: 'error', error: e?.message || 'Exception' });
    }
  }, []);

  useEffect(() => {
    callback(jsonldContext, keysPath);
  }, [callback, jsonldContext, keysPathDependency]);

  return state;
};
