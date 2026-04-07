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
  Pager,
  Spinner,
} from 'design-react-kit';
import { type FormEvent, useEffect, useState } from 'react';
import { useSearchVocabularies } from './search-vocabularies.hooks';

export function SearchVocabulariesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [params, setParams] = useState({ limit: 10, page, searchTerm });
  const { data, status, error } = useSearchVocabularies({
    limit: params.limit,
    offset: params.page,
    q: params.searchTerm,
  });
  const vocabularies = data?.item || [];
  const totalPages = Math.ceil((data?.total_count ?? 0) / (data?.limit ?? 1));

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('vocabulary-search') as HTMLInputElement | null;
    setParams((x) => ({ ...x, page: 0, searchTerm: input?.value ?? '' }));
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" centered scrollable>
      <ModalHeader toggle={onClose}>Search vocabularies</ModalHeader>

      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <ButtonGroup className="w-100 mb-3">
            <InputGroup>
              <InputGroupText>
                <Icon icon="it-search" />
              </InputGroupText>
              <input
                id="vocabulary-search"
                name="vocabulary-search"
                type="search"
                placeholder="Search by URI, title, or description"
                className="form-control"
                autoFocus
                autoComplete="off"
              />
            </InputGroup>
            <Button type="submit" color="primary">
              Search
            </Button>
          </ButtonGroup>
        </Form>

        <div className="pb-2">
          {status === 'error' ? (
            <Alert color="danger">
              <strong>Error:</strong> {error || 'Unknown error'}
            </Alert>
          ) : status === 'fulfilled' ? (
            !vocabularies.length ? (
              <Alert color="warning">No results found</Alert>
            ) : (
              <div>
                <List>
                  {vocabularies.map((vocabulary) => (
                    <ListItem
                      key={vocabulary.about}
                      href={vocabulary.about}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3"
                    >
                      <div className="flex-grow-1 overflow-hidden">
                        <span className="text">{vocabulary.title}</span>
                        <small className="text-muted d-block text-truncate">{vocabulary.about}</small>
                        <div className="text-muted" title={vocabulary.description}>
                          {vocabulary.description?.length > 180
                            ? vocabulary.description?.slice(0, 180) + '...'
                            : vocabulary.description}
                        </div>
                      </div>
                      <Icon icon="it-external-link" size="sm" className="flex-shrink-0" title="Open external link" />
                    </ListItem>
                  ))}
                </List>

                <Pager aria-label="Esempio di navigazione" className="justify-content-center mt-3">
                  <ul className="pagination">
                    <li className="page-item">
                      <Button
                        href="#"
                        disabled={page === 0}
                        onClick={() => setPage(0)}
                        className="page-link"
                        aria-label="Previous"
                      >
                        <Icon icon="it-chevron-left" />
                      </Button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <li className="d-sm-block page-item" key={index}>
                        <Button
                          aria-current={index === page ? 'page' : undefined}
                          href="#"
                          onClick={() => setPage(index)}
                          className="page-link"
                        >
                          {index + 1}
                        </Button>
                      </li>
                    ))}
                    <li className="page-item">
                      <Button
                        href="#"
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(totalPages - 1)}
                        className="page-link"
                        aria-label="Next"
                      >
                        <Icon icon="it-chevron-right" />
                      </Button>
                    </li>
                  </ul>
                </Pager>
              </div>
            )
          ) : (
            <div className="d-flex justify-content-center">
              <Spinner active small />
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
