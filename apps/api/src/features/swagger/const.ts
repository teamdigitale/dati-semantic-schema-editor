import { ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { GlobalErrorDTO } from '../exceptions';

// HEADERS
export const API_HEADER_RATE_LIMIT: ApiResponseOptions['headers'] = {
  'X-Ratelimit-Limit': {
    description:
      'The maximum number of requests that the user is allowed to make per interval of time.',
    schema: {
      type: 'integer',
      example: 30,
    },
  },
  'X-Ratelimit-Remaining': {
    description:
      'The number of requests remaining in the current rate limit window.',
    schema: {
      type: 'integer',
      example: 10,
    },
  },
  'X-Ratelimit-Reset': {
    description:
      'The time at which the current rate limit window resets in seconds.',
    schema: {
      type: 'integer',
      example: 60,
    },
  },
};

// RESPONSES
export const API_RESPONSE_DEFAULT: ApiResponseOptions = {
  status: 'default',
  description: 'Client or server error during semantic score calculation.',
  headers: { ...API_HEADER_RATE_LIMIT },
  content: {
    'application/problem+json': {
      schema: {
        $ref: getSchemaPath(GlobalErrorDTO),
      },
    },
  },
};

export const API_RESPONSE_406: ApiResponseOptions = {
  status: 406,
  description: `The provided file is not a valid OpenAPI 3.0 specification document.`,
  headers: { ...API_HEADER_RATE_LIMIT },
  content: {
    'application/problem+json': {
      schema: {
        $ref: '#/components/schemas/Problem',
      },
    },
  },
};

export const API_RESPONSE_413: ApiResponseOptions = {
  status: 413,
  description: `The provided file is too large.`,
  headers: { ...API_HEADER_RATE_LIMIT },
  content: {
    'application/problem+json': {
      schema: {
        $ref: '#/components/schemas/Problem',
      },
    },
  },
};

export const API_RESPONSE_415: ApiResponseOptions = {
  status: 415,
  description: `The provided file has an unsupported media type: we only accept application/json and application/yaml.`,
  headers: { ...API_HEADER_RATE_LIMIT },
  content: {
    'application/problem+json': {
      schema: {
        $ref: '#/components/schemas/Problem',
      },
    },
  },
};

export const API_RESPONSE_429: ApiResponseOptions = {
  status: 429,
  description: 'Too many requests sent to the server.',
  headers: { ...API_HEADER_RATE_LIMIT },
  content: {
    'application/problem+json': {
      schema: {
        $ref: getSchemaPath(GlobalErrorDTO),
      },
    },
  },
};
