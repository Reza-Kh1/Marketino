/**
 * @CurrentUser() - دکوریتور برای دریافت کاربر فعلی از request
 * مثال: @CurrentUser() user یا @CurrentUser('id') userId
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
