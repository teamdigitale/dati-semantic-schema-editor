export interface Config {
  sparqlUrl?: string;
  oasCheckerUrl?: string;
  schemaEditorUrl?: string;
  tabsList?: string[];
  sparqlAutocompleteEnabled?: boolean;
}

export type IConfigurationContext = () => Config;
