import { useContext } from 'react';
import { ConfigurationContext } from './context';

export const useConfiguration = () => useContext(ConfigurationContext);
