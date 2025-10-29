import { resolveJsonldContext } from '@teamdigitale/schema-editor-utils';
import { OrderedMap } from 'immutable';

export const JSONLDContextPlugin = (system) => ({
  statePlugins: {
    jsonldContext: {
      selectors: {
        jsonldContextResolvedSubtree: (state, path: string[]): OrderedMap<any, any> | undefined => {
          // Take the first parent (or self object) with x-jsonld-context property
          let xJsonldContext: OrderedMap<any, any> | undefined;
          for (let i = 1; i <= path.length; i++) {
            const partialPath = path.slice(0, i);
            const spec: OrderedMap<any, any> = system.specSelectors.specResolvedSubtree(partialPath);
            if (spec?.has('x-jsonld-context')) {
              xJsonldContext = spec;
              break;
            }
          }
          // If no x-jsonld-context is found, skip the resolver
          if (!xJsonldContext) {
            return undefined;
          }
          // Resolve the x-jsonld-context
          return resolveJsonldContext(xJsonldContext).get('@context');
        },
      },
    },
  },
});

export default JSONLDContextPlugin;
