import { resolveJsonldContext, resolvePropertyByJsonldContext } from '@teamdigitale/schema-editor-utils';
import { Map, OrderedMap } from 'immutable';
import { resolveSpecPathRefs } from '../../jump-to-path/utils';
import { SwaggerError } from '../models/error';

/**
 * Validates the jsonld context and its properties in the spec.
 * @param system - The system object.
 * @returns An array of Swagger Editor's errors.
 */
export const validateJsonldVocab = async (system): Promise<SwaggerError[]> => {
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
    // Validate jsonld context @id values associated with string properties
    function validateJsonldContextIdValuesDeeply(partialJsonldContext: Map<string, any>, resolvedPath: string[]) {
      const entries = Array.from(partialJsonldContext.entries());

      for (const [key, value] of entries) {
        const innerPath = [...resolvedPath, key];

        // Process nested values
        if (Map.isMap(value)) {
          validateJsonldContextIdValuesDeeply(value as Map<string, any>, innerPath);
        }

        // If the value equals "@id" then check for object property type
        else if (value === '@id') {
          const propertyPath = resolveSpecPathRefs(system, [
            ...SCHEMAS_PATH,
            dataModelKey,
            'properties',
            ...innerPath.map((x) => (x === '@context' ? 'properties' : x)),
          ]);
          const property = specJson.getIn(propertyPath) as Map<string, any>;
          if (!property || property.get('type') !== 'string') {
            const jsonldPropertyFullPath = [...SCHEMAS_PATH, dataModelKey, 'x-jsonld-context', ...innerPath];
            errors.push({
              type: 'spec',
              source,
              level: 'warning',
              message: `The @id annotation should be used with string properties.`,
              path: jsonldPropertyFullPath,
              line: system.specSelectors.getSpecLineFromPath(jsonldPropertyFullPath),
            });
          }
        }
      }
    }
    validateJsonldContextIdValuesDeeply(jsonldContext, []);

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
