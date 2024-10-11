import { fromJS } from 'immutable';
import { describe, expect, it } from 'vitest';
import { resolveSpecPathRefs } from './utils';

describe('resolveSpecPathRefs', () => {
  const system = { specSelectors: { specJson: getSchema } };

  it('should resolve direct $ref', async () => {
    const result = resolveSpecPathRefs(system, ['components', 'schemas', 'A', 'properties', 'hasBirthPlace']);
    expect(result).toEqual(['components', 'schemas', 'B']);
  });

  it('should resolve inner property $ref', async () => {
    const result = resolveSpecPathRefs(system, [
      'components',
      'schemas',
      'A',
      'properties',
      'hasBirthPlace',
      'properties',
      'hasCity',
    ]);
    expect(result).toEqual(['components', 'schemas', 'B', 'properties', 'hasCity']);
  });
});

const getSchema = () => {
  return fromJS({
    components: {
      schemas: {
        B: {
          properties: {
            hasCity: {
              type: 'string',
            },
          },
        },
        A: {
          properties: {
            hasBirthPlace: {
              $ref: '#/components/schemas/B',
            },
          },
        },
      },
    },
  });
};
