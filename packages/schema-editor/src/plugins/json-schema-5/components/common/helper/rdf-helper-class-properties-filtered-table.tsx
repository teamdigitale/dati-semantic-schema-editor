import {
  Badge,
  Button,
  ButtonGroup,
  Form,
  Icon,
  InputGroup,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from 'design-react-kit';
import yaml from 'js-yaml';
import { useState } from 'react';
import { RDFClassProperties } from '../../../hooks';
import { uri2shortUri } from '../../../utils';

export const ClassPropertiesFilteredTable = ({ properties, superClass }) => {
  const [selectedOption, setSelectedOption] = useState<RDFClassProperties | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = (option: RDFClassProperties | null = null) => {
    setSelectedOption(option);
    setIsModalOpen(!isModalOpen);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = (event) => {
    event.preventDefault();
    setSearchTerm(event.target[0].value);
  };

  const sortedOptions = properties.sort(
    (a, b) => a.baseClass.localeCompare(b.baseClass) || a.fieldUri.localeCompare(b.fieldUri),
  );

  const filteredOptions =
    sortedOptions.filter((property: RDFClassProperties) => {
      const formattedFieldUri = uri2shortUri(property.fieldUri);
      const formattedRange = property?.range ? uri2shortUri(property?.range) : '';

      const matchesSearchTerm =
        formattedFieldUri.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formattedRange.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSuperClass = !superClass || property.baseClass === superClass;

      return matchesSearchTerm && matchesSuperClass;
    }) || [];

  return sortedOptions.length ? (
    <span className="modelli">
      <Form onSubmit={handleSearch}>
        <ButtonGroup className="w-100 mb-3">
          <InputGroup>
            <InputGroupText>
              <Icon icon="it-search" />
            </InputGroupText>
            <input type="text" placeholder="Search" className="form-control" />
          </InputGroup>
          <Button type="submit" color="primary">
            Search
          </Button>
        </ButtonGroup>
      </Form>

      <Table responsive>
        <thead className="table-dark">
          <tr>
            <th>Class</th>
            <th>Field URI</th>
            <th>Range</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {filteredOptions.map((option: RDFClassProperties) => (
            <tr key={option.fieldUri} title={option?.comment}>
              <td className="align-middle">
                <a href={option.baseClass} target="_blank" rel="noopener noreferrer">
                  {uri2shortUri(option.baseClass)}
                </a>
              </td>

              <td className="align-middle">
                <a href={option.fieldUri} target="_blank" rel="noopener noreferrer">
                  {uri2shortUri(option.fieldUri)}
                </a>
                <Button color="link" onClick={() => toggleModal(option)} size="xs">
                  <Icon icon="it-help-circle" size="xs" color="primary"></Icon>
                </Button>
              </td>

              <td className="align-middle">
                {option?.range && (
                  <div className="d-flex justify-content-between">
                    <a href={option.range} target="_blank" rel="noopener noreferrer">
                      {uri2shortUri(option.range)}
                    </a>
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

              <td className="align-middle">{option.label || ''}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal isOpen={isModalOpen} toggle={() => toggleModal(null)} size="xl">
        <ModalHeader toggle={() => toggleModal(null)}>
          RDF Help for {selectedOption ? uri2shortUri(selectedOption.fieldUri) : null}
        </ModalHeader>

        <ModalBody>
          {selectedOption ? (
            <div>
              <p>
                <strong>Range:</strong> {selectedOption.range ? uri2shortUri(selectedOption.range) : 'N/A'}
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
          <Button color="primary" onClick={() => toggleModal(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </span>
  ) : (
    <>No properties found.</>
  );
};

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
