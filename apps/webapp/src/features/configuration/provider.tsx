import { useState } from 'react';
import { ConfigurationContext } from './context';
import { Config } from './models';

export function ConfigurationProvider({ children }: { children: JSX.Element }) {
  const [config, setConfig] = useState<Config>(window.__ENV);

  return <ConfigurationContext.Provider value={{ config, setConfig }}>{children}</ConfigurationContext.Provider>;
}
