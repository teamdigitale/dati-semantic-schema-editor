import { Map, OrderedMap } from 'immutable';
import { expand } from 'jsonld';
import { SwaggerError } from '../models/error';

export const validateJsonldVocab = async (system): Promise<SwaggerError[]> => {
  // Get basePath from spec
  const specJson = system.specSelectors.specJson() as OrderedMap<string, any>;

  // Checking for errors recursively
  const source = system.jsonldValidatorSelectors.errSource();
  const errors: SwaggerError[] = [];

  const executeDeeply = async (
    path: string[],
    contextPath: string[] | undefined,
    rootJsonldContext: OrderedMap<string, any> | undefined,
  ) => {
    const partialSpec = specJson.getIn(path);
    if (Map.isMap(partialSpec)) {
      for (const [key, value] of partialSpec.entries() as IterableIterator<[string, unknown]>) {
        const innerPath = [...path, key];
        if (key === 'x-jsonld-context') {
          await executeDeeply(innerPath, innerPath, value as OrderedMap<string, any>);
        } else if (contextPath && rootJsonldContext && !['@context', '@vocab', '@base'].includes(key)) {
          const propertyPath = innerPath.slice(contextPath.length);
          const input = propertyPath.reduceRight((obj, x, i) => ({ [x]: i < propertyPath.length - 1 ? obj : '' }), {});
          try {
            await expand({ '@context': rootJsonldContext.toJS(), ...input });
          } catch (ex) {
            errors.push({
              type: 'spec',
              source,
              level: 'error',
              message: ex.message,
              path: innerPath,
              line: system.specSelectors.getSpecLineFromPath(innerPath),
            });
          }
        } else {
          await executeDeeply(innerPath, contextPath, rootJsonldContext);
        }
      }
    }
  };

  await executeDeeply(['components', 'schemas'], undefined, undefined);

  return errors;
};
