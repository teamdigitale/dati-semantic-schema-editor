import type { Map } from 'immutable';
import { CONFIG_STATE_KEY } from './const';
import { ConfigurationContext } from './context';

export function ConfigurationProvider({ system, children }) {
  const getConfig = () => (system.getSystem().configsSelectors.get(CONFIG_STATE_KEY) as Map<string, any>)?.toJS();

  return <ConfigurationContext.Provider value={getConfig}>{children}</ConfigurationContext.Provider>;
}
