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
      meta: 'A JSON-LD vocabulary',
    },
    {
      caption: '"@base"',
      snippet: '"@base": ',
      meta: 'A JSON-LD vocabulary',
    },
    {
      // @id, @type, @context
      caption: '"@id"',
      snippet: '"@id": ',
      meta: 'A JSON-LD vocabulary',
    },
    {
      caption: '"@type"',
      snippet: '"@type": ',
      meta: 'A JSON-LD vocabulary',
    },
    {
      caption: '"@context"',
      snippet: '"@context": ',
      meta: 'A JSON-LD vocabulary',
    },
  ],
  '@base': [
    {
      caption: 'Country',
      snippet: 'http://publications.europa.eu/resource/authority/country/',
      meta: 'Country',
      score: 100,
    },
    {
      caption: 'Vehicle Code',
      snippet: 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code/',
      meta: 'Vehicle Code',
      score: 90,
    },
    {
      caption: 'Education Level',
      snippet: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      meta: 'Education Level',
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
                  console.log('path', path, context);

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
