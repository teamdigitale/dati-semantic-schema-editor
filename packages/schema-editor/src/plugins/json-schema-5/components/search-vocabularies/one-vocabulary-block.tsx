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
  Spinner,
} from 'design-react-kit';
import { type FormEvent, useState } from 'react';
import { useSearchVocabularyItems } from './search-vocabularies.hooks';

interface Props {
  vocabularyUri: string;
}

export function OneVocabularyBlock({ vocabularyUri }: Props) {
  const [params, setParams] = useState({ limit: 200, page: 0, searchTerm: '' });
  const { data, status, error } = useSearchVocabularyItems(vocabularyUri, {
    limit: params.limit,
    // offset: params.page,
    // q: params.searchTerm,
  });
  const vocabularies = data?.items || [];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('vocabulary-search') as HTMLInputElement | null;
    setParams((x) => ({ ...x, page: 0, searchTerm: input?.value ?? '' }));
  };

  return (
    <div>
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
                    key={vocabulary.uri}
                    href={vocabulary.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3"
                  >
                    <div className="flex-grow-1 overflow-hidden">
                      <span className="text">
                        {vocabulary.id} {vocabulary.label ? `- ${vocabulary.label}` : ''}
                      </span>
                      <small className="text-muted d-block text-truncate">{vocabulary.uri}</small>
                      {vocabulary.parent?.length && (
                        <div className="text-muted" title="Parent">
                          <i>Parents:</i>
                          <br />
                          <ul>
                            {vocabulary.parent.map((x) => (
                              <li key={x.uri}>{x.uri}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Icon
                      icon="it-external-link"
                      size="sm"
                      className="flex-shrink-0"
                      title="Open vocabulary details in new tab"
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          )
        ) : (
          <div className="d-flex justify-content-center">
            <Spinner active small />
          </div>
        )}
      </div>
    </div>
  );
}
