/**
 * GoogleStrategy - استراتژی ورود با Google OAuth 2.0
 * اگر کاربر قبلاً ثبت‌نام کرده باشد، وارد می‌شود
 * در غیر این صورت یک حساب جدید ایجاد می‌کند
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  /**
   * پردازش callback گوگل - ایجاد یا بازیابی کاربر
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, name, emails, photos } = profile;

    const userData = {
      googleId: id,
      email: emails[0].value,
      firstName: name?.givenName || displayName.split(' ')[0],
      lastName: name?.familyName || displayName.split(' ').slice(1).join(' '),
      avatar: photos[0]?.value,
    };

    const user = await this.authService.validateGoogleUser(userData);
    done(null, user);
  }
}
