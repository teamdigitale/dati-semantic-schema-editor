declare global {
  interface Window {
    __ENV: Config;
  }
}

export interface Config {
  sparqlUrl?: string;
  sparqlAutocompleteEnabled?: boolean;
  oasCheckerUrl?: string;
  schemaEditorUrl?: string;
}

export interface IConfigurationContext {
  config: Config;
  setConfig: (config: Config) => void;
}
