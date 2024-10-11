/* eslint-disable react/display-name */
import { ConfigurationProvider } from './provider';

export * from './hooks';
export * from './models';

export const ConfigurationPlugin = () => ({
  wrapComponents: {
    ItaliaSchemaEditorLayout: (Original, system) => (props) => {
      return (
        <ConfigurationProvider config={system.getConfigs()}>
          <Original {...props} />
        </ConfigurationProvider>
      );
    },
  },
});

export default ConfigurationPlugin;
