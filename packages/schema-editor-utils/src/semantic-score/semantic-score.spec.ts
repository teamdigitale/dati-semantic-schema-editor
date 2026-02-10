import yaml from 'js-yaml';
import { describe, expect, it, vi } from 'vitest';
import * as semanticScore from './semantic-score';
const { calculateSchemaSemanticScore } = semanticScore;

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

describe('semantic-score', () => {
  const sparqlUrl = 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql';

  describe('calculateSchemaSemanticScore', () => {
    it('should throw error when no schemas are provided', async () => {
      const specJson = { info: {} };
      await expect(calculateSchemaSemanticScore(specJson, { sparqlUrl })).rejects.toThrow(
        'No #/components/schemas models provided',
      );
    });

    it('should resolve openAPI specification, resolve jsonldContext and calculate schema semantic score', async () => {
      const specYaml = `openapi: 3.0.3
components:
  schemas:
    Country:
      x-jsonld-type: Country
      x-jsonld-context:
        '@vocab': https://w3id.org/italia/onto/CLV/
        country: '@id'
        '@base': 'https://publications.europa.eu/resource/authority/country/'
      type: object
      properties:
        country:
          type: string
      example:
        country: ITA
    Location:
      x-jsonld-context:
        '@vocab': https://w3id.org/italia/onto/CLV/
        country: hasCountry
      type: object
      properties:
        hasCity:
          type: string
        country:
          $ref: '#/components/schemas/Country'
      example:
        hasCity: Rome
        country:
          country: ITA`;
      const specJson = yaml.load(specYaml) as any;
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          results: {
            bindings: [{ fieldUri: { value: 'https://w3id.org/italia/onto/CLV/hasCountry' } }],
          },
        }),
      } as Response);
      const { schemaSemanticScore, resolvedSpecJson, summary } = await calculateSchemaSemanticScore(specJson, {
        sparqlUrl,
      });
      expect(resolvedSpecJson).toBeTruthy();
      expect(schemaSemanticScore).toBeDefined();
      expect(resolvedSpecJson['info']['x-semantic-score']).toEqual(schemaSemanticScore);
      expect(resolvedSpecJson['info']['x-semantic-score-timestamp']).toBeDefined();

      // Verify summary is returned
      expect(summary).toBeDefined();
      expect(summary.rawModelsCount).toBeGreaterThan(0);
      expect(summary.positiveScoreModelsCount).toBeGreaterThanOrEqual(0);
      expect(summary.modelsCalculationDetails).toBeDefined();
      expect(Array.isArray(summary.modelsCalculationDetails)).toBe(true);

      // Verify per-model details structure
      if (summary.modelsCalculationDetails.length > 0) {
        const modelDetail = summary.modelsCalculationDetails[0];
        expect(modelDetail).toHaveProperty('modelName');
        expect(modelDetail).toHaveProperty('score');
        expect(modelDetail).toHaveProperty('hasAnnotations');
        expect(modelDetail).toHaveProperty('validPropertiesPaths');
        expect(modelDetail).toHaveProperty('invalidPropertiesPaths');
        expect(Array.isArray(modelDetail.validPropertiesPaths)).toBe(true);
        expect(Array.isArray(modelDetail.invalidPropertiesPaths)).toBe(true);
        expect(typeof modelDetail.hasAnnotations).toBe('boolean');
        expect(typeof modelDetail.score).toBe('number');
        expect(modelDetail.score).toBeGreaterThanOrEqual(0);
        expect(modelDetail.score).toBeLessThanOrEqual(1);
      }
    });

    it('should not block semantic score calculation if x-jsonld-context is not present', async () => {
      const specYaml = `#
openapi: 3.0.3
components:
  schemas:
    NoContext:
      type: object
      properties:
        edu:
          $ref: '#/components/schemas/EducationLevel'
    AnotherNoContext:
      type: object
      properties:
        edu:
          $ref: '#/components/schemas/EducationLevel'
    EducationLevel:
      x-jsonld-type: https://w3id.org/italia/onto/CPV/EducationLevel
      x-jsonld-context:
        id: '@id'
        '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/'
        '@vocab': 'https://w3id.org/italia/onto/CPV/'
        description: educationLevelDesc
      type: object
      additionalProperties: false
      properties:
        id:
          type: string
        description:
          type: string
      example:
        id: NED
        description: Nessun titolo di studio
`;
      const specJson = yaml.load(specYaml) as Record<string, unknown>;
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          results: {
            bindings: [{ fieldUri: { value: 'https://w3id.org/italia/onto/CPV/description' } }],
          },
        }),
      } as Response);
      const { schemaSemanticScore, resolvedSpecJson, summary } = await calculateSchemaSemanticScore(specJson, {
        sparqlUrl,
      });
      expect(resolvedSpecJson).toBeTruthy();
      expect(resolvedSpecJson['info']['x-semantic-score']).toEqual(0.33);
      expect(resolvedSpecJson['info']['x-semantic-score-timestamp']).toBeDefined();
      expect(schemaSemanticScore).toEqual(0.33);

      // Verify summary
      expect(summary).toBeDefined();
      expect(summary.modelsCalculationDetails.length).toBeGreaterThan(0);
      expect(summary.rawModelsCount).toBeGreaterThan(0);
      expect(summary.positiveScoreModelsCount).toBeGreaterThanOrEqual(0);
    });
  });
});
