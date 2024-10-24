/* eslint-disable react/display-name */
import { ConfigurationProvider } from './provider';

export * from './hooks';
export * from './models';

export const ConfigurationPlugin = () => ({
  components: {
    ConfigurationProvider,
  },
});

export default ConfigurationPlugin;
