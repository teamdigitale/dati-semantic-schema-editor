import { useJsonLDResolver } from './use-jsonld-resolver';
import { useSparqlQuery } from './use-sparql';

export function basename(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

export function useRDFOntologiesResolver(jsonldContext, propertyName) {
  const { data: jsonLDResolverResult } = useJsonLDResolver(jsonldContext, [propertyName]);
  const { data: sparqlData, status: sparqlStatus } = useSparqlQuery(
    `
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    select distinct * where {
      <${jsonLDResolverResult?.fieldUri}>
        rdfs:domain ?domain ;
        rdfs:range ?class
      .
    }
  `,
    { skip: !jsonLDResolverResult?.fieldUri },
  );

  const content = sparqlData?.results?.bindings
    ? Object.fromEntries(Object.entries(sparqlData.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  return {
    data: {
      ontologicalClass: content?.domain as string | undefined,
      ontologicalProperty: jsonLDResolverResult?.fieldName as string | undefined,
      ontologicalType: content?.class as string | undefined,
    },
    status: sparqlStatus,
  };
}
