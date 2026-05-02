import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new LoggerService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const error = exception instanceof Error ? exception : new Error(String(exception));

    // Extract userId from request
    const userId = (request as any).user?._id || (request as any).user?.userId || 'anonymous';

    // Extract trace ID
    const traceId = request.traceId || 'unknown';

    // Log error with full context
    this.logger.logError(
      request.url,
      error,
      statusCode,
      userId,
      { traceId, ip: request.ip },
    );

    // Return safe error response to client (never expose stack trace)
    response.status(statusCode).json({
      statusCode,
      message: this.getSafeMessage(message),
      traceId,
      timestamp: new Date().toISOString(),
    });
  }

  private getSafeMessage(message: string): string {
    // In production, sanitize error messages to avoid leaking sensitive info
    if (process.env.NODE_ENV === 'production') {
      const safeMessages = [
        'Internal server error',
        'Bad request',
        'Unauthorized',
        'Forbidden',
        'Not found',
        'Conflict',
        'Unprocessable entity',
        'Too many requests',
      ];
      
      return safeMessages.includes(message) ? message : 'Internal server error';
    }
    
    return message;
  }
}
