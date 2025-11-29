// SPARQL query to fetch all ontology classes
const ONTOLOGY_CLASSES_QUERY = `
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?class ?label ?description WHERE {
  ?class a owl:Class .
  OPTIONAL { ?class rdfs:label ?label }
  OPTIONAL { ?class rdfs:comment ?description }
  # Filter out blank nodes
  FILTER(!isBlank(?class))
}
ORDER BY ?class
`;

// Type for suggestion items
interface Suggestion {
  snippet: string;
  caption: string;
  docHTML?: string;
  description?: string;
  meta?: string;
  score?: number;
}

// Type for suggestion map
type SuggestionMap = Record<string, Suggestion[]>;

// Cache for SPARQL results
let cachedSuggestionMap: SuggestionMap | null = null;
let isLoading = false;
let loadPromise: Promise<SuggestionMap> | null = null;
let lastSparqlUrl: string | null = null;

// Function to reset cache when SPARQL endpoint changes
function resetCacheIfNeeded(sparqlUrl: string) {
  if (lastSparqlUrl && lastSparqlUrl !== sparqlUrl) {
    console.log('SPARQL endpoint changed, resetting autocomplete cache');
    cachedSuggestionMap = null;
    isLoading = false;
    loadPromise = null;
  }
  lastSparqlUrl = sparqlUrl;
}

// Function to fetch ontology classes from SPARQL
async function fetchOntologyClasses(sparqlUrl: string): Promise<Suggestion[]> {
  try {
    const endpoint = `${sparqlUrl.trim()}?format=json&query=${encodeURIComponent(ONTOLOGY_CLASSES_QUERY)}`;
    const response = await fetch(endpoint, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch ontology classes:', response.statusText);
      return [];
    }

    const data = await response.json();

    return data.results.bindings.map((binding: any) => {
      const classUri = binding.class.value;
      const label = binding.label?.value || classUri.split('/').pop();
      const description = binding.description?.value;

      // Extract ontology prefix (e.g., "CPV:Person" from "https://w3id.org/italia/onto/CPV/Person")
      const parts = classUri.replace('https://w3id.org/italia/onto/', '').split('/');
      const prefix = parts[0];
      const className = parts.slice(1).join('/') || prefix;
      const caption = `${prefix}:${className}`;

      return {
        snippet: classUri,
        docHTML: description || label,
        caption: caption,
        meta: 'class',
        score: 50, // Default score for SPARQL-fetched classes
      };
    });
  } catch (error) {
    console.error('Error fetching ontology classes from SPARQL:', error);
    return [];
  }
}

// Function to initialize and merge suggestions
async function initializeSuggestions(sparqlUrl: string): Promise<SuggestionMap> {
  // Reset cache if SPARQL endpoint changed
  resetCacheIfNeeded(sparqlUrl);

  if (cachedSuggestionMap) {
    return cachedSuggestionMap;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async (): Promise<SuggestionMap> => {
    // Start with static suggestions
    const mergedSuggestions: SuggestionMap = { ...suggestionMap };

    // Fetch ontology classes from SPARQL
    const sparqlClasses = await fetchOntologyClasses(sparqlUrl);

    // Merge SPARQL results with existing x-jsonld-type suggestions
    const existingSuggestions = suggestionMap['x-jsonld-type'] || [];
    mergedSuggestions['x-jsonld-type'] = [...existingSuggestions, ...sparqlClasses];

    console.log(`Loaded ${sparqlClasses.length} ontology classes from SPARQL`);

    cachedSuggestionMap = mergedSuggestions;
    isLoading = false;
    return mergedSuggestions;
  })();

  return loadPromise;
}

