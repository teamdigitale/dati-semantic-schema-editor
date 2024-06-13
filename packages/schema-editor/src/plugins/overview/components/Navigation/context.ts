import { createContext } from 'react';
import { NavigationItem } from './models';

interface Context {
  history: NavigationItem[];
  push: (item: NavigationItem) => void;
  go: (index: number) => void;
}

export const SchemaNavigationContext = createContext<Context>(null as never);
