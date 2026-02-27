import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as utils from '@teamdigitale/schema-editor-utils';
import * as configuration from '../../../configuration';
import { useGlobalSemanticScore } from './hook';
import { SemanticScoreProvider } from './provider';

describe('SemanticScoreProvider', () => {
  const sparqlUrl = 'https://test-sparql.com';

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      sparqlUrl,
    } as any);
  });

  function setup(specJson: any) {
    let contextValue: any;

    function TestComponent() {
      contextValue = useGlobalSemanticScore();
      return null;
    }

    render(
      <SemanticScoreProvider specJson={specJson}>
        <TestComponent />
      </SemanticScoreProvider>,
    );

    return () => contextValue;
  }

  it('should start with idle status if no specJson', () => {
    const getContext = setup(null);
    const context = getContext();

    expect(context.status).toBe('idle');
    expect(context.data).toBeNull();
    expect(context.error).toBeNull();
  });

  it('should fetch semantic score when specJson is provided', async () => {
    const mockSummary = {
      score: 0.8,
      timestamp: Date.now(),
      sparqlEndpoint: sparqlUrl,
      models: [],
    };

    vi.spyOn(utils, 'calculateSchemaSemanticScore').mockResolvedValue({
      summary: mockSummary,
    } as any);

    const getContext = setup({ openapi: '3.0.0' });

    await waitFor(() => {
      expect(getContext().status).toBe('fulfilled');
    });

    const context = getContext();

    expect(context.data).toEqual(mockSummary);
    expect(utils.calculateSchemaSemanticScore).toHaveBeenCalledWith({ openapi: '3.0.0' }, { sparqlUrl });
  });

  it('should set status to pending while fetching', async () => {
    let resolvePromise: any;

    vi.spyOn(utils, 'calculateSchemaSemanticScore').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const getContext = setup({ openapi: '3.0.0' });

    expect(getContext().status).toBe('pending');

    resolvePromise({
      summary: {
        score: 1,
        timestamp: Date.now(),
        sparqlEndpoint: sparqlUrl,
        models: [],
      },
    });

    await waitFor(() => {
      expect(getContext().status).toBe('fulfilled');
    });
  });

  it('should handle error state', async () => {
    vi.spyOn(utils, 'calculateSchemaSemanticScore').mockRejectedValue(new Error('Boom'));

    const getContext = setup({ openapi: '3.0.0' });

    await waitFor(() => {
      expect(getContext().status).toBe('error');
    });

    const context = getContext();

    expect(context.error).toBeTruthy();
  });

  it('should calculate when calling calculate()', async () => {
    const mockFn = vi.spyOn(utils, 'calculateSchemaSemanticScore').mockResolvedValue({
      summary: {
        score: 0.5,
        timestamp: Date.now(),
        sparqlEndpoint: sparqlUrl,
        models: [],
      },
    } as any);

    const getContext = setup({ openapi: '3.0.0' });

    await waitFor(() => {
      expect(getContext().status).toBe('fulfilled');
    });

    mockFn.mockClear();

    await getContext().calculate();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
