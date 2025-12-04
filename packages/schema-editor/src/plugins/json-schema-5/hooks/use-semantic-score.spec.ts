import { renderHook, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSchemaSemanticScore, useSemanticScore, useSemanticScoreColor } from './use-semantic-score';
import * as useSparqlQueryImport from './use-sparql';
import * as configuration from '../../configuration';
import * as utils from '../utils';

describe('useSemanticScore', () => {
  it('should return 0 without jsonldcontext', async () => {
    vi.spyOn(useSparqlQueryImport, 'useSparqlQuery').mockReturnValue({
      status: 'idle',
      error: undefined,
      data: {},
    });
    const { result } = renderHook(() => useSemanticScore(undefined, [['givenName']]));
    expect(result.current).toEqual({
      status: 'idle',
      error: undefined,
      data: {
        rawPropertiesCount: 1,
        semanticPropertiesCount: 0,
        score: 0,
      },
    });
  });

  it('should return 0 without properties', async () => {
    vi.spyOn(useSparqlQueryImport, 'useSparqlQuery').mockReturnValue({
      status: 'idle',
      error: undefined,
      data: {},
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      givenName: 'givenName',
    });
    const { result } = renderHook(() => useSemanticScore(jsonldContext, undefined));
    expect(result.current).toEqual({
      status: 'idle',
      error: undefined,
      data: {
        rawPropertiesCount: 0,
        semanticPropertiesCount: 0,
        score: 0,
      },
    });
  });

  it('should return 1 with one property @id', async () => {
    const useSparqlQuerySpy = vi.spyOn(useSparqlQueryImport, 'useSparqlQuery').mockReturnValue({
      status: 'idle',
      error: undefined,
      data: {},
    });
    const jsonldContext = fromJS({
      '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      id: '@id',
    });
    const { result } = renderHook(() => useSemanticScore(jsonldContext, [['id']]));
    await waitFor(() => expect(useSparqlQuerySpy).toHaveBeenCalledTimes(2));
    expect(result.current).toEqual({
      status: 'idle',
      error: undefined,
      data: {
        rawPropertiesCount: 1,
        semanticPropertiesCount: 1,
        score: 1,
      },
    });
    expect(useSparqlQuerySpy).toHaveBeenLastCalledWith(expect.anything(), { skip: true }); // The query is skipped
  });

  it('should set 2 properties to check', async () => {
    const useSparqlQuerySpy = vi.spyOn(useSparqlQueryImport, 'useSparqlQuery').mockReturnValue({
      status: 'idle',
      error: undefined,
      data: {
        results: {
          bindings: [
            {
              count: {
                value: '2',
              },
            },
          ],
        },
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      familyName: 'familyName',
      givenName: 'givenName',
    });
    const { result } = renderHook(() => useSemanticScore(jsonldContext, [['familyName'], ['givenName']]));
    await waitFor(() => expect(useSparqlQuerySpy).toHaveBeenCalledTimes(2));
    expect(result.current).toEqual({
      status: 'idle',
      error: undefined,
      data: {
        rawPropertiesCount: 2,
        semanticPropertiesCount: 2,
        score: 1,
      },
    });
    expect(useSparqlQuerySpy).toHaveBeenLastCalledWith(
      expect.stringContaining(
        'https://w3id.org/italia/onto/CPV/familyName> <https://w3id.org/italia/onto/CPV/givenName>',
      ),
      {
        skip: false,
      },
    );
  });
});

describe('useSchemaSemanticScore', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.com' });
  });

  it('should return undefined score if no calculation is done', async () => {
    const { result } = renderHook(() => useSchemaSemanticScore({}));
    expect(result.current).toEqual({
      status: 'idle',
      error: undefined,
      data: {
        score: undefined,
        isUpdated: false,
      },
      recalculate: expect.any(Function),
    });
  });

  it('should return global semantic score from specJson if no calculation has been triggered yet', async () => {
    const specJson = {
      info: {
        'x-semantic-score': 0.75,
      },
    };
    const { result } = renderHook(() => useSchemaSemanticScore(specJson));
    expect(result.current).toEqual({
      status: 'idle',
      error: undefined,
      data: {
        score: 0.75,
        isUpdated: false,
      },
      recalculate: expect.any(Function),
    });
  });

  it('should return isUpdated false if spec is changed', async () => {
    vi.spyOn(utils, 'calculateSchemaSemanticScore').mockResolvedValue({
      schemaSemanticScore: 0.8,
      resolvedSpecJson: {},
    });
    const { result, rerender } = renderHook((props) => useSchemaSemanticScore(props ?? { foo: 'bar' }));
    await result.current.recalculate();
    await waitFor(() => expect(result.current.data.isUpdated).toBe(true));
    rerender({ foo: 'baz' });
    await waitFor(() => expect(result.current.data.isUpdated).toBe(false));
  });

  it('should return score and isUpdated if calculation is done', async () => {
    vi.spyOn(utils, 'calculateSchemaSemanticScore').mockResolvedValue({
      schemaSemanticScore: 0.8,
      resolvedSpecJson: {},
    });
    const { result } = renderHook(() => useSchemaSemanticScore({ foo: 'bar' }));
    await result.current.recalculate();
    await waitFor(() =>
      expect(result.current).toEqual({
        status: 'fulfilled',
        error: undefined,
        data: {
          score: 0.8,
          isUpdated: true,
        },
        recalculate: expect.any(Function),
      }),
    );
  });
});

describe('useSemanticScoreColor', () => {
  it('should return success if score is greater than 0.5', async () => {
    const { result } = renderHook(() => useSemanticScoreColor(0.9));
    expect(result.current).toEqual('success');
  });

  it('should return warning otherwise', async () => {
    const { result } = renderHook(() => useSemanticScoreColor(0.5));
    expect(result.current).toEqual('warning');
  });
});
