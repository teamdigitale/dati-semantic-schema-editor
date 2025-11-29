import { describe, expect, it } from 'vitest';
import { oasToGraph } from './oas-graph';

describe('createDepMap', () => {
  it('can extract refs', () => {
    const testcase = {
      oas: {
        components: {
          schemas: {
            A: {
              properties: {
                a: {
                  type: 'object',
                },
                c: {
                  $ref: '#/components/schemas/C',
                },
              },
            },
            B: {
              $ref: '#/components/schemas/A',
            },
            C: {
              properties: {
                c: {
                  $ref: '#/components/schemas/A',
                },
                b: {
                  $ref: '#/components/schemas/B',
                },
              },
            },
            D: {
              properties: {
                d: {
                  properties: {
                    a: {
                      $ref: '#/components/schemas/A',
                    },
                  },
                },
              },
            },
          },
        },
      },
      expected: {
        '#/components/schemas/A': ['#/components/schemas/C'],
        '#/components/schemas/B': ['#/components/schemas/A'],
        '#/components/schemas/C': ['#/components/schemas/A', '#/components/schemas/B'],
        '#/components/schemas/D': ['#/components/schemas/A'],
      },
      graph: {
        elements: [
          { id: '#/components/schemas/A', label: 'A', leaf: 0, type: 'nonscalar' },
          { id: '#/components/schemas/C', label: 'C', leaf: 0, type: 'nonscalar' },
          { id: '#/components/schemas/B', label: 'B', leaf: 0, type: 'ref' },
          { id: '#/components/schemas/D', label: 'D', leaf: 0, type: 'nonscalar' },
          //
          {
            id: '#/components/schemas/A->#/components/schemas/C',
            source: '#/components/schemas/A',
            target: '#/components/schemas/C',
            type: 'solid',
          },
          {
            id: '#/components/schemas/C->#/components/schemas/A',
            source: '#/components/schemas/C',
            target: '#/components/schemas/A',
            type: 'solid',
          },
          {
            id: '#/components/schemas/C->#/components/schemas/B',
            source: '#/components/schemas/C',
            target: '#/components/schemas/B',
            type: 'solid',
          },
          {
            id: '#/components/schemas/B->#/components/schemas/A',
            source: '#/components/schemas/B',
            target: '#/components/schemas/A',
            type: 'solid',
          },
          {
            id: '#/components/schemas/D->#/components/schemas/A',
            source: '#/components/schemas/D',
            target: '#/components/schemas/A',
            type: 'solid',
          },
        ],
      },
    };
    const { graph } = oasToGraph(testcase.oas);
    expect(graph.elements).toStrictEqual(testcase.graph.elements);
  });

  it('can annotate nodes', () => {
    const testcase = {
      oas: {
        components: {
          schemas: {
            Z: {
              $ref: '#/components/schemas/S',
            },
            S: {
              type: 'string',
            },
            A: {
              'x-jsonld-type': 'CPV:AType',
              'x-jsonld-context': {
                CPV: 'https://w3id.org/italia/onto/CPV/',
              },
              properties: {
                a: {
                  type: 'string',
                },
                c: {
                  $ref: '#/components/schemas/C',
                },
              },
            },
            B: {
              $ref: '#/components/schemas/A',
            },
            C: {
              'x-jsonld-type': 'https://w3id.org/italia/onto/CPV/BType',
              'x-jsonld-context': {
                '@vocab': 'https://w3id.org/italia/onto/CPV/',
              },
              properties: {
                c: {
                  $ref: '#/components/schemas/A',
                },
                b: {
                  $ref: '#/components/schemas/B',
                },
              },
            },
            D: {
              type: 'object',
              properties: {
                d: {
                  properties: {
                    a: {
                      $ref: '#/components/schemas/A',
                    },
                  },
                },
              },
            },
          },
        },
      },
      expected: {
        '#/components/schemas/A': ['#/components/schemas/C'],
        '#/components/schemas/B': ['#/components/schemas/A'],
        '#/components/schemas/C': ['#/components/schemas/A', '#/components/schemas/B'],
        '#/components/schemas/D': ['#/components/schemas/A'],
      },
      graph: {
        elements: [
          { id: '#/components/schemas/Z', label: 'Z', leaf: 0, type: 'ref' },
          { id: '#/components/schemas/S', label: 'S', leaf: 1, type: 'blank' },
          { id: '#/components/schemas/A', label: 'A', leaf: 0, type: '@typed' },
          { id: 'https://w3id.org/italia/onto/CPV/AType', label: 'CPV:AType', leaf: 0, type: 'rdf' },
          { id: '#/components/schemas/C', label: 'C', leaf: 0, type: '@typed' },
          { id: '#/components/schemas/B', label: 'B', leaf: 0, type: 'ref' },
          { id: 'https://w3id.org/italia/onto/CPV/BType', label: 'CPV:BType', type: 'rdf', leaf: 0 },
          { id: '#/components/schemas/D', label: 'D', leaf: 0, type: 'nonscalar' },
          //
          {
            id: '#/components/schemas/Z->#/components/schemas/S',
            source: '#/components/schemas/Z',
            target: '#/components/schemas/S',
            type: 'solid',
          },
          {
            id: '#/components/schemas/A->https://w3id.org/italia/onto/CPV/AType',
            source: '#/components/schemas/A',
            target: 'https://w3id.org/italia/onto/CPV/AType',
            type: 'dashed',
          },
          {
            id: '#/components/schemas/A->#/components/schemas/C',
            source: '#/components/schemas/A',
            target: '#/components/schemas/C',
            type: 'solid',
          },
          {
            id: '#/components/schemas/C->https://w3id.org/italia/onto/CPV/BType',
            source: '#/components/schemas/C',
            target: 'https://w3id.org/italia/onto/CPV/BType',
            type: 'dashed',
          },
          {
            id: '#/components/schemas/C->#/components/schemas/A',
            source: '#/components/schemas/C',
            target: '#/components/schemas/A',
            type: 'solid',
          },
          {
            id: '#/components/schemas/C->#/components/schemas/B',
            source: '#/components/schemas/C',
            target: '#/components/schemas/B',
            type: 'solid',
          },
          {
            id: '#/components/schemas/B->#/components/schemas/A',
            source: '#/components/schemas/B',
            target: '#/components/schemas/A',
            type: 'solid',
          },
          {
            id: '#/components/schemas/D->#/components/schemas/A',
            source: '#/components/schemas/D',
            target: '#/components/schemas/A',
            type: 'solid',
          },
        ],
      },
    };
    const { graph } = oasToGraph(testcase.oas);
    expect(graph.elements).toStrictEqual(testcase.graph.elements);
  });
});
