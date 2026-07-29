/**
 * @Roles() - دکوریتور برای محدود کردن دسترسی به نقش‌های خاص
 * مثال: @Roles('admin', 'seller')
 */
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../auth/guards/roles.guard';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
