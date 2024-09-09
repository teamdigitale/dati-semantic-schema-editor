import { useSparqlQuery } from './use-sparql';

export function basename(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

export function useRDFPropertyResolver(fieldUri: string | undefined) {
  const { data: sparqlData, status: sparqlStatus } = useSparqlQuery(
    `
    PREFIX RDFS: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT * WHERE {
      <${fieldUri}>
        rdfs:domain ?domain ;
        rdfs:range ?class
      .

      OPTIONAL {
        <${fieldUri}>
          rdfs:comment ?comment
        .
        FILTER(lang(?comment) = 'en')
      }
    }
  `,
    { skip: !fieldUri },
  );

  const content = sparqlData?.results?.bindings
    ? Object.fromEntries(Object.entries(sparqlData.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  return {
    data: {
      ontologicalClass: content?.domain as string | undefined,
      ontologicalProperty: fieldUri as string | undefined,
      ontologicalType: content?.class as string | undefined,
      ontologicalPropertyComment: content?.comment as string | undefined,
    },
    status: sparqlStatus,
  };
}

export function useRDFClassResolver(classUri: string | undefined) {
  const { data: sparqlData, status: sparqlStatus } = useSparqlQuery(
    `
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    select distinct * where {

      VALUES ?classUri { <${classUri}> }

      ?classUri
        rdfs:label ?label ;
        rdfs:comment ?comment
      .
      FILTER(lang(?label) = 'en')
      FILTER(lang(?comment) = 'en')

      optional {
        ?classUri
          rdfs:subClassOf ?subClassOf
        .
        FILTER(!isBlank(?subClassOf))
      }

    }
  `,
    { skip: !classUri },
  );

  const content = sparqlData?.results?.bindings
    ? Object.fromEntries(Object.entries(sparqlData.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  return {
    data: {
      ontologicalClass: content?.classUri as string | undefined,
      ontologicalClassLabel: content?.label as string | undefined,
      ontologicalClassComment: content?.comment as string | undefined,
    },
    status: sparqlStatus,
  };
}


export function useRDFClassPropertiesResolver(classUri: string | undefined) {
  const { data: sparqlData, status: sparqlStatus } = useSparqlQuery(
    `
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    select distinct * where {

      ?fieldUri
        rdfs:domain <${classUri}> ;
        rdfs:range ?range
      .
    }
  `,
    { skip: !classUri },
  );

  const content = sparqlData?.results?.bindings
    ? Object.fromEntries(Object.entries(sparqlData.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  return {
    data: {
      ontologicalClass: classUri as string | undefined,
      ontologicalProperty: content?.fieldUri as string | undefined,
      ontologicalType: content?.range as string | undefined,
    },
    status: sparqlStatus,
  };
}
