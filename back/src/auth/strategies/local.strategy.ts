/**
 * LocalStrategy - استراتژی ورود با نام کاربری/ایمیل و رمز عبور
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'login',
      passwordField: 'password',
    });
  }

  /**
   * اعتبارسنجی کاربر با نام کاربری/ایمیل و رمز عبور
   */
  async validate(login: string, password: string) {
    const user = await this.authService.validateUser(login, password);
    if (!user) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }
    return user;
  }
}
