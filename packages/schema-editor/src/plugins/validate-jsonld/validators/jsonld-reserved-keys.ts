import { Map, OrderedMap } from 'immutable';
import { JSONLD_VOCABULARY } from '../common/vocabulary';
import { SwaggerError } from '../models/error';

/**
 * Validates the @-prefixed keywords in the jsonld context and their values.
 * @param system - The system object.
 * @returns An array of Swagger Editor's errors.
 */
export const validateJsonldReservedKeys = (system): SwaggerError[] => {
  // Get basePath from spec
  const specJson = system.specSelectors.specJson() as OrderedMap<string, any>;

  // Checking for errors recursively
  const source = system.jsonldValidatorSelectors.errSource();
  const errors: SwaggerError[] = [];

  const executeDeeply = (path: string[], isInContext: boolean) => {
    const partialSpec = specJson.getIn(path);
    if (!Map.isMap(partialSpec)) {
      return;
    }

    for (const [key, value] of partialSpec.entries() as IterableIterator<[string, unknown]>) {
      const innerPath = [...path, key];

      // Perform validation only if we are inside a jsonld context
      if (isInContext) {
        // Validate @base value
        if (key === '@base' && !['#', '/', ':'].some((x) => value?.toString().endsWith(x))) {
          errors.push({
            type: 'spec',
            source,
            level: 'warning',
            message: `The provided @base value is not valid. It should end with #, /, or :`,
            path: innerPath,
            line: system.specSelectors.getSpecLineFromPath(innerPath),
          });
        }

        // Validate jsonld keywords
        if (key.startsWith('@') && !JSONLD_VOCABULARY.includes(key)) {
          errors.push({
            type: 'spec',
            source,
            level: 'error',
            message: `Key ${key} is not a valid jsonld keyword. Allowed keywords are: ${JSONLD_VOCABULARY.join(', ')}`,
            path: innerPath,
            line: system.specSelectors.getSpecLineFromPath(innerPath),
          });
        }
      }

      // Continue to validate nested properties
      executeDeeply(innerPath, key === 'x-jsonld-context' ? true : isInContext);
    }
  };

  executeDeeply(['components', 'schemas'], false);

  return errors;
};
