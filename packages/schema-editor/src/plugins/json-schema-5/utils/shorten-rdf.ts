function extractNamespacesFromURIs(turtleText: string): Record<string, string> {
  const uriPattern = /<([^>]+)>/g;
  const namespaces = {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    owl: 'http://www.w3.org/2002/07/owl#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
  };

  let match: RegExpExecArray | null;
  while ((match = uriPattern.exec(turtleText)) !== null) {
    const uri = match[1];
    const parts = uri.split(/[/#]/);
    const baseUri = uri.slice(0, uri.lastIndexOf(parts[parts.length - 1]));
    const prefix = parts[parts.length - 2];

    if (!prefix || !baseUri) {
      continue;
    }
    if (!namespaces[prefix] && Object.values(namespaces).indexOf(baseUri) === -1) {
      namespaces[prefix] = baseUri;
    }
  }

  return namespaces;
}

function replaceURIsWithCURIEs(turtleText: string, namespaces: Record<string, string>) {
  let shortenedTurtle = turtleText;

  for (const [prefix, uri] of Object.entries(namespaces)) {
    const uriPattern = new RegExp(`<${uri}([^>]+)>`, 'g');
    shortenedTurtle = shortenedTurtle.replace(uriPattern, `${prefix}:$1`);
  }

  return shortenedTurtle;
}

export interface RDFShortnerResult {
  namespaces: Record<string, string> | undefined;
  shortenedTurtle: string | undefined;
}

export function shortenRDF(turtleText: string | undefined): RDFShortnerResult {
  if (!turtleText) {
    return { namespaces: undefined, shortenedTurtle: undefined };
  }
  const namespaces = extractNamespacesFromURIs(turtleText);
  const shortenedTurtle = replaceURIsWithCURIEs(turtleText, namespaces);
  return { namespaces, shortenedTurtle };
}
