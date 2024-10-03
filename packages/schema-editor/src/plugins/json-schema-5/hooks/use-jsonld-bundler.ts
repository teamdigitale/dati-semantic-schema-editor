import { OrderedMap, Map } from 'immutable';


export const updateJsonldContext = (schema, jsonldContext = OrderedMap()) => {
  const traverseSchema = (schemaNode, contextNode, isRoot = false) => {
    if (Map.isMap(schemaNode)) {
      schemaNode.forEach((value: any, key) => {
        if (key === 'x-jsonld-context') {
          contextNode = contextNode.set('@context', value);
        } else if (key === 'properties') {
          value.forEach((subValue, subKey) => {
            const subContext = traverseSchema(subValue, OrderedMap());
            console.log('Searching context for: ', subKey, subContext.toJS(), 'in', contextNode.toJS());

            if (subContext.isEmpty()) {
              return;
            }

            const c0 = contextNode.get('@context') || OrderedMap();
            console.log("c0: ", c0.toJS(), typeof c0);

            let subKeyContext = OrderedMap();
            if (c0.has(subKey)) {
              if (typeof c0.get(subKey) === 'string') {
                subKeyContext = OrderedMap({ '@id': c0.get(subKey) });
              } else {
                subKeyContext = c0.get(subKey);
              }
            }
            console.log('subKeyContext: ', subKeyContext.toJS());
            if (subKeyContext.has('@context')) {
              console.log(`Don't overwrite an explicit parent's context`);
              return;
            }

            const mergedContext = subKeyContext
              ? subKeyContext.mergeDeep(subContext)
              : subContext;

            contextNode = contextNode.set('@context', c0.set(subKey, mergedContext));
          });
        } else {
          console.log('Traverse: ', key);
          contextNode = traverseSchema(value, contextNode);
        }
      });
    } else {
      console.log('Not a map: ', schemaNode);
    }
    return contextNode;
  };

  return traverseSchema(schema, jsonldContext, true);
};
