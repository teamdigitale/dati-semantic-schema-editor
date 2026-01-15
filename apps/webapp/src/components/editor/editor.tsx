import { decodeOAS, SchemaEditor } from '@teamdigitale/schema-editor';
import { Alert } from 'design-react-kit';
import { useMemo, useState } from 'react';
import { useConfiguration } from '../../features/configuration';
import { useNavigation } from '../../features/navigation';

export function Editor() {
  const { config } = useConfiguration();
  const { query, hash } = useNavigation();

  // Check if URL query parameter is used (deprecated)
  const hasUrlQueryParam = query.has('url');
  const [isUrlWarningDismissed, setIsUrlWarningDismissed] = useState(false);

  // Get schema url or spec from hash fragment
  const { schemaUrl, schemaSpec, isValidSchemaSpec } = useMemo(() => {
    let schemaUrl: string | undefined;
    let schemaSpec: string | undefined;
    let isValidSchemaSpec = true;

    // Priority high: URL from hash fragment (#url=...)
    if (hash.startsWith('url=')) {
      schemaUrl = decodeURIComponent(hash.substring(4));
    }
    // Priority medium: OAS spec from hash fragment (#oas:...)
    else if (hash.startsWith('oas:')) {
      const encodedOAS = hash.replace('oas:', '');
      const decodedOAS = decodeOAS(encodedOAS);
      if (encodedOAS && !decodedOAS) {
        isValidSchemaSpec = false;
      }
      schemaSpec = decodedOAS;
    }

    // Default schema URL if nothing valid is provided (URL or OAS)
    if (!schemaSpec && !schemaUrl) {
      schemaUrl = 'schemas/starter-schema.oas3.yaml';
    }

    return { schemaUrl, schemaSpec, isValidSchemaSpec };
  }, [hash]);
  const [isOASWarningDismissed, setIsOASWarningDismissed] = useState(false);

  return (
    <>
      <Alert
        color="warning"
        className="my-2"
        isOpen={hasUrlQueryParam && !isUrlWarningDismissed}
        toggle={() => setIsUrlWarningDismissed(true)}
      >
        <strong>Warning:</strong> The URL query parameter (?url=...) is deprecated. Please use the hash fragment
        (#url=...) instead to avoid sharing URLs with the server.
      </Alert>

      <Alert
        color="warning"
        className="my-2"
        isOpen={!isValidSchemaSpec && !isOASWarningDismissed}
        toggle={() => setIsOASWarningDismissed(true)}
      >
        <strong>Warning:</strong> The OAS spec in the hash fragment (#oas:...) is invalid. Please use a valid OAS spec
        or a valid URL.
      </Alert>

      <SchemaEditor url={schemaUrl} spec={schemaSpec} {...config} />
    </>
  );
}
