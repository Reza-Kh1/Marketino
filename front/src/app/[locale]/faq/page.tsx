'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';

const FAQ_DATA = [
  {
    q: 'چگونه در بازارچه ثبت‌نام کنم؟',
    a: 'برای ثبت‌نام، روی دکمه "ورود / ثبت‌نام" در بالای صفحه کلیک کنید. می‌توانید به عنوان خریدار یا فروشنده ثبت‌نام کنید. ثبت‌نام خریدار کاملاً رایگان است و کمتر از ۲ دقیقه طول می‌کشد.',
    cat: 'ثبت‌نام',
  },
  {
    q: 'چگونه فروشنده شوم؟',
    a: 'برای فروشنده شدن، در صفحه ثبت‌نام گزینه "ثبت‌نام فروشنده" را انتخاب کنید. پس از تکمیل اطلاعات شخصی و فروشگاه، درخواست شما توسط تیم ما بررسی و تأیید خواهد شد.',
    cat: 'فروشندگی',
  },
  {
    q: 'هزینه فروش در بازارچه چقدر است؟',
    a: 'ثبت‌نام و ایجاد فروشگاه در بازارچه رایگان است. ما فقط درصد کمی از هر فروش موفق را به عنوان کمیسیون دریافت می‌کنیم که بسته به دسته‌بندی محصول متفاوت است.',
    cat: 'فروشندگی',
  },
  {
    q: 'روش‌های پرداخت چیست؟',
    a: 'می‌توانید از طریق کلیه کارت‌های بانکی عضو شتاب، کیف پول بازارچه و یا پرداخت در محل (برای شهر تهران) خرید خود را تسویه کنید.',
    cat: 'پرداخت',
  },
  {
    q: 'مدت زمان ارسال چقدر است؟',
    a: 'زمان ارسال بستگی به فروشنده و محل سکونت شما دارد. معمولاً سفارشات تهران ۱-۲ روز کاری و شهرستان‌ها ۳-۵ روز کاری تحویل داده می‌شوند. زمان دقیق در صفحه هر محصول درج شده است.',
    cat: 'ارسال',
  },
  {
    q: 'چگونه سفارش خود را پیگیری کنم؟',
    a: 'پس از ثبت سفارش، یک کد رهگیری به شما داده می‌شود. می‌توانید از طریق صفحه "پیگیری سفارش" در سایت، وضعیت سفارش خود را لحظه‌ای مشاهده کنید.',
    cat: 'سفارشات',
  },
  {
    q: 'آیا می‌توانم سفارش را مرجوع کنم؟',
    a: 'بله، طبق قوانین بازارچه شما تا ۷ روز پس از دریافت کالا فرصت دارید در صورت وجود مشکل یا انصراف از خرید، کالا را مرجوع کنید. برای اطلاعات بیشتر صفحه "رویه بازگشت کالا" را مطالعه کنید.',
    cat: 'سفارشات',
  },
  {
    q: 'چگونه از فروشنده شکایت کنم؟',
    a: 'می‌توانید از طریق بخش "گزارش تخلف" در فوتر سایت یا پنل کاربری خود، شکایت خود را ثبت کنید. تیم پشتیبانی ما در اسرع وقت به موضوع رسیدگی خواهد کرد.',
    cat: 'پشتیبانی',
  },
  {
    q: 'آیا اطلاعات من امن است؟',
    a: 'بله، امنیت اطلاعات شما اولویت اول ماست. تمام ارتباطات با پروتکل SSL رمزنگاری می‌شوند و اطلاعات کارت بانکی شما در هیچ جایی ذخیره نمی‌شود.',
    cat: 'امنیت',
  },
  {
    q: 'ساعت کاری پشتیبانی چیست؟',
    a: 'تیم پشتیبانی بازارچه همه روزه (شنبه تا پنجشنبه) از ساعت ۹ صبح تا ۹ شب آماده پاسخگویی به شماست. همچنین می‌توانید از طریق چت آنلاین سایت با ما در ارتباط باشید.',
    cat: 'پشتیبانی',
  },
];

const CATEGORIES = ['همه', ...Array.from(new Set(FAQ_DATA.map(f => f.cat)))];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('همه');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = FAQ_DATA.filter(f => {
    const matchSearch = !search || f.q.includes(search) || f.a.includes(search);
    const matchCat = activeCat === 'همه' || f.cat === activeCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6">سوالات متداول</h1>
            <p className="text-lg text-muted-foreground mb-8">پاسخ سوالات پرتکرار شما در این صفحه جمع‌آوری شده است</p>
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pr-12 pl-4 rounded-2xl border border-border bg-card shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="جستجو در سوالات..." />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCat === cat ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-border hover:bg-accent'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-accent/50 transition-colors">
                <span className="font-bold pr-2">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">سوالی با این مشخصات یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
