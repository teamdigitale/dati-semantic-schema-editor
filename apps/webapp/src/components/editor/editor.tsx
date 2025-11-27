import { decompressAndBase64UrlSafe, SchemaEditor } from '@teamdigitale/schema-editor';
import { useState, useEffect } from 'react';
import { Alert } from 'design-react-kit';
import { useConfiguration } from '../../features/configuration';

export function Editor() {
  const { config } = useConfiguration();
  const [showQueryParamWarning, setShowQueryParamWarning] = useState(false);

  // Check if URL query parameter is used (deprecated)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('url')) {
      setShowQueryParamWarning(true);
    }
  }, []);

  // Parse hash fragment
  const hash = window.location.hash.slice(1); // Remove leading #
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
      {showQueryParamWarning && (
        <Alert color="warning" isOpen={showQueryParamWarning} toggle={() => setShowQueryParamWarning(false)}>
          <strong>Warning:</strong> The URL query parameter (?url=...) is deprecated. Please use the hash fragment
          (#url=...) instead to avoid sharing URLs with the server.
        </Alert>
      )}
      <SchemaEditor url={schemaUrl} spec={schemaSpec} {...config} />
    </>
  );
}
