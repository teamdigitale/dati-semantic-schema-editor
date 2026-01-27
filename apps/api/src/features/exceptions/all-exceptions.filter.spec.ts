import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockRequest = {
      method: 'GET',
      url: '/api/v1/test',
      protocol: 'http',
      get: vi.fn().mockImplementation((header: string) => {
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
        detail: 'An internal server error occurred. Please try again later.',
      });
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
      // Filter uses exception.message which contains the actual message
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.title).toBe('Unsupported Media Type');
      expect(jsonCall.status).toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
      expect(jsonCall.detail).toBe('Invalid YAML content');
    });

    it('should handle BadRequestException with string message', () => {
      const exception = new BadRequestException('Invalid request parameters');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      // Filter uses exception.message which contains the actual message
      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(jsonCall.title).toBe('Bad Request');
      expect(jsonCall.status).toBe(HttpStatus.BAD_REQUEST);
      expect(jsonCall.detail).toBe('Invalid request parameters');
    });

    it('should handle HttpException with string message', () => {
      // Filter uses exception.message which contains the actual message
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
      expect(jsonCall.detail).toBe('Resource not found');
    });
  });

  describe('handled exceptions with object as error content', () => {
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
      expect(jsonCall.detail).toBe(
        'The request is well-formed but contains semantic errors. Please check the API documentation at http://localhost:3000/openapi.yaml to verify the correct request format.',
      );
    });
  });
});
