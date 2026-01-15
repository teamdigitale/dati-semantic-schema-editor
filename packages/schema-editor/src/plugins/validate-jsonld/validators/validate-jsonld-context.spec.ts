import { fromJS, OrderedMap } from 'immutable';
import yaml from 'js-yaml';
import { describe, expect, it, vi } from 'vitest';
import { validateJsonldContext } from './validate-jsonld-context';

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

describe('validateJsonldContext', () => {
  describe('validate x-jsonld-context keys and values', () => {
    describe('@base value', () => {
      it('should validate @base value ending with valid separator', async () => {
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
        const errors = await validateJsonldContext(system);
        expect(errors).toHaveLength(0);
      });

      it('should warn when @base does not end with #, /, or :', async () => {
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
        const errors = await validateJsonldContext(system);
        expect(errors).toHaveLength(1);
        expect(errors[0].level).toBe('warning');
        expect(errors[0].message).toContain('@base value is not valid');
        expect(errors[0].path).toEqual(['components', 'schemas', 'Person', 'x-jsonld-context', '@base']);
      });
    });

    describe('validate jsonld keywords', () => {
      it('should error when invalid @-prefixed keyword is used', async () => {
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
        const errors = await validateJsonldContext(system);
        expect(errors).toHaveLength(1);
        expect(errors[0].level).toBe('error');
        expect(errors[0].message).toContain('not a valid jsonld keyword');
        expect(errors[0].path).toEqual(['components', 'schemas', 'Person', 'x-jsonld-context', '@invalid-keyword']);
      });

      it('should not validate outside x-jsonld-context', async () => {
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
        const errors = await validateJsonldContext(system);
        expect(errors).toHaveLength(0);
      });
    });

    describe('validate @id property', () => {
      it('should warn when nested integer property is associated with @id', async () => {
        const specYaml = `openapi: 3.0.3
components:
  schemas:
    Foo:
      type: object
      x-jsonld-context:
        '@base': 'https://example.com/'
        foo: '@id'
      properties:
        foo:
          type: integer
          
    BirthPlace:
      type: object
      properties:
        code:
          type: integer
          example: 100
        name:
          type: string
    
    Person:
      type: object
      x-jsonld-type: https://w3id.org/italia/onto/CPV/Person
      x-jsonld-context:
        '@vocab': 'https://w3id.org/italia/onto/CPV/'
        given_name: givenName
        birth_place:
          '@context':
            "@vocab": 'https://example.com/'
            code: "@id"
            name: name
      properties:
        given_name:
          maxLength: 255
          type: string
        birth_place:
          $ref: '#/components/schemas/BirthPlace'
          `;
        const specJson = fromJS(yaml.load(specYaml));
        const system = createMockSystem(specJson);
        const errors = await validateJsonldContext(system);
        const warning = errors.filter(
          (e) =>
            e.level === 'warning' && e.message.includes('The @id annotation should be used with string properties.'),
        );
        expect(warning.length).toEqual(2);
      });

      it('should not warn when string property is associated with @id', async () => {
        const specYaml = `openapi: 3.0.3
components:
  schemas:
    Foo:
      type: object
      x-jsonld-context:
        '@base': 'https://example.com/'
        foo: '@id'
      properties:
        foo:
          type: string
          
    BirthPlace:
      type: object
      properties:
        code:
          type: string
          example: 'A001'
        name:
          type: string
    
    Person:
      type: object
      x-jsonld-type: https://w3id.org/italia/onto/CPV/Person
      x-jsonld-context:
        '@vocab': 'https://w3id.org/italia/onto/CPV/'
        given_name: givenName
        birth_place:
          '@context':
            "@vocab": 'https://example.com/'
            code: "@id"
            name: name
      properties:
        given_name:
          maxLength: 255
          type: string
        birth_place:
          $ref: '#/components/schemas/BirthPlace'
          `;
        const specJson = fromJS(yaml.load(specYaml));
        const system = createMockSystem(specJson);
        const errors = await validateJsonldContext(system);
        const warning = errors.find(
          (e) =>
            e.level === 'warning' && e.message.includes('The @id annotation should be used with string properties.'),
        );
        expect(warning).toBeUndefined();
      });
    });
  });

  describe('validate properties associated with jsonld context', () => {
    it('should not report errors for valid jsonld context', async () => {
      const specYaml = `openapi: 3.0.3
components:
  schemas:
    Person:
      type: object
      x-jsonld-context:
        '@base': 'https://example.com/'
        '@vocab': 'https://vocab.example.com/'
        name: 'name'
      properties:
        name:
          type: string
        `;
      const specJson = fromJS(yaml.load(specYaml));
      const system = createMockSystem(specJson);
      const errors = await validateJsonldContext(system);
      expect(errors).toHaveLength(0);
    });

    it('should report error for invalid jsonld context', async () => {
      const specYaml = `openapi: 3.0.3
components:
  schemas:
    Person:
      type: object
      x-jsonld-context:
        '@base': 'https://example.com/'
        '@vocab': 'https://vocab.example.com/'
        invalid: 'invalid:iri'
      properties:
        invalid:
          type: string
        `;
      const specJson = fromJS(yaml.load(specYaml));
      const system = createMockSystem(specJson);
      const errors = await validateJsonldContext(system);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].level).toBe('error');
    });
  });
});
