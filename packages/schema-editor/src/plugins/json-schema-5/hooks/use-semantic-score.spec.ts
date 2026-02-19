import { renderHook, waitFor } from '@testing-library/react';
import { fromJS, Map } from 'immutable';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSchemaSemanticScore, useSemanticScore, useSemanticScoreColor } from './use-semantic-score';
import * as configuration from '../../configuration';
import * as utils from '@teamdigitale/schema-editor-utils';

describe('useSemanticScore', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.com' });
  });

  it('should return undefined without dataModelKey', async () => {
    vi.spyOn(utils, 'calculateModelSemanticScore').mockResolvedValue({
      name: 'TestModel',
      score: 0,
      hasAnnotations: false,
      rawPropertiesCount: 0,
      validPropertiesCount: 0,
      invalidPropertiesCount: 0,
      properties: [],
    });
    const dataModelValue = fromJS({
      type: 'object',
      properties: {
        givenName: { type: 'string' },
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      givenName: 'givenName',
    });
    const { result } = renderHook(() => useSemanticScore('', dataModelValue, jsonldContext));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toBeUndefined();
  });

  it('should return undefined without dataModelValue', async () => {
    vi.spyOn(utils, 'calculateModelSemanticScore').mockResolvedValue({
      name: 'TestModel',
      score: 0,
      hasAnnotations: false,
      rawPropertiesCount: 0,
      validPropertiesCount: 0,
      invalidPropertiesCount: 0,
      properties: [],
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      givenName: 'givenName',
    });
    const { result } = renderHook(() => useSemanticScore('TestModel', undefined as any, jsonldContext));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toBeUndefined();
  });

  it('should return score with valid model', async () => {
    vi.spyOn(utils, 'calculateModelSemanticScore').mockResolvedValue({
      name: 'TestModel',
      score: 1,
      hasAnnotations: true,
      rawPropertiesCount: 1,
      validPropertiesCount: 1,
      invalidPropertiesCount: 0,
      properties: [{ name: 'id', uri: '@id', valid: true }],
    });
    const dataModelValue = fromJS({
      type: 'object',
      'x-jsonld-context': {
        '@context': {
          '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
          id: '@id',
        },
      },
      properties: {
        id: { type: 'string' },
      },
    });
    const jsonldContext = fromJS({
      '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      id: '@id',
    });
    const { result } = renderHook(() => useSemanticScore('TestModel', dataModelValue, jsonldContext));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      name: 'TestModel',
      score: 1,
      hasAnnotations: true,
      rawPropertiesCount: 1,
      validPropertiesCount: 1,
      invalidPropertiesCount: 0,
      properties: [{ name: 'id', uri: '@id', valid: true }],
    });
  });

  it('should return score with multiple properties', async () => {
    vi.spyOn(utils, 'calculateModelSemanticScore').mockResolvedValue({
      name: 'TestModel',
      score: 1,
      hasAnnotations: true,
      rawPropertiesCount: 2,
      validPropertiesCount: 2,
      invalidPropertiesCount: 0,
      properties: [
        { name: 'familyName', uri: 'https://w3id.org/italia/onto/CPV/familyName', valid: true },
        { name: 'givenName', uri: 'https://w3id.org/italia/onto/CPV/givenName', valid: true },
      ],
    });
    const dataModelValue = fromJS({
      type: 'object',
      'x-jsonld-context': {
        '@context': {
          '@vocab': 'https://w3id.org/italia/onto/CPV/',
          familyName: 'familyName',
          givenName: 'givenName',
        },
      },
      properties: {
        familyName: { type: 'string' },
        givenName: { type: 'string' },
      },
    });
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      familyName: 'familyName',
      givenName: 'givenName',
    });
    const { result } = renderHook(() => useSemanticScore('TestModel', dataModelValue, jsonldContext));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      name: 'TestModel',
      score: 1,
      hasAnnotations: true,
      rawPropertiesCount: 2,
      validPropertiesCount: 2,
      invalidPropertiesCount: 0,
      properties: [
        { name: 'familyName', uri: 'https://w3id.org/italia/onto/CPV/familyName', valid: true },
        { name: 'givenName', uri: 'https://w3id.org/italia/onto/CPV/givenName', valid: true },
      ],
    });
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
      summary: {
        score: 0.8,
        timestamp: Date.now(),
        sparqlEndpoint: 'https://sparql.com',
        models: [
          {
            name: 'TestModel',
            score: 0.8,
            hasAnnotations: true,
            rawPropertiesCount: 0,
            validPropertiesCount: 0,
            invalidPropertiesCount: 0,
            properties: [],
          },
        ],
      },
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
      summary: {
        score: 0.8,
        timestamp: Date.now(),
        sparqlEndpoint: 'https://sparql.com',
        models: [
          {
            name: 'TestModel',
            score: 0.8,
            hasAnnotations: true,
            rawPropertiesCount: 0,
            validPropertiesCount: 0,
            invalidPropertiesCount: 0,
            properties: [],
          },
        ],
      },
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
