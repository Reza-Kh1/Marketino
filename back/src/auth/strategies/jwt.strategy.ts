/**
 * JwtStrategy - استراتژی احراز هویت JWT
 * توکن را از Cookie یا Header Authorization استخراج می‌کند
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // اولویت اول: cookie به نام token
        (req: Request) => {
          if (req.cookies && req.cookies.token) {
            return req.cookies.token;
          }
          return null;
        },
        // اولویت دوم: Header Authorization
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-key',
    });
  }

  /**
   * اعتبارسنجی کاربر پس از استخراج توکن
   * بررسی می‌کند کاربر وجود دارد و فعال است
   */
  async validate(payload: { sub: string; username: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری غیرفعال است');
    }

    // برگرداندن اطلاعات کاربر بدون password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
