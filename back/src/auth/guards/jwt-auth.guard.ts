/**
 * JwtAuthGuard - گارد احراز هویت JWT
 * برای محافظت از routeهای نیازمند لاگین
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * بررسی می‌کند که route آیا @Public دارد یا خیر
   * اگر Public بود، بدون احراز هویت اجازه دسترسی می‌دهد
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
