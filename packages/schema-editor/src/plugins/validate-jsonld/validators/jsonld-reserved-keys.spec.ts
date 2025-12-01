import { fromJS, OrderedMap } from 'immutable';
import { describe, expect, it, vi } from 'vitest';
import { validateJsonldReservedKeys } from './jsonld-reserved-keys';

const createMockSystem = (specJson: OrderedMap<string, any>) => {
  return {
    specSelectors: {
      specJson: vi.fn(() => specJson),
      getSpecLineFromPath: vi.fn(() => 1),
    },
    jsonldValidatorSelectors: {
      errSource: vi.fn(() => 'JsonLD Validator'),
    },
  };
};

describe('validateJsonldReservedKeys', () => {
  describe('@base value', () => {
    it('should validate @base value ending with valid separator', () => {
      const specJson = fromJS({
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': {
                '@base': 'https://example.com/',
                '@vocab': 'https://vocab.example.com/',
              },
            },
          },
        },
      });
      const system = createMockSystem(specJson);
      const errors = validateJsonldReservedKeys(system);
      expect(errors).toHaveLength(0);
    });

    it('should warn when @base does not end with #, /, or :', () => {
      const specJson = fromJS({
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': {
                '@base': 'https://example.com',
                '@vocab': 'https://vocab.example.com/',
              },
            },
          },
        },
      });
      const system = createMockSystem(specJson);
      const errors = validateJsonldReservedKeys(system);
      expect(errors).toHaveLength(1);
      expect(errors[0].level).toBe('warning');
      expect(errors[0].message).toContain('@base value is not valid');
      expect(errors[0].path).toEqual(['components', 'schemas', 'Person', 'x-jsonld-context', '@base']);
    });
  });

  it('should error when invalid @-prefixed keyword is used', () => {
    const specJson = fromJS({
      components: {
        schemas: {
          Person: {
            'x-jsonld-context': {
              '@invalid-keyword': 'value',
              '@vocab': 'https://vocab.example.com/',
            },
          },
        },
      },
    });
    const system = createMockSystem(specJson);
    const errors = validateJsonldReservedKeys(system);
    expect(errors).toHaveLength(1);
    expect(errors[0].level).toBe('error');
    expect(errors[0].message).toContain('not a valid jsonld keyword');
    expect(errors[0].path).toEqual(['components', 'schemas', 'Person', 'x-jsonld-context', '@invalid-keyword']);
  });

  it('should not validate outside x-jsonld-context', () => {
    const specJson = fromJS({
      components: {
        schemas: {
          Person: {
            '@base': 'https://example.com',
            '@invalid-keyword': 'value',
            properties: {
              name: 'string',
            },
          },
        },
      },
    });
    const system = createMockSystem(specJson);
    const errors = validateJsonldReservedKeys(system);
    expect(errors).toHaveLength(0);
  });
});
