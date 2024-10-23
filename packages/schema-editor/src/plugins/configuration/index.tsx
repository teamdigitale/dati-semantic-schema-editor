/* eslint-disable react/display-name */
import { ConfigurationProvider } from './provider';

export * from './const';
export * from './hooks';
export * from './models';

export const ConfigurationPlugin = () => ({
  wrapComponents: {
    ItaliaSchemaEditorLayout: (Original, system) => (props) => {
      return (
        <ConfigurationProvider system={system}>
          <Original {...props} />
        </ConfigurationProvider>
      );
    },
  },
});

export default ConfigurationPlugin;
