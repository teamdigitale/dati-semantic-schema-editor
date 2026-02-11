import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CalculateSemanticScoreRequest' })
export class CalculateSemanticScoreRequestDTO {
  @ApiProperty({
    description: 'YAML file to process for semantic scoring',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
