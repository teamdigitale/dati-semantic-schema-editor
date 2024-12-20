import { renderHook, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOntoScore } from './use-onto-score';
import * as useSparqlQueryImport from './use-sparql';
import * as configuration from '../../configuration';

describe('useOntoScore', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      sparqlUrl: 'https://virtuoso-dev-external-service-ndc-dev.apps.cloudpub.testedev.istat.it/sparql',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('should check real values for https://w3id.org/italia/social-security/onto/contributions/retribuzioneOrariaEffettiva', async () => {
    const jsonldContext = fromJS({
      retribuzioneOrariaEffettiva:
        'https://w3id.org/italia/social-security/onto/contributions/retribuzioneOrariaEffettiva',
    });
    const { result } = renderHook(() => useOntoScore(jsonldContext, [['retribuzioneOrariaEffettiva']]));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      rawPropertiesCount: 1,
      semanticPropertiesCount: 1,
      score: 1,
    });
  });
});
