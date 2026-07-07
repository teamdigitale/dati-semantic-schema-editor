import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  calculateSchemaSemanticScore,
  InClientCache,
  setCacheService,
  validateJsonldContext,
} from '@teamdigitale/schema-editor-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Config } from '../configs';
import { SemanticScoreService } from './semantic-score.service';

vi.mock('@teamdigitale/schema-editor-utils', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@teamdigitale/schema-editor-utils')>();
  return {
    ...actual,
    validateJsonldContext: vi.fn(),
    calculateSchemaSemanticScore: vi.fn(),
    setCacheService: vi.fn(),
  };
});

const CONFIGURATION_MOCK: Partial<Record<keyof Config, unknown>> = {
  sparqlCacheTTL: 300000,
  sparqlUrl: 'https://example.com/sparql',
};

describe('SemanticScoreService', () => {
  let service: SemanticScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemanticScoreService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, options?: { infer?: boolean }) => {
              if (options?.infer) {
                return CONFIGURATION_MOCK[key as keyof Config];
              }
              return CONFIGURATION_MOCK[key as keyof Config];
            },
          },
        },
      ],
    }).compile();

    service = module.get(SemanticScoreService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should register the in-client cache with schema-editor-utils', () => {
      expect(setCacheService).toHaveBeenCalledWith(expect.any(InClientCache));
    });
  });

  describe('onDestroy', () => {
    it('should destroy the cache', () => {
      const destroySpy = vi.spyOn(InClientCache.prototype, 'destroy');

      service.onDestroy();

      expect(destroySpy).toHaveBeenCalledTimes(1);
      destroySpy.mockRestore();
    });
  });

  describe('validateJsonldContext', () => {
    it('should return only validation errors', async () => {
      vi.mocked(validateJsonldContext).mockResolvedValue([
        {
          type: 'spec',
          level: 'error',
          message: 'Context must be an object.',
          path: ['components', 'schemas', 'Person', 'x-jsonld-context'],
        },
        {
          type: 'spec',
          level: 'warning',
          message: 'Context URL dereferencing is not supported.',
          path: ['components', 'schemas', 'Person', 'x-jsonld-context'],
        },
      ]);

      const specJson = { openapi: '3.0.3' };
      const errors = await service.validateJsonldContext(specJson);

      expect(validateJsonldContext).toHaveBeenCalledOnce();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        level: 'error',
        message: 'Context must be an object.',
      });
    });

    it('should return an empty array when validation succeeds', async () => {
      vi.mocked(validateJsonldContext).mockResolvedValue([]);

      const errors = await service.validateJsonldContext({ openapi: '3.0.3' });

      expect(errors).toEqual([]);
    });
  });

  describe('purgeJsonldContextNullProperties', () => {
    it('should return the input when it is null', () => {
      expect(
        service.purgeJsonldContextNullProperties(null as unknown as object),
      ).toBeNull();
    });

    it('should return the input when it is not an object', () => {
      expect(
        service.purgeJsonldContextNullProperties(
          'not-an-object' as unknown as object,
        ),
      ).toBe('not-an-object');
    });

    it('should transform null x-jsonld-context to undefined', () => {
      const specJson = {
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': null,
              type: 'object',
            },
          },
        },
      };

      const result = service.purgeJsonldContextNullProperties(specJson);

      expect(result).toEqual({
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': undefined,
              type: 'object',
            },
          },
        },
      });
      expect(specJson.components.schemas.Person['x-jsonld-context']).toBeNull();
    });

    it('should transform null x-jsonld-context recursively in nested structures', () => {
      const specJson = {
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': null,
              type: 'object',
              properties: {
                address: {
                  'x-jsonld-context': null,
                  type: 'object',
                },
              },
            },
          },
        },
      };

      const result = service.purgeJsonldContextNullProperties(specJson);

      expect(result).toEqual({
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': undefined,
              type: 'object',
              properties: {
                address: {
                  'x-jsonld-context': undefined,
                  type: 'object',
                },
              },
            },
          },
        },
      });
    });

    it('should not modify non-null x-jsonld-context values', () => {
      const context = { '@vocab': 'https://example.com/' };
      const specJson = {
        components: {
          schemas: {
            Person: {
              'x-jsonld-context': context,
              type: 'object',
            },
          },
        },
      };

      const result = service.purgeJsonldContextNullProperties(specJson);

      expect(
        result.components.schemas.Person['x-jsonld-context'],
      ).toStrictEqual(context);
    });

    it('should not modify null values on other keys', () => {
      const specJson = {
        components: {
          schemas: {
            Person: {
              description: null,
              type: 'object',
            },
          },
        },
      };

      const result = service.purgeJsonldContextNullProperties(specJson);

      expect(result.components.schemas.Person.description).toBeNull();
    });
  });

  describe('calculateSchemaSemanticScore', () => {
    it('should delegate to schema-editor-utils with the configured SPARQL endpoint', async () => {
      const specJson = { openapi: '3.0.3' };
      const expectedResult = {
        resolvedSpecJson: specJson,
        schemaSemanticScore: 0.75,
        summary: {
          score: 0.75,
          timestamp: 1,
          sparqlEndpoint: CONFIGURATION_MOCK.sparqlUrl as string,
          models: [],
        },
      };
      vi.mocked(calculateSchemaSemanticScore).mockResolvedValue(expectedResult);

      const result = await service.calculateSchemaSemanticScore(specJson);

      expect(calculateSchemaSemanticScore).toHaveBeenCalledWith(specJson, {
        sparqlUrl: CONFIGURATION_MOCK.sparqlUrl,
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
