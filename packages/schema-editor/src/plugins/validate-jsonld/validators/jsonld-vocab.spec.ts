import { fromJS, OrderedMap } from 'immutable';
import { describe, expect, it, vi } from 'vitest';
import { validateJsonldVocab } from './jsonld-vocab';

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

describe('validateJsonldVocab', () => {
  describe('validate jsonld context', () => {
    it('should not report errors for valid jsonld context', async () => {
      const specJson = fromJS({
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': {
                '@base': 'https://example.com/',
                '@vocab': 'https://vocab.example.com/',
                name: 'name',
              },
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
          },
        },
      });
      const system = createMockSystem(specJson);
      const errors = await validateJsonldVocab(system);
      expect(errors).toHaveLength(0);
    });

    it('should report error for invalid jsonld context', async () => {
      const specJson = fromJS({
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': {
                '@base': 'https://example.com/',
                '@vocab': 'https://vocab.example.com/',
                invalid: 'invalid:iri',
              },
              properties: {
                invalid: {
                  type: 'string',
                },
              },
            },
          },
        },
      });
      const system = createMockSystem(specJson);
      const errors = await validateJsonldVocab(system);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].level).toBe('error');
    });
  });

  describe('validate @id property', () => {
    it('should warn when integer property is associated with @id', async () => {
      const specJson = fromJS({
        components: {
          schemas: {
            Foo: {
              'x-jsonld-context': {
                '@base': 'https://example.com/',
                foo: '@id',
              },
              properties: {
                foo: {
                  type: 'integer',
                },
              },
            },
          },
        },
      });
      const system = createMockSystem(specJson);
      const errors = await validateJsonldVocab(system);
      expect(errors.length).toBeGreaterThan(0);
      const warning = errors.find((e) => e.level === 'warning' && e.message.includes('scalar property'));
      expect(warning).toBeDefined();
      expect(warning?.path).toEqual(['components', 'schemas', 'Foo', 'properties', 'foo']);
    });

    it('should not warn when string property is associated with @id', async () => {
      const specJson = fromJS({
        components: {
          schemas: {
            Foo: {
              'x-jsonld-context': {
                '@base': 'https://example.com/',
                foo: '@id',
              },
              properties: {
                foo: {
                  type: 'string',
                },
              },
            },
          },
        },
      });
      const system = createMockSystem(specJson);
      const errors = await validateJsonldVocab(system);
      const warning = errors.find((e) => e.level === 'warning' && e.message.includes('scalar property'));
      expect(warning).toBeUndefined();
    });
  });
});
