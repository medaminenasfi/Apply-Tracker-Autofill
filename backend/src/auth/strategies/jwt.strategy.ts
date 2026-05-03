import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { normalizeUserId } from '../../common/utils/userId.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => {
          const appRole = request.headers['x-app-role'];
          this.logger.log(`[AUTH DEBUG] === REQUEST ANALYSIS ===`);
          this.logger.log(`[AUTH DEBUG] Route: ${request.url}`);
          this.logger.log(`[AUTH DEBUG] Method: ${request.method}`);
          this.logger.log(`[AUTH DEBUG] x-app-role header: ${appRole}`);
          this.logger.log(`[AUTH DEBUG] Cookie header: ${request.headers.cookie || 'NONE'}`);
          
          if (!appRole) {
            this.logger.error('[AUTH DEBUG] ❌ Missing x-app-role header - REJECTING');
            return null;
          }
          
          if (appRole !== 'user' && appRole !== 'admin') {
            this.logger.error(`[AUTH DEBUG] ❌ Invalid x-app-role: ${appRole} - REJECTING`);
            return null;
          }
          
          let token = null;
          if (request && request.headers && request.headers.cookie) {
            const cookies = request.headers.cookie.split(';').reduce((acc: any, cookie: string) => {
              const [key, value] = cookie.split('=').map((c: string) => c.trim());
              acc[key] = value;
              return acc;
            }, {});
            
            this.logger.log(`[AUTH DEBUG] Parsed cookies: ${JSON.stringify(Object.keys(cookies))}`);
            this.logger.log(`[AUTH DEBUG] user_token present: ${!!cookies['user_token']}`);
            this.logger.log(`[AUTH DEBUG] admin_token present: ${!!cookies['admin_token']}`);
            
            // STRICT: Only use x-app-role header - NO URL fallback
            const cookieName = appRole === 'admin' ? 'admin_token' : 'user_token';
            token = cookies[cookieName];
            
            this.logger.log(`[AUTH DEBUG] Looking for cookie: ${cookieName}`);
            this.logger.log(`[AUTH DEBUG] Token found: ${token ? 'YES' : 'NO'}`);
            if (token) {
              this.logger.log(`[AUTH DEBUG] Token length: ${token.length} chars`);
              this.logger.log(`[AUTH DEBUG] Token preview: ${token.substring(0, 20)}...`);
            }
          } else {
            this.logger.log('[AUTH DEBUG] ❌ No cookies in request');
          }
          
          this.logger.log(`[AUTH DEBUG] === END ANALYSIS ===`);
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    this.logger.log(`[AUTH FLOW] Validating payload: sub=${payload.sub}, role=${payload.role}`);
    const userIdString = normalizeUserId(payload.sub);
    const user = await this.usersService.findById(userIdString);
    if (!user) {
      this.logger.error(`[AUTH FLOW] User not found for userId: ${userIdString}`);
      throw new UnauthorizedException();
    }
    this.logger.log(`[AUTH FLOW] User authenticated: ${user.email}, role=${user.role}`);
    // Ensure _id is always a string in the returned user object
    if (user._id && typeof user._id !== 'string') {
      user._id = String(user._id) as any;
    }
    return user;
  }
}
