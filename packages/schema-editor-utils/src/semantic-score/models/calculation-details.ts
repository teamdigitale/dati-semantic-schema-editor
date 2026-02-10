export interface ModelCalculationDetails {
  modelName: string;
  score: number;
  hasAnnotations: boolean;
  validPropertiesPaths: string[];
  invalidPropertiesPaths: string[];
}

export interface Summary {
  rawModelsCount: number;
  positiveScoreModelsCount: number;
  modelsCalculationDetails: ModelCalculationDetails[];
}
