import { InClientCache } from '@teamdigitale/schema-editor-utils';
import { uri2shortUri } from '../json-schema-5';
import { Suggestion } from './models';

export type OperationKey = 'ontologies' | 'controlledVocabularies' | 'classes' | `properties-${string}`;

export const cache = new InClientCache<Promise<Suggestion[]>>({ ttl: 1000 * 60 * 60 * 24 });

export const DEFAULT_SPARQL_ENDPOINTS = [
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

export async function initAutocomplete(config: any): Promise<void> {
  await Promise.all([
    getOntologiesSuggestions(config),
    getClassesSuggestions(config),
    getControlledVocabulariesSuggestions(config),
  ]);
}

async function recursiveFetch(
  key: OperationKey,
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
      const cacheKey = `${key}__${endpoint.url}`;
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
const DEFAULT_ONTOLOGIES_SUGGESTIONS = [
  {
    snippet: 'https://w3id.org/italia/onto/CPV/',
    docHTML: 'The Core Person Vocabulary',
    caption: 'onto:CPV',
    meta: 'onto',
    score: 100,
  },
  {
    snippet: 'https://w3id.org/italia/onto/RPO/',
    docHTML: 'Registered Residence Person Ontology',
    caption: 'onto:RPO',
    meta: 'onto',
    score: 90,
  },
  {
    snippet: 'https://w3id.org/italia/onto/CLV/',
    docHTML: 'Italian Core Location Vocabulary',
    caption: 'onto:CLV',
    meta: 'onto',
    score: 50,
  },
  {
    snippet: 'https://w3id.org/italia/onto/Learning/',
    docHTML: 'Learning Ontology',
    caption: 'onto:Learning',
    meta: 'onto',
    score: 50,
  },
  {
    snippet: 'https://w3id.org/italia/onto/l0/',
    docHTML: 'Top level ontology',
    caption: 'onto:l0',
    meta: 'onto',
    score: 50,
  },
  {
    snippet: 'http://publications.europa.eu/ontology/euvoc#',
    docHTML: 'Euvoc Ontology',
    caption: 'ontology:euvoc',
    meta: 'onto',
    score: 50,
  },
];

export async function getOntologiesSuggestions(config: any): Promise<Suggestion[]> {
  return config.sparqlAutocompleteEnabled
    ? await recursiveFetch('ontologies', config, fetchOntologies)
    : DEFAULT_ONTOLOGIES_SUGGESTIONS;
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
LIMIT 300
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
const DEFAULT_CONTROLLED_VOCABULARIES_SUGGESTIONS = [
  {
    caption: 'Country',
    snippet: 'http://publications.europa.eu/resource/authority/country/',
    docHTML: 'authority:country',
    meta: 'vocab',
    score: 100,
  },
  {
    caption: 'Vehicle Code',
    snippet: 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code/',
    docHTML: 'provinces-identifiers:vehicle-code',
    meta: 'vocab',
    score: 90,
  },
  {
    caption: 'Education Level',
    snippet: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
    docHTML: 'classifications-for-people:education-level',
    meta: 'vocab',
    score: 90,
  },
];

export async function getControlledVocabulariesSuggestions(config: any): Promise<Suggestion[]> {
  return config.sparqlAutocompleteEnabled
    ? await recursiveFetch('controlledVocabularies', config, fetchControlledVocabularies)
    : DEFAULT_CONTROLLED_VOCABULARIES_SUGGESTIONS;
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
LIMIT 300
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
const DEFAULT_CLASSES_SUGGESTIONS = [
  {
    snippet: 'https://w3id.org/italia/onto/CPV/Person',
    docHTML: 'A natural person',
    caption: 'CPV:Person',
    meta: 'class',
    score: 100,
  },
  {
    snippet: 'https://w3id.org/italia/onto/CPV/Alive',
    docHTML: 'An alive person',
    caption: 'CPV:Alive',
    meta: 'class',
    score: 90,
  },
  {
    snippet: 'https://w3id.org/italia/onto/CPV/EducationLevel',
    docHTML: 'Education Level',
    caption: 'CPV:EducationLevel',
    meta: 'class',
    score: 50,
  },
  {
    snippet: 'https://w3id.org/italia/onto/CPV/ResidenceInTime',
    docHTML: 'Residenza nel tempo (storica)',
    caption: 'CPV:ResidenceInTime',
    meta: 'class',
    score: 50,
  },
  // RPO
  {
    snippet: 'https://w3id.org/italia/onto/RPO/RegisteredResidence',
    docHTML: 'Residenza anagrafica',
    caption: 'RPO:RegisteredResidence',
    meta: 'class',
    score: 50,
  },
  {
    snippet: 'https://w3id.org/italia/onto/RPO/RegisteredResidentPerson',
    docHTML: 'Persona anagraficamente residente',
    caption: 'RPO:RegisteredResidentPerson',
    meta: 'class',
    score: 50,
  },
  // CLV
  {
    snippet: 'https://w3id.org/italia/onto/CLV/Feature',
    docHTML: 'Luogo',
    caption: 'CLV:Feature',
    meta: 'class',
    score: 50,
  },
  {
    snippet: 'https://w3id.org/italia/onto/CLV/Geometry',
    docHTML: 'Geometria',
    caption: 'CLV:Geometry',
    meta: 'class',
    score: 50,
  },
  {
    snippet: 'https://w3id.org/italia/onto/CLV/Address',
    docHTML: 'Indirizzo / Accesso Esterno',
    caption: 'CLV:Address',
    meta: 'class',
    score: 50,
  },
  {
    snippet: 'https://w3id.org/italia/onto/CLV/CivicNumbering',
    docHTML: 'Numerazione Civica / Numero Civico',
    caption: 'CLV:CivicNumbering',
    meta: 'class',
    score: 50,
  },
  // Learning
  {
    snippet: 'https://w3id.org/italia/onto/Learning/DegreeCourse',
    docHTML: 'Corso di Laurea',
    caption: 'Learning:DegreeCourse',
    meta: 'class',
    score: 30,
  },
  {
    snippet: 'https://w3id.org/italia/onto/Learning/EducationalOffering',
    docHTML: 'Offerta formativa',
    caption: 'Learning:EducationalOffering',
    meta: 'class',
    score: 30,
  },
  {
    snippet: 'https://w3id.org/italia/onto/Learning/DegreeClass',
    docHTML: 'Classe di Laurea',
    caption: 'Learning:DegreeClass',
    meta: 'class',
    score: 30,
  },
  {
    snippet: 'https://w3id.org/italia/onto/Learning/Qualification',
    docHTML: 'Qualifica (Titolo di Studio)',
    caption: 'Learning:Qualification',
    meta: 'class',
    score: 30,
  },
  {
    snippet: 'https://w3id.org/italia/onto/Learning/Enrolment',
    docHTML: 'Iscrizione',
    caption: 'Learning:Enrolment',
    meta: 'class',
    score: 30,
  },
  // l0
  {
    snippet: 'https://w3id.org/italia/onto/l0/Location',
    docHTML: 'Location',
    caption: 'l0:Location',
    meta: 'class',
    score: 50,
  },
];

export async function getClassesSuggestions(config: any): Promise<Suggestion[]> {
  return config.sparqlAutocompleteEnabled
    ? await recursiveFetch('classes', config, fetchClasses)
    : DEFAULT_CLASSES_SUGGESTIONS;
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
LIMIT 300
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

// Properties (i.e. https://w3id.org/italia/onto/CPV/taxCode)
export async function getPropertiesSuggestions(config: any, ontologyUri: string): Promise<Suggestion[]> {
  return config.sparqlAutocompleteEnabled
    ? await recursiveFetch(`properties-${ontologyUri}`, config, (sparqlUrl: string) =>
        fetchProperties(sparqlUrl, ontologyUri),
      )
    : [];
}

async function fetchProperties(sparqlUrl: string, ontologyUri: string): Promise<Suggestion[]> {
  try {
    const trimmedOntologyUri =
      ontologyUri.endsWith('/') || ontologyUri.endsWith('#') ? ontologyUri.slice(0, -1) : ontologyUri;

    const sparqlQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?property ?label ?comment WHERE {
  ?property rdf:type ?type .
  FILTER(?type IN (
    rdf:Property,
    owl:ObjectProperty,
    owl:DatatypeProperty,
    owl:FunctionalProperty
  ))
  ?property rdfs:isDefinedBy <${trimmedOntologyUri}> .
  
  # Filter out blank nodes
  FILTER(!isBlank(?property))

  # Get the label from rdfs or skos.
  OPTIONAL {
    ?property (rdfs:label|skos:prefLabel) ?label_it .
    FILTER(lang(?label_it) = "it")
  }
  OPTIONAL {
    ?property (rdfs:label|skos:prefLabel) ?label_en .
    FILTER(lang(?label_en) = "en")
  }
  BIND(COALESCE(?label_it, ?label_en) as ?label)

  # Get the comment from rdfs or skos.
  OPTIONAL {
    ?property (rdfs:comment|skos:definition) ?comment_it .
    FILTER(lang(?comment_it) = "it")
  }
  OPTIONAL {
    ?property (rdfs:comment|skos:definition) ?comment_en .
    FILTER(lang(?comment_en) = "en")
  }
  BIND(COALESCE(?comment_it, ?comment_en) as ?comment)
}

ORDER BY ?property
LIMIT 300
`;
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings
      .filter((binding: any) => !binding.property.value.startsWith('nodeID://')) // Filter out blank nodes
      .map((binding: any) => {
        const propertyUri = binding.property.value;
        const label = binding.label?.value;
        const description = binding.description?.value;

        return {
          snippet: propertyUri.replace(ontologyUri, ''),
          docHTML: `${propertyUri}<br/>${description || label || ''}`,
          caption: uri2shortUri(propertyUri),
          meta: 'property',
          score: 50,
        };
      });
  } catch (error) {
    console.error('Error fetching ontology classes from SPARQL:', error);
    return [];
  }
}
