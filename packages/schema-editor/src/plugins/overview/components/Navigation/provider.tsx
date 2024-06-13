import { useState } from "react";
import { SchemaNavigationContext } from "./context";
import { NavigationItem } from "./models";

export function SchemaNavigationProvider({ children }) {
  const [history, setHistory] = useState<NavigationItem[]>([]);

  const push = (item: NavigationItem) => {
    if (history[history.length - 1]?.id === item.id) {
      return;
    }
    setHistory((value) => [...value, item]);
  };

  const go = (index: number) => {
    setHistory((value) => value.slice(0, index));
  };

  return (
    <SchemaNavigationContext.Provider value={{ history, push, go }}>
      {children}
    </SchemaNavigationContext.Provider>
  );
}
