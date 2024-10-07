import { Map } from 'immutable';
import { expand } from 'jsonld';
import { basename } from '../utils';
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

      const lastKey = keysPath[keysPath.length - 1];
      if (lastKey.startsWith('@id')) {
        setState({ status: 'fulfilled', data: { fieldName: '@id', fieldUri: '@id', vocabularyUri: undefined } });
        return;
      }

      // Don't need to process full URIs.
      if (/^https?:/.test(lastKey)) {
        setState({
          status: 'fulfilled',
          data: { fieldName: basename(lastKey), fieldUri: lastKey, vocabularyUri: undefined },
        });
        return;
      }

      let context =
        typeof jsonldContext.toJSON !== 'undefined' ? JSON.parse(JSON.stringify(jsonldContext)) : jsonldContext;
      context = context['@context'] ? context['@context'] : context;

      // Validate property path upon context
      let innerContext = context;
      for (let i = 0; i < keysPath.length; i++) {
        const key = keysPath[i];
        if (innerContext[key] === undefined) {
          console.log(`Property ${key} not found in inner @context. Resolving with default @vocab.`);
          // XXX: We cannot check if @vocab is defined in the context
          //      because it can be defined in the parent context.
          innerContext[key] = key;
        } else if (innerContext[key].startsWith && innerContext[key].startsWith('@')) {
          console.log(`Property ${key} is a keyword. Don't resolve it.`);
          setState({
            status: 'fulfilled',
            data: { fieldName: innerContext[key], fieldUri: innerContext[key], vocabularyUri: undefined },
          });
          return;
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