const suggestionMap = {
  /// Completion for REST API Linked Data Keywords.
  'x-jsonld': [
    {
      caption: 'x-jsonld-type',
      snippet: 'x-jsonld-type: ',
      meta: 'keyword',
      score: 100,
    },
    {
      snippet: 'x-jsonld-context: ',
      caption: 'x-jsonld-context',
      meta: 'keyword',
      score: 100,
    },
  ],
  '@vocab': [
    {
      snippet: 'https://w3id.org/italia/onto/CPV/',
      docHTML: 'The Core Person Vocabulary',
      caption: 'CPV',
      score: 100,
    },
    {
      snippet: 'https://w3id.org/italia/onto/RPO/',
      docHTML: 'Registered Residence Person Ontology',
      caption: 'RPO',
      score: 90,
    },
    {
      snippet: 'https://w3id.org/italia/onto/CLV/',
      docHTML: 'Italian Core Location Vocabulary',
      caption: 'CLV',
      score: 50,
    },
    {
      snippet: 'https://w3id.org/italia/onto/Learning/',
      docHTML: 'Learning Ontology',
      caption: 'Learning',
      score: 50,
    },
    {
      snippet: 'https://w3id.org/italia/onto/l0/',
      docHTML: 'Top level ontology',
      caption: 'l0',
      score: 50,
    },
    {
      snippet: 'http://publications.europa.eu/ontology/euvoc#',
      docHTML: 'Euvoc Ontology',
      caption: 'euvoc',
      score: 50,
    },
  ],
  'x-jsonld-type': [
    {
      snippet: 'https://w3id.org/italia/onto/CPV/Person',
      docHTML: 'A natural person',
      caption: 'CPV:Person',
      score: 100,
    },
    {
      snippet: 'https://w3id.org/italia/onto/CPV/Alive',
      docHTML: 'An alive person',
      caption: 'CPV:Alive',
      score: 90,
    },
    {
      snippet: 'https://w3id.org/italia/onto/CPV/EducationLevel',
      docHTML: 'Education Level',
      caption: 'CPV:EducationLevel',
      score: 50,
    },
    {
      snippet: 'https://w3id.org/italia/onto/CPV/ResidenceInTime',
      docHTML: 'Residenza nel tempo (storica)',
      caption: 'CPV:ResidenceInTime',
      score: 50,
    },
    // RPO
    {
      snippet: 'https://w3id.org/italia/onto/RPO/RegisteredResidence',
      docHTML: 'Residenza anagrafica',
      caption: 'RPO:RegisteredResidence',
      score: 50,
    },
    {
      snippet: 'https://w3id.org/italia/onto/RPO/RegisteredResidentPerson',
      docHTML: 'Persona anagraficamente residente',
      caption: 'RPO:RegisteredResidentPerson',
      score: 50,
    },
    // CLV
    {
      snippet: 'https://w3id.org/italia/onto/CLV/Feature',
      docHTML: 'Luogo',
      caption: 'CLV:Feature',
      score: 50,
    },
    {
      snippet: 'https://w3id.org/italia/onto/CLV/Geometry',
      docHTML: 'Geometria',
      caption: 'CLV:Geometry',
      score: 50,
    },
    {
      snippet: 'https://w3id.org/italia/onto/CLV/Address',
      docHTML: 'Indirizzo / Accesso Esterno',
      caption: 'CLV:Address',
      score: 50,
    },
    {
      snippet: 'https://w3id.org/italia/onto/CLV/CivicNumbering',
      docHTML: 'Numerazione Civica / Numero Civico',
      caption: 'CLV:CivicNumbering',
      score: 50,
    },
    // Learning
    {
      snippet: 'https://w3id.org/italia/onto/Learning/DegreeCourse',
      description: 'Corso di Laurea',
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
  ],
  'x-jsonld-context': [
    // a list of json-ld keywords enclosed by quotes.
    {
      caption: '"@vocab"',
      snippet: '"@vocab": ',
      docHTML: 'A JSON-LD vocabulary',
    },
    {
      caption: '"@base"',
      snippet: '"@base": ',
      docHTML: 'A JSON-LD vocabulary',
    },
    {
      // @id, @type, @context
      caption: '"@id"',
      snippet: '"@id": ',
      docHTML: 'A JSON-LD vocabulary',
    },
    {
      caption: '"@type"',
      snippet: '"@type": ',
      docHTML: 'A JSON-LD vocabulary',
    },
    {
      caption: '"@context"',
      snippet: '"@context": ',
      docHTML: 'A JSON-LD vocabulary',
    },
  ],
  '@base': [
    {
      caption: 'Country',
      snippet: 'http://publications.europa.eu/resource/authority/country/',
      docHTML: 'EU Country Vocabulary',
      score: 100,
    },
    {
      caption: 'Vehicle Code',
      snippet: 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code/',
      docHTML: 'IT Vehicle Code',
      score: 90,
    },
    {
      caption: 'Education Level',
      snippet: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      docHTML: 'IT Education Level',
      score: 90,
    },
  ],
};

export const EditorAutosuggestCustomPlugin = () => {
  return {
    statePlugins: {
      editor: {
        wrapActions: {
          addAutosuggestionCompleters: (ori, system) => (context) => {
            try {
              return ori(context).concat([
                {
                  getCompletions(editor, session, pos, prefix, cb) {
                    const path = system.fn.getPathForPosition({
                      pos,
                      prefix,
                      editorValue: editor.getValue(),
                      AST: system.fn.AST,
                    });

                    // Check if SPARQL URL has changed and initialize/reinitialize if needed
                    const sparqlUrl = system.getConfigs()?.sparqlUrl;
                    if (sparqlUrl) {
                      // This will reset cache if URL changed, or use existing cache if unchanged
                      if (!cachedSuggestionMap || (lastSparqlUrl && lastSparqlUrl !== sparqlUrl)) {
                        if (!isLoading) {
                          console.log('Initializing SPARQL autocomplete suggestions...');
                          initializeSuggestions(sparqlUrl).catch((err) => {
                            console.error('Failed to initialize SPARQL suggestions:', err);
                          });
                        }
                      }
                    }

                    // Use cached suggestions if available, otherwise fall back to static
                    const currentSuggestionMap = cachedSuggestionMap || suggestionMap;

                    if (path.length == 3 && path[0] === 'components' && path[1] === 'schemas') {
                      const suggestions = currentSuggestionMap['x-jsonld'];
                      if (suggestions) {
                        cb(null, suggestions);
                      }
                      return;
                    }

                    const suggestions = currentSuggestionMap[path[path.length - 1]];
                    if (suggestions) {
                      cb(null, suggestions);
                    }
                  },
                },
              ]);
            } catch (e) {
              console.error(e);
              return null;
            }
          },
        },
      },
    },
  };
};export default EditorAutosuggestCustomPlugin;
