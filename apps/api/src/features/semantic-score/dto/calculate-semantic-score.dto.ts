import { ApiProperty } from '@nestjs/swagger';

export class CalculateSemanticScoreRequestDTO {
  @ApiProperty({
    description: 'YAML file to process for semantic scoring',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
