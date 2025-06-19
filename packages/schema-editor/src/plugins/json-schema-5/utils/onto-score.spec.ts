import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { calculateGlobalOntoscore } from './onto-score';

describe('onto-score', () => {
  const sparqlUrl = 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql';

  describe('calculateGlobalOntoscore', () => {
    it('should throw error when no schemas are provided', async () => {
      const specJson = { info: {} };
      await expect(calculateGlobalOntoscore(specJson, { sparqlUrl })).rejects.toThrow(
        'No #/components/schemas models provided',
      );
    });

    it('should resolve openAPI specification, resolve jsonldContext and calculate global ontoscore', async () => {
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
      const { globalOntoScore, resolvedSpecJson } = await calculateGlobalOntoscore(specJson, { sparqlUrl });
      expect(resolvedSpecJson).toBeTruthy();
      expect(resolvedSpecJson['info']['x-ontoscore']).toEqual(1);
      expect(globalOntoScore).toEqual(1);
    });
  });
});
