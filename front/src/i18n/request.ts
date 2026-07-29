// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // درخواست locale از URL یا کوکی
  let locale = await requestLocale;

  // اگر locale مشخص نبود، از پیش‌فرض استفاده کن
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // پیام‌های ترجمه شده برای این لوکال را بارگذاری می‌کند
    messages: (await import(`../messages/${locale}.ts`)).default,
  };
});