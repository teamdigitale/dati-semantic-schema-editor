import { fromJS } from 'immutable';
import { describe, expect, it } from 'vitest';
import { resolvePropertyByJsonldContext } from './jsonld-resolver';

describe('resolvePropertyByJsonldContext', () => {
  it('should resolve mapping keywords in root', async () => {
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      description: 'educationLevelDesc',
    });
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['description']);
    expect(result).toEqual({
      fieldName: 'educationLevelDesc',
      fieldUri: 'https://w3id.org/italia/onto/CPV/educationLevelDesc',
      vocabularyUri: undefined,
    });
  });

  it('should not resolve jsonld keywords in root', async () => {
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      id: '@id',
    });
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['id']);
    expect(result).toEqual({
      fieldName: '@id',
      fieldUri: '@id',
      vocabularyUri: undefined,
    });
  });

  it('should throw error on wrong jsonld context', async () => {
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
      country: '@id',
    });
    await expect(resolvePropertyByJsonldContext(jsonldContext, ['country', 'id'])).rejects.toThrow();
  });

  it('should return undefined fieldUri if no @vocab in jsonldContext', async () => {
    const jsonldContext = fromJS({
      name: 'http://schema.org/name',
      geo: 'http://schema.org/geo',
    });
    await expect(resolvePropertyByJsonldContext(jsonldContext, ['geo', 'latitude'])).rejects.toThrow(
      'No results provided',
    );
  });

  it('should ignore detached properties', async () => {
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      detached: null,
    });
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['detached']);
    expect(result).toEqual({
      fieldName: 'detached',
      fieldUri: undefined,
      vocabularyUri: undefined,
    });
  });

  it('should resolve with the default @vocab if property not explicitly set', async () => {
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
    });
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['educationLevelDesc']);
    expect(result).toEqual({
      fieldName: 'educationLevelDesc',
      fieldUri: 'https://w3id.org/italia/onto/CPV/educationLevelDesc',
      vocabularyUri: undefined,
    });
  });

  it('should return undefined fieldUri if cannot be resolved', async () => {
    const jsonldContext = fromJS({
      '@vocab': 'https://w3id.org/italia/onto/CPV/',
      privateDetails: {
        '@id': 'supponiamoEsista',
      },
    });
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['privateDetails', 'bankAccount']);
    expect(result).toEqual({
      fieldName: 'bankAccount',
      fieldUri: 'https://w3id.org/italia/onto/CPV/bankAccount',
      vocabularyUri: undefined,
    });
  });

  it('should not resolve jsonld keywords', async () => {
    const jsonldContext = getJsonLDContext();
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['@vocab']);
    expect(result).toEqual({
      fieldName: '@vocab',
      fieldUri: '@vocab',
      vocabularyUri: undefined,
    });
  });

  it('should return details of simple property', async () => {
    const jsonldContext = getJsonLDContext();
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['given_name']);
    expect(result).toEqual({
      fieldName: 'givenName',
      fieldUri: 'https://w3id.org/italia/onto/CPV/givenName',
      vocabularyUri: undefined,
    });
  });

  it('should return details of object property', async () => {
    const jsonldContext = getJsonLDContext();
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['birth_place']);
    expect(result).toEqual({
      fieldName: 'hasBirthPlace',
      fieldUri: 'https://w3id.org/italia/onto/CPV/hasBirthPlace',
      vocabularyUri: undefined,
    });
  });

  it('should return details of complex object property', async () => {
    const jsonldContext = getJsonLDContext();
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['resident_in']);
    expect(result).toEqual({
      fieldName: 'currentlyHasRegisteredResidenceIn',
      fieldUri: 'https://w3id.org/italia/onto/RPO/currentlyHasRegisteredResidenceIn',
      vocabularyUri: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/cities',
    });
  });

  it('should return property vocabulary', async () => {
    const jsonldContext = getJsonLDContext();
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['education_level']);
    expect(result).toEqual({
      fieldName: 'hasLevelOfEducation',
      fieldUri: 'https://w3id.org/italia/onto/CPV/hasLevelOfEducation',
      vocabularyUri: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
    });
  });

  it('should return details of nested property', async () => {
    const jsonldContext = getJsonLDContext();
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['birth_place', 'province']);
    expect(result).toEqual({
      fieldName: 'hasProvince',
      fieldUri: 'https://w3id.org/italia/onto/CLV/hasProvince',
      vocabularyUri: 'https://w3id.org/italia/data/identifiers/provinces-identifiers/vehicle-code',
    });
  });

  it('should not process full URIs', async () => {
    const jsonldContext = getJsonLDContext();
    const result = await resolvePropertyByJsonldContext(jsonldContext, ['https://w3id.org/italia/onto/CPV/Person']);
    expect(result).toEqual({
      fieldName: 'Person',
      fieldUri: 'https://w3id.org/italia/onto/CPV/Person',
      vocabularyUri: undefined,
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
