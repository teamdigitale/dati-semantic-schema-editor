import { OrderedMap } from 'immutable';

/**
 * Resolves the path by navigating through the $ref properties
 * @param specJson - The spec json object (e.g. the spec json object)
 * @param specPath - The spec path to resolve (e.g. ['components', 'schemas', 'A', 'properties', 'hasBirthPlace'])
 * @returns The resolved spec path
 * @example
 * If the spec path is ['components', 'schemas', 'A', 'properties', 'hasBirthPlace'], and the spec json is:
 * ```json
 * {
 *   "components": {
 *     "schemas": {
 *       "A": {
 *         "properties": {
 *           "hasBirthPlace": {
 *             "$ref": "#/components/schemas/B/properties/hasCity"
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 * Then the resolved spec path will be ['components', 'schemas', 'B', 'properties', 'hasCity'].
 */
export const resolveSpecPathRefs = (specJson: OrderedMap<string, any>, specPath: string[]): string[] => {
  for (let i = specPath.length; i >= 0; i--) {
    const tryPath = specPath.slice(0, i);
    const $ref = specJson.getIn([...tryPath, '$ref']);
    if ($ref && typeof $ref === 'string' && /^#\//.test($ref)) {
      const pointer = $ref.charAt(0) === '#' ? $ref.slice(1) : $ref;
      return resolveSpecPathRefs(specJson, [...jsonPointerToArray(pointer), ...specPath.slice(i)]);
    }
  }

  return specPath;
};

function jsonPointerToArray(pointer) {
  if (typeof pointer !== 'string') {
    throw new TypeError(`Expected a string, got a ${typeof pointer}`);
  }

  if (pointer[0] === '/') {
    pointer = pointer.substring(1);
  }

  if (pointer === '') {
    return [];
  }

  return pointer.split('/');
}
