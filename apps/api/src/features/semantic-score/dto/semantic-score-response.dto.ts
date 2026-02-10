import { ApiProperty } from '@nestjs/swagger';
import {
  ModelCalculationDetails,
  Summary,
} from '@teamdigitale/schema-editor-utils';
import { Expose, Type } from 'class-transformer';

export class ModelCalculationDetailsDTO implements ModelCalculationDetails {
  @Expose({ name: 'model_name' })
  @ApiProperty({
    name: 'model_name',
    description: 'Name of the data model',
    example: 'Country',
    required: true,
  })
  modelName: string;

  @Expose({ name: 'score' })
  @ApiProperty({
    name: 'score',
    description: 'Semantic score for this model (0-1)',
    example: 0.75,
    required: true,
    minimum: 0,
    maximum: 1,
  })
  score: number;

  @Expose({ name: 'has_annotations' })
  @ApiProperty({
    name: 'has_annotations',
    description: 'Whether the model is annotated with x-jsonld-context or not.',
    example: true,
    required: true,
  })
  hasAnnotations: boolean;

  @Expose({ name: 'valid_properties_paths' })
  @ApiProperty({
    name: 'valid_properties_paths',
    description:
      'List of URIs or reserved keywords that are correctly resolved to a semantic property.',
    example: [
      '@id',
      'https://w3id.org/italia/onto/RPO/isCurrentlyPredominantlyCitizen',
    ],
    required: true,
    type: [String],
  })
  validPropertiesPaths: string[];

  @Expose({ name: 'invalid_properties_paths' })
  @ApiProperty({
    name: 'invalid_properties_paths',
    description:
      'List of URIs or reserved keywords that cannot be resolved to a semantic property.',
    example: ['https://w3id.org/italia/onto/RPO/notExistingProperty'],
    required: true,
    type: [String],
  })
  invalidPropertiesPaths: string[];
}

export class SummaryDTO implements Summary {
  @Expose({ name: 'raw_models_count' })
  @ApiProperty({
    name: 'raw_models_count',
    description: 'Total number of object-type models processed',
    example: 10,
    required: true,
    minimum: 0,
  })
  rawModelsCount: number;

  @Expose({ name: 'positive_score_models_count' })
  @ApiProperty({
    name: 'positive_score_models_count',
    description:
      'Total number of object-type models that have a semantic score greater than 0.',
    example: 8,
    required: true,
    minimum: 0,
  })
  positiveScoreModelsCount: number;

  @Expose({ name: 'models_calculation_details' })
  @Type(() => ModelCalculationDetailsDTO)
  @ApiProperty({
    name: 'models_calculation_details',
    description: 'Per-model calculation details',
    type: [ModelCalculationDetailsDTO],
    required: true,
  })
  modelsCalculationDetails: ModelCalculationDetailsDTO[];
}

export class SemanticScoreResponseDTO {
  constructor(partial: Partial<SemanticScoreResponseDTO>) {
    Object.assign(this, partial);
  }

  @Expose({ name: 'score' })
  @ApiProperty({
    name: 'score',
    description: 'Overall semantic score for the schema (0-1)',
    example: 0.75,
    required: true,
    minimum: 0,
    maximum: 1,
  })
  score: number;

  @Expose({ name: 'timestamp' })
  @ApiProperty({
    name: 'timestamp',
    description: 'Unix timestamp of when the score was calculated',
    example: 1707234567890,
    required: true,
  })
  timestamp: number;

  @Expose({ name: 'sparql_endpoint' })
  @ApiProperty({
    name: 'sparql_endpoint',
    description: 'SPARQL endpoint URL used for validation',
    example: 'https://example.com/sparql',
    required: true,
    format: 'uri',
  })
  sparqlEndpoint: string;

  @Expose({ name: 'summary' })
  @Type(() => SummaryDTO)
  @ApiProperty({
    name: 'summary',
    description:
      'Summary information including total models processed, total models with scores, and per-model calculation details',
    type: SummaryDTO,
    required: true,
  })
  summary: SummaryDTO;
}
