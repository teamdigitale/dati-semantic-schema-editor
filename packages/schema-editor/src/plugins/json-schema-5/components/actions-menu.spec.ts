import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { createBundle } from './actions-menu';

describe('ActionsMenu', () => {
  const sparqlUrl = 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql';

  it('should createBundle', async () => {
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
    const bundledSpecJson = await createBundle(specJson, { sparqlUrl });
    expect(bundledSpecJson).toBeTruthy();
    expect(bundledSpecJson['info']['x-ontoscore']).toEqual(1);
  });
});
