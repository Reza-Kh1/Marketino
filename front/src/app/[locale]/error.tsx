'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-black mb-3">خطایی رخ داد</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          متأسفانه در بارگذاری این صفحه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید یا به صفحه اصلی بازگردید.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted font-bold text-sm hover:bg-muted/80 transition-colors"
          >
            <Home className="w-4 h-4" />
            صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
