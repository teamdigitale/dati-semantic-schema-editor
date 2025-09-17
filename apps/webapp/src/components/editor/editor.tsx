import { decompressAndBase64UrlSafe, SchemaEditor } from '@teamdigitale/schema-editor';
import { useConfiguration } from '../../features/configuration';

export function Editor() {
  const { config } = useConfiguration();

  // Priority high: URL from search param
  const urlParams = new URLSearchParams(window.location.search);
  let schemaUrl = urlParams.get('url') || undefined;

  // Priority medium: Fragment from hash
  const fragment = window.location.hash?.replace('#oas:', '');
  const schemaSpec = !schemaUrl && fragment ? decompressAndBase64UrlSafe(fragment) : undefined;

  // Priority low: Default schema URL if nothing else provided
  if (!schemaSpec && !schemaUrl) {
    schemaUrl = 'schemas/starter-schema.oas3.yaml';
  }

  return <SchemaEditor url={schemaUrl} spec={schemaSpec} {...config} />;
}
