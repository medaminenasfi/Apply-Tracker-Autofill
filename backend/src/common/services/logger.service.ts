import { Injectable, Scope } from '@nestjs/common';

export interface LogContext {
  userId?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  traceId?: string;
  [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const traceId = context?.traceId || this.generateTraceId();
    
    if (this.isProduction) {
      // Structured JSON for production
      return JSON.stringify({
        timestamp,
        level,
        message,
        traceId,
        ...context,
      });
    } else {
      // Pretty logs for development
      const contextStr = context 
        ? ` ${Object.entries(context)
            .filter(([key]) => key !== 'traceId')
            .map(([key, value]) => `${key}=${value}`)
            .join(' ')}`
        : '';
      return `[${level.toUpperCase()}] [${traceId}] ${message}${contextStr}`;
    }
  }

  private generateTraceId(): string {
    return crypto.randomUUID().substring(0, 8);
  }

  logRequest(method: string, url: string, userId?: string, ip?: string): void {
    const context: LogContext = {
      method,
      url,
      userId: userId || 'anonymous',
      ip,
    };
    console.log(this.formatMessage('request', `${method} ${url}`, context));
  }

  logResponse(method: string, url: string, statusCode: number, responseTime: number, userId?: string): void {
    const context: LogContext = {
      method,
      url,
      statusCode,
      responseTime,
      userId: userId || 'anonymous',
    };

    if (responseTime > 1000) {
      console.warn(this.formatMessage('warning', `Slow request ${method} ${url} ${responseTime}ms`, context));
    } else {
      console.log(this.formatMessage('response', `${statusCode} ${url} ${responseTime}ms`, context));
    }
  }

  logError(route: string, error: Error, statusCode: number, userId?: string, additionalContext?: LogContext): void {
    const context: LogContext = {
      route,
      userId: userId || 'anonymous',
      message: error.message,
      statusCode,
      ...additionalContext,
    };

    console.error(this.formatMessage('error', `${route} ${error.message}`, context));
    
    // Only log stack trace in development
    if (!this.isProduction && error.stack) {
      console.error(error.stack);
    }
  }

  logWarning(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warning', message, context));
  }

  logInfo(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  logDebug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  getTraceId(): string {
    return this.generateTraceId();
  }
}
