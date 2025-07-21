import '@italia/schema-editor/dist/style.css';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import { Editor } from './components/editor/editor';
import { Layout } from './components/layout/layout';
import { ConfigurationProvider } from './features/configuration';

function App() {
  return (
    <ConfigurationProvider>
      <Layout>
        <Editor />
      </Layout>
    </ConfigurationProvider>
  );
}

export default App;
