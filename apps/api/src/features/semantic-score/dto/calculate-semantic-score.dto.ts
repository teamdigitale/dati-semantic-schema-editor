import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CalculateSemanticScoreRequest' })
export class CalculateSemanticScoreRequestDTO {
  @ApiProperty({
    description:
      'An OpenAPI Specification Document serialized as YAML or JSON.',
    type: 'string',
    format: 'binary',
    required: true,
  })
  file: any;
}
