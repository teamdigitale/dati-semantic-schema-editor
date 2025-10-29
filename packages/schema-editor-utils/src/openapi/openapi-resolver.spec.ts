import { describe, expect, it } from 'vitest';
import { normalizeOpenAPISpec, resolveOpenAPISpec } from './openapi-resolver';

describe('OpenAPI resolver', () => {
  describe('resolveOpenAPISpec', () => {
    it('should resolve openAPI specification with local $ref', async () => {
      const specJson = {
        openapi: '3.0.0',
        components: {
          schemas: {
            Child: {
              description: 'Figlio',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
            Parent: {
              description: 'Genitore',
              properties: {
                name: {
                  type: 'string',
                },
                firstChild: {
                  $ref: '#/components/schemas/Child',
                },
              },
            },
          },
        },
      };
      const resolvedSpec = await resolveOpenAPISpec(specJson);
      expect(resolvedSpec).toBeTruthy();
      expect(resolvedSpec['$$normalized']).toBeUndefined();
      expect(resolvedSpec['components']['schemas']['Parent']['properties']['firstChild']['properties']).toBeDefined();
    });

    it('should resolve openAPI specification with remote $ref', async () => {
      const specJson = {
        openapi: '3.0.0',
        info: {
          title: 'Servizio consultazione anagrafe per gestione anagrafica evento di stato civile',
          version: '1.4.0',
        },
        servers: [
          {
            url: 'https://anscservice.anpr.interno.it/services/service/ricerca',
            description: 'Servizio di produzione',
          },
          {
            url: 'https://anscservicepre.anpr.interno.it/services/service/ricerca',
            description: 'Servizio di preproduzione',
          },
          { url: 'http://localhost:8088', description: 'Servizio mock locale' },
        ],
        paths: {
          '/consultazione/anagrafica/{version}': {
            post: {
              parameters: [
                {
                  name: 'version',
                  in: 'path',
                  required: true,
                  description: 'La versione del servizio invocato',
                  schema: { type: 'string' },
                },
              ],
              requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ConsultazioneANPRRequest' } } },
              },
              responses: {
                '200': {
                  description: 'Atto richiesto dalla ricerca',
                  content: {
                    'application/json': { schema: { $ref: '#/components/schemas/ConsultazioneANPRResponse' } },
                  },
                },
                '400': {
                  description: 'Se non arriva una firma valida (deve essere diversa da null)',
                  content: {
                    'application/json': { schema: { $ref: '#/components/schemas/ConsultazioneANPRResponse' } },
                  },
                },
                '403': {
                  description: 'Non autorizzato',
                  content: {
                    'application/json': { schema: { $ref: '#/components/schemas/ConsultazioneANPRResponse' } },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            FiltroRicercaModel: {
              properties: {
                idAnpr: { type: 'string', description: 'Id Anpr' },
                idAnsc: { type: 'string', description: 'Id Ansc' },
                nomeUtente: { type: 'string', description: "Nome dell'utente" },
                cfUtente: { type: 'string', description: "Codice Fiscale dell'utente" },
                credenziale1: { type: 'string', description: 'Prima credenziale della firma' },
                credenziale2: { type: 'string', description: 'Seconda credenziale della firma' },
              },
            },
            ConsultazioneANPRRequest: {
              description: 'Ritorno del servizio specializzato per la consultazione ANPR',
              allOf: [
                {
                  $ref: 'https://italia.github.io/ansc/docs/openapi/base_servizi.yaml#/components/schemas/AnscRequest',
                },
                {
                  type: 'object',
                  properties: { filtroRicercaModel: { $ref: '#/components/schemas/FiltroRicercaModel' } },
                },
              ],
            },
            ConsultazioneANPRResponse: {
              description: 'Ritorno del servizio specializzato per la consultazione ANP',
              allOf: [
                {
                  $ref: 'https://italia.github.io/ansc/docs/openapi/base_servizi.yaml#/components/schemas/AnscResponse',
                },
                {
                  type: 'object',
                  properties: {
                    modelEvento: {
                      $ref: 'https://italia.github.io/ansc/docs/openapi/model_evento.yaml#/components/schemas/ModelEvento',
                    },
                  },
                },
              ],
            },
          },
        },
      };
      const resolvedSpec = await resolveOpenAPISpec(specJson);
      expect(resolvedSpec).toBeTruthy();
      expect(resolvedSpec['$$normalized']).toBeUndefined();
      expect(JSON.stringify(resolvedSpec)).not.toContain(
        'https://italia.github.io/ansc/docs/openapi/base_servizi.yaml#/components/schemas/AnscResponse',
      );
    });

    it('should handle errors during resolution', async () => {
      const invalidSpecJson = {
        a: 1,
        b: {
          $ref: 1,
        },
      };
      await expect(resolveOpenAPISpec(invalidSpecJson)).rejects.toThrowError();
    });
  });

  describe('normalizeOpenAPISpec', () => {
    it('should normalize openapi schema', () => {
      const specJson = {
        openapi: '3.0.3',
        components: {
          schemas: {
            ConsultazioneANPRResponse: {
              description: 'Ritorno del servizio specializzato per la consultazione ANP',
              properties: {
                modelEvento: {
                  $$ref: 'https://italia.github.io/ansc/docs/openapi/model_evento.yaml#/components/schemas/ModelEvento',
                  properties: {
                    id: {
                      type: 'string',
                      example: '12',
                    },
                    attoNotarileConsensoMadre: {
                      $$ref:
                        'https://italia.github.io/ansc/docs/openapi/model_evento.yaml#/components/schemas/ModelEnteDichiarante',
                      properties: {
                        tipologiaTrascrizione: {
                          type: 'string',
                          description: 'Id tipo trascrizione --DEPRECATO--',
                          example: '1',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      const normalizedSpecJson = normalizeOpenAPISpec(specJson, 'http://localhost:3000/');
      expect(normalizedSpecJson).toEqual({
        openapi: '3.0.3',
        components: {
          schemas: {
            ConsultazioneANPRResponse: {
              description: 'Ritorno del servizio specializzato per la consultazione ANP',
              properties: {
                modelEvento: {
                  'x-ref':
                    'https://italia.github.io/ansc/docs/openapi/model_evento.yaml#/components/schemas/ModelEvento',
                  $ref: '#/components/schemas/ModelEvento-667734716631353d366e2d6963682a78195c717469364337336e777040000700',
                },
              },
            },
            'ModelEnteDichiarante-14165a050331353d366e2d6963682a78195c71746936432f2265477623686e61': {
              properties: {
                tipologiaTrascrizione: {
                  description: 'Id tipo trascrizione --DEPRECATO--',
                  example: '1',
                  type: 'string',
                },
              },
            },
            'ModelEvento-667734716631353d366e2d6963682a78195c717469364337336e777040000700': {
              properties: {
                id: {
                  type: 'string',
                  example: '12',
                },
                attoNotarileConsensoMadre: {
                  'x-ref':
                    'https://italia.github.io/ansc/docs/openapi/model_evento.yaml#/components/schemas/ModelEnteDichiarante',
                  $ref: '#/components/schemas/ModelEnteDichiarante-14165a050331353d366e2d6963682a78195c71746936432f2265477623686e61',
                },
              },
            },
          },
        },
      });
    });

    it('should avoid normalizing local $ref', () => {
      const specJson = {
        openapi: '3.0.0',
        components: {
          schemas: {
            Child: {
              description: 'Figlio',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
            Parent: {
              description: 'Genitore',
              properties: {
                name: {
                  type: 'string',
                },
                firstChild: {
                  $$ref: 'http://localhost:3000/#/components/schemas/Child',
                  properties: {
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      };
      const normalizedSpecJson = normalizeOpenAPISpec(specJson, 'http://localhost:3000/');
      expect(normalizedSpecJson).toEqual({
        openapi: '3.0.0',
        components: {
          schemas: {
            Child: {
              description: 'Figlio',
              properties: {
                name: {
                  type: 'string',
                },
              },
            },
            Parent: {
              description: 'Genitore',
              properties: {
                name: {
                  type: 'string',
                },
                firstChild: {
                  $ref: '#/components/schemas/Child',
                },
              },
            },
          },
        },
      });
    });
  });
});
