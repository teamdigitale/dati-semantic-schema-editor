import { LayoutTypes, SchemaEditor } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

export function SchemaViewer() {
  // Retrieve the 'url' query parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const schemaUrl = urlParams.get('url') || 'schemas/example-schema.oas3.yaml';
  const sparqlUrl = urlParams.get('eu') ? 'https://data.europa.eu/sparql' : undefined;

  return (
    <div>
      <SchemaEditor
        url={schemaUrl}
        layout={LayoutTypes.VIEWER}
        oasCheckerUrl="https://italia.github.io/api-oas-checker/"
        schemaEditorUrl="https://teamdigitale.github.io/dati-semantic-schema-editor/latest/"
        sparqlUrl={sparqlUrl}
      />
    </div>
  );
}
