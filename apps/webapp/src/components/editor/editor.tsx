import { decompressAndBase64UrlSafe, SchemaEditor } from '@italia/schema-editor';
import { useConfiguration } from '../../features/configuration';

export function Editor() {
  const { config } = useConfiguration();

  const urlParams = new URLSearchParams(window.location.search);
  const schemaUrl = urlParams.get('url') || 'schemas/starter-schema.oas3.yaml';

  const fragment = window.location.hash?.replace('#oas:', '');
  const schemaSpec = fragment ? decompressAndBase64UrlSafe(fragment) : undefined;

  return <SchemaEditor url={schemaUrl} spec={schemaSpec} {...config} />;
}
