export const prefix_cc = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  dcat: 'http://www.w3.org/ns/dcat#',
  foaf: 'http://xmlns.com/foaf/0.1/',
  dc: 'http://purl.org/dc/elements/1.1/',
  dct: 'http://purl.org/dc/terms/',
  // Italy
  CPV: 'https://w3id.org/italia/onto/CPV/',
  CLV: 'https://w3id.org/italia/onto/CLV/',
  l0: 'https://w3id.org/italia/onto/l0/',
  // EU
  euvoc: 'http://publications.europa.eu/ontology/euvoc#',
};

export function uri2curie(uri: string, context: Record<string, string>) {
  for (const prefix in context) {
    if (uri.startsWith(context[prefix])) {
      return prefix + ':' + uri.substring(context[prefix].length);
    }
  }
  return uri;
}

export function uri2shortUri(uri: string) {
  const curie = uri2curie(uri, prefix_cc);

  if (curie != uri) {
    return curie;
  }

  try {
    const url = new URL(uri);
    const pathParts = url.pathname.split('/');
    // Return the fragment if present
    if (url.hash) {
      return pathParts[pathParts.length - 1] + ':' + url.hash.substring(1);
    }
    return pathParts[pathParts.length - 2] + ':' + pathParts[pathParts.length - 1];
  } catch (e) {
    // Handle invalid URLs
    console.error(`Invalid URL: ${uri}`, e);
    return '';
  }
}
