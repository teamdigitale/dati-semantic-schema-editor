export const JSONLD_PLAYGROUND_URI = 'https://par-tec.github.io/json-ld.org/playground/next/';
export const JSONLD_PLAYGROUND_FRAME = {
  '@context': {
    skos: 'http://www.w3.org/2004/02/skos/core#',
    NDC: 'https://w3id.org/italia/onto/NDC/',
    url: '@id',
    description: {
      '@id': 'http://purl.org/dc/terms/description',
      '@language': 'it',
    },
    prefLabel: {
      '@id': 'skos:prefLabel',
      '@language': 'it',
    },
    keyConcept: {
      '@id': 'NDC:keyConcept',
    },
  },
  '@explicit': true,
  description: {},
  prefLabel: {},
  keyConcept: {},
};
