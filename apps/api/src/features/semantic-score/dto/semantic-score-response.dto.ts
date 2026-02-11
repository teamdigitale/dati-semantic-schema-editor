import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  ModelSummary,
  PropertySummary,
  SemanticScoreSummary,
} from '@teamdigitale/schema-editor-utils';
import { Expose, Type } from 'class-transformer';
import { ExposeConditionally } from '../../swagger';

@ApiSchema({ name: 'PropertySummary' })
export class PropertySummaryDTO implements PropertySummary {
  @Expose({ name: 'name' })
  @ApiProperty({
    name: 'name',
    description: 'Name of the property',
    example: 'country',
    required: true,
  })
  name: string;

  @Expose({ name: 'uri' })
  @ApiProperty({
    name: 'uri',
    description:
      'URI of the property or reserved keyword. If the property is not mapped, the URI is null.',
    type: 'string',
    examples: ['@id', 'https://w3id.org/italia/onto/CLV/country', null],
    required: false,
    format: 'uri',
    nullable: true,
  })
  uri: string | null;

  @Expose({ name: 'valid' })
  @ApiProperty({
    name: 'valid',
    description: 'Whether the property is semantically valid',
    example: true,
    required: true,
  })
  valid: boolean;
}

@ApiSchema({ name: 'ModelSummary' })
export class ModelSummaryDTO implements ModelSummary {
  @Expose({ name: 'name' })
  @ApiProperty({
    name: 'name',
    description:
      'Name of the data model relative to the OpenAPI specification document #/components/schemas path.',
    example: 'Country',
    required: true,
  })
  name: string;

  @Expose({ name: 'score' })
  @ApiProperty({
    name: 'score',
    description: 'Semantic score for this model (0-1)',
    example: 0.8,
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

  @Expose({ name: 'raw_properties_count' })
  @ApiProperty({
    name: 'raw_properties_count',
    description: 'Number of properties in the model',
    type: 'integer',
    minimum: 0,
    example: 10,
    required: true,
  })
  rawPropertiesCount: number;

  @Expose({ name: 'valid_properties_count' })
  @ApiProperty({
    name: 'valid_properties_count',
    description: 'Number of valid properties in the model',
    type: 'integer',
    minimum: 0,
    example: 8,
    required: true,
  })
  validPropertiesCount: number;

  @Expose({ name: 'invalid_properties_count' })
  @ApiProperty({
    name: 'invalid_properties_count',
    description: 'Number of invalid properties in the model',
    type: 'integer',
    minimum: 0,
    example: 2,
    required: true,
  })
  invalidPropertiesCount: number;

  @Expose({ name: 'properties' })
  @Type(() => PropertySummaryDTO)
  @ApiProperty({
    name: 'properties',
    description: 'List of properties with their validation status',
    type: [PropertySummaryDTO],
    required: true,
  })
  properties: PropertySummaryDTO[];
}

@ApiSchema({ name: 'SemanticScoreResponse' })
export class SemanticScoreResponseDTO implements SemanticScoreSummary {
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
    type: 'integer',
    minimum: 0,
    description: 'Unix timestamp of when the score was calculated',
    example: 1707234567890,
    required: true,
  })
  timestamp: number;

  @ExposeConditionally({
    enabled: process.env.NODE_ENV !== 'production',
    name: 'sparql_endpoint',
  })
  @ApiProperty({
    name: 'sparql_endpoint',
    description:
      'SPARQL endpoint URL used for validation. This field is used only for debugging purposes and could not be always available',
    example: 'https://example.com/sparql',
    format: 'uri',
    deprecated: true,
    required: false,
  })
  sparqlEndpoint: string;

  @Expose({ name: 'models' })
  @Type(() => ModelSummaryDTO)
  @ApiProperty({
    name: 'models',
    description: 'Per-model details with their semantic score',
    type: [ModelSummaryDTO],
    required: true,
  })
  models: ModelSummaryDTO[];
}
