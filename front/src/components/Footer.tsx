'use client';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ChevronLeft, Instagram, Twitter, Linkedin, Shield, Truck, RefreshCw, Headphones } from 'lucide-react';

const FOOTER_SECTIONS = [
  {
    title: 'خدمات مشتریان',
    links: [
      { label: 'سوالات متداول', href: '/faq' },
      { label: 'راهنمای خرید', href: '/guide' },
      { label: 'رویه بازگشت کالا', href: '/returns' },
      { label: 'گزارش تخلف', href: '/report' },
    ],
  },
  {
    title: 'بازارچه',
    links: [
      { label: 'درباره ما', href: '/about' },
      { label: 'تماس با ما', href: '/contact' },
      { label: 'قوانین و مقررات', href: '/terms' },
      { label: 'وبلاگ', href: '/blog' },
    ],
  },
  {
    title: 'محصولات',
    links: [
      { label: 'کالای دیجیتال', href: '/products?category=electronics' },
      { label: 'پوشاک و مد', href: '/products?category=clothing' },
      { label: 'خانه و آشپزخانه', href: '/products?category=home' },
      { label: 'همه محصولات', href: '/products' },
    ],
  },
];

const TRUST_ITEMS = [
  { icon: Shield, label: 'پرداخت امن', desc: 'درگاه امن شاپرک' },
  { icon: Truck, label: 'ارسال سریع', desc: 'تحویل زیر ۴۸ ساعت' },
  { icon: RefreshCw, label: 'ضمانت بازگشت', desc: 'تا ۷ روز مهلت بازگشت' },
  { icon: Headphones, label: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی شبانه‌روزی' },
];

function CopyrightYear() {
  const [year, setYear] = useState<string>('');
  useEffect(() => { setYear(new Date().toLocaleDateString('fa-IR', { year: 'numeric' })); }, []);
  return <>{year}</>;
}

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-card to-muted/50 border-t border-border/50">
      {/* Top wave decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                بازارچه
              </span>
            </Link>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm">
              بازار آنلاین خرید و فروش کالا با هزاران محصول از بهترین فروشندگان. تجربه یک خرید حرفه‌ای، سریع و مطمئن.
            </p>

            {/* Contact */}
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              {[
                { icon: MapPin, text: 'تهران، خیابان ولیعصر، مرکز تجارت الکترونیک' },
                { icon: Phone, text: '۰۲۱-۴۱۰۰۲۰۰۰' },
                { icon: Mail, text: 'support@bazarche.ir' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <span className="group-hover:text-foreground transition-colors">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="mt-4 sm:mt-6 flex items-center gap-2">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(social => (
                <a key={social.label} href={social.href} aria-label={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted/80 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200">
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {FOOTER_SECTIONS.map(s => (
            <div key={s.title}>
              <h4 className="font-bold mb-5 text-foreground">{s.title}</h4>
              <ul className="space-y-3">
                {s.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                      <ChevronLeft className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      <span>{l.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Bar */}
        <div className="mt-10 sm:mt-14 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background flex items-center justify-center shadow-sm shrink-0">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">{item.label}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © <CopyrightYear /> بازارچه | تمامی حقوق محفوظ است
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">قوانین</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">حریم خصوصی</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">تماس</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
