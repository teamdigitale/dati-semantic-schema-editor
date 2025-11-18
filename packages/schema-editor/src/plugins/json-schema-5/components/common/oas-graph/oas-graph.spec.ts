import { describe, it, expect } from 'vitest';
import { mapToGraph, oasToMap } from './oas-graph';

const testcase_oas = {
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
      { data: { id: '#/components/schemas/A', label: 'A', leaf: 0, type: 'nonscalar' } },
      { data: { id: '#/components/schemas/C', label: 'C', leaf: 0, type: 'nonscalar' } },
      { data: { id: '#/components/schemas/B', label: 'B', leaf: 0, type: 'ref' } },
      { data: { id: '#/components/schemas/D', label: 'D', leaf: 0, type: 'nonscalar' } },
      //
      { data: { source: '#/components/schemas/A', target: '#/components/schemas/C' } },
      { data: { source: '#/components/schemas/C', target: '#/components/schemas/A' } },
      { data: { source: '#/components/schemas/C', target: '#/components/schemas/B' } },
      { data: { source: '#/components/schemas/B', target: '#/components/schemas/A' } },
      { data: { source: '#/components/schemas/D', target: '#/components/schemas/A' } },
    ],
  },
};
const testcase_oas_2 = {
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
      { data: { id: '#/components/schemas/Z', label: 'Z', leaf: 0, type: 'ref' } },
      { data: { id: '#/components/schemas/S', label: 'S', leaf: 1, type: 'blank' } },
      { data: { id: '#/components/schemas/A', label: 'A', leaf: 0, type: '@typed' } },
      { data: { id: 'https://w3id.org/italia/onto/CPV/AType', label: 'CPV:AType', leaf: 0, type: 'rdf' } },
      { data: { id: '#/components/schemas/C', label: 'C', leaf: 0, type: '@typed' } },
      { data: { id: '#/components/schemas/B', label: 'B', leaf: 0, type: 'ref' } },
      { data: { id: 'https://w3id.org/italia/onto/CPV/BType', label: 'CPV:BType', type: 'rdf', leaf: 0 } },
      { data: { id: '#/components/schemas/D', label: 'D', leaf: 0, type: 'nonscalar' } },
      //
      { data: { source: '#/components/schemas/Z', target: '#/components/schemas/S' } },
      { data: { source: '#/components/schemas/A', target: 'https://w3id.org/italia/onto/CPV/AType', type: 'dashed' } },
      { data: { source: '#/components/schemas/A', target: '#/components/schemas/C' } },
      { data: { source: '#/components/schemas/C', target: 'https://w3id.org/italia/onto/CPV/BType', type: 'dashed' } },
      { data: { source: '#/components/schemas/C', target: '#/components/schemas/A' } },
      { data: { source: '#/components/schemas/C', target: '#/components/schemas/B' } },
      { data: { source: '#/components/schemas/B', target: '#/components/schemas/A' } },
      { data: { source: '#/components/schemas/D', target: '#/components/schemas/A' } },
    ],
  },
};

describe('createDepMap', () => {
  it('can extract refs', () => {
    const testcase = testcase_oas;
    const { result } = oasToMap(testcase.oas);
    // expect(result).toStrictEqual(testcase_oas.expected);

    const { graph } = mapToGraph(result);
    expect(graph).toStrictEqual(testcase.graph);
  });

  it('can annotate nodes', () => {
    const testcase = testcase_oas_2;
    const { result } = oasToMap(testcase.oas);
    // expect(result).toStrictEqual(testcase_oas.expected);

    const { graph } = mapToGraph(result);
    expect(graph).toStrictEqual(testcase.graph);
  });
});
