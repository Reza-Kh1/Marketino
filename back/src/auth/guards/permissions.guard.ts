/**
 * PermissionsGuard - گارد دسترسی‌های ادمین
 * بررسی می‌کند کاربر دسترسی مورد نیاز را دارد
 * اگر کاربر isSuperAdmin باشد، خودکار همه دسترسی‌ها را دارد
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../../common/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true; // No specific permission required
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('دسترسی غیرمجاز');
    }

    // Super admin has all permissions
    if (user.isSuperAdmin) {
      return true;
    }

    // Check if user has the required permission
    if (!user.permissions) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }

    let permissions: string[] = [];
    try {
      permissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions;
    } catch {
      throw new ForbiddenException('خطا در خواندن دسترسی‌ها');
    }

    if (!permissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        `شما دسترسی "${requiredPermission}" را ندارید. لطفاً با مدیر سیستم تماس بگیرید.`,
      );
    }

    return true;
  }
}
