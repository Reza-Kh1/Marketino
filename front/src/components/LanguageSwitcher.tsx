'use client';
import { useSearchParams } from 'next/navigation';
import { Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const pathname = usePathname(); // 👈 بدون locale، مثلاً همیشه "/cart"
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale(); // 👈 به‌جای split کردن pathname
  const nextLocale = locale === 'fa' ? 'en' : 'fa';

  function handleSwitch() {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: nextLocale }); // 👈 فقط همینو کافیه next-intl خودش locale رو می‌ذاره
  }

  return (
    <button
      onClick={handleSwitch}
      className="p-2 rounded-xl hover:bg-accent transition-colors flex items-center gap-1.5 text-sm font-medium"
      aria-label="Switch Language"
      title={locale === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
    >
      <Languages className="w-5 h-5" />
      <span className="hidden sm:inline text-xs font-bold">
        {locale === 'fa' ? 'EN' : 'FA'}
      </span>
    </button>
  );
}