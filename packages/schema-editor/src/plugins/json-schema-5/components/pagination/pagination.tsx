import { Button, Icon, Pager } from 'design-react-kit';
import { type Dispatch } from 'react';

const SHOW_FIRST_AND_LAST_PAGES = true;
const SHOW_ELLIPSIS = true;
const MAX_PAGES_AROUND_CURRENT = 2;

export function Pagination({
  currentPage,
  totalPages,
  pageChanged,
}: {
  currentPage: number;
  totalPages: number;
  pageChanged: Dispatch<number>;
}) {
  if (totalPages <= 0) {
    return null;
  }

  const lastPage = totalPages - 1;
  const clampedCurrentPage = Math.min(Math.max(currentPage, 0), lastPage);
  const startPage = Math.max(1, clampedCurrentPage - MAX_PAGES_AROUND_CURRENT);
  const endPage = Math.min(lastPage - 1, clampedCurrentPage + MAX_PAGES_AROUND_CURRENT);

  const middlePages = Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, index) => startPage + index);

  const renderPageButton = (pageIndex: number, className = '') => (
    <li className={`d-block page-item ${className}`} key={pageIndex}>
      <Button
        size="xs"
        aria-current={pageIndex === clampedCurrentPage ? 'page' : undefined}
        disabled={pageIndex === clampedCurrentPage}
        onClick={() => pageChanged(pageIndex)}
        className="page-link"
      >
        {pageIndex + 1}
      </Button>
    </li>
  );

  return (
    <Pager aria-label="Esempio di navigazione" className="justify-content-center mt-3">
      <ul className="pagination">
        <li className="page-item">
          <Button
            size="xs"
            disabled={clampedCurrentPage === 0}
            onClick={() => pageChanged(clampedCurrentPage - 1)}
            className="page-link"
            aria-label="Previous"
          >
            <Icon icon="it-chevron-left" />
          </Button>
        </li>

        {SHOW_FIRST_AND_LAST_PAGES && renderPageButton(0, 'd-none d-md-block')}

        {SHOW_ELLIPSIS && startPage > 1 && (
          <li className="d-none d-md-block page-item disabled" aria-hidden="true">
            <span className="page-link">...</span>
          </li>
        )}

        {middlePages.map((pageIndex) => renderPageButton(pageIndex))}

        {SHOW_ELLIPSIS && endPage < lastPage - 1 && (
          <li className="d-none d-md-block page-item disabled" aria-hidden="true">
            <span className="page-link">...</span>
          </li>
        )}

        {SHOW_FIRST_AND_LAST_PAGES && lastPage > 0 && renderPageButton(lastPage, 'd-none d-md-block')}

        <li className="page-item">
          <Button
            size="xs"
            disabled={clampedCurrentPage === lastPage}
            onClick={() => pageChanged(clampedCurrentPage + 1)}
            className="page-link"
            aria-label="Next"
          >
            <Icon icon="it-chevron-right" />
          </Button>
        </li>
      </ul>
    </Pager>
  );
}
