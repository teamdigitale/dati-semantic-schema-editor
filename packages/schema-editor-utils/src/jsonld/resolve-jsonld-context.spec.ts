import { fromJS } from 'immutable';
import { describe, expect, it } from 'vitest';
import { resolveJsonldContext } from './resolve-jsonld-context';

describe('resolve-jsonld-context', () => {
  const schema = getSchema();

  it('should resolve a simple context', () => {
    const result = resolveJsonldContext(schema.get('Place'));
    expect(result.toJS()).toEqual({
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CLV/',
        province: {
          '@id': 'hasProvince',
        },
      },
    });
  });

  it('should not overwrite a parent context', () => {
    const result = resolveJsonldContext(schema.get('DontOverWriteContext'));
    expect(result.toJS()).toEqual({
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
          '@context': 'http://remote.example.org/context.json',
        },
      },
    });
  });

  it('should not overwrite a null parent context', () => {
    const result = resolveJsonldContext(schema.get('DontOverrideNullParentContext'));
    expect(result.toJS()).toEqual({
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        other: null,
      },
    });
  });

  it('should resolve a nested context', () => {
    const result = resolveJsonldContext(schema.get('A'));
    expect(result.toJS()).toEqual({
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
          '@context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
          },
        },
      },
    });
  });

  it('should preserve @id information when merging contexts', () => {
    const result = resolveJsonldContext(schema.get('PreserveId'));
    expect(result.toJS()).toEqual({
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
          '@context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
            province: {
              '@id': 'hasProvince',
            },
          },
        },
      },
    });
  });

  it('should resolve a deeply nested context', () => {
    const result = resolveJsonldContext(schema.get('Nested3'));
    expect(result.toJS()).toEqual({
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
          '@context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
            province: {
              '@id': 'hasProvince',
              '@context': {
                '@vocab': 'https://w3id.org/italia/onto/l0/',
                sigla: {
                  '@id': 'hasSigla',
                },
              },
            },
          },
        },
      },
    });
  });

  it('should produce the same output if x-jsonld-context is written after properties', () => {
    const result = resolveJsonldContext(schema.get('Nested3'));
    const resultInverted = resolveJsonldContext(schema.get('Nested3Inverted'));
    expect(result.toJS()).toEqual(resultInverted.toJS());
  });
});

function getSchema() {
  return fromJS({
    Nested3: {
      'x-jsonld-context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
        },
      },
      properties: {
        given_name: {
          type: 'string',
        },
        birth_place: {
          'x-jsonld-context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
            province: {
              '@id': 'hasProvince',
            },
          },
          properties: {
            province: {
              type: 'object',
              'x-jsonld-context': {
                '@vocab': 'https://w3id.org/italia/onto/l0/',
                sigla: {
                  '@id': 'hasSigla',
                },
              },
              properties: {
                sigla: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    Nested3Inverted: {
      properties: {
        given_name: {
          type: 'string',
        },
        birth_place: {
          'x-jsonld-context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
            province: {
              '@id': 'hasProvince',
            },
          },
          properties: {
            province: {
              type: 'object',
              'x-jsonld-context': {
                '@vocab': 'https://w3id.org/italia/onto/l0/',
                sigla: {
                  '@id': 'hasSigla',
                },
              },
              properties: {
                sigla: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      'x-jsonld-context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
        },
      },
    },
    Place: {
      'x-jsonld-context': {
        '@vocab': 'https://w3id.org/italia/onto/CLV/',
        province: {
          '@id': 'hasProvince',
        },
      },
      properties: {
        province: {
          type: 'string',
        },
      },
    },
    A: {
      'x-jsonld-context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
        },
      },
      properties: {
        given_name: {
          type: 'string',
        },
        birth_place: {
          'x-jsonld-context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
          },
          properties: {
            province: {
              type: 'string',
            },
          },
        },
      },
    },
    PreserveId: {
      'x-jsonld-context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: 'hasBirthPlace',
      },
      properties: {
        given_name: {
          type: 'string',
        },
        birth_place: {
          'x-jsonld-context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
            province: {
              '@id': 'hasProvince',
            },
          },
          properties: {
            province: {
              type: 'string',
            },
          },
        },
      },
    },
    DontOverWriteContext: {
      'x-jsonld-context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        given_name: 'givenName',
        birth_place: {
          '@id': 'hasBirthPlace',
          '@context': 'http://remote.example.org/context.json',
        },
      },
      properties: {
        given_name: {
          type: 'string',
        },
        birth_place: {
          'x-jsonld-context': {
            '@vocab': 'https://w3id.org/italia/onto/CLV/',
            province: {
              '@id': 'hasProvince',
            },
          },
          properties: {
            province: {
              type: 'string',
            },
          },
        },
      },
    },
    DontOverrideNullParentContext: {
      'x-jsonld-context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
        other: null,
      },
      properties: {
        other: {
          'x-jsonld-context': {
            '@vocab': 'https://w3id.org/italia/onto/CPV/',
          },
          properties: {
            givenName: {
              type: 'string',
            },
          },
        },
      },
    },
  });
}
