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
      docHTML: 'A JSON-LD base IRI. Should end with a "/" and must not end with a "#".',
    },
    {
      // @id, @type, @context
      caption: '"@id"',
      snippet: '"@id": ',
      docHTML: 'A JSON-LD node identifier',
    },
    {
      caption: '"@type"',
      snippet: '"@type": ',
      docHTML: 'A JSON-LD type',
    },
    {
      caption: '"@context"',
      snippet: '"@context": ',
      docHTML: 'A JSON-LD context',
    },
    {
      caption: '"@language"',
      snippet: '"@language": ',
      docHTML: 'Default language for string values',
    },
    {
      caption: '"@version"',
      snippet: '"@version": ',
      docHTML: 'JSON-LD version (1.0 or 1.1)',
    },
    {
      caption: '"@protected"',
      snippet: '"@protected": ',
      docHTML: 'Prevent terms from being overridden (JSON-LD 1.1). Default is false.',
    },
    {
      caption: '"@propagate"',
      snippet: '"@propagate": ',
      docHTML: 'Control context propagation (JSON-LD 1.1). Default is true.',
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

export const EditorAutosuggestCustomPlugin = () => ({
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

                  if (path.length == 3 && path[0] === 'components' && path[1] === 'schemas') {
                    const suggestions = suggestionMap['x-jsonld'];
                    if (suggestions) {
                      cb(null, suggestions);
                    }
                    return;
                  }

                  const suggestions = suggestionMap[path[path.length - 1]];
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
});

export default EditorAutosuggestCustomPlugin;
