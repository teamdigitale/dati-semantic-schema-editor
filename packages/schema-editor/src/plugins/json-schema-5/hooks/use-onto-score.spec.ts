import { renderHook, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGlobalOntoScore, useOntoScore, useOntoScoreColor } from './use-onto-score';
import * as useSparqlQueryImport from './use-sparql';
import * as configuration from '../../configuration';
import * as utils from '../utils';

describe('useOntoScore', () => {
  it('should return 0 without jsonldcontext', async () => {
    vi.spyOn(useSparqlQueryImport, 'useSparqlQuery').mockReturnValue({
      status: 'idle',
      error: undefined,
      data: {},
    });
    const { result } = renderHook(() => useOntoScore(undefined, [['givenName']]));
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
    const { result } = renderHook(() => useOntoScore(jsonldContext, undefined));
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
    const { result } = renderHook(() => useOntoScore(jsonldContext, [['id']]));
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
    const { result } = renderHook(() => useOntoScore(jsonldContext, [['familyName'], ['givenName']]));
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

describe('useGlobalOntoScore', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.com' });
  });

  it('should return undefined score if no calculation is done', async () => {
    const { result } = renderHook(() => useGlobalOntoScore({}));
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

  it('should return isUpdated false if spec is changed', async () => {
    vi.spyOn(utils, 'calculateGlobalOntoscore').mockResolvedValue({ globalOntoScore: 0.8, resolvedSpecJson: {} });
    const { result, rerender } = renderHook((props) => useGlobalOntoScore(props ?? { foo: 'bar' }));
    await result.current.recalculate();
    await waitFor(() => expect(result.current.data.isUpdated).toBe(true));
    rerender({ foo: 'baz' });
    await waitFor(() => expect(result.current.data.isUpdated).toBe(false));
  });

  it('should return score and isUpdated if calculation is done', async () => {
    vi.spyOn(utils, 'calculateGlobalOntoscore').mockResolvedValue({ globalOntoScore: 0.8, resolvedSpecJson: {} });
    const { result } = renderHook(() => useGlobalOntoScore({ foo: 'bar' }));
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

describe('useOntoScoreColor', () => {
  it('should return success if score is greater than 0.5', async () => {
    const { result } = renderHook(() => useOntoScoreColor(0.9));
    expect(result.current).toEqual('success');
  });

  it('should return warning otherwise', async () => {
    const { result } = renderHook(() => useOntoScoreColor(0.5));
    expect(result.current).toEqual('warning');
  });
});
