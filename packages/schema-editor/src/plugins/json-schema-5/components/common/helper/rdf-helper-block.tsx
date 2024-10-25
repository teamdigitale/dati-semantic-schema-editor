import { Spinner } from 'design-react-kit';
import { useRDFClassPropertiesResolver } from '../../../hooks';
import { useState } from 'react';
import { RDFHelperClassVocabulariesBlock } from './rdf-helper-class-vocabularies-block';
import { RDFOntologicalClassBlock } from '../rdf-ontological-class-block';
import { uri2shortUri } from '../../../utils';
import { ClassPropertiesFilteredTable } from './rdf-helper-class-properties-filtered-table';

interface Props {
  getComponent: (name: string, isStatic?: boolean) => any;
  classUri: string | undefined;
  schema: any | undefined;
}

export function RDFOntologicalClassHelperBlock({ getComponent, classUri, schema }: Props) {
  const Markdown = getComponent('Markdown', true);

  if (!classUri || !schema) {
    return <Markdown source={MARKDOWN_HELPER_SOURCE} />;
  }

  const { data, status } = useRDFClassPropertiesResolver(classUri);
  const superClasses = data?.classProperties
    ?.map((property) => property.baseClass)
    .filter((value, index, self) => self.indexOf(value) === index);
  const [selectedSuperClass, setSelectedSuperClass] = useState('');

  const handleSuperClassChange = (event) => {
    setSelectedSuperClass(event.target.value);
  };

  if (status === 'pending') {
    return (
      <span className="d-inline-block align-middle">
        <Spinner active small />
      </span>
    );
  }

  if (!data?.classProperties) {
    return null;
  }
  if (!data?.classUri) {
    return null;
  }

  return (
    <span className="modelli">
      <h4>
        {schema?.get('x-jsonld-context') ? null : <>Warning: x-jsonld-context</>}
        {schema?.get('x-jsonld-type') ? null : <>Warning: x-jsonld-type</>}
      </h4>

      <h5 className="d-flex justify-content-between">
        <span>
          Class: <RDFOntologicalClassBlock classUri={classUri} />
        </span>
        <span className="ms-2 d-flex">
          {superClasses?.length ? (
            <>
              superclasses:{' '}
              <select
                value={selectedSuperClass}
                onChange={handleSuperClassChange}
                title="Select a superclass to filter out the rdf:Properties accordingly."
              >
                <option value="">All</option>
                {superClasses?.map((superClass) => (
                  <option key={superClass} value={superClass}>
                    {uri2shortUri(superClass)}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>no superclasses found.</>
          )}
        </span>
      </h5>

      <h6>Vocabularies</h6>
      <RDFHelperClassVocabulariesBlock classUri={classUri} />

      <h6>Properties</h6>
      <ClassPropertiesFilteredTable properties={data?.classProperties || []} superClass={selectedSuperClass} />
    </span>
  );
}

const MARKDOWN_HELPER_SOURCE = `
###### 🇮🇹 ITALIAN


:mega: E' una funzionalità in fase di sviluppo.
Il nome provvisorio del tool è "RDF Helper", ma possiamo cambiarlo. :mega:

Questo tab ospita un tool per aiutarti a visualizzare le owl:Class e le rdfs:Property  associate presenti nei tuoi schemi dati.

Seleziona uno schema dati, quindi apri questo tab
oppure clicca su "RDF Helper" per aprire in una modale.

Troverai qui:

- una drop-down con l'elenco di tutte le superclassi ontologiche,
  ad esempio, per  "CPV:Alive" troverai "CPV:Person";
- l'elenco dei vocabolari controllati associabili alla classe selezionata,
    ad esempio, per "CLV:Feature" troverai sia il vocabolario delle città che quello delle regioni.
- una tabella filtrabile con tutte le proprietà dirette ed ereditate dalla classe selezionata,
    ad esempio, per "CPV:Alive" troverai "CPV:givenName" e "CPV:familyName" ereditate da "CPV:Person";

Cliccando su una proprietà della tabella,
vedrai le informazioni dettagliate della proprietà selezionata
e delle snippet di codice per integrarle nei tuoi schemi dati.

###### 🇬🇧 ENGLISH

TBD
`;
