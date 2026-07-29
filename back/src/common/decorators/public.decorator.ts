/**
 * @Public() - دکوریتور برای routeهای عمومی (بدون نیاز به احراز هویت)
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
