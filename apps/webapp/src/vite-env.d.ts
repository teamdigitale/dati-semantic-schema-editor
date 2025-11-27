/// <reference types="vite/client" />

interface Window {
  __ENV?: {
    sparqlUrl?: string;
    oasCheckerUrl?: string;
    schemaEditorUrl?: string;
  };
}
