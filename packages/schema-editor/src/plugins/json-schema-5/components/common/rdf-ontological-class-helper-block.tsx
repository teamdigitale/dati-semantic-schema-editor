import { Badge, Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Table } from 'design-react-kit';
import { RDFClassProperties, useRDFClassPropertiesResolver } from '../../hooks';
import { useState } from 'react';
import yaml from 'js-yaml';
import { RDFHelperClassVocabulariesBlock } from './rdf-helper-class-vocabularies-block';
import { basename } from '../../utils';

function formatUri(uri: string): string {
  try {
    const parts = uri.split('/');
    const lastPart = parts.pop() || '';
    const secondLastPart = parts.pop() || '';
    return `${secondLastPart}:${lastPart}`;
  } catch (e) {
    console.error(uri);
    return 'Error formatting URI';
  }
}

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

  const [selectedOption, setSelectedOption] = useState<RDFClassProperties | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = (option: RDFClassProperties | null = null) => {
    setSelectedOption(option);
    setIsModalOpen(!isModalOpen);
  };

  const { data, status } = useRDFClassPropertiesResolver(classUri);
  const [searchTerm, setSearchTerm] = useState('');
  const superClasses = data?.classProperties
    ?.map((property) => property.baseClass)
    .filter((value, index, self) => self.indexOf(value) === index);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const [selectedSuperClass, setSelectedSuperClass] = useState('');

  const handleSuperClassChange = (event) => {
    setSelectedSuperClass(event.target.value);
  };

  const filteredOptions =
    data?.classProperties?.filter((property) => {
      const formattedFieldUri = formatUri(property.fieldUri);
      const formattedRange = property?.range ? formatUri(property?.range) : '';

      const matchesSearchTerm =
        formattedFieldUri.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formattedRange.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSuperClass = !selectedSuperClass || property.baseClass === selectedSuperClass;

      return matchesSearchTerm && matchesSuperClass;
    }) || [];

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
      {schema?.get('x-jsonld-context') ? null : <>Warning: Missing context</>}
      {schema?.get('x-jsonld-type') ? null : <>Warning: Missing type</>}

      <h4>
        Class: {formatUri(data?.classUri)} inherits from
        <select value={selectedSuperClass} onChange={handleSuperClassChange}>
          <option value="">All</option>
          {superClasses?.map((superClass) => (
            <option key={superClass} value={superClass}>
              {formatUri(superClass)}
            </option>
          ))}
        </select>
      </h4>

      <RDFHelperClassVocabulariesBlock classUri={classUri} />

      <h5>Properties</h5>
      <span className="modelli">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <Table bordered responsive>
          <thead className="table-dark">
            <tr>
              <th>Baseclass</th>
              <th>Field URI</th>
              <th>Range</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {filteredOptions.map((option: RDFClassProperties) => (
              <tr key={option.fieldUri} title={option?.comment}>
                <td className="align-middle">
                  <a
                    href={option.baseClass}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {formatUri(option.baseClass)}
                  </a>
                </td>

                <td className="align-middle">
                  <a
                    href={option.fieldUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      color: schema?.hasIn(['properties', basename(option.fieldUri)]) ? 'red' : 'inherit',
                    }}
                  >
                    {formatUri(option.fieldUri)}
                  </a>
                  <Button color="link" onClick={() => toggleModal(option)} size="xs">
                    <Icon icon="it-help-circle" size="sm"></Icon>
                  </Button>
                </td>

                <td className="align-middle">
                  {option?.range && (
                    <div className="d-flex justify-content-between">
                      {formatUri(option.range)}
                      {!!option.controlledVocabulary && (
                        <span className="ms-2">
                          <Badge color="primary" title="This property has an associated vocabulary">
                            Vocabulary
                          </Badge>
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td className="align-middle">{option.label || 'No comment'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </span>

      <Modal isOpen={isModalOpen} toggle={() => toggleModal(null)} size="xl" style={{ height: '90%' }}>
        <ModalHeader toggle={() => toggleModal(null)}>
          RDF Help for {selectedOption ? formatUri(selectedOption.fieldUri) : null}
        </ModalHeader>
        <ModalBody>
          {selectedOption ? (
            <div>
              <p>
                <strong>Range:</strong> {selectedOption.range ? formatUri(selectedOption.range) : 'N/A'}
              </p>
              <p>
                <strong>Comment:</strong> {selectedOption.comment || 'No comment'}
              </p>
              <p>
                Use the following snippet to associate this semantic information to the desired JSON Schema property.
                {selectedOption.controlledVocabulary && (
                  <>
                    This property has a controlled vocabulary. You can associate the value of the JSON Schema property
                    with the controlled vocabulary prefixing it with the @base value.
                  </>
                )}
              </p>

              <pre className="m-0">
                <code> {yaml.dump(suggestContext(selectedOption), {}, 2)} </code>
              </pre>
            </div>
          ) : (
            <p>No option selected.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => toggleModal(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </span>
  );
}

function suggestContext(rdfProperty: RDFClassProperties): any {
  if (!rdfProperty || !rdfProperty.fieldUri) {
    throw new Error('Invalid RDF property: fieldUri is required');
  }

  const fieldUri = rdfProperty.fieldUri;
  const uriParts = fieldUri.split(/[/#]/);

  if (uriParts.length < 2) {
    throw new Error('Invalid fieldUri format');
  }

  const propertyNamespace = uriParts.slice(0, -1).join('/');
  const prefix = uriParts.slice(-2, -1)[0];

  return {
    '@context': {
      ...(prefix && { [prefix]: propertyNamespace }),
      my_property: {
        '@id': fieldUri,
        ...(rdfProperty.controlledVocabulary && {
          // Associate the value of the JSON Schema property with the controlled vocabulary prefixing it with the @base value.
          ['@type']: '@id',
          ['@context']: {
            '@base': rdfProperty.controlledVocabulary?.endsWith('/')
              ? rdfProperty.controlledVocabulary
              : rdfProperty.controlledVocabulary + '/',
          },
        }),
      },
    },
  };
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
