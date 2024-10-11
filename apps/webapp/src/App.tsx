import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-lora';
import 'typeface-roboto-mono';
import 'typeface-titillium-web';

import './App.scss';

import { Header, HeaderBrand, HeaderContent, HeaderRightZone, HeaderSocialsZone, Icon } from 'design-react-kit';

import { decompressAndBase64UrlSafe, SchemaEditor } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const schemaUrl = urlParams.get('url') || 'schemas/starter-schema.oas3.yaml';

  const fragment = window.location.hash?.replace('#oas:', '');
  const schemaSpec = fragment ? decompressAndBase64UrlSafe(fragment) : undefined;

  return (
    <>
      <Header type="center">
        <HeaderContent>
          <HeaderBrand iconAlt="it code circle icon" iconName="it-code-circle">
            <h2>Schema Editor - 0.0.2 beta</h2>
            <h3>Italian OpenAPI Schema Editor</h3>
          </HeaderBrand>
          <HeaderRightZone>
            <HeaderSocialsZone label="Info + Repo">
              <ul>
                <li>
                  <a aria-label="Github" href="#" target="_blank">
                    <Icon icon="it-github" />
                  </a>
                </li>
              </ul>
            </HeaderSocialsZone>
          </HeaderRightZone>
        </HeaderContent>
      </Header>

      <div className="app-container">
        <SchemaEditor
          url={schemaUrl}
          spec={schemaSpec}
          oasCheckerUrl={'https://italia.github.io/api-oas-checker'}
          schemaEditorUrl="https://par-tec.github.io/dati-semantic-schema-editor/v0.0.3-preview/"
        />
      </div>
    </>
  );
}

export default App;
