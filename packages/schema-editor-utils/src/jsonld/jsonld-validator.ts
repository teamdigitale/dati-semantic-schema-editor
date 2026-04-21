import { resolveJsonldContext, resolvePropertyByJsonldContext } from '@teamdigitale/schema-editor-utils';
import { Map, OrderedMap } from 'immutable';
import { JSONLD_VOCABULARY } from './jsonld-vocabulary';
import { resolveSpecPathRefs } from '../utils';

export interface JsonLDValidationIssue {
  type: string;
  level: 'error' | 'warning';
  message: string;
  path: string[];
}

/**
 * Validates the jsonld context and its properties in the spec.
 * @param system - The system object.
 * @returns An array of Swagger Editor's errors.
 */
export const validateJsonldContext = async (specJson: OrderedMap<string, any>): Promise<JsonLDValidationIssue[]> => {
  const issues: JsonLDValidationIssue[] = [];

  // Extract all data models from spec
  const SCHEMAS_PATH = ['components', 'schemas'];
  const dataModels = specJson.getIn(SCHEMAS_PATH) as Map<any, any> | undefined;
  if (!dataModels) {
    return issues;
  }

  // Process every element in #/components/schemas that has a jsonld context
  const filteredSchemas = dataModels.filter((x) => x.has('x-jsonld-context'));
  for (const [dataModelKey, dataModel] of filteredSchemas.entries()) {
    const xJsonldContext = dataModel.get('x-jsonld-context');
    const jsonldContextPath = resolveSpecPathRefs(specJson, [...SCHEMAS_PATH, dataModelKey, 'x-jsonld-context']);

    // Check if x-jsonld-context is a URL (not an embedded context)
    if (
      typeof xJsonldContext === 'string' &&
      (xJsonldContext.startsWith('http://') || xJsonldContext.startsWith('https://'))
    ) {
      issues.push({
        type: 'spec',
        level: 'warning',
        message: `Context URL dereferencing is not supported. URL contexts have limitations and security implications. Use an embedded context instead.`,
        path: jsonldContextPath,
      });
      continue;
    }

    // Check if x-jsonld-context is an object
    if (typeof xJsonldContext !== 'object' || xJsonldContext === null) {
      issues.push({
        type: 'spec',
        level: 'error',
        message: `Context must be an object.`,
        path: jsonldContextPath,
      });
      continue;
    }

    // Get the root jsonld context
    const jsonldContext = resolveJsonldContext(dataModel)?.get('@context');
    if (!jsonldContext) {
      continue;
    }
    const stringifiedJsonldContext = JSON.stringify(jsonldContext);

    // VALIDATION 1:
    // Validate jsonld context keys and values
    function validateJsonldContextDeeply(partialJsonldContext: Map<string, any>, resolvedPath: string[]) {
      const entries = Array.from(partialJsonldContext.entries());

      for (const [key, value] of entries) {
        const innerPath = [...resolvedPath, key];
        const jsonldPropertyFullPath = resolveSpecPathRefs(specJson, [
          ...SCHEMAS_PATH,
          dataModelKey,
          'x-jsonld-context',
          ...innerPath,
        ]);

        // VALIDATION 1A: avoid invalid @base values
        if (key === '@base' && !['#', '/', ':'].some((x) => value?.toString().endsWith(x))) {
          issues.push({
            type: 'spec',
            level: 'warning',
            message: `The provided @base value is not valid. It should end with #, /, or :`,
            path: jsonldPropertyFullPath,
          });
        }

        // VALIDATION 1B: avoid invalid jsonld keywords
        if (key.startsWith('@') && !JSONLD_VOCABULARY.includes(key)) {
          issues.push({
            type: 'spec',
            level: 'error',
            message: `Key ${key} is not a valid jsonld keyword. Allowed keywords are: ${JSONLD_VOCABULARY.join(', ')}`,
            path: jsonldPropertyFullPath,
          });
        }

        // VALIDATION 1C: avoid invalid @id values associated with non-string properties
        if (value === '@id') {
          const propertyPath = resolveSpecPathRefs(specJson, [
            ...SCHEMAS_PATH,
            dataModelKey,
            'properties',
            ...innerPath.map((x) => (x === '@context' ? 'properties' : x)),
          ]);
          const property = specJson.getIn(propertyPath) as Map<string, any>;
          if (!property || property.get('type') !== 'string') {
            issues.push({
              type: 'spec',
              level: 'warning',
              message: `The @id annotation should be used with string properties.`,
              path: jsonldPropertyFullPath,
            });
          }
        }

        // VALIDATION 1D: avoid invalid prefixes (i.e. "CPV": "https://w3id.org/italia/onto/CPV" <-- without final / or # or :)
        // Pay attention: don't block properties full URIs like "https://w3id.org/italia/onto/CPV/description"
        // prefixes must be referenced by other properties (i.e. "description": "CPV:description").
        if (/^https?:\/\/.*[^#/:]$/.test(value) && stringifiedJsonldContext.includes(`${key}:`)) {
          issues.push({
            type: 'spec',
            level: 'error',
            message: `The prefix ${key} is not valid. It should end with a final / or # or :`,
            path: jsonldPropertyFullPath,
          });
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
        issues.push({
          type: 'spec',
          level: 'error',
          message: ex.message,
          path: propertyFullPath,
        });
      }
    }
  }

  return issues;
};
