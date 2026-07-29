import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { ArrowLeft } from "lucide-react";
import { getLocale, getTranslations } from 'next-intl/server';

export default async function LoginPage() {
  const t = await getTranslations('auth');  
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{t('login_title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">{t('login_subtitle')}</p>
        </div>
        <LoginForm />
      </div>
    </Suspense>
  );
}
