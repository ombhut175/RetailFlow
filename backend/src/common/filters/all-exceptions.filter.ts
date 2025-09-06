import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MESSAGES } from '../constants/string-const';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = MESSAGES.UNEXPECTED_ERROR;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      // Handle specific error types
      if (exception.message.includes('timeout') || exception.message.includes('TIMEOUT')) {
        status = HttpStatus.REQUEST_TIMEOUT;
        message = 'Request timeout - please try again';
      } else if (exception.message.includes('connection') || exception.message.includes('ECONNREFUSED')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Service temporarily unavailable';
      } else if (exception.message.includes('ENOTFOUND') || exception.message.includes('DNS')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'External service unavailable';
      } else {
        // Log the full error for debugging but don't expose it to client
        this.logger.error(
          `Unhandled error: ${exception.message}`,
          exception.stack,
        );
        message = MESSAGES.UNEXPECTED_ERROR;
      }
    } else {
      // Handle non-Error exceptions
      this.logger.error(
        `Unknown exception type: ${typeof exception}`,
        exception,
      );
    }

    // Log the error with request context
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Ensure response hasn't been sent already
    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}