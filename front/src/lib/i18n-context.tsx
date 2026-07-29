'use client';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import fa from '@/messages/fa';
import en from '@/messages/en';

type Messages = typeof fa;
type Locale = 'fa' | 'en';

const messagesMap: Record<Locale, Messages> = { fa, en };

interface I18nContextType {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'fa';
  const stored = localStorage.getItem('locale') as Locale | null;
  if (stored === 'fa' || stored === 'en') return stored;
  const browserLang = navigator.language?.split('-')[0];
  if (browserLang === 'en') return 'en';
  return 'fa';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fa');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setIsMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'fa' ? 'rtl' : 'ltr';
  }, []);

  // Sync HTML dir attribute
  // useEffect(() => {
  //   document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  //   document.documentElement.lang = locale;
  // }, [locale]);

  // Prevent flash of wrong locale during SSR
  if (!isMounted) {
    return (
      <I18nContext.Provider value={{ locale: 'fa', t: fa, setLocale, isRTL: true }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, t: messagesMap[locale], setLocale, isRTL: locale === 'fa' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
