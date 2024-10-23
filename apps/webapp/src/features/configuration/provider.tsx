import { useState } from 'react';
import { ConfigurationContext } from './context';
import { Config } from './models';

export function ConfigurationProvider({ config: initialConfig, children }: { config: Config; children: JSX.Element }) {
  const [config, setConfig] = useState<Config>(initialConfig);

  return <ConfigurationContext.Provider value={{ config, setConfig }}>{children}</ConfigurationContext.Provider>;
}
