import { useSparqlQuery } from '@teamdigitale/schema-editor';
import {
  Alert,
  Button,
  ButtonGroup,
  Form,
  Icon,
  InputGroup,
  InputGroupText,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from 'design-react-kit';
import { useEffect, useMemo, useState } from 'react';
import { useConfiguration } from '../../features/configuration';

const SPARQL_QUERY = `
prefix admsapit: <https://w3id.org/italia/onto/ADMS/>
prefix COV: <https://w3id.org/italia/onto/COV/>
prefix dcat: <http://www.w3.org/ns/dcat#>
prefix dcatapit: <http://dati.gov.it/onto/dcatapit#>
prefix dct: <http://purl.org/dc/terms/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select distinct ?label ?url where {
  ?s
    a dcatapit:Distribution ;
    dcat:downloadURL ?url ;
    rdfs:label ?label
  .
  FILTER(
    STRSTARTS(
      STR(?s),
      "https://w3id.org/italia/schemas/"
    )
  )
}
`;

export function SearchSchemaModal() {
  const { config } = useConfiguration();

  // Open and close
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(event.target[0].value);
  };

  const { status, data, error } = useSparqlQuery(SPARQL_QUERY, { sparqlUrl: config.sparqlUrl!, skip: !isOpen });
  const schemas: { label: string; url: string }[] = useMemo(() => {
    return (
      data?.results?.bindings?.map((binding) => ({
        label: binding.label.value,
        url: binding.url.value,
      })) || []
    );
  }, [data]);
  const filteredSchemas = schemas?.filter(
    (schema) =>
      schema.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Select
  const handleSelectUrl = (url: string) => {
    window.location.href = `#url=${encodeURIComponent(url)}`;
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg" centered scrollable>
      <ModalHeader toggle={handleClose}>Open Schema</ModalHeader>

      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <ButtonGroup className="w-100 mb-3">
            <InputGroup>
              <InputGroupText>
                <Icon icon="it-search" />
              </InputGroupText>
              <input type="text" placeholder="Search" className="form-control" autoFocus />
            </InputGroup>
            <Button type="submit" color="primary">
              Search
            </Button>
          </ButtonGroup>
        </Form>

        <div className="pb-4">
          {status === 'pending' ? (
            <div className="text-center">
              <Spinner active small />
            </div>
          ) : status === 'error' ? (
            <div>
              <Alert color="danger">
                <strong>Error:</strong> {error || 'Unknown error'}
              </Alert>
            </div>
          ) : status === 'fulfilled' ? (
            !filteredSchemas.length ? (
              <div>
                <Alert color="warning">No results found</Alert>
              </div>
            ) : (
              <List>
                {filteredSchemas.map((schema) => (
                  <ListItem key={schema.url} href="#" onClick={() => handleSelectUrl(schema.url)} className="py-3">
                    <div>
                      <span className="text">{schema.label}</span>
                      <small className="text-muted">{schema.url}</small>
                    </div>
                    <Icon icon="it-chevron-right" title="Use schema" />
                  </ListItem>
                ))}
              </List>
            )
          ) : null}
        </div>
      </ModalBody>
    </Modal>
  );
}
