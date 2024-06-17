export const useJsonLDContextResolver = (key: string, jsonldContext: any) => {
  if (!key || !jsonldContext || typeof jsonldContext !== 'object' || !Object.keys(jsonldContext).length) {
    return undefined;
  }

  let fieldName: any = jsonldContext.get(key);
  if (fieldName === null) {
    return undefined;
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
    console.log('processing : field', fieldName);
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
