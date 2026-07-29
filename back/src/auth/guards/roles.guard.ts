/**
 * RolesGuard - گارد نقش‌های کاربری
 * بررسی می‌کند کاربر نقش مورد نیاز را دارد
 * مثال: @Roles('admin') یا @Roles('seller', 'admin')
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * بررسی می‌کند کاربر حداقل یکی از نقش‌های مورد نیاز را دارد
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
