import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination';

describe('<Pagination />', () => {
  it('should render first and last page numbers', () => {
    render(<Pagination currentPage={5} totalPages={10} pageChanged={vi.fn()} />);

    expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '10' })).toBeTruthy();
  });

  it('should render max two pages before and two after current page', () => {
    render(<Pagination currentPage={5} totalPages={10} pageChanged={vi.fn()} />);

    expect(screen.getByRole('button', { name: '4' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '5' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '6' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '7' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '8' })).toBeTruthy();
  });

  it('should show ellipses only when needed', () => {
    const { rerender } = render(<Pagination currentPage={5} totalPages={10} pageChanged={vi.fn()} />);
    expect(screen.getAllByText('...')).toHaveLength(2);

    rerender(<Pagination currentPage={1} totalPages={5} pageChanged={vi.fn()} />);
    expect(screen.queryByText('...')).toBeNull();
  });

  it('should disable previous arrow and current page when on first page', () => {
    render(<Pagination currentPage={0} totalPages={5} pageChanged={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: '1' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(false);
  });

  it('should disable next arrow when on last page', () => {
    render(<Pagination currentPage={4} totalPages={5} pageChanged={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: '5' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled')).toBe(false);
  });

  it('should call pageChanged for previous, next, and number buttons', () => {
    const pageChanged = vi.fn();
    render(<Pagination currentPage={3} totalPages={10} pageChanged={pageChanged} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));

    expect(pageChanged).toHaveBeenCalledWith(2);
    expect(pageChanged).toHaveBeenCalledWith(4);
    expect(pageChanged).toHaveBeenCalledWith(0);
  });

  it('should render nothing when totalCount is zero', () => {
    const { container } = render(<Pagination currentPage={0} totalPages={0} pageChanged={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
