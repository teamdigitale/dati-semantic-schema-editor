import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller({
  version: '',
  path: 'status',
})
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'The service status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    content: {
      'application/problem+json': {
        schema: {
          $ref: '#/components/schemas/Problem',
        },
        example: {
          status: 200,
          title: 'OK',
        },
      },
    },
  })
  @ApiResponse({
    status: 'default',
    description: 'Client or server error during semantic score calculation.',
    content: {
      'application/problem+json': {
        schema: {
          $ref: '#/components/schemas/Problem',
        },
      },
    },
  })
  getHealth() {
    return {
      status: 200,
      title: 'OK',
    };
  }
}
