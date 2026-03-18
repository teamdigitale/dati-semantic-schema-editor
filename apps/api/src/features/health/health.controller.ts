import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { API_HEADER_RATE_LIMIT, API_RESPONSE_503 } from '../swagger';

@ApiTags('Health')
@Controller('status')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Retrieve the status of the service.',
    description: `Returns whether the service is functioning properly or not.

Consumers should use this endpoint to test the service,
instead of issuing specific requests to the other endponts.

If the service is unavailable, the response may provide information
about the unavailability period.`,
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
  @ApiResponse(API_RESPONSE_503)
  getHealth() {
    return {
      status: 200,
      title: 'OK',
    };
  }
}
