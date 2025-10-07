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
      { data: { id: '#/components/schemas/A', label: 'A' } },
      { data: { id: '#/components/schemas/C', label: 'C' } },
      { data: { id: '#/components/schemas/B', label: 'B' } },
      { data: { id: '#/components/schemas/D', label: 'D' } },
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
        S: {
          type: 'string',
        },
        A: {
          'x-jsonld-type': 'CPV:AType',
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
          'x-jsonld-type': 'CPV:BType',
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
      { data: { id: '#/components/schemas/S', label: 'S', type: 'blank' } },
      { data: { id: '#/components/schemas/A', label: 'A', type: '@typed' } },
      { data: { id: 'CPV:AType', label: 'CPV:AType', type: 'rdf' } },
      { data: { id: '#/components/schemas/C', label: 'C', type: '@typed' } },
      { data: { id: '#/components/schemas/B', label: 'B' } },
      { data: { id: 'CPV:BType', label: 'CPV:BType', type: 'rdf' } },
      { data: { id: '#/components/schemas/D', label: 'D' } },
      //
      { data: { source: '#/components/schemas/A', target: 'CPV:AType', type: 'dashed' } },
      { data: { source: '#/components/schemas/A', target: '#/components/schemas/C' } },
      { data: { source: '#/components/schemas/C', target: 'CPV:BType', type: 'dashed' } },
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
