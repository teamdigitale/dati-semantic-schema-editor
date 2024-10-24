import { ConfigurationContext } from './context';

export function ConfigurationProvider({ getConfigs, children }) {
  return <ConfigurationContext.Provider value={getConfigs}>{children}</ConfigurationContext.Provider>;
}
