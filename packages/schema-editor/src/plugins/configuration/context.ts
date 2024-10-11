import { createContext } from 'react';
import { ConfigurationProperties } from './models';

export const ConfigurationContext = createContext<ConfigurationProperties>(null as never);
