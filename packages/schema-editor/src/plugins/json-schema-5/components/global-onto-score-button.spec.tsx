import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration';
import * as utils from '../utils';
import { GlobalSemanticScoreButton } from './global-onto-score-button';

describe('GlobalSemanticScoreButton', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      sparqlUrl: 'https://test-sparql-url.com',
    });
  });

  it('should render', async () => {
    const mockSpecSelectors = getMockSpecSelectors();
    render(<GlobalSemanticScoreButton specSelectors={mockSpecSelectors} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render button with initial state', () => {
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(button.innerHTML).toContain('Global Semantic Score β: -');
    expect(button.classList).toContain('btn-secondary'); // Not calculated initially
  });

  it('should calculate global semantic score on click', async () => {
    const calculateGlobalSemanticScoreSpy = vi
      .spyOn(utils, 'calculateGlobalSemanticScore')
      .mockResolvedValueOnce({ resolvedSpecJson: {}, globalSemanticScore: 0.5 });
    const button = screen.getByRole('button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(calculateGlobalSemanticScoreSpy).toHaveBeenCalled();
      expect(button.innerHTML).toContain('Global Semantic Score β: 0.50');
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
