import { render } from '@testing-library/react';
import { fromJS, Map } from 'immutable';
import { describe, expect, it, vi } from 'vitest';
import * as ontoScoreImport from '../../hooks/use-semantic-score';
import { SemanticScoreBlock } from './semantic-score-block';

describe('<SemanticScoreBlock />', () => {
  it('should not show semantic score if missing dataModelKey', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'fulfilled',
      data: {
        name: 'TestModel',
        score: 0,
        hasAnnotations: false,
        rawPropertiesCount: 0,
        validPropertiesCount: 0,
        invalidPropertiesCount: 0,
        properties: [],
      },
    });
    const dataModelValue = fromJS({
      type: 'object',
      properties: {
        givenName: { type: 'string' },
      },
    });
    const result = render(
      <SemanticScoreBlock dataModelKey="" dataModelValue={dataModelValue} jsonldContext={undefined} />,
    );
    expect(result.container.innerHTML).toBeFalsy();
  });

  it('should not show semantic score if missing dataModelValue', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'fulfilled',
      data: undefined,
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const result = render(
      <SemanticScoreBlock
        dataModelKey="TestModel"
        // @ts-expect-error - Testing with undefined dataModelValue
        dataModelValue={undefined}
        jsonldContext={jsonldContext}
      />,
    );
    expect(result.container.innerHTML).toBeFalsy();
  });

  it('should render loader if waiting for calculation', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'pending',
      data: undefined,
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const dataModelValue = fromJS({
      type: 'object',
      properties: {
        firstName: { type: 'string' },
      },
    });
    const result = render(
      <SemanticScoreBlock dataModelKey="TestModel" dataModelValue={dataModelValue} jsonldContext={jsonldContext} />,
    );
    expect(result.container.innerHTML).toContain('Caricamento');
  });

  it('should render error if calculation error', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'error',
      error: 'Test error',
      data: undefined,
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const dataModelValue = fromJS({
      type: 'object',
      properties: {
        firstName: { type: 'string' },
      },
    });
    const result = render(
      <SemanticScoreBlock dataModelKey="TestModel" dataModelValue={dataModelValue} jsonldContext={jsonldContext} />,
    );
    expect(result.container.innerHTML).toContain('Semantic Score β: ERROR');
  });

  it('should render if value provided', async () => {
    vi.spyOn(ontoScoreImport, 'useSemanticScore').mockReturnValue({
      status: 'fulfilled',
      data: {
        name: 'TestModel',
        score: 1,
        hasAnnotations: true,
        rawPropertiesCount: 1,
        validPropertiesCount: 1,
        invalidPropertiesCount: 0,
        properties: [{ name: 'firstName', uri: 'https://w3id.org/italia/onto/CPV/firstName', valid: true }],
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      firstName: 'firstName',
    });
    const dataModelValue = fromJS({
      type: 'object',
      properties: {
        firstName: { type: 'string' },
      },
    });
    const result = render(
      <SemanticScoreBlock dataModelKey="TestModel" dataModelValue={dataModelValue} jsonldContext={jsonldContext} />,
    );
    expect(result.container.innerHTML).toContain('Semantic Score β: 1.00');
  });
});
