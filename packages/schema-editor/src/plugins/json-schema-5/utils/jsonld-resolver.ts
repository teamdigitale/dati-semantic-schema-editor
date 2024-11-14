import { Map } from 'immutable';
import { basename } from '.';
import { expand } from 'jsonld';

export interface JsonLDResolverResult {
  fieldName: string;
  fieldUri: string;
  vocabularyUri?: string;
}

export async function resolvePropertyByJsonldContext(
  jsonldContext: Map<any, any>,
  propertyPath: string[], // For example ["components", "schemas", "person", "birth_place"]
): Promise<JsonLDResolverResult> {
  try {
    if (!jsonldContext || !propertyPath?.length) {
      throw new Error('Invalid context or keys');
    }

    const lastKey = propertyPath[propertyPath.length - 1];
    if (lastKey.startsWith('@id')) {
      return { fieldName: '@id', fieldUri: '@id' };
    }

    // Don't need to process full URIs.
    if (/^https?:/.test(lastKey)) {
      return { fieldName: basename(lastKey), fieldUri: lastKey };
    }

    let context: any = typeof jsonldContext.toJS !== 'undefined' ? jsonldContext.toJS() : jsonldContext;
    context = context['@context'] ?? context;

    // Validate property path upon context
    let innerContext = context;
    for (let i = 0; i < propertyPath.length; i++) {
      const key = propertyPath[i];
      if (!innerContext[key]) {
        // Property ${key} not found in inner @context. Resolving with default @vocab.
        // We cannot check if @vocab is defined in the context because it can be defined in the parent context.
        innerContext[key] = key;
      } else if (innerContext[key].startsWith && innerContext[key].startsWith('@')) {
        // Property ${key} is associated with the keyword ${innerContext[key]}. Don't resolve it.
        return { fieldName: innerContext[key], fieldUri: innerContext[key] };
      } else if (i < propertyPath.length - 1 && !innerContext[key]['@context']) {
        throw new Error(`Missing inner @context for property ${key}`);
      }
      innerContext = innerContext[key]['@context'];
    }

    // Generating input and extracting expanded data
    const input = propertyPath.reduceRight((obj, x, i) => ({ [x]: i < propertyPath.length - 1 ? obj : '' }), {});
    const result = await expand({ '@context': context, ...input });

    // Processing extracted data
    let fieldUri: string | undefined = undefined;
    let fieldValue: any = result;
    for (let i = 0; i < propertyPath.length; i++) {
      [fieldUri, fieldValue] = Object.entries(fieldValue[0])[0];
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
    console.error(e);
    throw e;
  }
}
