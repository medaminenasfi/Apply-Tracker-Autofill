import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, emails, name } = profile;
    const email = emails[0].value;
    
    let user = await this.usersService.findByEmail(email);
    
    if (!user) {
      user = await this.usersService.createGoogleUser({
        googleId: id,
        email,
        firstName: name.givenName,
        lastName: name.familyName,
      });
    }
    
    return user;
  }
}
