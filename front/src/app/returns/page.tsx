'use client';
import { motion } from 'framer-motion';
import { RotateCcw, Clock, CheckCircle, Shield, AlertTriangle } from 'lucide-react';

const CONDITIONS = [
  { icon: Clock, title: 'مهلت ۷ روزه', desc: 'شما تا ۷ روز پس از دریافت کالا فرصت دارید درخواست مرجوعی ثبت کنید.' },
  { icon: CheckCircle, title: 'کالا سالم و بازنشده', desc: 'کالا باید در بسته‌بندی اصلی و بدون آسیب فیزیکی باشد. برچسب‌ها و پلمپ‌ها نباید مخدوش شده باشند.' },
  { icon: Shield, title: 'دلیل موجه', desc: 'انصراف از خرید، کالای معیوب، مغایرت با توضیحات یا ارسال اشتباه از دلایل قابل قبول هستند.' },
  { icon: AlertTriangle, title: 'موارد استثنا', desc: 'مواد غذایی، محصولات بهداشتی، نرم‌افزارها و کالاهای سفارشی‌سازی شده مشمول مرجوعی نمی‌شوند.' },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-purple-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <RotateCcw className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6">رویه بازگشت کالا</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              ما به کیفیت محصولات و رضایت شما متعهد هستیم. در صورت نیاز، کالا را طبق شرایط زیر مرجوع کنید.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {CONDITIONS.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <c.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-black text-lg">{c.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Steps */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-black mb-6">مراحل مرجوع کردن کالا</h2>
          <div className="space-y-4">
            {[
              { step: '۱', title: 'ثبت درخواست', desc: 'وارد پنل کاربری خود شوید، به بخش سفارشات بروید و روی گزینه "درخواست مرجوعی" کلیک کنید.' },
              { step: '۲', title: 'انتخاب دلیل', desc: 'دلیل مرجوعی را انتخاب کرده و در صورت نیاز توضیحات و عکس ارسال کنید.' },
              { step: '۳', title: 'بررسی توسط تیم پشتیبانی', desc: 'تیم پشتیبانی درخواست شما را بررسی کرده و در صورت تأیید، هماهنگی‌های لازم را انجام می‌دهد.' },
              { step: '۴', title: 'بازگشت کالا و تسویه', desc: 'پس از دریافت کالا توسط فروشنده، مبلغ پرداختی به کیف پول یا حساب بانکی شما بازگردانده می‌شود.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 font-black text-primary">{s.step}</div>
                <div>
                  <h4 className="font-bold">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Refund Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-800 dark:text-amber-400">نکته مهم</h3>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed">
            بازگشت وجه بسته به روش پرداخت اولیه شما انجام می‌شود. پرداخت‌های آنلاین به حساب بانکی و
            پرداخت‌های کیف پول به کیف پول بازارچه بازگردانده می‌شوند. زمان تسویه معمولاً ۲۴ تا ۷۲ ساعت کاری است.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
