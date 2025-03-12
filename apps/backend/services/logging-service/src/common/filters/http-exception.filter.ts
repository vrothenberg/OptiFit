import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const errorMessage = 
      typeof errorResponse === 'object' && 'message' in errorResponse
        ? errorResponse['message']
        : exception.message;

    const errorName = exception.name;
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // Log the error
    this.logger.error(
      `${method} ${path} ${status} - ${JSON.stringify(errorMessage)}`,
      exception.stack,
    );

    // Return a consistent error response
    response.status(status).json({
      statusCode: status,
      error: errorName,
      message: errorMessage,
      timestamp,
      path,
    });
  }
}
