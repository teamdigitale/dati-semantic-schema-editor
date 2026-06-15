import '@teamdigitale/schema-editor/dist/style.css';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import { Editor } from './components/editor/editor';
import { Layout } from './components/layout/layout';
import { SearchSchemaModal } from './components/search-schema-modal/search-schema-modal';
import { ConfigurationProvider } from './features/configuration';

function App() {
  return (
    <ConfigurationProvider>
      <Layout>
        <Editor />
        <SearchSchemaModal />
      </Layout>
    </ConfigurationProvider>
  );
}

export default App;
