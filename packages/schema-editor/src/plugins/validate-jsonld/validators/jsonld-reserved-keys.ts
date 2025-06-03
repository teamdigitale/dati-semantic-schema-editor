import { Map, OrderedMap } from 'immutable';
import { JSONLD_VOCABULARY } from '../common/vocabulary';
import { SwaggerError } from '../models/error';

export const validateJsonldReservedKeys = (system): SwaggerError[] => {
  // Get basePath from spec
  const specJson = system.specSelectors.specJson() as OrderedMap<string, any>;

  // Checking for errors recursively
  const source = system.jsonldValidatorSelectors.errSource();
  const errors: SwaggerError[] = [];

  const executeDeeply = (path: string[], isInContext: boolean) => {
    const partialSpec = specJson.getIn(path);
    if (Map.isMap(partialSpec)) {
      for (const [key, value] of partialSpec.entries() as IterableIterator<[string, unknown]>) {
        const innerPath = [...path, key];
        if (key === 'x-jsonld-context') {
          executeDeeply(innerPath, true);
        } else if (isInContext && key.startsWith('@') && !JSONLD_VOCABULARY.includes(key)) {
          errors.push({
            type: 'spec',
            source,
            level: 'error',
            message: `Key ${key} is not a valid jsonld keyword. Allowed keywords are: ${JSONLD_VOCABULARY.join(', ')}`,
            path: innerPath,
            line: system.specSelectors.getSpecLineFromPath(innerPath),
          });
        } else {
          executeDeeply(innerPath, isInContext);
        }
      }
    }
  };

  executeDeeply(['components', 'schemas'], false);

  return errors;
};
