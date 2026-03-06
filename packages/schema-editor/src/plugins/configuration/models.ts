export interface Config {
  sparqlUrl?: string;
  oasCheckerUrl?: string;
  schemaEditorUrl?: string;
  tabsList?: string[];
}

export type IConfigurationContext = () => Config;
