import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchemaSemanticScoreButton } from './schema-semantic-score-button';

import type { ISemanticScoreContext } from './semantic-score';
import { SemanticScoreContext } from './semantic-score';

describe('SchemaSemanticScoreButton', () => {
  const baseContext: ISemanticScoreContext = {
    status: 'idle',
    calculate: vi.fn(),
  };

  const renderWithContext = (override?: Partial<ISemanticScoreContext>) => {
    const value = { ...baseContext, ...(override || {}) } as ISemanticScoreContext;

    return render(
      <SemanticScoreContext.Provider value={value}>
        <SchemaSemanticScoreButton />
      </SemanticScoreContext.Provider>,
    );
  };

  it('should render', async () => {
    renderWithContext();
  });

  it('should render button with initial state', () => {
    renderWithContext();
  });

  it('should call refetch on click', () => {
    const refetchMock = vi.fn();

    renderWithContext({
      calculate: refetchMock,
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
  it('should render updated score correctly', () => {
    renderWithContext({
      data: {
        score: 0.5,
        timestamp: Date.now(),
        sparqlEndpoint: '',
        models: [],
      },
      status: 'fulfilled',
    });

    const button = screen.getByRole('button');

    expect(button.innerHTML).toContain('Schema Semantic Score β: 0.50');
  });

  it('should render error state', () => {
    renderWithContext({ status: 'error', error: 'Boom' });
    const button = screen.getByRole('button');
    expect(button.innerHTML).toContain('ERROR');
    expect(button.classList).toContain('btn-danger');
  });
});
