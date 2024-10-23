import { createContext } from 'react';
import { IConfigurationContext } from './models';

export const ConfigurationContext = createContext<IConfigurationContext>(null as never);
