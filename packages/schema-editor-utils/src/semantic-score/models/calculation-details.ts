export interface PropertySummary {
  name: string;
  uri: string | null;
  valid: boolean;
}

export interface ModelSummary {
  name: string;
  score: number;
  hasAnnotations: boolean;
  rawPropertiesCount: number;
  validPropertiesCount: number;
  invalidPropertiesCount: number;
  properties: PropertySummary[];
}

export interface SemanticScoreSummary {
  score: number;
  timestamp: number;
  sparqlEndpoint: string;
  models: ModelSummary[];
}
