import { renderHook } from '@testing-library/react';
import { fromJS } from 'immutable';
import { describe, expect, it } from 'vitest';
import { useJsonLDContextResolver } from './use-context-resolver';

describe('useSearch', () => {
  const jsonldContext = getJsonLDContext();

  it('should return details of simple property', () => {
    const { result } = renderHook(() => useJsonLDContextResolver(jsonldContext, 'given_name'));
    expect(result.current).toEqual({
      fieldName: 'givenName',
      fieldUri: 'https://w3id.org/italia/onto/CPV/givenName',
      vocabularyUri: '',
    });
  });

  it('should return details of object property', () => {
    const { result } = renderHook(() => useJsonLDContextResolver(jsonldContext, 'birth_place'));
    expect(result.current).toEqual({
      fieldName: 'hasBirthPlace',
      fieldUri: 'https://w3id.org/italia/onto/CPV/hasBirthPlace',
      vocabularyUri: null,
    });
  });

  it('should return property vocabulary', () => {
    const { result } = renderHook(() => useJsonLDContextResolver(jsonldContext, 'education_level'));
    expect(result.current).toEqual({
      fieldName: 'hasLevelOfEducation',
      fieldUri: 'https://w3id.org/italia/onto/CPV/hasLevelOfEducation',
      vocabularyUri: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
    });
  });

  it('should return details of nested property', () => {
    const { result } = renderHook(() => useJsonLDContextResolver(jsonldContext, 'province'));
    expect(result.current).toEqual({
      fieldName: 'province',
      fieldUri: 'https://w3id.org/italia/onto/CPV/province',
      vocabularyUri: 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code/',
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
