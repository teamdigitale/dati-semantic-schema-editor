import { useSparqlQuery } from './use-sparql';

export function basename(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

export interface RDFProperty {
  ontologicalProperty?: string;
  ontologicalClass?: string;
  ontologicalType?: string | undefined;
  ontologicalPropertyComment?: string | undefined;
  controlledVocabulary?: string | undefined;
}

export function useRDFPropertyResolver(fieldUri: string | undefined): { data: RDFProperty; status: string } {
  const { data: sparqlData, status: sparqlStatus } = useSparqlQuery(
    `
    PREFIX RDFS: <http://www.w3.org/2000/01/rdf-schema#>


    SELECT DISTINCT * WHERE {
      VALUES ?fieldUri { <${fieldUri}> }

      ?fieldUri
        rdfs:domain ?domain ;
        rdfs:range ?class
      .

      OPTIONAL {
        ?fieldUri
          rdfs:comment ?comment
        .
        FILTER(lang(?comment) = 'en')
      }

      OPTIONAL {
        ?class
          <https://w3id.org/italia/onto/l0/controlledVocabulary> ?controlledVocabulary
        .
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
      controlledVocabulary: content?.controlledVocabulary as string | undefined,
    },
    status: sparqlStatus,
  };
}

export function useRDFClassResolver(classUri: string | undefined) {
  const { data: sparqlData, status: sparqlStatus } = useSparqlQuery(
    `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT
      ?classUri
      ?label
      ?comment
      GROUP_CONCAT(DISTINCT ?subClassOf; separator=",") as ?superClasses

    WHERE {

      VALUES ?classUri { <${classUri}> }

      ?classUri
        rdfs:label ?label
      .
      FILTER(lang(?label) = 'en')

      OPTIONAL {
        ?classUri  rdfs:comment ?comment
        .
        FILTER(lang(?comment) = 'en')
      }

      OPTIONAL {
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
