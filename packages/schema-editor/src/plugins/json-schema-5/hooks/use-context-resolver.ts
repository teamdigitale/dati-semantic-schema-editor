import { Map } from 'immutable';

interface JsonLDContextResolverResponse {
  fieldName: string | undefined;
  fieldUri: string | undefined;
  vocabularyUri: string | undefined;
}

export const useJsonLDContextResolver = (jsonldContext: Map<any, any>, key: string): JsonLDContextResolverResponse => {
  const emptyResponse: JsonLDContextResolverResponse = {
    fieldName: undefined,
    fieldUri: undefined,
    vocabularyUri: undefined,
  };

  if (!key || !jsonldContext || typeof jsonldContext !== 'object' || !Object.keys(jsonldContext).length) {
    return emptyResponse;
  }

  let fieldName = jsonldContext.get(key);
  if (fieldName === null) {
    return emptyResponse;
  }

  if (fieldName === undefined) {
    fieldName = key;
  }

  let vocab: string = jsonldContext.get('@vocab') || '';
  let vocabularyUri: string = '';

  if (typeof fieldName !== 'string') {
    const fieldCtx = fieldName.get('@context');
    fieldName = fieldName.get('@id');
    vocabularyUri = (fieldCtx && fieldCtx.get('@base') && fieldCtx.get('@base').replace(/[/#]$/, '')) || null;
  }

  if (typeof fieldName === 'string' && fieldName.includes(':')) {
    const [a, b] = fieldName.split(':', 2);
    fieldName = b;
    vocab = jsonldContext.get(a) || '';
  }

  return {
    fieldName,
    fieldUri: vocab + fieldName,
    vocabularyUri,
  };
};
