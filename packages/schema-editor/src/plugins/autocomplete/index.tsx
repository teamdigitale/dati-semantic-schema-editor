import { Suggestion } from './models';
import {
  getClassesSuggestions,
  getControlledVocabulariesSuggestions,
  getOntologiesSuggestions,
} from './ontologies-autocomplete';

const SUGGESTIONS_MAP: Record<string, Suggestion[]> = {
  // Custom x-jsonld-xxx keywords
  'x-jsonld': [
    {
      caption: 'x-jsonld-type',
      snippet: 'x-jsonld-type: ',
      meta: 'keyword',
      score: 100,
    },
    {
      snippet: `x-jsonld-context:\n  '@vocab': `,
      caption: 'x-jsonld-context',
      meta: 'object',
      score: 100,
    },
  ],

  // JSON-LD 1.1 keywords
  'x-jsonld-context': [
    // a list of json-ld keywords enclosed by quotes.
    {
      caption: '"@vocab"',
      snippet: '"@vocab": ',
      docHTML: 'A JSON-LD vocabulary',
      score: 0,
    },
    {
      caption: '"@base"',
      snippet: '"@base": ',
      docHTML: 'A JSON-LD base IRI. Should end with a "/" and must not end with a "#".',
      score: 0,
    },
    {
      // @id, @type, @context
      caption: '"@id"',
      snippet: '"@id": ',
      docHTML: 'A JSON-LD node identifier',
      score: 0,
    },
    {
      caption: '"@type"',
      snippet: '"@type": ',
      docHTML: 'A JSON-LD type',
      score: 0,
    },
    {
      caption: '"@context"',
      snippet: '"@context": ',
      docHTML: 'A JSON-LD context',
      score: 0,
    },
    {
      caption: '"@language"',
      snippet: '"@language": ',
      docHTML: 'Default language for string values',
      score: 0,
    },
    {
      caption: '"@version"',
      snippet: '"@version": ',
      docHTML: 'JSON-LD version (1.0 or 1.1)',
      score: 0,
    },
    {
      caption: '"@protected"',
      snippet: '"@protected": ',
      docHTML: 'Prevent terms from being overridden (JSON-LD 1.1). Default is false.',
      score: 0,
    },
    {
      caption: '"@propagate"',
      snippet: '"@propagate": ',
      docHTML: 'Control context propagation (JSON-LD 1.1). Default is true.',
      score: 0,
    },
    {
      snippet: 'http://www.w3.org/2004/02/skos/core#',
      docHTML: 'Simple Knowledge Organization System',
      caption: 'skos',
      score: 50,
    },
    {
      snippet: 'http://purl.org/dc/terms/',
      docHTML: 'Dublin Core Metadata Terms',
      caption: 'dcterms',
      score: 50,
    },
    {
      snippet: 'http://www.w3.org/2000/01/rdf-schema#',
      docHTML: 'RDF Schema',
      caption: 'rdfs',
      score: 50,
    },
    {
      snippet: 'http://www.w3.org/2001/XMLSchema#',
      docHTML: 'XML Schema Datatypes',
      caption: 'xsd',
      score: 50,
    },
  ],
  '@propagate': [
    {
      caption: 'true',
      snippet: 'true',
      docHTML: 'Context propagation enabled',
      score: 100,
    },
    {
      caption: 'false',
      snippet: 'false',
      docHTML: 'Context propagation disabled',
      score: 100,
    },
  ],
  '@protected': [
    {
      caption: 'true',
      snippet: 'true',
      docHTML: 'Terms cannot be overridden',
      score: 100,
    },
    {
      caption: 'false',
      snippet: 'false',
      docHTML: 'Terms can be overridden',
      score: 100,
    },
  ],
  '@container': [
    {
      caption: '"@list"',
      snippet: '"@list"',
      docHTML: 'Indicates that the value is a list of values',
      score: 100,
    },
    {
      caption: '"@set"',
      snippet: '"@set"',
      docHTML: 'Indicates that the value is a set of values (unordered, unique)',
      score: 100,
    },
    {
      caption: '"@index"',
      snippet: '"@index"',
      docHTML: 'Indicates that the value is an index mapping keys to values',
      score: 100,
    },
    {
      caption: '"@language"',
      snippet: '"@language"',
      docHTML: 'Indicates that the value is a language map',
      score: 100,
    },
  ],

  // Autocomplete (ontologies, controlled vocabularies, classes)
  '@vocab': [
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
  ],
  '@base': [
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
  ],
  'x-jsonld-type': [
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
  ],
};

