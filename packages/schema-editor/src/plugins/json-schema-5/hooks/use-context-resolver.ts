interface JsonLDContextResolverResponse {
  fieldName: string | undefined;
  fieldUri: string | undefined;
  vocabularyUri: string | undefined;
  ns: string | undefined;
}

export const useJsonLDContextResolver = (key: string, jsonldContext: any): JsonLDContextResolverResponse => {
  const emptyResponse: JsonLDContextResolverResponse = {
    fieldName: undefined,
    fieldUri: undefined,
    vocabularyUri: undefined,
    ns: undefined,
  };

  if (!key || !jsonldContext || typeof jsonldContext !== 'object' || !Object.keys(jsonldContext).length) {
    return emptyResponse;
  }

  let fieldName: any = jsonldContext.get(key);
  if (fieldName === null) {
    return emptyResponse;
  }
  if (fieldName === undefined) {
    fieldName = key;
  }

  let vocab: string = jsonldContext.get('@vocab') || '';
  let vocabularyUri: string = '';
  let ns: string = '';

  if (typeof fieldName !== 'string') {
    const fieldCtx = fieldName.get('@context');
    fieldName = fieldName.get('@id');
    vocabularyUri = (fieldCtx && fieldCtx.get('@base') && fieldCtx.get('@base').replace(/[/#]$/, '')) || null;
  }

  if (typeof fieldName === 'string' && fieldName.includes(':')) {
    const [a, b] = fieldName.split(':', 2);
    fieldName = b;
    ns = a;
    vocab = jsonldContext.get(ns) || '';
  }

  return {
    fieldName,
    fieldUri: vocab + fieldName,
    vocabularyUri,
    ns,
  };
};
