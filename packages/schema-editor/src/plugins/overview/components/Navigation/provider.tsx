import { useState } from 'react';
import { SchemaNavigationContext } from './context';
import { NavigationItem } from './models';

export function SchemaNavigationProvider({ children }) {
  const [history, setHistory] = useState<NavigationItem[]>([]);

  const push = (item: NavigationItem) => {
    if (history[history.length - 1]?.id === item.id) {
      return;
    }
    setHistory((currentHistory) => [...currentHistory, item]);
  };

  const go = (index: number) => {
    setHistory((currentHistory) => currentHistory.slice(0, index));
  };

  const back = () => {
    setHistory((currentHistory) => currentHistory.slice(0, currentHistory.length - 1));
  };

  return (
    <SchemaNavigationContext.Provider value={{ history, push, go, back }}>{children}</SchemaNavigationContext.Provider>
  );
}
