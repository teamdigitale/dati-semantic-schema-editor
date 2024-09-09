import { SchemaEditor } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

export function Standalone() {
  // Retrieve the 'url' query parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const schemaUrl = urlParams.get('url') || '/schemas/help.yaml';

  return (
    <div>
      <h1>Standalone</h1>

      <div style={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
        <SchemaEditor url={schemaUrl} />
      </div>
    </div>
  );
}
