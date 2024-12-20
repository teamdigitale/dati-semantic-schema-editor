import { AsyncState } from '../models';
import { isUri } from '../utils';
import { useSparqlQuery } from './use-sparql';

export interface RDFProperty {
  ontologicalProperty?: string;
  ontologicalClass?: string;
  ontologicalType?: string | undefined;
  ontologicalPropertyComment?: string | undefined;
  controlledVocabulary?: string | undefined;
}

export function useRDFPropertyResolver(fieldUri: string | undefined): AsyncState<RDFProperty> {
  const {
    data: sparqlData,
    status: sparqlStatus,
    error: sparqlError,
  } = useSparqlQuery(
    `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT
      ?fieldUri
      ?domain
      ?class
      ?comment
      ?controlledVocabulary
    WHERE {
      VALUES ?fieldUri { <${fieldUri}> }

      FILTER EXISTS {
        ?fieldUri rdf:type ?validType .
        FILTER(?validType IN (rdf:Property, owl:ObjectProperty, owl:DatatypeProperty, owl:FunctionalProperty))
      }

      OPTIONAL {
        ?fieldUri rdfs:domain ?domain .
      }

      OPTIONAL {
        ?fieldUri rdfs:range ?class .

        OPTIONAL {
          ?class
            <https://w3id.org/italia/onto/l0/controlledVocabulary> ?controlledVocabulary
          .
        }
      }

      OPTIONAL {
        ?fieldUri rdfs:comment ?comment .
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
      controlledVocabulary: content?.controlledVocabulary as string | undefined,
    },
    status: sparqlStatus,
    error: sparqlError,
  };
}

export function useRDFClassResolver(classUri: string | undefined) {
  const {
    data: sparqlData,
    status: sparqlStatus,
    error: sparqlError,
  } = useSparqlQuery(
    `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT
      ?classUri
      ?label
      ?comment
      GROUP_CONCAT(DISTINCT ?subClassOf; separator=",") as ?superClasses

    WHERE {

      VALUES ?classUri { <${classUri}> }

      ?classUri
        (rdfs:label|skos:prefLabel) ?label
      .
      FILTER(lang(?label) = 'en')

      OPTIONAL {
        ?classUri
          rdfs:comment ?comment
        .
        FILTER(lang(?comment) = 'en')
      }

      OPTIONAL {
        ?classUri
          rdfs:subClassOf* ?subClassOf
        .
        FILTER(!isBlank(?subClassOf))
      }

    }
  `,
    { skip: !classUri || !isUri(classUri) },
  );

  const content = sparqlData?.results?.bindings
    ? Object.fromEntries(Object.entries(sparqlData.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  return {
    data: {
      ontologicalClass: content?.classUri as string | undefined,
      ontologicalClassLabel: content?.label as string | undefined,
      ontologicalClassComment: content?.comment as string | undefined,
      ontologicalClassSuperClasses: content?.superClasses?.split(',') as string[] | undefined,
    },
    status: sparqlStatus,
    error: sparqlError,
  };
}

/*
  This hook resolves all the possible properties of a RDF class.
*/
export interface RDFClassProperties {
  baseClass: string;
  fieldUri: string;
  classUri: string | undefined;
  range: string | undefined;
  label: string | undefined;
  comment: string | undefined;
  controlledVocabulary: string | undefined;
}
export function useRDFClassPropertiesResolver(classUri: string | undefined) {
  const { data: sparqlData, status: sparqlStatus } = useSparqlQuery(
    `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT

      ?baseClass
      ?fieldUri
      ?range
      ?comment

      GROUP_CONCAT(DISTINCT ?label; separator="; ") as ?label
      GROUP_CONCAT(DISTINCT ?controlledVocabulary; separator=",") as ?controlledVocabulary

    WHERE {

      VALUES ?classUri { <${classUri}> }

      ?classUri
        rdfs:subClassOf* ?baseClass
      .
      FILTER(!isBlank(?baseClass))


      ?fieldUri
        rdfs:domain ?baseClass
      .

      OPTIONAL {
        ?fieldUri
          rdfs:range ?range
      .
        OPTIONAL {
          ?range
            <https://w3id.org/italia/onto/l0/controlledVocabulary> ?controlledVocabulary
          .
        }

      }

      OPTIONAL {
        ?fieldUri
          rdfs:label ?label
        .
        FILTER(lang(?label) = 'en')
      }

      OPTIONAL {
        ?fieldUri
          rdfs:comment ?comment
        .
        FILTER(lang(?comment) = 'en')
      }

    }
  `,
    { skip: !classUri },
  );

  const content = sparqlData?.results?.bindings
    ? sparqlData.results.bindings.map((binding: any) =>
        Object.fromEntries(Object.entries(binding).map(([k, v]: any[]) => [k, v.value])),
      )
    : undefined;

  return {
    data: {
      classUri: classUri as string | undefined,
      classProperties: content as RDFClassProperties[] | undefined,
    },
    status: sparqlStatus,
  };
}

/*
  This hook resolves the vocabularies related to a rdf:type or its subclasses.
  E.g. for a location, returns Provinces, Regions, Municipalities, etc.
*/
export interface RDFClassVocabularies {
  controlledVocabulary: string;
  label?: string;
  subclass?: string;
  classUri?: string;
  api?: string;
}
export function useRDFClassVocabulariesResolver(classUri: string | undefined): AsyncState<RDFClassVocabularies[]> {
  const {
    data: sparqlData,
    status: sparqlStatus,
    error: error,
  } = useSparqlQuery(
    `
PREFIX NDC: <https://w3id.org/italia/onto/NDC/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT

  ?controlledVocabulary
  ?label
  GROUP_CONCAT(DISTINCT ?subclass; separator=",") as ?subclass
  ?api

 WHERE {

  ?subclass
    rdfs:subClassOf* <${classUri}>
  .
  FILTER ( ?subclass != skos:Concept )

  _:b1
    a ?subclass;
    skos:inScheme ?controlledVocabulary
  .

  ?controlledVocabulary a skos:ConceptScheme
  .

  # Get the label from rdfs or skos.
  # If there is a label in English, use it, otherwise use the Italian one.
  OPTIONAL {
    ?controlledVocabulary (rdfs:label|skos:prefLabel) ?label_en .
    FILTER(lang(?label_en) = 'en')
  }
  OPTIONAL {
    ?controlledVocabulary (rdfs:label|skos:prefLabel) ?label_it .
    FILTER(lang(?label_it) = 'it')
  }
  BIND(COALESCE(?label_en, ?label_it) as ?label)

  OPTIONAL {
    _:b2
      NDC:servesDataset  ?controlledVocabulary ;
      NDC:endpointURL ?api
    .
  }
}
  `,
    { skip: !classUri },
  );

  const content = sparqlData?.results?.bindings
    ? sparqlData.results.bindings.map((binding: any) =>
        Object.fromEntries(Object.entries(binding).map(([k, v]: any[]) => [k, v.value])),
      )
    : undefined;

  return {
    data: content as RDFClassVocabularies[] | undefined,
    status: sparqlStatus,
    error: error,
  };
}
