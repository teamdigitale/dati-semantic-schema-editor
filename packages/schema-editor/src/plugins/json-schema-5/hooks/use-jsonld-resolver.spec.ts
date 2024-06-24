import { renderHook, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';
import { describe, expect, it } from 'vitest';
import { useJsonLDResolver } from './use-jsonld-resolver';

describe('useSearch', () => {
  const jsonldContext = getJsonLDContext();

  it('should return details of simple property', async () => {
    const { result } = renderHook(() => useJsonLDResolver(jsonldContext, ['given_name']));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      fieldName: 'givenName',
      fieldUri: 'https://w3id.org/italia/onto/CPV/givenName',
      vocabularyUri: undefined,
    });
  });

  it('should return details of object property', async () => {
    const { result } = renderHook(() => useJsonLDResolver(jsonldContext, ['birth_place']));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      fieldName: 'hasBirthPlace',
      fieldUri: 'https://w3id.org/italia/onto/CPV/hasBirthPlace',
      vocabularyUri: undefined,
    });
  });

  it('should return details of complex object property', async () => {
    const { result } = renderHook(() => useJsonLDResolver(jsonldContext, ['resident_in']));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      fieldName: 'currentlyHasRegisteredResidenceIn',
      fieldUri: 'https://w3id.org/italia/onto/RPO/currentlyHasRegisteredResidenceIn',
      vocabularyUri: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/cities',
    });
  });

  it('should return property vocabulary', async () => {
    const { result } = renderHook(() => useJsonLDResolver(jsonldContext, ['education_level']));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      fieldName: 'hasLevelOfEducation',
      fieldUri: 'https://w3id.org/italia/onto/CPV/hasLevelOfEducation',
      vocabularyUri: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
    });
  });

  it('should return details of nested property', async () => {
    const { result } = renderHook(() => useJsonLDResolver(jsonldContext, ['birth_place', 'province']));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual({
      fieldName: 'hasProvince',
      fieldUri: 'https://w3id.org/italia/onto/CLV/hasProvince',
      vocabularyUri: 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code',
    });
  });
});

function getJsonLDContext() {
  return fromJS({
    '@vocab': 'https://w3id.org/italia/onto/CPV/',
    RPO: 'https://w3id.org/italia/onto/RPO/',
    tax_code: 'taxCode',
    date_of_birth: 'dateOfBirth',
    given_name: 'givenName',
    family_name: 'familyName',
    education_level: {
      '@id': 'hasLevelOfEducation',
      '@type': '@id',
      '@context': {
        '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      },
    },
    birth_place: {
      '@id': 'hasBirthPlace',
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CLV/',
        city: 'hasCity',
        country: {
          '@id': 'hasCountry',
          '@type': '@id',
          '@context': {
            '@base': 'http://publications.europa.eu/resource/authority/country/',
          },
        },
        province: {
          '@id': 'hasProvince',
          '@type': '@id',
          '@context': {
            '@base': 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code/',
          },
        },
        interno: null,
      },
    },
    children: {
      '@id': 'isParentOf',
    },
    resident_in: {
      '@id': 'RPO:currentlyHasRegisteredResidenceIn',
      '@type': '@id',
      '@context': {
        '@base': 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/cities/',
      },
    },
    parents: {
      '@id': 'isChildOf',
    },
  });
}
