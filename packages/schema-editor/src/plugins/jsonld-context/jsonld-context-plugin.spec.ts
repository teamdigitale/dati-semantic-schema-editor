import { describe, it, expect } from 'vitest';
import { OrderedMap } from 'immutable';
import { JSONLDContextPlugin } from './index';
import { resolveJsonldContext } from '@teamdigitale/schema-editor-utils';

describe('JSONLDContextPlugin', () => {
  const mockSystem = {
    specSelectors: {
      specResolvedSubtree: (path: string[]) => {
        const specs: Record<string, any> = {
          valid: OrderedMap({ 'x-jsonld-context': OrderedMap({ '@vocab': 'https://example.com/' }) }),
          stringCtx: OrderedMap({ 'x-jsonld-context': 'https://example.com/context.json' }),
          empty: OrderedMap({}),
        };
        return specs[path[0]]; //specResolvedSubtree
      },
    },
  };

  const plugin = JSONLDContextPlugin(mockSystem);

  it('should return the resolved @context for valid object', () => {
    const result = plugin.statePlugins.jsonldContext.selectors.jsonldContextResolvedSubtree({}, ['valid']);
    // `resolveJsonldContext` must be called and return the context
    expect(result).toEqual(
      resolveJsonldContext(mockSystem.specSelectors.specResolvedSubtree(['valid'])).get('@context'),
    );
  });

  it('should return undefined for string x-jsonld-context', () => {
    const result = plugin.statePlugins.jsonldContext.selectors.jsonldContextResolvedSubtree({}, ['stringCtx']);
    expect(result).toBeUndefined();
  });

  it('should return undefined if no x-jsonld-context is found', () => {
    const result = plugin.statePlugins.jsonldContext.selectors.jsonldContextResolvedSubtree({}, ['empty']);
    expect(result).toBeUndefined();
  });
});
