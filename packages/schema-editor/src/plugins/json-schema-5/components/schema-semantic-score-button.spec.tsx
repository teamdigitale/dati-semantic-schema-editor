import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration';
import * as utils from '../utils';
import { SchemaSemanticScoreButton } from './schema-semantic-score-button';

describe('SchemaSemanticScoreButton', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      sparqlUrl: 'https://test-sparql-url.com',
    });
  });

  it('should render', async () => {
    const mockSpecSelectors = getMockSpecSelectors();
    render(<SchemaSemanticScoreButton specSelectors={mockSpecSelectors} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render button with initial state', () => {
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(button.innerHTML).toContain('Schema Semantic Score β: -');
    expect(button.classList).toContain('btn-secondary'); // Not calculated initially
  });

  it('should calculate schema semantic score on click', async () => {
    const calculateSchemaSemanticScoreSpy = vi
      .spyOn(utils, 'calculateSchemaSemanticScore')
      .mockResolvedValueOnce({ resolvedSpecJson: {}, schemaSemanticScore: 0.5 });
    const button = screen.getByRole('button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(calculateSchemaSemanticScoreSpy).toHaveBeenCalled();
      expect(button.innerHTML).toContain('Schema Semantic Score β: 0.50');
      expect(button.classList).toContain('btn-warning'); // Just calculated
    });
  });
});

const getMockSpecSelectors = () => {
  return {
    specJson: () => ({
      toJS: () => ({}),
    }),
  };
};
