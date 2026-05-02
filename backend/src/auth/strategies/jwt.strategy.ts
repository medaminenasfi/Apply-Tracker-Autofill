import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { normalizeUserId } from '../../common/utils/userId.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => {
          let token = null;
          if (request && request.headers && request.headers.cookie) {
            const cookies = request.headers.cookie.split(';').reduce((acc: any, cookie: string) => {
              const [key, value] = cookie.split('=').map((c: string) => c.trim());
              acc[key] = value;
              return acc;
            }, {});
            
            // Strictly separate tokens using x-app-role header or url fallback
            const appRole = request.headers['x-app-role'];
            if (appRole === 'admin' || request.url?.includes('/admin')) {
              token = cookies['admin_token'];
            } else {
              token = cookies['user_token'];
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    const userIdString = normalizeUserId(payload.sub);
    const user = await this.usersService.findById(userIdString);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Ensure _id is always a string in the returned user object
    if (user._id && typeof user._id !== 'string') {
      user._id = String(user._id) as any;
    }
    // Also include role from payload if not present in user
    return user;
  }
}
