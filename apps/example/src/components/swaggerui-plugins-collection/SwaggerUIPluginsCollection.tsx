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
  return (
    <div>
      <SwaggerUI
        url="https://petstore.swagger.io/v2/swagger.json"
        plugins={[ErrorsPlugin, JSONSchema5Plugin, OverviewPlugin, CustomLayoutPlugin]}
        layout={'CustomLayout'}
      />
    </div>
  );
}
