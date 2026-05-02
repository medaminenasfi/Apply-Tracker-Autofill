# Production-Grade Logging System

## Overview

A centralized, structured, and scalable logging system for the NestJS backend that provides:
- Request/response logging with trace IDs
- Error logging with full context
- Performance tracking for slow requests
- Environment-aware formatting (pretty in dev, JSON in production)
- userId tracking throughout all logs

## Components

### 1. LoggerService
**Location**: `src/common/services/logger.service.ts`

**Methods**:
- `logRequest(method, url, userId, ip)` - Logs incoming HTTP requests
- `logResponse(method, url, statusCode, responseTime, userId)` - Logs HTTP responses
- `logError(route, error, statusCode, userId, context)` - Logs errors with full context
- `logWarning(message, context)` - Logs warnings
- `logInfo(message, context)` - Logs info messages
- `logDebug(message, context)` - Logs debug messages (dev only)
- `getTraceId()` - Generates unique trace ID for request tracking

**Features**:
- Automatic trace ID generation using `crypto.randomUUID()`
- Environment-aware formatting (pretty in dev, JSON in production)
- Structured log context support
- Performance tracking (warns on requests >1000ms)

### 2. LoggingMiddleware
**Location**: `src/common/middleware/logging.middleware.ts`

**Features**:
- Generates unique trace ID for each request
- Logs HTTP method, URL, userId, IP address on request
- Logs response status code and response time on response
- Tracks slow requests (>1000ms) as warnings
- Extends Express Request interface with `traceId` and `startTime`

**Log Format (Dev)**:
```
[REQUEST] [a1b2c3d4] GET /applications user=69f... ip=127.0.0.1
[RESPONSE] [a1b2c3d4] 200 /applications 120ms
```

**Log Format (Production)**:
```json
{
  "timestamp": "2026-05-02T17:00:00.000Z",
  "level": "request",
  "message": "GET /applications",
  "traceId": "a1b2c3d4",
  "method": "GET",
  "url": "/applications",
  "userId": "69f...",
  "ip": "127.0.0.1"
}
```

### 3. HttpExceptionFilter
**Location**: `src/common/filters/http-exception.filter.ts`

**Features**:
- Catches all exceptions globally
- Logs error with route, userId, message, status code, traceId
- Never exposes stack trace to client
- Returns safe error message in production
- Includes trace ID in error response for debugging

**Error Response Format**:
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "traceId": "a1b2c3d4",
  "timestamp": "2026-05-02T17:00:00.000Z"
}
```

## Integration

**main.ts**:
```typescript
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply logging middleware
  app.use(new LoggingMiddleware());

  // ... rest of bootstrap
}
```

## Usage Examples

### Using LoggerService in Controllers

```typescript
import { LoggerService } from '../common/services/logger.service';

@Controller('applications')
export class ApplicationsController {
  private logger = new LoggerService();

  @Get()
  async findAll(@GetUser() user) {
    this.logger.logInfo('Fetching all applications', { userId: user._id });
    // ... implementation
  }
}
```

### Manual Error Logging

```typescript
try {
  // ... some operation
} catch (error) {
  this.logger.logError('/applications', error, 500, userId, { additionalContext: 'value' });
  throw error;
}
```

## Environment Configuration

**Development** (`NODE_ENV=development` or not set):
- Pretty, human-readable logs
- Stack traces included in error logs
- Debug logs enabled

**Production** (`NODE_ENV=production`):
- Structured JSON logs
- No stack traces in logs
- Error messages sanitized
- Debug logs disabled

## Performance Tracking

Slow requests (>1000ms) are automatically logged as warnings:
```
[WARNING] [a1b2c3d4] Slow request GET /applications 1450ms
```

## Trace ID Tracking

Every request gets a unique 8-character trace ID (e.g., `a1b2c3d4`) that:
- Links all logs from a single request
- Included in error responses
- Enables easy debugging in production logs

## userId Integration

All logs include userId when available:
- Extracted from `req.user._id` or `req.user.userId`
- Falls back to "anonymous" if user not authenticated
- Always uses normalized string userId (from existing system)

## Monitoring Integration

The structured JSON logs in production are ready for integration with:
- Datadog
- Splunk
- ELK Stack
- CloudWatch
- Any log aggregation service

## Benefits

1. **Debugging**: Every request is traceable via trace ID
2. **Performance**: Slow requests are automatically flagged
3. **Security**: No sensitive info leaked to clients
4. **Production-ready**: Structured JSON logs for monitoring tools
5. **User tracking**: userId included in all logs for user-specific debugging
