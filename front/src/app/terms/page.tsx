'use client';
import { motion } from 'framer-motion';
import { ScrollText, Shield, UserCheck, Ban, Scale, Copyright } from 'lucide-react';

const SECTIONS = [
  {
    icon: UserCheck,
    title: '۱. شرایط عضویت',
    text: 'ثبت‌نام در بازارچه به منزله پذیرش قوانین و مقررات سایت است. کاربران باید اطلاعات صحیح و دقیق وارد کنند. استفاده از اطلاعات جعلی تخلف محسوب می‌شود. هر شخص حقیقی یا حقوقی می‌تواند یک حساب کاربری داشته باشد.',
  },
  {
    icon: Shield,
    title: '۲. حریم خصوصی',
    text: 'بازارچه متعهد است از اطلاعات شخصی کاربران محافظت کند. اطلاعات شما نزد ما محفوظ بوده و به هیچ شخص ثالثی واگذار نخواهد شد، مگر به حکم قانون. برای اطلاعات بیشتر، بخش حریم خصوصی را مطالعه کنید.',
  },
  {
    icon: Scale,
    title: '۳. قوانین فروشندگان',
    text: 'فروشندگان موظف به ارائه اطلاعات دقیق محصول، قیمت واقعی و موجودی صحیح هستند. هرگونه گران‌فروشی، احتکار یا فروش کالای تقلبی تخلف محسوب شده و منجر به تعلیق یا مسدودیت حساب فروشنده خواهد شد.',
  },
  {
    icon: Ban,
    title: '۴. کالاهای ممنوعه',
    text: 'فروش کالاهای غیرمجاز، قاچاق، مشروبات الکلی، مواد مخدر، سلاح، محصولات غیربهداشتی و هر کالایی که خلاف قوانین جمهوری اسلامی ایران باشد، در بازارچه ممنوع است و پیگرد قانونی دارد.',
  },
  {
    icon: Copyright,
    title: '۵. حقوق مالکیت معنوی',
    text: 'تمامی محتوا، تصاویر، لوگو و برند بازارچه تحت حمایت قوانین مالکیت معنوی است. کپی‌برداری، بازنشر یا استفاده تجاری از محتوای سایت بدون اجازه کتبی ممنوع می‌باشد.',
  },
  {
    icon: ScrollText,
    title: '۶. تغییرات قوانین',
    text: 'بازارچه حق دارد در هر زمان قوانین و مقررات را بروزرسانی کند. تغییرات از طریق سایت و ایمیل به اطلاع کاربران می‌رسد. ادامه استفاده از سایت به منزله پذیرش قوانین جدید است.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-red-500/5 to-orange-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ScrollText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6">قوانین و مقررات</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              لطفاً قبل از استفاده از خدمات بازارچه، قوانین و مقررات زیر را با دقت مطالعه فرمایید.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="space-y-6">
          {SECTIONS.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                  <s.icon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="font-black text-lg">{s.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-8 bg-card border border-border rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            آخرین بروزرسانی: فروردین ۱۴۰۴ | در صورت داشتن سوال با <span className="text-primary font-bold">support@bazarche.ir</span> تماس بگیرید.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
