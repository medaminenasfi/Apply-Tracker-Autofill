import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/logger.service';

declare global {
  namespace Express {
    interface Request {
      traceId?: string;
      startTime?: number;
    }
  }
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new LoggerService();

  use(req: Request, res: Response, next: NextFunction) {
    // Generate trace ID for this request
    req.traceId = this.logger.getTraceId();
    req.startTime = Date.now();

    // Extract userId from request (set by auth middleware)
    const userId = (req as any).user?._id || (req as any).user?.userId || 'anonymous';
    
    // Extract IP address
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Log request
    this.logger.logRequest(req.method, req.url, userId, ip);

    // Capture response
    const originalSend = res.send;
    res.send = function (data) {
      const responseTime = Date.now() - (req.startTime || Date.now());
      
      // Log response
      (req as any).loggerService?.logResponse(req.method, req.url, res.statusCode, responseTime, userId);
      
      return originalSend.call(this, data);
    };

    // Store logger service on request for use in other middleware
    (req as any).loggerService = this.logger;

    next();
  }
}
