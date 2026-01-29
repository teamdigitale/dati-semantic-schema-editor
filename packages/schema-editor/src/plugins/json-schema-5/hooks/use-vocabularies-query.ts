import { AsyncState } from '../models';
import { useSparqlQuery } from './use-sparql';

export function useVocabulariesQuery(): AsyncState<any> {
  const { data, status, error } = useSparqlQuery<any>(
    `
    PREFIX ndc: <https://w3id.org/italia/onto/NDC/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    CONSTRUCT {
        ?scheme ndc:keyConcept ?concept .
        ?scheme skos:prefLabel ?title .
        ?scheme dct:language ?languages .
        ?scheme dct:description ?description .
        ?scheme dcterms:type ?type .
        ?scheme owl:versionInfo ?version .
        ?scheme dct:rightsHolder ?publisher .
    }
    WHERE {
        ?scheme ndc:keyConcept ?concept .
        ?scheme skos:prefLabel ?title .

        OPTIONAL {
            ?scheme dct:language ?languages .
        }
        OPTIONAL {
            ?scheme dct:description ?description .
        }
        OPTIONAL {
            ?scheme dcterms:type ?type .
        }
        OPTIONAL {
            ?scheme owl:versionInfo ?version .
        }
        OPTIONAL {
            ?scheme dct:rightsHolder ?publisher .
        }
    }
    LIMIT 7
  `,
    {
      format: 'application/ld+json',
    },
  );

  return {
    data,
    status,
    error,
  };
}
