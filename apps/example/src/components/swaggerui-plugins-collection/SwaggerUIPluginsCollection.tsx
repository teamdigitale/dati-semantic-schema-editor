import SwaggerUI from 'swagger-ui-react';
import { ErrorsPlugin, JSONSchema5Plugin, OverviewPlugin } from '@italia/schema-editor';
import '@italia/schema-editor/dist/style.css';

const CustomLayoutPlugin = () => ({
  components: {
    CustomLayout: ({ getComponent }) => {
      const OverviewContainer = getComponent('OverviewContainer', true);
      return <OverviewContainer />;
    },
  },
});

export function SwaggerUIPluginsCollection() {
  // Retrieve the 'url' query parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const schemaUrl = urlParams.get('url') || 'schemas/example-schema.oas3.yaml';
  const sparqlUrl = urlParams.get('eu') ? 'https://data.europa.eu/sparql' : null;

  return (
    <div>
      <SwaggerUI
        url={schemaUrl}
        plugins={[ErrorsPlugin, JSONSchema5Plugin, OverviewPlugin, CustomLayoutPlugin]}
        layout={'CustomLayout'}
        oasCheckerUrl="https://italia.github.io/api-oas-checker/"
        schemaEditorUrl="https://par-tec.github.io/dati-semantic-schema-editor/v0.0.3/"
        sparqlUrl={sparqlUrl}
      />
    </div>
  );
}
