import { uri2shortUri } from '../json-schema-5';
import { Suggestion } from './models';

export type SemanticItem = {
  uri: string;
  label: string;
  description: string;
};

export async function initAutocomplete(config: any): Promise<void> {
  await Promise.all([getOntologiesSuggestions(config), getControlledVocabulariesSuggestions(config)]);
}

async function parallelFetch(
  config: any,
  fetchFunction: (sparqlUrl: string) => Promise<SemanticItem[]>,
): Promise<SemanticItem[]> {
  // Definisco tutti gli endpoint sparql da cui effettuare la ricerca
  // Supporta più endpoints in parallelo ma al momento usiamo solo quello passato in configurazione
  const sparqlEndpoints: { label: string; url: string }[] = [];
  const sparqlUrl = config.sparqlUrl?.trim() || '';
  if (sparqlUrl && !sparqlEndpoints.some((endpoint) => endpoint.url.includes(sparqlUrl))) {
    sparqlEndpoints.push({ label: 'Custom', url: sparqlUrl });
  }

  // Per ogni endpoint, effettuo la ricerca delle ontologie e memorizzo il risultato in cache
  const promises = await Promise.allSettled(sparqlEndpoints.map((endpoint) => fetchFunction(endpoint.url)));

  // Return all suggestions
  return promises
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
    .flat();
}

// Ontologies (i.e. https://www.w3id.org/italia/onto/CPV/) [~90 suggestions]
const DEFAULT_ONTOLOGIES_SUGGESTIONS: SemanticItem[] = [
  {
    uri: 'https://w3id.org/italia/onto/CPV/',
    label: 'The Core Person Vocabulary',
    description: 'The Core Person Vocabulary',
  },
  {
    uri: 'https://w3id.org/italia/onto/RPO/',
    label: 'Registered Residence Person Ontology',
    description: 'Registered Residence Person Ontology',
  },
  {
    uri: 'https://w3id.org/italia/onto/CLV/',
    label: 'Italian Core Location Vocabulary',
    description: 'Italian Core Location Vocabulary',
  },
  {
    uri: 'https://w3id.org/italia/onto/Learning/',
    label: 'Learning Ontology',
    description: 'Learning Ontology',
  },
  {
    uri: 'https://w3id.org/italia/onto/l0/',
    label: 'Top level ontology',
    description: 'Top level ontology',
  },
  {
    uri: 'http://publications.europa.eu/ontology/euvoc#',
    label: 'Euvoc Ontology',
    description: 'Euvoc Ontology',
  },
];

export async function getOntologiesSuggestions(config: any): Promise<Suggestion[]> {
  return (
    config.sparqlAutocompleteEnabled ? await parallelFetch(config, fetchOntologies) : DEFAULT_ONTOLOGIES_SUGGESTIONS
  ).map(({ uri, description, label }) => ({
    snippet: uri,
    docHTML: `${uri}<br />${description || label || ''}`,
    caption: uri2shortUri(uri.endsWith('/') ? uri.slice(0, -1) : uri),
    meta: 'onto',
    score: 50,
  }));
}

async function fetchOntologies(sparqlUrl: string): Promise<SemanticItem[]> {
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

  # Filter out blank nodes
  FILTER(!isBlank(?ontology))

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
LIMIT 500
`;
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings.map(
      (binding): SemanticItem => ({
        uri: binding.ontologyUri.value,
        label: binding.label?.value,
        description: binding.comment?.value,
      }),
    );
  } catch (error) {
    console.error('Error fetching ontology classes from SPARQL:', error);
    return [];
  }
}

// Controlled Vocabularies (i.e. https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/) [~350 suggestions]
const DEFAULT_CONTROLLED_VOCABULARIES_SUGGESTIONS: SemanticItem[] = [
  {
    uri: 'http://publications.europa.eu/resource/authority/country/',
    label: 'Country',
    description: 'Country',
  },
  {
    uri: 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code/',
    label: 'Vehicle Code',
    description: 'Vehicle Code',
  },
  {
    uri: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
    label: 'Education Level',
    description: 'Education Level',
  },
];

export async function getControlledVocabulariesSuggestions(config: any): Promise<Suggestion[]> {
  return (
    config.sparqlAutocompleteEnabled
      ? await parallelFetch(config, fetchControlledVocabularies)
      : DEFAULT_CONTROLLED_VOCABULARIES_SUGGESTIONS
  ).map(({ uri, description, label }) => ({
    snippet: uri,
    docHTML: `${uri}<br/>${description || label || ''}`,
    caption: uri2shortUri(uri.endsWith('/') ? uri.slice(0, -1) : uri),
    meta: 'vocab',
    score: 50,
  }));
}

async function fetchControlledVocabularies(sparqlUrl: string): Promise<SemanticItem[]> {
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

  # Filter out blank nodes
  FILTER(!isBlank(?controlledVocabulary))

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
LIMIT 500
`;
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings.map(
      (binding): SemanticItem => ({
        uri: binding.controlledVocabularyUri.value,
        label: binding.label?.value,
        description: binding.comment?.value,
      }),
    );
  } catch (error) {
    console.error('Error fetching controlled vocabularies from SPARQL:', error);
    return [];
  }
}