export const EditorAutosuggestCustomPlugin = () => ({
  afterLoad: (system) => {
    // Preload on startup
    const config = system.getConfigs();
    if (!config.sparqlAutocompleteEnabled) {
      return;
    }
    Promise.all([
      getOntologiesSuggestions(config),
      getClassesSuggestions(config),
      getControlledVocabulariesSuggestions(config),
    ]).catch((e) => {
      console.error(e);
    });
  },
  statePlugins: {
    editor: {
      wrapActions: {
        addAutosuggestionCompleters: (ori, system) => (context) => {
          return ori(context).concat([
            {
              async getCompletions(editor, session, pos, prefix, cb) {
                try {
                  const suggestions: Suggestion[] = [];

                  const config = system.getConfigs();
                  const path = system.fn.getPathForPosition({
                    pos,
                    prefix,
                    editorValue: editor.getValue(),
                    AST: system.fn.AST,
                  });
                  const lastPath = path[path.length - 1];
                  const isInsideXJsonldContext = path.includes('x-jsonld-context') && lastPath !== 'x-jsonld-context';

                  // "x-jsonld-type" and "x-jsonld-context" autocomplete
                  if (path.length == 3 && path[0] === 'components' && path[1] === 'schemas') {
                    const xJsonldSuggestions = SUGGESTIONS_MAP['x-jsonld'];
                    if (xJsonldSuggestions) {
                      suggestions.push(...xJsonldSuggestions);
                      cb(null, suggestions);
                    }
                    return; // No need to perform other checks
                  }

                  // X-jsonld-context keys
                  if (lastPath === 'x-jsonld-context' || lastPath === '@context') {
                    // SPARQL autocomplete enabled / disabled
                    const keywordsSuggestions = SUGGESTIONS_MAP['x-jsonld-context'];
                    if (keywordsSuggestions) {
                      suggestions.push(...keywordsSuggestions);
                    }
                  }

                  // Classes autocomplete
                  else if (lastPath === 'x-jsonld-type') {
                    // SPARQL autocomplete enabled / disabled
                    const classesSuggestions = config.sparqlAutocompleteEnabled
                      ? await getClassesSuggestions(config)
                      : SUGGESTIONS_MAP['x-jsonld-type'];

                    if (classesSuggestions) {
                      suggestions.push(...classesSuggestions);
                    }
                  }

                  // Ontologies autocomplete
                  else if (lastPath === '@vocab') {
                    // SPARQL autocomplete enabled / disabled
                    const ontologiesSuggestions = config.sparqlAutocompleteEnabled
                      ? await getOntologiesSuggestions(config)
                      : SUGGESTIONS_MAP['@vocab'];

                    if (ontologiesSuggestions) {
                      suggestions.push(...ontologiesSuggestions);
                    }
                  }

                  // Controlled vocabularies autocomplete
                  else if (lastPath === '@base') {
                    // SPARQL autocomplete enabled / disabled
                    const ontologiesSuggestions = config.sparqlAutocompleteEnabled
                      ? await getControlledVocabulariesSuggestions(config)
                      : SUGGESTIONS_MAP['@base'];

                    if (ontologiesSuggestions) {
                      suggestions.push(...ontologiesSuggestions);
                    }
                  }

                  // Other keywords autocomplete
                  else {
                    // Custom autocomplete suggestions
                    const keywordsSuggestions = SUGGESTIONS_MAP[lastPath];
                    if (keywordsSuggestions) {
                      suggestions.push(...keywordsSuggestions);
                    }

                    // Custom URIs or prefixes autocomplete
                    if (isInsideXJsonldContext) {
                      // SPARQL autocomplete enabled / disabled
                      const classesSuggestions = config.sparqlAutocompleteEnabled
                        ? await getClassesSuggestions(config)
                        : SUGGESTIONS_MAP['x-jsonld-type'];

                      if (classesSuggestions) {
                        suggestions.push(...classesSuggestions.map((x) => ({ ...x, score: 100 }))); // High score because user is likely to select a class
                      }
                    }
                  }

                  // Return all suggestions
                  cb(null, suggestions);
                } catch (e) {
                  console.error(e);
                  cb(null, []);
                }
              },
            },
          ]);
        },
      },
    },
  },
});

export default EditorAutosuggestCustomPlugin;
