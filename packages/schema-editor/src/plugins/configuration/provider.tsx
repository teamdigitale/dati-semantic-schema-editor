import { ConfigurationContext } from './context';

export function ConfigurationProvider({ config, children }) {
  return <ConfigurationContext.Provider value={config}>{children}</ConfigurationContext.Provider>;
}
