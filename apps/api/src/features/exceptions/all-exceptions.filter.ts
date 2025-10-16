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

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      title: HttpStatusCodes.getStatusText(status),
      type: `https://httpstatuses.com/${status}`,
      status,
      detail:
        typeof errorMessage === 'string'
          ? errorMessage
          : (errorMessage['message'] as string) || '',
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.url,
    } satisfies GlobalErrorDTO;

    this.logger.error(`${request.method} ${request.url}`);
    this.logger.error(exception);

    response.status(status).json(errorResponse);
  }
}
