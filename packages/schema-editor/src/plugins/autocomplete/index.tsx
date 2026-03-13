import { Suggestion } from './models';
import {
  getClassesSuggestions,
  getControlledVocabulariesSuggestions,
  getOntologiesSuggestions,
  getPropertiesSuggestions,
  initAutocomplete,
} from './ontologies-autocomplete';

const SUGGESTIONS_MAP: Record<string, Suggestion[]> = {
  // Custom x-jsonld-xxx keywords
  'x-jsonld': [
    {
      caption: 'x-jsonld-type',
      snippet: 'x-jsonld-type: ',
      meta: 'keyword',
      score: 1000,
    },
    {
      snippet: `x-jsonld-context:\n  '@vocab': `,
      caption: 'x-jsonld-context',
      meta: 'object',
      score: 1000,
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
};

export const EditorAutosuggestCustomPlugin = () => ({
  afterLoad: (system) => {
    // Preload on startup
    const config = system.getConfigs();
    if (!config.sparqlAutocompleteEnabled) {
      return;
    }
    initAutocomplete(config).catch((e) => {
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
                    const keywordsSuggestions = SUGGESTIONS_MAP['x-jsonld-context'];
                    if (keywordsSuggestions) {
                      suggestions.push(...keywordsSuggestions);
                    }
                  }

                  // Classes autocomplete
                  else if (lastPath === 'x-jsonld-type') {
                    const value = system.specSelectors.specJson().getIn(path)?.trim() || '';

                    // Show ontologies suggestions if the value is empty
                    const ontologiesSuggestions = await getOntologiesSuggestions(config);
                    if (!value && ontologiesSuggestions) {
                      suggestions.push(
                        ...ontologiesSuggestions.map((suggestion) => ({
                          ...suggestion,
                          caption: `${suggestion.caption} (load classes...)`, // Show three dots to indicate that there are more suggestions to load
                        })),
                      );
                    }

                    // Semantic classes (if the text editor value equals an ontology URI)
                    if (value && ontologiesSuggestions.some((suggestion) => suggestion.snippet === value)) {
                      const classesSuggestions = await getClassesSuggestions(config, value);
                      if (classesSuggestions) {
                        suggestions.push(...classesSuggestions.map((suggestion) => ({ ...suggestion, score: 100 })));
                      }
                    }
                  }

                  // Ontologies autocomplete
                  else if (lastPath === '@vocab') {
                    const ontologiesSuggestions = await getOntologiesSuggestions(config);
                    if (ontologiesSuggestions) {
                      suggestions.push(...ontologiesSuggestions);
                    }
                  }

                  // Controlled vocabularies autocomplete
                  else if (lastPath === '@base') {
                    const controlledVocabulariesSuggestions = await getControlledVocabulariesSuggestions(config);
                    if (controlledVocabulariesSuggestions) {
                      suggestions.push(...controlledVocabulariesSuggestions);
                    }
                  }

                  // Other keywords autocomplete
                  else {
                    // JSON-LD keywords autocomplete suggestions
                    const keywordsSuggestions = SUGGESTIONS_MAP[lastPath];
                    if (keywordsSuggestions) {
                      suggestions.push(...keywordsSuggestions);
                    }

                    // Custom URIs or prefixes autocomplete
                    if (isInsideXJsonldContext) {
                      const value = system.specSelectors.specJson().getIn(path)?.trim() || '';

                      // Show ontologies suggestions if the value is empty
                      const ontologiesSuggestions = await getOntologiesSuggestions(config);
                      if (!value && ontologiesSuggestions) {
                        suggestions.push(...ontologiesSuggestions);
                      }

                      // Semantic properties (if the text editor value equals an ontology URI)
                      if (value && ontologiesSuggestions.some((suggestion) => suggestion.snippet === value)) {
                        const propertiesSuggestions = await getPropertiesSuggestions(config, value);
                        if (propertiesSuggestions) {
                          suggestions.push(
                            ...propertiesSuggestions.map((suggestion) => ({ ...suggestion, score: 100 })),
                          );
                        }
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
