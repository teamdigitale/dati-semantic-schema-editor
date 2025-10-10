import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { describe, expect, it, vi } from 'vitest';
import * as ontoScoreImport from '../../hooks/use-onto-score';
import { SemanticScoreBlock } from './onto-score-block';

describe('<SemanticScoreBlock />', () => {
  it('should not show semantic score if missing jsonldContext', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'fulfilled',
      data: {
        semanticPropertiesCount: 0,
        rawPropertiesCount: 0,
        score: 0,
      },
    });
    const result = render(<SemanticScoreBlock jsonldContext={undefined} propertiesPaths={[['givenName']]} />);
    expect(result.container.innerHTML).toBeFalsy();
  });

  it('should not show semantic score if missing properties', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'fulfilled',
      data: {
        semanticPropertiesCount: 0,
        rawPropertiesCount: 0,
        score: 0,
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const result = render(<SemanticScoreBlock jsonldContext={jsonldContext} propertiesPaths={undefined} />);
    expect(result.container.innerHTML).toBeFalsy();
  });

  it('should render loader if waiting for calculation', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'pending',
      data: {
        semanticPropertiesCount: 0,
        rawPropertiesCount: 0,
        score: 0,
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const result = render(<SemanticScoreBlock jsonldContext={jsonldContext} propertiesPaths={[]} />);
    expect(result.container.innerHTML).toContain('Caricamento');
  });

  it('should render error if calculation error', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'error',
      data: {
        semanticPropertiesCount: 0,
        rawPropertiesCount: 0,
        score: 0,
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const result = render(<SemanticScoreBlock jsonldContext={jsonldContext} propertiesPaths={[]} />);
    expect(result.container.innerHTML).toContain('Semantic Score β: ERROR');
  });

  it('should render if value provided', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'fulfilled',
      data: {
        semanticPropertiesCount: 1,
        rawPropertiesCount: 1,
        score: 1,
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const result = render(<SemanticScoreBlock jsonldContext={jsonldContext} propertiesPaths={[['firstName']]} />);
    expect(result.container.innerHTML).toContain('Semantic Score β: 1.00');
  });
});
