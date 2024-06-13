import { useContext } from "react";
import { SchemaNavigationContext } from "./context";

export const useSchemaNavigation = () => useContext(SchemaNavigationContext);
