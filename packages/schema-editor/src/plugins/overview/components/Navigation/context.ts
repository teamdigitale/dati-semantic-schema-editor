import { createContext } from 'react';
import { NavigationItem } from './models';

export interface ISchemaNavigationContext {
  history: NavigationItem[];
  push: (item: NavigationItem) => void;
  go: (index: number) => void;
  back: () => void;
}

export const SchemaNavigationContext = createContext<ISchemaNavigationContext>(null as never);
