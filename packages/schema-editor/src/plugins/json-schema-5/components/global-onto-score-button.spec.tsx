import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration';
import * as utils from '../utils';
import { GlobalOntoScoreButton } from './global-onto-score-button';

describe('GlobalOntoScoreButton', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      sparqlUrl: 'https://test-sparql-url.com',
    });
  });

  it('should render', async () => {
    const mockSpecSelectors = getMockSpecSelectors();
    render(<GlobalOntoScoreButton specSelectors={mockSpecSelectors} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render button with initial state', () => {
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(button.innerHTML).toContain('Global OntoScore β: 0.00');
    expect(button.classList).toContain('btn-secondary'); // Not calculated initially
  });

  it('should calculate global ontoscore on click', async () => {
    const calculateGlobalOntoscoreSpy = vi
      .spyOn(utils, 'calculateGlobalOntoscore')
      .mockResolvedValueOnce({ resolvedSpecJson: {}, globalOntoScore: 0.5 });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(calculateGlobalOntoscoreSpy).toHaveBeenCalled();
      expect(button.innerHTML).toContain('Global OntoScore β: 0.50');
      expect(button.classList).toContain('btn-success'); // Just calculated
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
