import { SchemaEditor } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

export function Standalone() {
  // Retrieve the 'url' query parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const schemaUrl = urlParams.get('url') || '/schemas/help.yaml';
  const sparqlUrl = urlParams.get('eu') ? 'https://data.europa.eu/sparql' : undefined;

  return (
    <div>
      <h1>Standalone</h1>

      <div style={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
        <SchemaEditor
          url={schemaUrl}
          oasCheckerUrl="https://italia.github.io/api-oas-checker/"
          schemaEditorUrl="https://teamdigitale.github.io/dati-semantic-schema-editor/latest/"
          sparqlUrl={sparqlUrl}
        />
      </div>
    </div>
  );
}
