import { Map } from 'immutable';
import { expand } from 'jsonld';
import { basename } from '.';

/**
 * JSON-LD vocabulary keys
 * @see https://www.w3.org/ns/json-ld
 */
const JSONLD_VOCABULARY = [
  '@base',
  '@container',
  '@context',
  '@definition',
  '@direction',
  '@id',
  '@import',
  '@language',
  '@nest',
  '@prefix',
  '@propagate',
  '@protected',
  '@reverse',
  '@term',
  '@type',
  '@version',
  '@vocab',

  '@graph',
  '@index',
  '@list',
  '@set',
];

export interface JsonLDResolverResult {
  fieldName: string;
  fieldUri: string | undefined;
  vocabularyUri?: string;
}

export async function resolvePropertyByJsonldContext(
  jsonldContext: Map<any, any> | any,
  propertyPath: string[], // For example ["components", "schemas", "person", "birth_place"]
): Promise<JsonLDResolverResult> {
  try {
    // Validate inputs
    if (!jsonldContext || !propertyPath?.length) {
      throw new Error('Invalid context or keys');
    }

    // If last key equals @id, then resolve
    const lastKey = propertyPath[propertyPath.length - 1];
    if (lastKey.startsWith('@id')) {
      return { fieldName: '@id', fieldUri: '@id' };
    }

    // If last key is an URI, then resolve
    if (/^https?:/.test(lastKey)) {
      return { fieldName: basename(lastKey), fieldUri: lastKey };
    }

    // Parse context deeply in order to generate a correct context
    let rootContext: any = Map.isMap(jsonldContext) ? jsonldContext.toJS() : jsonldContext;
    rootContext = rootContext['@context'] ?? rootContext;

    let innerContext = rootContext;
    for (let i = 0; i < propertyPath.length; i++) {
      const key = propertyPath[i];
      const isLastKey = i === propertyPath.length - 1;

      // If missing inner context, the x-jsonld-context spec is not complete (eg: still writing yaml, or unresolved context)
      if (!innerContext) {
        break;
      }
      // If property value is explicitly null, then avoid resolving URI
      else if (innerContext[key] === null) {
        return { fieldName: key, fieldUri: undefined };
      }
      // If property value is not set, then resolve with the default @vocab.
      // Please consider that @vocab could be defined in the parent context, not only in inner context.
      else if (innerContext[key] === undefined) {
        innerContext[key] = key;
      }
      // If property is something like @id, avoid resolving URI
      else if (isLastKey && typeof innerContext[key] === 'string' && innerContext[key].startsWith('@')) {
        if (!JSONLD_VOCABULARY.includes(innerContext[key])) {
          throw new Error(
            `Invalid JSON-LD vocabulary key: ${innerContext[key]} in ${innerContext}. Allowed keys are: ${JSONLD_VOCABULARY.join(', ')}`,
          );
        }
        return { fieldName: innerContext[key], fieldUri: innerContext[key] };
      }
      // Continue to resolve deeply
      else {
        innerContext = innerContext[key]?.['@context'];
      }
    }

    // Generating input and extracting expanded data
    const input = propertyPath.reduceRight((obj, x, i) => ({ [x]: i < propertyPath.length - 1 ? obj : '' }), {});
    const result = await expand({ '@context': rootContext, ...input });

    // Processing extracted data
    let fieldUri: string | undefined = undefined;
    let fieldValue: any = result;
    for (let i = 0; i < propertyPath.length; i++) {
      const entries = Object.entries(fieldValue[0])[0];
      if (!entries) {
        [fieldUri, fieldValue] = [undefined, undefined];
        break;
      }
      [fieldUri, fieldValue] = entries;
    }
    if (!fieldUri || !fieldValue) {
      throw new Error(`No results provided`);
    }

    const fieldName: string = fieldUri.split('/').reverse()[0];
    let vocabularyUri: string = fieldValue[0]['@id'];
    if (vocabularyUri?.endsWith('/')) {
      vocabularyUri = vocabularyUri.substring(0, vocabularyUri.length - 1);
    }

    return { fieldName, fieldUri, vocabularyUri };
  } catch (e) {
    if (e.name == 'jsonld.SyntaxError') {
      console.error(
        `Error parsing JSON-LD context when resolving "${propertyPath}" in ${JSON.stringify(jsonldContext)}`,
        e,
      );
    } else {
      console.error(e);
    }
    throw e;
  }
}
