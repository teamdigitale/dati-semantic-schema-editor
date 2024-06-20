import { useJsonLDContextResolver } from './use-context-resolver';
import { useSparqlQuery } from './use-sparql';

function basename(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

export function useRDFReferenceResolver(jsonldContext, propertyName) {
  const { fieldUri, fieldName } = useJsonLDContextResolver(jsonldContext, propertyName);
  const { data, status } = useSparqlQuery(
    `
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    select distinct * where {
      <${fieldUri}>
        rdfs:domain ?domain ;
        rdfs:range ?class
      .
    }
  `,
    { skip: !fieldUri },
  );

  const content = data?.results?.bindings
    ? Object.fromEntries(Object.entries(data.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  const parts = [
    ...(content?.domain ? [{ title: basename(content.domain), href: content.domain.toString() }] : []),
    ...(fieldName ? [{ title: fieldName, href: fieldUri?.toString() }] : []),
    ...(content?.class && !content.class.includes('rdf-schema#') && !content.class.includes('XMLSchema#')
      ? [{ title: basename(content.class), href: content.class.toString() }]
      : []),
  ];

  return {
    data: parts,
    status,
  };
}
