import { decompressAndBase64UrlSafe, SchemaEditor } from '@teamdigitale/schema-editor';
import { Alert } from 'design-react-kit';
import { useState } from 'react';
import { useConfiguration } from '../../features/configuration';
import { useNavigation } from '../../features/navigation';

export function Editor() {
  const { config } = useConfiguration();
  const { query, hash } = useNavigation();

  // Check if URL query parameter is used (deprecated)
  const showQueryParamWarning = query.has('url');
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  // Parse hash fragment
  let schemaUrl: string | undefined;
  let schemaSpec: string | undefined;

  // Priority high: URL from hash fragment (#url=...)
  if (hash.startsWith('url=')) {
    schemaUrl = decodeURIComponent(hash.substring(4));
  }
  // Priority medium: OAS spec from hash fragment (#oas:...)
  else if (hash.startsWith('oas:')) {
    const fragment = hash.replace('oas:', '');
    schemaSpec = fragment ? decompressAndBase64UrlSafe(fragment) : undefined;
  }
  // Priority low: Default schema URL if nothing else provided
  if (!schemaSpec && !schemaUrl) {
    schemaUrl = 'schemas/starter-schema.oas3.yaml';
  }

  return (
    <>
      <Alert
        color="warning"
        isOpen={showQueryParamWarning && !isWarningDismissed}
        toggle={() => setIsWarningDismissed(true)}
      >
        <strong>Warning:</strong> The URL query parameter (?url=...) is deprecated. Please use the hash fragment
        (#url=...) instead to avoid sharing URLs with the server.
      </Alert>
      <SchemaEditor url={schemaUrl} spec={schemaSpec} {...config} />
    </>
  );
}
