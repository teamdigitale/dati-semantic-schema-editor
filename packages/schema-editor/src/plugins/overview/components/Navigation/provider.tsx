import { useState } from 'react';
import { SchemaNavigationContext } from './context';
import { NavigationItem } from './models';

export function SchemaNavigationProvider({ children }) {
  const [history, setHistory] = useState<NavigationItem[]>([]);
  const jsonldContextFullPath = history.find((x) => x.jsonldContextFullPath)?.jsonldContextFullPath;

  const push = (item: NavigationItem) => {
    if (history[history.length - 1]?.id === item.id) {
      return;
    }
    setHistory((currentHistory) => [...currentHistory, item]);
  };

  const go = (index: number) => {
    setHistory((currentHistory) => currentHistory.slice(0, index));
  };

  return (
    <SchemaNavigationContext.Provider value={{ history, jsonldContextFullPath, push, go }}>
      {children}
    </SchemaNavigationContext.Provider>
  );
}
