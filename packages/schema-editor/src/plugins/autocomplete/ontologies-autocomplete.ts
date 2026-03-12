import { InClientCache } from '@teamdigitale/schema-editor-utils';
import { Suggestion } from './models';
import { uri2shortUri } from '../json-schema-5';

type OperationType = 'ontologies' | 'controlledVocabularies' | 'classes';

const cache = new InClientCache<Promise<Suggestion[]>>({ ttl: 1000 * 60 * 60 * 24 });

const DEFAULT_SPARQL_ENDPOINTS = [
  {
    label: 'ISTAT Virtuoso',
    url: 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql',
  },
  // Disabled due to CORS errors
  // {
  //   label: 'EU Publications Office',
  //   url: 'https://publications.europa.eu/webapi/rdf/sparql',
  // },
  {
    label: 'CORDIS',
    url: 'https://cordis.europa.eu/datalab/sparql',
  },
];

async function recursiveFetch(
  operationType: OperationType,
  config: any,
  fetchFunction: (sparqlUrl: string) => Promise<Suggestion[]>,
): Promise<Suggestion[]> {
  // Definisco tutti gli endpoint sparql da cui effettuare la ricerca
  const sparqlEndpoints = [...DEFAULT_SPARQL_ENDPOINTS];
  const sparqlUrl = config.sparqlUrl?.trim() || '';
  if (sparqlUrl && !sparqlEndpoints.some((endpoint) => endpoint.url.includes(sparqlUrl))) {
    sparqlEndpoints.push({ label: 'Custom', url: sparqlUrl });
  }

  // Per ogni endpoint, effettuo la ricerca delle ontologie e memorizzo il risultato in cache
  const promises = await Promise.allSettled(
    sparqlEndpoints.map((endpoint) => {
      const cacheKey = `${operationType}__${endpoint.url}`;
      const cachedPromise = cache.get(cacheKey);
      if (cachedPromise) {
        return cachedPromise;
      }
      const promise = fetchFunction(endpoint.url);
      cache.set(cacheKey, promise);
      return promise.catch((error) => {
        cache.delete(cacheKey);
        throw error;
      });
    }),
  );

  // Return all suggestions
  return promises
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
    .flat();
}

// Ontologies (i.e. https://www.w3id.org/italia/onto/CPV/)
export async function getOntologiesSuggestions(config: any): Promise<Suggestion[]> {
  return recursiveFetch('ontologies', config, fetchOntologies);
}

