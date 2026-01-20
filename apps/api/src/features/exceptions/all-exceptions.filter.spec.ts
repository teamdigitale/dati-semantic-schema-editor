import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  UnsupportedMediaTypeException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockRequest = {
      method: 'GET',
      url: '/api/v1/test',
      protocol: 'http',
      get: vi.fn((header: string) => {
        if (header === 'host') {
          return 'localhost:3000';
        }
        return undefined;
      }),
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    };

    loggerErrorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('unhandled exceptions', () => {
    it('should handle unhandled exceptions and return 500 with generic message', () => {
      const unhandledException = new Error('Something went wrong');

      filter.catch(unhandledException, mockArgumentsHost as ArgumentsHost);

      expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/problem+json',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Link',
        '<http://localhost:3000/openapi.yaml>; rel="service-desc"',
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        title: 'Internal Server Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.0',
        detail: 'An internal server error occurred. Please try again later.',
        instance: '/api/v1/test',
      });
      expect(loggerErrorSpy).toHaveBeenCalledWith('GET /api/v1/test');
      expect(loggerErrorSpy).toHaveBeenCalledWith(unhandledException);
    });

    it('should handle non-Error exceptions', () => {
      const unhandledException = 'String error';

      filter.catch(unhandledException, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: 'An internal server error occurred. Please try again later.',
        }),
      );
    });
  });

  describe('handled exceptions with string message', () => {
    it('should handle UnsupportedMediaTypeException with string message', () => {
      const exception = new UnsupportedMediaTypeException(
        'Invalid YAML content',
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/problem+json',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Link',
        '<http://localhost:3000/openapi.yaml>; rel="service-desc"',
      );
      // UnsupportedMediaTypeException returns an object, so filter uses status-based message
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.title).toBe('Unsupported Media Type');
      expect(jsonCall.status).toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
      expect(jsonCall.type).toBe(
        'https://tools.ietf.org/html/rfc7231#section-6.4.15',
      );
      expect(jsonCall.detail).toContain('An unknown error occurred');
      expect(jsonCall.instance).toBe('/api/v1/test');
      expect(loggerErrorSpy).toHaveBeenCalledWith('GET /api/v1/test');
      expect(loggerErrorSpy).toHaveBeenCalledWith(exception);
    });

    it('should handle BadRequestException with string message', () => {
      const exception = new BadRequestException('Invalid request parameters');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      // BadRequestException returns an object, so filter uses status-based message
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.title).toBe('Bad Request');
      expect(jsonCall.status).toBe(HttpStatus.BAD_REQUEST);
      expect(jsonCall.type).toBe(
        'https://tools.ietf.org/html/rfc7231#section-6.4.0',
      );
      expect(jsonCall.detail).toContain(
        'The request is invalid. Please check the API documentation',
      );
      expect(jsonCall.instance).toBe('/api/v1/test');
    });

    it('should handle HttpException with string message', () => {
      // HttpException with string returns the string directly
      const exception = new HttpException(
        'Resource not found',
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.title).toBe('Not Found');
      expect(jsonCall.status).toBe(HttpStatus.NOT_FOUND);
      expect(jsonCall.type).toBe(
        'https://tools.ietf.org/html/rfc7231#section-6.4.4',
      );
      expect(jsonCall.detail).toBe('Resource not found');
      expect(jsonCall.instance).toBe('/api/v1/test');
    });
  });

  describe('handled exceptions with object as error content', () => {
    it('should handle HttpException with object response and use status-based message', () => {
      const exception = new HttpException(
        {
          message: 'Validation failed',
          errors: ['field1 is required', 'field2 must be a number'],
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.title).toBe('Bad Request');
      expect(jsonCall.status).toBe(HttpStatus.BAD_REQUEST);
      expect(jsonCall.type).toBe(
        'https://tools.ietf.org/html/rfc7231#section-6.4.0',
      );
      expect(jsonCall.detail).toContain(
        'The request is invalid. Please check the API documentation',
      );
      expect(jsonCall.detail).toContain('http://localhost:3000/openapi.yaml');
      expect(jsonCall.instance).toBe('/api/v1/test');
    });

    it('should handle HttpException with complex object response', () => {
      const exception = new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: ['field1 must be a string', 'field2 must be an integer'],
          error: 'Unprocessable Entity',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.title).toBe('Unprocessable Entity');
      expect(jsonCall.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(jsonCall.type).toBe(
        'https://tools.ietf.org/html/rfc7231#section-6.4.22',
      );
      expect(jsonCall.detail).toContain(
        'The request is well-formed but contains semantic errors',
      );
      expect(jsonCall.instance).toBe('/api/v1/test');
    });

    it('should handle HttpException with array response', () => {
      const exception = new HttpException(
        ['Error 1', 'Error 2', 'Error 3'],
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.detail).toContain(
        'The request is invalid. Please check the API documentation',
      );
    });
  });

  describe('Link header with service-desc relation', () => {
    it('should include service-desc Link header for all exceptions', () => {
      const exception = new Error('Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Link',
        '<http://localhost:3000/openapi.yaml>; rel="service-desc"',
      );
    });

    it('should build correct OpenAPI spec URL with https protocol', () => {
      mockRequest.protocol = 'https';
      mockRequest.get = vi.fn((header: string) => {
        if (header === 'host') {
          return 'api.example.com';
        }
        return undefined;
      });

      const exception = new Error('Test error');
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Link',
        '<https://api.example.com/openapi.yaml>; rel="service-desc"',
      );
    });
  });

  describe('Content-Type header', () => {
    it('should set Content-Type to application/problem+json for all exceptions', () => {
      const exception = new Error('Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/problem+json',
      );
    });
  });

  describe('error response structure', () => {
    it('should include all required Problem.JSON fields', () => {
      const exception = new BadRequestException('Test message');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall).toHaveProperty('title');
      expect(jsonCall).toHaveProperty('status');
      expect(jsonCall).toHaveProperty('type');
      expect(jsonCall).toHaveProperty('detail');
      expect(jsonCall).toHaveProperty('instance');
    });

    it('should generate correct RFC 7231 type URI for different status codes', () => {
      const testCases = [
        { status: HttpStatus.NOT_FOUND, expectedType: 'section-6.4.4' },
        { status: HttpStatus.BAD_REQUEST, expectedType: 'section-6.4.0' },
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          expectedType: 'section-6.5.0',
        },
        { status: HttpStatus.UNAUTHORIZED, expectedType: 'section-6.4.1' },
      ];

      testCases.forEach(({ status, expectedType }) => {
        // Reset mocks for each test case
        (mockResponse.json as ReturnType<typeof vi.fn>).mockClear();
        (mockResponse.status as ReturnType<typeof vi.fn>).mockClear();

        const exception = new HttpException('Test', status);
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);

        const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
          .calls[0][0];
        expect(jsonCall.type).toContain(expectedType);
      });
    });
  });
});
