const rdfTypeSuggestions = [
  {
    caption: "A natural person",
    snippet: "https://w3id.org/italia/onto/CPV/Person",
    meta: "CPV:Person",
    score: 100
  }, {
    caption: "An alive person",
    snippet: "https://w3id.org/italia/onto/CPV/Alive",
    meta: "CPV:Alive",
    score: 90
  }, {
    snippet: "https://w3id.org/italia/onto/RPO/RegisteredResidentPerson",
    caption: "Registered resident person",
    meta: "RPO:RegisteredResidentPerson",
    score: 50
  }
];

const ontologySuggestions = [
  {
    caption: "The Core Person Vocabulary",
    snippet: "https://w3id.org/italia/onto/CPV/",
    meta: "CPV",
    score: 100
  }, {
    caption: "Registered Residence Person Ontology",
    snippet: "https://w3id.org/italia/onto/RPO/",
    meta: "RPO",
    score: 90
  }, {
    caption: "Italian Core Location Vocabulary",
    snippet: "https://w3id.org/italia/onto/CLV/",
    meta: "CLV",
    score: 50
  }
];

const controlledVocabularySuggestions = [
  {
    caption: "Country",
    snippet: "http://publications.europa.eu/resource/authority/country/",
    meta: "Country",
    score: 100
  }, {
    caption: "Vehicle Code",
    snippet: "https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code/",
    meta: "Vehicle Code",
    score: 90
  }, {
    caption: "Education Level",
    snippet: "https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/",
    meta: "Education Level",
    score: 90
  }
];

const suggestionMap = {
  "@vocab": ontologySuggestions,
  "x-jsonld-type": rdfTypeSuggestions,
  "x-jsonld-context": [
    // a list of json-ld keywords enclosed by quotes.
   {
    caption: '"@vocab"',
    snippet: '"@vocab": ',
    meta: "A JSON-LD vocabulary",
   },
    {
     caption: '"@base"',
     snippet: '"@base": ',
     meta: "A JSON-LD vocabulary",
    },
    {
        // @id, @type, @context
        caption: '"@id"',
        snippet: '"@id": ',
        meta: "A JSON-LD vocabulary",
    },
    {
        caption: '"@type"',
        snippet: '"@type": ',
        meta: "A JSON-LD vocabulary",
    },
    {
        caption: '"@context"',
        snippet: '"@context": ',
        meta: "A JSON-LD vocabulary",
    },
  ],
  "@base": controlledVocabularySuggestions
};

export const EditorAutosuggestCustomPlugin = () => ({
  statePlugins: {
    editor: {
      wrapActions: {
        addAutosuggestionCompleters: (ori, system) => (context) => {
          // TODO: Try/catch to avoid breaking the editor if the plugin is not loaded.
          try {

            return ori(context).concat([
                {
                getCompletions(editor, session, pos, prefix, cb) {
                    const path = system.fn.getPathForPosition({pos, prefix, editorValue: editor.getValue(), AST: system.fn.AST});
                    console.log("path", path, context);

                    const suggestions = suggestionMap[path[path.length - 1]];
                    if (suggestions) {
                    cb(null, suggestions);
                    }
                }
                }
            ]);
          } catch (e) {
            console.error(e);
            return null;
          }
        }
      }
    }
  }
});

export default EditorAutosuggestCustomPlugin;
