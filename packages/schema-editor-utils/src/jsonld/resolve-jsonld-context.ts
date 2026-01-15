import { Map, OrderedMap } from 'immutable';

const innerLog = (...args) => {
  // console.log(...args); // Uncomment to enable logs
};

/**
 * Resolves the jsonld context from the schema, by analyzing the nested contexts too.
 * @param schema The schema to resolve the jsonld context from.
 * @returns The resolved jsonld context in the form of `Immutable.Map`.
 * @example
 * const resolvedContext = resolveJsonldContext(schema);
 * console.log(resolvedContext.toJS()); // { '@context': { '@vocab': 'https://example.com/' } }
 */
export const resolveJsonldContext = (schema: Map<any, any> | undefined) => {
  const traverseSchema = (schemaNode: Map<any, any> | undefined, contextNode: Map<any, any>) => {
    if (Map.isMap(schemaNode)) {
      schemaNode
        .sortBy((_, key) => (key === 'x-jsonld-context' ? 0 : key === 'properties' ? 1 : 2))
        .forEach((value: any, key) => {
          if (key === 'x-jsonld-context') {
            contextNode = contextNode.set('@context', value);
          } else if (key === 'properties') {
            value?.forEach?.((subValue, subKey) => {
              const subContext = traverseSchema(subValue, OrderedMap());
              innerLog('Searching context for: ', subKey, subContext.toJS(), 'in', contextNode.toJS());

              if (subContext.isEmpty()) {
                return;
              }

              const c0 = contextNode.get('@context') || OrderedMap();
              // innerLog('c0: ', c0.toJS(), typeof c0);

              let subKeyContext = OrderedMap();
              if (c0.has(subKey)) {
                if (typeof c0.get(subKey) === 'string') {
                  subKeyContext = OrderedMap({ '@id': c0.get(subKey) });
                } else {
                  subKeyContext = c0.get(subKey);
                }
              }
              // innerLog('subKeyContext: ', subKeyContext?.toJS());
              if (subKeyContext === null) {
                innerLog(`Don't overwrite an explicit parent's context`);
                return;
              }
              if (subKeyContext?.has('@context')) {
                innerLog(`Don't overwrite an explicit parent's context`);
                return;
              }

              const mergedContext = subKeyContext ? subKeyContext.mergeDeep(subContext) : subContext;

              contextNode = contextNode.set('@context', c0.set(subKey, mergedContext));
            });
          } else {
            innerLog('Traverse: ', key);
            contextNode = traverseSchema(value, contextNode);
          }
        });
    } else {
      innerLog('Not a map: ', schemaNode);
    }
    return contextNode;
  };

  return traverseSchema(schema, OrderedMap());
};
