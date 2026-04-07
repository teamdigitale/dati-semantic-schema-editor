export interface Config {
  sparqlUrl?: string;
  vocabulariesApiUrl?: string;
  oasCheckerUrl?: string;
  schemaEditorUrl?: string;
  tabsList?: string[];
  sparqlAutocompleteEnabled?: boolean;
}

export type IConfigurationContext = () => Config;