// Classes (i.e. https://w3id.org/italia/onto/CPV/Person) [~2500 suggestions]
const DEFAULT_CLASSES_SUGGESTIONS: SemanticItem[] = [
  {
    uri: 'https://w3id.org/italia/onto/CPV/Person',
    label: 'Person',
    description: 'A natural person',
  },
  {
    uri: 'https://w3id.org/italia/onto/CPV/Alive',
    label: 'Alive',
    description: 'An alive person',
  },
  {
    uri: 'https://w3id.org/italia/onto/CPV/EducationLevel',
    label: 'Education Level',
    description: 'Education Level',
  },
  {
    uri: 'https://w3id.org/italia/onto/CPV/ResidenceInTime',
    label: 'Residence In Time',
    description: 'Residence In Time',
  },
  // RPO
  {
    uri: 'https://w3id.org/italia/onto/RPO/RegisteredResidence',
    label: 'Registered Residence',
    description: 'Registered Residence',
  },
  {
    uri: 'https://w3id.org/italia/onto/RPO/RegisteredResidentPerson',
    label: 'Registered Resident Person',
    description: 'Registered Resident Person',
  },
  // CLV
  {
    uri: 'https://w3id.org/italia/onto/CLV/Feature',
    label: 'Feature',
    description: 'Feature',
  },
  {
    uri: 'https://w3id.org/italia/onto/CLV/Geometry',
    label: 'Geometry',
    description: 'Geometry',
  },
  {
    uri: 'https://w3id.org/italia/onto/CLV/Address',
    label: 'Address',
    description: 'Address',
  },
  {
    uri: 'https://w3id.org/italia/onto/CLV/CivicNumbering',
    label: 'Civic Numbering',
    description: 'Civic Numbering',
  },
  // Learning
  {
    uri: 'https://w3id.org/italia/onto/Learning/DegreeCourse',
    label: 'Degree Course',
    description: 'Degree Course',
  },
  {
    uri: 'https://w3id.org/italia/onto/Learning/EducationalOffering',
    label: 'Educational Offering',
    description: 'Educational Offering',
  },
  {
    uri: 'https://w3id.org/italia/onto/Learning/DegreeClass',
    label: 'Degree Class',
    description: 'Degree Class',
  },
  {
    uri: 'https://w3id.org/italia/onto/Learning/Qualification',
    label: 'Qualification',
    description: 'Qualification',
  },
  {
    uri: 'https://w3id.org/italia/onto/Learning/Enrolment',
    label: 'Enrolment',
    description: 'Enrolment',
  },
  // l0
  {
    uri: 'https://w3id.org/italia/onto/l0/Location',
    label: 'Location',
    description: 'Location',
  },
];

export async function getClassesSuggestions(config: any, ontologyUri: string): Promise<Suggestion[]> {
  return (
    config.sparqlAutocompleteEnabled
      ? await parallelFetch(config, (sparqlUrl: string) => fetchClasses(sparqlUrl, ontologyUri))
      : DEFAULT_CLASSES_SUGGESTIONS
  ).map(({ uri, description, label }) => ({
    snippet: uri.replace(ontologyUri, ''),
    docHTML: `${uri}<br/>${description || label || ''}`,
    caption: uri2shortUri(uri),
    meta: 'class',
    score: 50,
  }));
}

async function fetchClasses(sparqlUrl: string, ontologyUri: string): Promise<SemanticItem[]> {
  try {
    const trimmedOntologyUri =
      ontologyUri.endsWith('/') || ontologyUri.endsWith('#') ? ontologyUri.slice(0, -1) : ontologyUri;

    const sparqlQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?class ?label ?comment WHERE {
  ?class a owl:Class .
  ?class rdfs:isDefinedBy <${trimmedOntologyUri}> .

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

    return data.results.bindings.map(
      (binding): SemanticItem => ({
        uri: binding.class.value,
        label: binding.label?.value,
        description: binding.comment?.value,
      }),
    );
  } catch (error) {
    console.error('Error fetching ontology classes from SPARQL:', error);
    return [];
  }
}

// Properties (i.e. https://w3id.org/italia/onto/CPV/taxCode) [~300 suggestions per ontology]
export async function getPropertiesSuggestions(config: any, ontologyUri: string): Promise<Suggestion[]> {
  return (
    config.sparqlAutocompleteEnabled
      ? await parallelFetch(config, (sparqlUrl: string) => fetchProperties(sparqlUrl, ontologyUri))
      : []
  ).map(({ uri, description, label }) => ({
    snippet: uri.replace(ontologyUri, ''),
    docHTML: `${uri}<br/>${description || label || ''}`,
    caption: uri2shortUri(uri),
    meta: 'property',
    score: 50,
  }));
}

async function fetchProperties(sparqlUrl: string, ontologyUri: string): Promise<SemanticItem[]> {
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
LIMIT 500
`;
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings.map(
      (binding): SemanticItem => ({
        uri: binding.property.value,
        label: binding.label?.value,
        description: binding.comment?.value,
      }),
    );
  } catch (error) {
    console.error('Error fetching ontology classes from SPARQL:', error);
    return [];
  }
}
