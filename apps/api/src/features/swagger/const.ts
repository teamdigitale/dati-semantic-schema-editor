import { ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { GlobalErrorDTO } from '../exceptions';

// HEADERS
export const API_HEADER_RATE_LIMIT: ApiResponseOptions['headers'] = {
  'X-RateLimit-Limit': {
    description: 'The number of allowed requests in the current period',
    schema: {
      type: 'integer',
      format: 'int32',
      minimum: 0,
      maximum: 1000000,
      example: 30,
    },
  },
  'X-RateLimit-Remaining': {
    description: 'The number of remaining requests in the current period',
    schema: {
      type: 'integer',
      format: 'int32',
      minimum: 0,
      maximum: 1000000,
      example: 10,
    },
  },
  'X-RateLimit-Reset': {
    description: 'The number of seconds left in the current period',
    schema: {
      type: 'integer',
      format: 'int32',
      minimum: 0,
      maximum: 186400,
      example: 60,
    },
  },
};

export const API_HEADER_RETRY_AFTER: ApiResponseOptions['headers'] = {
  'Retry-After': {
    description:
      'Retry contacting the endpoint *at least* after seconds. See https://tools.ietf.org/html/rfc7231#section-7.1.3',
    schema: {
      type: 'integer',
      format: 'int32',
      minimum: 0,
      maximum: 186400,
      example: 60,
    },
  },
};

// RESPONSES
export const API_RESPONSE_DEFAULT: ApiResponseOptions = {
  status: 'default',
  description:
    'A client or server error happened while processing the service status.',
  headers: {
    ...API_HEADER_RETRY_AFTER,
    ...API_HEADER_RATE_LIMIT,
  },
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
  headers: {
    ...API_HEADER_RETRY_AFTER,
    ...API_HEADER_RATE_LIMIT,
  },
  content: {
    'application/problem+json': {
      schema: {
        $ref: getSchemaPath(GlobalErrorDTO),
      },
    },
  },
};

export const API_RESPONSE_503: ApiResponseOptions = {
  status: 503,
  description:
    'The service is not available: further availability information may be provided via headers.',
  headers: {
    ...API_HEADER_RETRY_AFTER,
    ...API_HEADER_RATE_LIMIT,
  },
  content: {
    'application/problem+json': {
      schema: {
        $ref: getSchemaPath(GlobalErrorDTO),
      },
    },
  },
};

export const API_RESPONSE_DEFAULT_SEMANTIC_SCORE: ApiResponseOptions = {
  status: 'default',
  description: 'Client or server error during semantic score calculation.',
  headers: {
    ...API_HEADER_RETRY_AFTER,
    ...API_HEADER_RATE_LIMIT,
  },
  content: {
    'application/problem+json': {
      schema: {
        $ref: getSchemaPath(GlobalErrorDTO),
      },
    },
  },
};
