import { useCallback } from "react";

export const useSchemaBasePath = (
  specSelectors
): [string[], () => string[]] => {
  const getSchemaBasePath = useCallback(() => {
    const isOAS3 = specSelectors.isOAS3();
    return isOAS3 ? ["components", "schemas"] : ["definitions"];
  }, [specSelectors]);

  const specPathBase = getSchemaBasePath();

  return [specPathBase, getSchemaBasePath];
};
