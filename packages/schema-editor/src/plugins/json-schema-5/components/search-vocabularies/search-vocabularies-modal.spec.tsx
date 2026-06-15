import { fireEvent, render, screen } from '@testing-library/react';
import { type Dispatch } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type APICatalog, type APIDistribution } from './vocabularies.models';
import { SearchVocabulariesModal } from './search-vocabularies-modal';
import * as hooks from './search-vocabularies.hooks';

vi.mock('../pagination/pagination', () => ({
  Pagination: ({ pageChanged }: { pageChanged: Dispatch<number> }) => (
    <button type="button" onClick={() => pageChanged(2)}>
      Go to page 3
    </button>
  ),
}));

const makeVocabulary = (values?: Partial<APIDistribution>): APIDistribution => ({
  about: 'https://example.org/v1',
  author: 'https://example.org/author',
  description: 'Description One',
  href: 'https://example.org/v1',
  hreflang: ['en'],
  'predecessor-version': [],
  'service-desc': [],
  'service-meta': [],
  title: 'Vocabulary One',
  ...values,
});

const makeCatalog = (values?: Partial<APICatalog>): APICatalog => ({
  'api-catalog': 'https://example.org/catalog',
  item: [],
  ...values,
});

describe('<SearchVocabulariesModal />', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loader when search is pending', () => {
    vi.spyOn(hooks, 'useSearchVocabularies').mockReturnValue({
      status: 'pending',
    });

    render(<SearchVocabulariesModal isOpen onClose={vi.fn()} />);
    expect(document.body.innerHTML).toContain('spinner');
  });

  it('should show error alert when search fails', () => {
    vi.spyOn(hooks, 'useSearchVocabularies').mockReturnValue({
      status: 'error',
      error: 'Boom',
    });

    render(<SearchVocabulariesModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText('Error:')).toBeTruthy();
    expect(screen.getByText('Boom')).toBeTruthy();
  });

  it('should show warning when no results found', () => {
    vi.spyOn(hooks, 'useSearchVocabularies').mockReturnValue({
      status: 'fulfilled',
      data: makeCatalog({ item: [], total_count: 0, limit: 10 }),
    });

    render(<SearchVocabulariesModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText('No results found')).toBeTruthy();
  });

  it('should render vocabularies list when results are available', () => {
    vi.spyOn(hooks, 'useSearchVocabularies').mockReturnValue({
      status: 'fulfilled',
      data: makeCatalog({
        item: [makeVocabulary()],
        total_count: 1,
        limit: 10,
      }),
    });

    render(<SearchVocabulariesModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText('Vocabulary One')).toBeTruthy();
    expect(screen.getByText('https://example.org/v1')).toBeTruthy();
    expect(screen.getByText('Description One')).toBeTruthy();
  });

  it('should submit search term and reset page to zero', () => {
    const useSearchVocabularies = vi.spyOn(hooks, 'useSearchVocabularies').mockReturnValue({
      status: 'fulfilled',
      data: makeCatalog({ item: [], total_count: 0, limit: 10 }),
    });

    render(<SearchVocabulariesModal isOpen onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search by URI, title, or description');
    fireEvent.change(input, { target: { value: 'AGID' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    const lastCall = useSearchVocabularies.mock.calls[useSearchVocabularies.mock.calls.length - 1];
    expect(lastCall?.[0]).toEqual(
      expect.objectContaining({
        q: 'AGID',
        offset: 0,
      }),
    );
  });

  it('should update page when pagination emits pageChanged', () => {
    const useSearchVocabularies = vi.spyOn(hooks, 'useSearchVocabularies').mockReturnValue({
      status: 'fulfilled',
      data: makeCatalog({
        item: [makeVocabulary()],
        total_count: 50,
        limit: 10,
      }),
    });

    render(<SearchVocabulariesModal isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));

    const lastCall = useSearchVocabularies.mock.calls[useSearchVocabularies.mock.calls.length - 1];
    expect(lastCall?.[0]).toEqual(
      expect.objectContaining({
        offset: 2,
      }),
    );
  });
});
