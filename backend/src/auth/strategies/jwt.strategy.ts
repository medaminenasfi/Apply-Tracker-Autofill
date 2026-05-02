import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

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
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Also include role from payload if not present in user
    return user;
  }
}
