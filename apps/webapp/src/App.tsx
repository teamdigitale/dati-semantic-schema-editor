import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-lora';
import 'typeface-roboto-mono';
import 'typeface-titillium-web';

import '@italia/schema-editor/dist/style.css';
import { Editor } from './components/editor/editor';
import { Layout } from './components/layout/layout';
import { ConfigurationProvider } from './features/configuration';

function App() {
  return (
    <ConfigurationProvider
      config={{
        sparqlUrl: 'https://virtuoso-dev-external-service-ndc-dev.apps.cloudpub.testedev.istat.it/sparql',
        oasCheckerUrl: 'https://italia.github.io/api-oas-checker',
        schemaEditorUrl: 'https://par-tec.github.io/dati-semantic-schema-editor/latest/',
      }}
    >
      <Layout>
        <Editor />
      </Layout>
    </ConfigurationProvider>
  );
}

export default App;
