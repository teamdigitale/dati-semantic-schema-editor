import { resolveJsonldContext, resolvePropertyByJsonldContext } from '@teamdigitale/schema-editor-utils';
import { Map, OrderedMap } from 'immutable';
import { resolveSpecPathRefs } from '../../jump-to-path/utils';
import { SwaggerError } from '../models/error';
import { JSONLD_VOCABULARY } from '../common/vocabulary';

/**
 * Validates the jsonld context and its properties in the spec.
 * @param system - The system object.
 * @returns An array of Swagger Editor's errors.
 */
export const validateJsonldContext = async (system): Promise<SwaggerError[]> => {
  const specJson = system.specSelectors.specJson() as OrderedMap<string, any>;

  const source = system.jsonldValidatorSelectors.errSource();
  const errors: SwaggerError[] = [];

  // Extract all data models from spec
  const SCHEMAS_PATH = ['components', 'schemas'];
  const dataModels = specJson.getIn(SCHEMAS_PATH) as Map<any, any> | undefined;
  if (!dataModels) {
    return errors;
  }

  // Process every element in #/components/schemas that has a jsonld context
  const filteredSchemas = dataModels.filter((x) => x.has('x-jsonld-context'));
  for (const [dataModelKey, dataModel] of filteredSchemas.entries()) {
    // Get the root jsonld context
    const jsonldContext = resolveJsonldContext(dataModel)?.get('@context');
    if (!jsonldContext) {
      continue;
    }

    // VALIDATION 1:
    // Validate jsonld context keys and values
    function validateJsonldContextDeeply(partialJsonldContext: Map<string, any>, resolvedPath: string[]) {
      const entries = Array.from(partialJsonldContext.entries());

      for (const [key, value] of entries) {
        const innerPath = [...resolvedPath, key];
        const jsonldPropertyFullPath = resolveSpecPathRefs(system, [
          ...SCHEMAS_PATH,
          dataModelKey,
          'x-jsonld-context',
          ...innerPath,
        ]);
        const jsonldPropertyLine = system.specSelectors.getSpecLineFromPath(jsonldPropertyFullPath);

        // VALIDATION 1A: avoid invalid @base values
        if (key === '@base' && !['#', '/', ':'].some((x) => value?.toString().endsWith(x))) {
          errors.push({
            type: 'spec',
            source,
            level: 'warning',
            message: `The provided @base value is not valid. It should end with #, /, or :`,
            path: jsonldPropertyFullPath,
            line: jsonldPropertyLine,
          });
        }

        // VALIDATION 1B: avoid invalid jsonld keywords
        if (key.startsWith('@') && !JSONLD_VOCABULARY.includes(key)) {
          errors.push({
            type: 'spec',
            source,
            level: 'error',
            message: `Key ${key} is not a valid jsonld keyword. Allowed keywords are: ${JSONLD_VOCABULARY.join(', ')}`,
            path: jsonldPropertyFullPath,
            line: jsonldPropertyLine,
          });
        }

        // VALIDATION 1C: avoid invalid @id values associated with non-string properties
        if (value === '@id') {
          const propertyPath = resolveSpecPathRefs(system, [
            ...SCHEMAS_PATH,
            dataModelKey,
            'properties',
            ...innerPath.map((x) => (x === '@context' ? 'properties' : x)),
          ]);
          const property = specJson.getIn(propertyPath) as Map<string, any>;
          if (!property || property.get('type') !== 'string') {
            errors.push({
              type: 'spec',
              source,
              level: 'warning',
              message: `The @id annotation should be used with string properties.`,
              path: jsonldPropertyFullPath,
              line: jsonldPropertyLine,
            });
          }
        }

        // Process nested values
        if (Map.isMap(value)) {
          validateJsonldContextDeeply(value as Map<string, any>, innerPath);
        }
      }
    }
    validateJsonldContextDeeply(jsonldContext, []);

    // VALIDATION 2:
    // Check all object properties are valid in the jsonld context
    const propertiesPaths: string[][] =
      dataModel
        .get('properties')
        ?.keySeq()
        .toArray()
        .map((x) => [x]) || [];

    for (const propertyRelativePath of propertiesPaths) {
      try {
        await resolvePropertyByJsonldContext(jsonldContext, propertyRelativePath);
      } catch (ex) {
        const propertyFullPath = [...SCHEMAS_PATH, dataModelKey, 'properties', ...propertyRelativePath];
        const propertyLine = system.specSelectors.getSpecLineFromPath(propertyFullPath);
        errors.push({
          type: 'spec',
          source,
          level: 'error',
          message: ex.message,
          path: propertyFullPath,
          line: propertyLine,
        });
      }
    }
  }

  return errors;
};
