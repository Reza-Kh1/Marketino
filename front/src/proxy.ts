// // proxy.ts (قبلاً middleware.ts)
// import { routing } from '@/i18n/routing';
// import createMiddleware from 'next-intl/middleware';

// const intlMiddleware = createMiddleware(routing);

// export function proxy(request: Request) {  // 👈 اسم تابع عوض شد
//   return intlMiddleware(request);
// }

// export const config = {
//   matcher: ['/((?!api|_next|.*\\..*).*)'],
// };
import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};