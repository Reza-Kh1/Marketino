import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import RegisterFormSeller from "./RegisterFormSeller";


export default function SellerRegisterPage() {
  const t = useTranslations('auth')
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black">{t('register_seller_title')}</h1>
        <p className="text-muted-foreground mt-2">{t('register_seller_title')}</p>
      </div>
      <RegisterFormSeller />
    </div>
  );
}
