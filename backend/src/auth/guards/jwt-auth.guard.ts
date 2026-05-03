import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    this.logger.log(`[JWT GUARD] Request: ${request.method} ${request.url}`);
    this.logger.log(`[JWT GUARD] User: ${user?._id || 'anonymous'}, Role: ${user?.role || 'none'}`);
    
    if (err || !user) {
      this.logger.error(`[JWT GUARD] Unauthorized - Error: ${err?.message || 'No user'}`);
      throw new UnauthorizedException('Authentication required');
    }
    
    return user;
  }
}
