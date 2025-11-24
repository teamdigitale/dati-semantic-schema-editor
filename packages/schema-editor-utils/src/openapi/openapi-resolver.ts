import SwaggerClient from 'swagger-client';
import { to32CharString } from '../utils';

/**
 * It uses SwaggerClient library to resolve all $ref properties of an OpenAPI specification
 * @param spec A JSON rappresentation of the openAPI schema
 * @returns Resolved JSON
 */
export async function resolveOpenAPISpec(spec: object) {
  const originalSpec = JSON.parse(JSON.stringify(spec));

  const swaggerResponse = await SwaggerClient.resolve({ spec: originalSpec, allowMetaPatches: true });
  if (swaggerResponse.errors?.length) {
    throw swaggerResponse.errors;
  }

  const resolvedSpec = swaggerResponse.spec;
  delete resolvedSpec['$$normalized'];

  return resolvedSpec;
}

/**
 * Takes an input OpenAPI JSON schema, analyzes it deeply and moves every $$ref model into #/components/schemas/`refName`-`refHash`
 * @param specJson A JSON rappresentation of the openAPI schema
 * @returns Normalized JSON
 */
export function normalizeOpenAPISpec(specJson: any, localPathDomain: string) {
  if (!localPathDomain) {
    throw new Error('localPathDomain is required');
  }

  const normalizedSpecJson = JSON.parse(JSON.stringify(specJson));

  const processRef = (currentElement: any, currentElementKey?: string, parentElement?: any) => {
    if (!currentElement || typeof currentElement !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(currentElement)) {
      if (key === '$$ref' && typeof value === 'string') {
        // Local reference
        if (value.startsWith(localPathDomain)) {
          if (parentElement && currentElementKey) {
            parentElement[currentElementKey] = {
              $ref: value.replace(localPathDomain, localPathDomain.endsWith('#') ? '#' : ''),
            };
          }
        }
        // Remote reference
        else {
          const originalRefUrl = value;

          // For every $$ref property generate the SHA256 and extract main model name in order to create a local reference like `#/components/schemas/${refPropertyName}-${refSha256}`
          const refSha256 = to32CharString(originalRefUrl);
          const refPropertyName = originalRefUrl.split('/').pop();
          const newRefName = `${refPropertyName}-${refSha256}`;

          // Add to #/components/schemas if not processed yet
          if (!normalizedSpecJson.components.schemas[newRefName]) {
            normalizedSpecJson.components.schemas[newRefName] = { ...currentElement };
            delete normalizedSpecJson.components.schemas[newRefName]['$$ref'];
          }

          // Remove other properties from current element
          if (parentElement && currentElementKey) {
            parentElement[currentElementKey] = {
              'x-ref': originalRefUrl,
              $ref: `#/components/schemas/${newRefName}`,
            };
          }
        }
      } else {
        processRef(value, key, currentElement);
      }
    }
  };

  processRef(normalizedSpecJson);

  return normalizedSpecJson;
}