async function fetchOntologies(sparqlUrl: string): Promise<Suggestion[]> {
  try {
    const sparqlQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?ontologyUri ?label ?comment WHERE {
  ?ontology rdf:type owl:Ontology .

  # Ensure URI ends with / or #
  BIND(
    IF(
      STRENDS(STR(?ontology), "#") || STRENDS(STR(?ontology), "/"),
      STR(?ontology),
      CONCAT(STR(?ontology), "/")
    ) AS ?ontologyUri
  )

  # Get the label from rdfs or skos.
  OPTIONAL {
    ?ontology (rdfs:label|skos:prefLabel) ?label_it .
    FILTER(lang(?label_it) = "it")
  }
  OPTIONAL {
    ?ontology (rdfs:label|skos:prefLabel) ?label_en .
    FILTER(lang(?label_en) = "en")
  }
  BIND(COALESCE(?label_it, ?label_en) as ?label)

  # Get the comment from rdfs or skos.
  OPTIONAL {
    ?ontology (rdfs:comment|skos:definition) ?comment_it .
    FILTER(lang(?comment_it) = "it")
  }
  OPTIONAL {
    ?ontology (rdfs:comment|skos:definition) ?comment_en .
    FILTER(lang(?comment_en) = "en")
  }
  BIND(COALESCE(?comment_it, ?comment_en) as ?comment)
}

ORDER BY ?ontology
`;
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings
      .filter((binding: any) => !binding.ontologyUri.value.startsWith('nodeID://')) // Filter out blank nodes
      .map((binding: any) => {
        const ontologyUri = binding.ontologyUri.value;
        const label = binding.label?.value;
        const description = binding.description?.value;

        return {
          snippet: ontologyUri,
          docHTML: `${ontologyUri}<br/>${description || label || ''}`,
          caption: uri2shortUri(ontologyUri.endsWith('/') ? ontologyUri.slice(0, -1) : ontologyUri),
          meta: 'onto',
          score: 50,
        };
      });
  } catch (error) {
    console.error('Error fetching ontology classes from SPARQL:', error);
    return [];
  }
}

// Controlled Vocabularies (i.e. https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/)
export async function getControlledVocabulariesSuggestions(config: any): Promise<Suggestion[]> {
  return recursiveFetch('controlledVocabularies', config, fetchControlledVocabularies);
}

async function fetchControlledVocabularies(sparqlUrl: string): Promise<Suggestion[]> {
  try {
    const sparqlQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?controlledVocabularyUri ?label ?comment WHERE {
  ?controlledVocabulary rdf:type skos:ConceptScheme .

  # Ensure URI ends with / or #
  BIND(
    IF(
      STRENDS(STR(?controlledVocabulary), "#") || STRENDS(STR(?controlledVocabulary), "/"),
      STR(?controlledVocabulary),
      CONCAT(STR(?controlledVocabulary), "/")
    ) AS ?controlledVocabularyUri
  )

  # Get the label from rdfs or skos.
  OPTIONAL {
    ?controlledVocabulary (rdfs:label|skos:prefLabel) ?label_it .
    FILTER(lang(?label_it) = "it")
  }
  OPTIONAL {
    ?controlledVocabulary (rdfs:label|skos:prefLabel) ?label_en .
    FILTER(lang(?label_en) = "en")
  }
  BIND(COALESCE(?label_it, ?label_en) as ?label)

  # Get the comment from rdfs or skos.
  OPTIONAL {
    ?controlledVocabulary (rdfs:comment|skos:definition) ?comment_it .
    FILTER(lang(?comment_it) = "it")
  }
  OPTIONAL {
    ?controlledVocabulary (rdfs:comment|skos:definition) ?comment_en .
    FILTER(lang(?comment_en) = "en")
  }
  BIND(COALESCE(?comment_it, ?comment_en) as ?comment)
}

ORDER BY ?controlledVocabulary
`;
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings
      .filter((binding: any) => !binding.ontologyUri.value.startsWith('nodeID://')) // Filter out blank nodes
      .map((binding: any) => {
        const controlledVocabularyUri = binding.controlledVocabularyUri.value;
        const label = binding.label?.value;
        const description = binding.description?.value;

        return {
          snippet: controlledVocabularyUri,
          docHTML: `${controlledVocabularyUri}<br/>${description || label || ''}`,
          caption: uri2shortUri(
            controlledVocabularyUri.endsWith('/') ? controlledVocabularyUri.slice(0, -1) : controlledVocabularyUri,
          ),
          meta: 'vocab',
          score: 50,
        };
      });
  } catch (error) {
    console.error('Error fetching controlled vocabularies from SPARQL:', error);
    return [];
  }
}

// Classes (i.e. https://w3id.org/italia/onto/CPV/Person)
export async function getClassesSuggestions(config: any): Promise<Suggestion[]> {
  return recursiveFetch('classes', config, fetchClasses);
}

async function fetchClasses(sparqlUrl: string): Promise<Suggestion[]> {
  try {
    const sparqlQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?class ?label ?comment WHERE {
  ?class a owl:Class .

  # Filter out blank nodes
  FILTER(!isBlank(?class))

  # Get the label from rdfs or skos.
  OPTIONAL {
    ?class (rdfs:label|skos:prefLabel) ?label_it .
    FILTER(lang(?label_it) = "it")
  }
  OPTIONAL {
    ?class (rdfs:label|skos:prefLabel) ?label_en .
    FILTER(lang(?label_en) = "en")
  }
  BIND(COALESCE(?label_it, ?label_en) as ?label)

  # Get the comment from rdfs or skos.
  OPTIONAL {
    ?class (rdfs:comment|skos:definition) ?comment_it .
    FILTER(lang(?comment_it) = "it")
  }
  OPTIONAL {
    ?class (rdfs:comment|skos:definition) ?comment_en .
    FILTER(lang(?comment_en) = "en")
  }
  BIND(COALESCE(?comment_it, ?comment_en) as ?comment)
}

ORDER BY ?class
`;
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings
      .filter((binding: any) => !binding.ontologyUri.value.startsWith('nodeID://')) // Filter out blank nodes
      .map((binding: any) => {
        const classUri = binding.class.value;
        const label = binding.label?.value;
        const description = binding.description?.value;

        return {
          snippet: classUri,
          docHTML: `${classUri}<br/>${description || label || ''}`,
          caption: uri2shortUri(classUri),
          meta: 'class',
          score: 50,
        };
      });
  } catch (error) {
    console.error('Error fetching ontology classes from SPARQL:', error);
    return [];
  }
}
