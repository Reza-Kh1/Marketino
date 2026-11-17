'use client';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, CreditCard, Truck, Package, Star } from 'lucide-react';

const STEPS = [
  { icon: Search, title: '۱. جستجو و انتخاب محصول', desc: 'محصول مورد نظر خود را از طریق جستجو یا دسته‌بندی‌ها پیدا کنید. می‌توانید بر اساس قیمت، برند، رنگ و سایر ویژگی‌ها فیلتر کنید.' },
  { icon: ShoppingCart, title: '۲. افزودن به سبد خرید', desc: 'پس از انتخاب محصول، تعداد مورد نظر را وارد کرده و روی دکمه "افزودن به سبد خرید" کلیک کنید. محصول در سبد خرید شما ذخیره می‌شود.' },
  { icon: CreditCard, title: '۳. تسویه حساب', desc: 'وارد سبد خرید شوید، آدرس تحویل را وارد کنید و یکی از روش‌های پرداخت (آنلاین یا کارت به کارت) را انتخاب نمایید.' },
  { icon: Package, title: '۴. تأیید و بسته‌بندی', desc: 'فروشنده سفارش شما را بررسی، بسته‌بندی و آماده ارسال می‌کند. وضعیت سفارش را می‌توانید در پنل کاربری خود پیگیری کنید.' },
  { icon: Truck, title: '۵. ارسال و تحویل', desc: 'سفارش از طریق پست یا پیک برای شما ارسال می‌شود. کد رهگیری جهت پیگیری در اختیار شما قرار می‌گیرد.' },
  { icon: Star, title: '۶. بررسی و امتیازدهی', desc: 'پس از دریافت کالا، می‌توانید نظر و امتیاز خود را ثبت کنید تا به خریداران دیگر در انتخاب محصول کمک کنید.' },
];

const TIPS = [
  { title: 'قبل از خرید، مشخصات را دقیق بخوانید', desc: 'توضیحات محصول، سایز، رنگ و سایر مشخصات را با دقت بررسی کنید.' },
  { title: 'نظرات خریداران قبلی را بخوانید', desc: 'تجربه دیگران می‌تواند به شما در تصمیم‌گیری بهتر کمک کند.' },
  { title: 'از فروشندگان معتبر خرید کنید', desc: 'فروشندگانی که نشان تأیید شده دارند، قابل اعتمادتر هستند.' },
  { title: 'فاکتور خرید را نگه دارید', desc: 'در صورت نیاز به مرجوعی یا گارانتی، فاکتور خرید ضروری است.' },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen" dir="rtl">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6">راهنمای خرید</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              با مطالعه این راهنما، یک خرید امن و لذت‌بخش را در بازارچه تجربه کنید.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center shrink-0">
                <step.icon className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-black text-lg mb-1">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-center mb-8">نکات مهم</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map((tip, i) => (
              <motion.div key={tip.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-lg">💡</div>
                  <h3 className="font-bold">{tip.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
