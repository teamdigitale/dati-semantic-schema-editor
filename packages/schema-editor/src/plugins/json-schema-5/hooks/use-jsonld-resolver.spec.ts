import { renderHook, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';
import { describe, expect, it } from 'vitest';
import { useJsonLDResolver } from './use-jsonld-resolver';

describe('useJsonLDResolver', () => {
  it('should process data successfully', async () => {
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      birth_place: {
        '@id': 'hasBirthPlace',
        '@context': {
          '@vocab': 'https://w3id.org/italia/onto/CLV/',
          city: 'hasCity',
        },
      },
    });
    const { result } = renderHook(() => useJsonLDResolver(jsonldContext, ['birth_place']));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      fieldName: 'hasBirthPlace',
      fieldUri: 'https://w3id.org/italia/onto/CPV/hasBirthPlace',
      vocabularyUri: undefined,
    });
  });

  it('should return error');
});
