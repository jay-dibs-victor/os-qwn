import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    // Log configuration status
    if (!clientID || !clientSecret || !callbackURL) {
      console.warn(
        'Google OAuth credentials not fully configured. ' +
        `clientID: ${clientID ? 'set' : 'missing'}, ` +
        `clientSecret: ${clientSecret ? 'set' : 'missing'}, ` +
        `callbackURL: ${callbackURL ? 'set' : 'missing'}`
      );
    }

    super({
      clientID: clientID || 'placeholder-client-id',
      clientSecret: clientSecret || 'placeholder-client-secret',
      callbackURL: callbackURL || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      const user = {
        email: emails?.[0]?.value || '',
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        picture: photos?.[0]?.value || '',
        accessToken,
        refreshToken,
        googleId: profile.id,
      };
      done(null, user);
    } catch (error) {
      console.error('Error validating Google profile:', error);
      done(error);
    }
  }
}
