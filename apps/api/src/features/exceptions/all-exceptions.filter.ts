import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import { GlobalErrorDTO } from './dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Builds the OpenAPI spec URL from the request
   */
  private getOpenApiSpecUrl(request: Request): string {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return `${baseUrl}/openapi.yaml`;
  }

  /**
   * Generates user-friendly error details based on HTTP status code
   */
  private getErrorDetail(status: HttpStatus, request: Request): string {
    const openApiSpecUrl = this.getOpenApiSpecUrl(request);

    switch (status) {
      case HttpStatus.NOT_FOUND:
        return `The requested resource was not found. Please check the API documentation at ${openApiSpecUrl} to verify the correct endpoint and parameters.`;
      case HttpStatus.BAD_REQUEST:
        return `The request is invalid. Please check the API documentation at ${openApiSpecUrl} to verify the correct request format and parameters.`;
      case HttpStatus.UNAUTHORIZED:
        return `Authentication is required. Please check the API documentation at ${openApiSpecUrl} for authentication requirements.`;
      case HttpStatus.FORBIDDEN:
        return `You do not have permission to access this resource. Please check the API documentation at ${openApiSpecUrl} for access requirements.`;
      case HttpStatus.METHOD_NOT_ALLOWED:
        return `The HTTP method is not allowed for this endpoint. Please check the API documentation at ${openApiSpecUrl} to verify the correct HTTP method.`;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return `The request is well-formed but contains semantic errors. Please check the API documentation at ${openApiSpecUrl} to verify the correct request format.`;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'An internal server error occurred. Please try again later.';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return `An unknown error occurred. Please check the API documentation at ${openApiSpecUrl} and/or try again later.`;
    }
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // If internal exceptions are detected, always use status-based message to avoid leaking internal details
    // Otherwise, use the provided message
    const detail: string =
      exception instanceof HttpException && typeof errorMessage === 'string'
        ? errorMessage
        : this.getErrorDetail(status, request);

    // Generate RFC 7231 type URI for the status code
    const statusCategory = Math.floor(status / 100);
    const typeUri = `https://tools.ietf.org/html/rfc7231#section-6.${statusCategory}.${status % 100}`;

    const errorResponse: GlobalErrorDTO = {
      title: HttpStatusCodes.getStatusText(status),
      status,
      type: typeUri,
      detail,
      instance: request.url,
    };

    // Set Content-Type header for Problem.JSON (RFC 7807)
    response.setHeader('Content-Type', 'application/problem+json');

    // Add Link header with service-desc relation (RFC 8631 section 4.2)
    const openApiSpecUrl = this.getOpenApiSpecUrl(request);
    response.setHeader('Link', `<${openApiSpecUrl}>; rel="service-desc"`);

    // Log the full error details (including internal info) for debugging
    this.logger.error(`${request.method} ${request.url}`);
    this.logger.error(exception);

    response.status(status).json(errorResponse);
  }
}
