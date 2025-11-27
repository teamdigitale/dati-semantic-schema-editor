interface SparqlBinding {
  type: string;
  value: string;
}

interface SparqlResult {
  [key: string]: SparqlBinding;
}

interface SparqlResponse {
  head: {
    vars: string[];
  };
  results: {
    bindings: SparqlResult[];
  };
}

export async function executeSparqlQuery(sparqlUrl: string, query: string): Promise<SparqlResponse> {
  const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(query)}`;
  const response = await fetch(endpoint, { cache: 'force-cache' });

  if (!response.ok) {
    throw new Error(`SPARQL query failed: ${response.statusText}`);
  }

  return await response.json();
}
