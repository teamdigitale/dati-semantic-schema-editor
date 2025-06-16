import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { createBundle } from './actions-menu';

describe('resolveOpenAPISpec', () => {
  const sparqlUrl = 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql';

  it('should resolve openAPI specification, resolve jsonldContext and calculate ontoscore', async () => {
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

  it('should normalize spec models', async () => {
    const specYaml = `openapi: 3.0.3
components:
  schemas:
    ConsultazioneANPRResponse:
      description: Ritorno del servizio specializzato per la consultazione ANP
      allOf:
        - $ref: 'https://italia.github.io/ansc/docs/openapi/base_servizi.yaml#/components/schemas/AnscResponse'
        - type: object
          properties:
            modelEvento:
                 $ref: 'https://italia.github.io/ansc/docs/openapi/model_evento.yaml#/components/schemas/ModelEvento'`;
    const specJson = yaml.load(specYaml) as any;
    const bundledSpecJson = await createBundle(specJson, { sparqlUrl });
    expect(bundledSpecJson).toBeTruthy();
    expect(
      bundledSpecJson.components.schemas[
        'ModelEvento-667734716631353d366e2d6963682a78195c717469364337336e777040000700'
      ],
    ).toBeDefined();
  });
});
