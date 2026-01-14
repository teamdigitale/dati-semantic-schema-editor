import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { API_HEADER_RATE_LIMIT } from '../swagger';

@ApiTags('health')
@Controller({
  version: '',
  path: 'status',
})
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'The service status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    headers: { ...API_HEADER_RATE_LIMIT },
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
  getHealth() {
    return {
      status: 200,
      title: 'OK',
    };
  }
}
