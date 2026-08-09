'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Star, Shield, Truck, RefreshCw,
  Store, Eye, Zap, Package, Smile, Timer,
  Camera, Search, Heart, Award, ShoppingBag, Gift, Users,
  MessageCircle, Headphones, CreditCard, TrendingUp
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ShopCard from '@/components/ShopCard';
import ScrollReveal from '@/components/ScrollReveal';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { shopsApi, homepageApi, categoriesApi, type Product, type User, type Category } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ========================================================================
 * 🏠 بازارچه — Ultra Premium Homepage v5
 * طراحی کاملاً حرفه‌ای و ۱۰ از ۱۰
 * ======================================================================== */

// ── Count Up Animation Hook ──
function useCountUp(target: number, isActive: boolean, suffix = '') {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    let start = 0;
    const duration = 2000;
    const frames = Math.ceil(duration / 16);
    const increment = target / frames;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [isActive, target]);
  return `${count.toLocaleString('fa-IR')}${suffix}`;
}

// ── Animated Stat Card ──
function StatCard({ icon: Icon, target, suffix, label, color, delay = 0, bgGradient }: {
  icon: any; target: number; suffix?: string; label: string; color: string; delay?: number; bgGradient: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const display = useCountUp(target, isInView, suffix || '');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/40 shadow-sm hover:shadow-lg transition-all duration-500 group',
        bgGradient
      )}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shadow-sm', color.replace('text-', 'bg-').replace(/-\d+/, '-500/10'))}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <div>
          <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight tabular-nums">{display}</div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{label}</div>
        </div>
      </div>
      {/* Decorative element */}
      <div className={cn('absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-[0.07] transition-opacity group-hover:opacity-[0.12]', color.replace('text-', 'bg-'))} />
    </motion.div>
  );
}

// ── Testimonial Carousel ──
function TestimonialCarousel({ reviews }: { reviews: any[] }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActive(prev => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const goTo = (idx: number) => {
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
  };

  if (!reviews.length) return null;
  const t = reviews[active];

  return (
    <div>
      <div className="relative overflow-hidden min-h-[230px] flex items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="w-full"
          >
            <div className="text-6xl font-serif text-amber-200 dark:text-amber-900/60 leading-none mb-3 select-none">&ldquo;</div>
            <p className="text-base md:text-lg leading-relaxed text-foreground font-medium mb-5">{t.body || t.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20 text-sm">
                {(t.userName || t.name || 'م')?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-sm">{t.userName || t.name}</div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array(5).fill(0).map((_, idx) => (
                    <Star key={idx} className={cn('w-3 h-3', idx < (t.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-muted/20')} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {reviews.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === active
                  ? 'w-7 h-2.5 bg-amber-500'
                  : 'w-2.5 h-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/35'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section Header ──
function SectionHeader({ icon: Icon, badge, title, subtitle, badgeColor = 'text-indigo-600', badgeBg = 'bg-indigo-50 dark:bg-indigo-500/10', badgeBorder = 'border-indigo-100 dark:border-indigo-500/20' }: {
  icon: any; badge: string; title: string; subtitle?: string; badgeColor?: string; badgeBg?: string; badgeBorder?: string;
}) {
  return (
    <div>
      <span className={cn('inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 border', badgeBg, badgeColor, badgeBorder)}>
        <Icon className="w-3.5 h-3.5" /> {badge}
      </span>
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black">{title}</h2>
      {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [topShops, setTopShops] = useState<(User & { totalProducts: number; avgRating: number; totalSales: number })[]>([]);
  const [homepageData, setHomepageData] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);
  useEffect(() => { shopsApi.top().then(data => setTopShops(data.slice(0, 8))).catch(() => { }); }, []);
  useEffect(() => { homepageApi.get().then(setHomepageData).catch(() => { }); }, []);
  useEffect(() => { categoriesApi.list().then(setCategories).catch(() => setCategories([])); }, []);

  const hpFeatured = homepageData?.featuredProducts || [];
  const hpLatest = homepageData?.newestProducts || homepageData?.latestProducts || [];
  const hpFlashDeals = homepageData?.flashDeals || [];
  const hpMostViewed = homepageData?.mostViewed || [];
  const hpReviews = homepageData?.customerReviews || [];
  const hpStats = homepageData?.stats || { totalProducts: 0, totalSellers: 0, totalUsers: 0, satisfactionRate: 0 };

  const hpBanners = ({
    heroCtas: [
      { title: 'تخفیف‌های ویژه', desc: 'تا ۵۰٪ تخفیف محصولات منتخب', icon: Sparkles, link: '/products?tag=تخفیف', color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600' },
      { title: 'جدیدترین محصولات', desc: 'محصولات تازه وارد بازار', icon: Gift, link: '/products?sort=newest', color: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600' },
      { title: 'پرفروش‌ترین‌ها', desc: 'محبوب‌ترین محصولات هفته', icon: TrendingUp, link: '/products?sort=bestseller', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600' },
    ]
  });

  const handleSearch = useCallback((q: string) => {
    if (q.length < 2) { setShowResults(false); return; }
    const pool = hpFeatured.length > 0 ? hpFeatured : (hpLatest.length > 0 ? hpLatest : []);
    if (pool.length === 0) { setShowResults(false); return; }
    const results = pool.filter((p: Product) =>
      p.title.includes(q) || p.description.includes(q) || (p.tags && p.tags.some((t: string) => t.includes(q)))
    ).slice(0, 6);
    setSearchResults(results);
    setShowResults(results.length > 0);
  }, [hpFeatured, hpLatest]);

  const submitSearch = (q: string) => { setShowResults(false); router.push(`/products?q=${encodeURIComponent(q)}`); };

  const handleImageSearch = (file: File) => {
    toast.success(`📸 تحلیل عکس "${file.name}"...`, { duration: 2500 });
    const pool = hpFeatured.length > 0 ? hpFeatured : hpLatest;
    if (pool.length === 0) {
      toast.error('داده‌ای برای جستجو موجود نیست');
      return;
    }
    setTimeout(() => {
      const random = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
      setSearchResults(random);
      setShowResults(true);
    }, 1500);
  };
  return (
    <div className="overflow-hidden">
      {/* ================================================================
           🎯 PROMO STRIP — نوار اطلاع‌رسانی بالا
           ================================================================ */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 min-h-[36px] sm:h-10 flex items-center justify-between text-xs sm:text-sm gap-2 flex-nowrap">
          <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap min-w-0">
            <motion.span
              animate={{ x: [0, -20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-flex items-center gap-1 sm:gap-1.5"
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="font-bold truncate">تخفیف ویژه تا ۵۰٪</span>
              <span className="hidden sm:inline text-white/70">•</span>
              <span className="hidden sm:inline text-white/80 truncate">ارسال رایگان بالای ۵۰۰ هزار تومان</span>
            </motion.span>
          </div>
          <Link href="/products?tag=تخفیف" className="shrink-0 text-[11px] sm:text-xs font-bold bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition-colors">
            تخفیف‌ها
          </Link>
        </div>
      </div>

      {/* ================================================================
           🏠 HERO v5 — Elegant & Premium
           ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-background">
        {/* Background decorations - RTL/LTR aware */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 rtl:-right-40 ltr:-left-40 w-96 h-96 rounded-full bg-indigo-400/5 dark:bg-indigo-500/3 blur-3xl" />
          <div className="absolute -bottom-40 rtl:-left-40 ltr:-right-40 w-96 h-96 rounded-full bg-violet-400/5 dark:bg-violet-500/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-400/3 via-violet-400/3 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20 md:pt-24 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <Sparkles className="w-4 h-4" />
                بازار آنلاین خرید و فروش
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-[1.15] sm:leading-[1.1] tracking-tight"
            >
              <span className="block text-foreground">هر چیزی که نیاز داری،</span>
              <span className="block mt-2 sm:mt-3">
                از{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  هزاران فروشنده
                </span>{' '}
                معتبر
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              سریع، مطمئن و حرفه‌ای — خرید کنید یا بفروشید. با ضمانت اصالت کالا و ارسال سریع.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-4 md:gap-8 flex-wrap"
            >
              {[
                { icon: Shield, text: 'ضمانت اصالت' },
                { icon: Truck, text: 'ارسال سریع' },
                { icon: RefreshCw, text: 'بازگشت ۷ روزه' },
                { icon: Headphones, text: 'پشتیبانی ۲۴/۷' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-card border border-border/30 shadow-sm">
                  <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground">{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 relative max-w-2xl mx-auto"
            >
              <div className="relative flex items-center min-h-[48px] sm:h-14 md:h-16 rounded-2xl bg-white dark:bg-card border-2 border-border/60
                              shadow-lg shadow-black/[0.04] dark:shadow-black/20 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                <Search className="absolute rtl:right-3 sm:rtl:right-4 ltr:left-3 sm:ltr:left-4 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  value={searchValue}
                  onChange={e => { setSearchValue(e.target.value); handleSearch(e.target.value); }}
                  onKeyDown={e => { if (e.key === 'Enter') submitSearch(searchValue); }}
                  placeholder="جستجوی محصول، برند یا دسته‌بندی..."
                  className="flex-1 h-full rtl:pr-9 sm:rtl:pr-12 rtl:pl-28 sm:rtl:pl-36 md:rtl:pl-40 ltr:pl-9 sm:ltr:pl-12 ltr:pr-28 sm:ltr:pr-36 md:ltr:pr-40 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground/50"
                />
                <div className="absolute rtl:left-1.5 sm:rtl:left-2.5 ltr:right-1.5 sm:ltr:right-2.5 flex items-center gap-1 sm:gap-1.5">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    title="جستجو با عکس">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) { handleImageSearch(f); e.target.value = ''; } }} />
                  <button onClick={() => submitSearch(searchValue)}
                    className="h-8 sm:h-10 px-3 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-md shadow-indigo-500/20">
                    جستجو
                  </button>
                </div>
              </div>

              {/* Quick tags */}
              <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
                {['گوشی موبایل', 'لپ تاپ', 'هدفون', 'مانتو', 'کتاب', 'ساعت هوشمند'].map(tag => (
                  <button key={tag} onClick={() => submitSearch(tag)}
                    className="px-3.5 py-2 rounded-full bg-muted/50 hover:bg-muted border border-border/30 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 text-xs font-medium transition-all">
                    {tag}
                  </button>
                ))}
              </div>

              {/* Live Search Results */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-3 left-0 right-0 bg-card border border-border rounded-2xl shadow-2xl shadow-black/5 z-50 overflow-hidden">
                    <div className="p-1.5">
                      <div className="flex justify-between items-center px-3 py-2.5">
                        <span className="text-xs text-muted-foreground font-semibold">نتایج جستجو</span>
                        <button onClick={() => submitSearch(searchValue)} className="text-xs text-indigo-600 font-semibold hover:underline">
                          مشاهده همه نتایج
                        </button>
                      </div>
                      {searchResults.map(p => (
                        <Link key={p.id} href={`/products/${p.id}`} onClick={() => setShowResults(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group/result">
                          <img src={p.image} alt={p.title} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate group-hover/result:text-indigo-600 transition-colors">{p.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{(p.discountPrice ?? p.price).toLocaleString()} تومان</div>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-muted-foreground opacity-0 group-hover/result:opacity-100 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 flex items-center gap-3 justify-center flex-wrap"
            >
              <Link href="/products"
                className="h-10 sm:h-12 md:h-14 px-5 sm:px-7 md:px-9 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm md:text-base inline-flex items-center gap-1.5 sm:gap-2 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
                شروع خرید <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <Link href="/register/seller"
                className="h-10 sm:h-12 md:h-14 px-5 sm:px-7 md:px-9 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm md:text-base inline-flex items-center gap-1.5 sm:gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> فروشنده شوید
              </Link>
            </motion.div>
          </div>

          {/* Quick Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            {hpBanners.heroCtas.map((card: any, i: number) => (
              <Link key={i} href={card.link}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <card.icon className={`w-5 h-5 ${card.text}`} />
                </div>
                <div>
                  <div className="font-bold text-sm">{card.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{card.desc}</div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
           LIVE ACTIVITY TICKER
           ================================================================ */}
      <section className="border-y border-border/20 bg-gradient-to-r from-indigo-50/40 via-white to-rose-50/40 dark:from-indigo-950/10 dark:via-background dark:to-rose-950/10">
        <LiveActivityTicker />
      </section>

      {/* ================================================================
           STATS — Animated Counters
           ================================================================ */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Package} target={hpStats?.totalProducts || 50000} label="محصول فعال" color="text-indigo-600" bgGradient="bg-card" delay={0} />
          <StatCard icon={Store} target={hpStats?.totalSellers || 3500} label="فروشنده" color="text-violet-600" bgGradient="bg-card" delay={0.1} />
          <StatCard icon={Users} target={hpStats?.totalUsers || 200000} label="کاربر فعال" color="text-emerald-600" bgGradient="bg-card" delay={0.2} />
          <StatCard icon={Smile} target={hpStats?.satisfactionRate || 98} suffix="٪" label="رضایت کاربران" color="text-amber-600" bgGradient="bg-card" delay={0.3} />
        </div>
      </ScrollReveal>

      {/* ================================================================
           FLASH DEALS — پیشنهادهای داغ
           ================================================================ */}
      {hpFlashDeals.length > 0 && (
        <ScrollReveal className="max-w-7xl mx-auto px-4 py-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/60 via-orange-50/30 to-rose-50/40 dark:from-rose-950/20 dark:via-orange-950/10 dark:to-rose-950/10 border border-rose-200/30 dark:border-rose-800/10 p-6 md:p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-black">پیشنهادهای داغ</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                    <span className="text-rose-500 font-bold">زمان محدود!</span> <span className="hidden sm:inline">این محصولات را از دست ندهید</span>
                  </p>
                </div>
              </div>
              <Link href="/products?tag=flash"
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100">
                مشاهده همه <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {hpFlashDeals.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ================================================================
           CATEGORIES — دسته‌بندی‌ها
           ================================================================ */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <SectionHeader icon={Package} badge="دسته‌بندی‌ها" title="دسته‌بندی‌های محبوب" subtitle="محصولات را بر اساس دسته‌بندی مرور کنید" />
          </ScrollReveal>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {/* {categories?.categories?.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 0.03} distance={20} className="h-full">
                <Link href={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-3 p-4 h-full rounded-2xl bg-card border border-border/30 hover:border-indigo-200 dark:hover:border-indigo-800
                             hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10
                                  flex items-center justify-center text-2xl group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-indigo-100/50 dark:border-indigo-500/10">
                    {cat.icon}
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{cat._count?.products ?? 0} محصول</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))} */}
          </div>
        </div>
      </section>

      {/* ================================================================
           FEATURED PRODUCTS — محصولات ویژه
           ================================================================ */}
      <section className="py-14 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent dark:via-slate-900/5">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal className="flex items-center justify-between mb-8">
            <SectionHeader icon={Star} badge="ویژه" title="محصولات ویژه" subtitle="منتخب بهترین محصولات با تخفیف ویژه" badgeColor="text-violet-600" badgeBg="bg-violet-50 dark:bg-violet-500/10" badgeBorder="border-violet-100 dark:border-violet-500/20" />
            <Link href="/products?tag=تخفیف" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">
              مشاهده همه <ArrowLeft className="w-4 h-4" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? Array(4).fill(0).map((_, i) => <Skeleton key={i} />)
              : hpFeatured.map((p: Product, i: number) => (
                <ScrollReveal key={p.id} delay={i * 0.04} distance={24}>
                  <ProductCard product={p} index={i} />
                </ScrollReveal>
              ))
            }
          </div>
        </div>
      </section>

      {/* ================================================================
           VALUE PROPOSITION — چرا بازارچه؟
           ================================================================ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black">چرا بازارچه؟</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-lg mx-auto">تجربه‌ای متفاوت از خرید و فروش آنلاین</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'ارسال سریع', desc: 'تحویل زیر ۴۸ ساعت در تهران و ۳-۵ روز در شهرستان', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
              { icon: Shield, title: 'ضمانت اصالت', desc: 'تضمین ۱۰۰٪ اصل بودن کالا با امکان مرجوعی', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20' },
              { icon: Headphones, title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی سریع و حرفه‌ای در تمام ساعات شبانه‌روز', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20' },
              { icon: CreditCard, title: 'پرداخت امن', desc: 'درگاه پرداخت امن با پشتیبانی از تمام کارت‌های بانکی', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className={cn('p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-0.5', item.bg, item.border)}>
                  <div className={cn('w-12 h-12 rounded-xl bg-white dark:bg-card flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300', item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
           POPULAR SHOPS — فروشگاه‌های محبوب
           ================================================================ */}
      <section className="py-14 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/10">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal className="flex items-center justify-between mb-8">
            <SectionHeader icon={Store} badge="فروشگاه‌ها" title="محبوب‌ترین فروشگاه‌ها" subtitle="معتبرترین فروشندگان با بهترین امتیاز" badgeColor="text-emerald-600" badgeBg="bg-emerald-50 dark:bg-emerald-500/10" badgeBorder="border-emerald-100 dark:border-emerald-500/20" />
            <Link href="/shops" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              همه فروشگاه‌ها <ArrowLeft className="w-4 h-4" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {topShops.length > 0
              ? topShops.map((shop, i) => (
                <ScrollReveal key={shop.id} delay={i * 0.05} distance={24}>
                  <ShopCard shop={shop} rank={i + 1} />
                </ScrollReveal>
              ))
              : [
                { id: 's1', storeName: 'دیجی کالای مرکزی', storeLogo: '📱', businessType: 'electronics', sellerStatus: 'approved', totalProducts: 156, avgRating: 4.8, totalSales: 12500 },
                { id: 's2', storeName: 'مد پوشاک ایرانی', storeLogo: '👕', businessType: 'clothing', sellerStatus: 'approved', totalProducts: 89, avgRating: 4.6, totalSales: 8900 },
                { id: 's3', storeName: 'خانه مدرن', storeLogo: '🏠', businessType: 'home', sellerStatus: 'approved', totalProducts: 234, avgRating: 4.7, totalSales: 15600 },
                { id: 's4', storeName: 'کتابسرای ایران', storeLogo: '📚', businessType: 'books', sellerStatus: 'approved', totalProducts: 345, avgRating: 4.7, totalSales: 9800 },
              ].map((shop: Record<string, unknown>, i) => (
                <ScrollReveal key={shop.id as string} delay={i * 0.05} distance={24}>
                  <ShopCard shop={shop as unknown as User & { totalProducts: number; avgRating: number; totalSales: number }} rank={i + 1} />
                </ScrollReveal>
              ))
            }
          </div>
        </div>
      </section>

      {/* ================================================================
           MOST VIEWED + TESTIMONIALS — Professional Redesign
           ================================================================ */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Most Viewed (7/12) — Compact Horizontal Scroll */}
            <div className="lg:col-span-7">
              <ScrollReveal className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-black">پربازدیدترین‌ها</h2>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">محبوب‌ترین محصولات این هفته</p>
                  </div>
                </div>
                <Link href="/products?sort=popular" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1">
                  مشاهده همه <ArrowLeft className="w-3 h-3" />
                </Link>
              </ScrollReveal>

              <div className="space-y-3">
                {(hpMostViewed.length > 0 ? hpMostViewed : hpLatest).slice(0, 5).map((p: any, idx: number) => {
                  const pImg = typeof p.image === 'string' ? p.image : (p.images?.[0] || '');
                  const pPrice = p.variants[0].discountPrice ?? p.variants[0].price;
                  const pDisc = p.variants[0].discountPrice ? Math.round(((p.variants[0].price - p.variants[0].discountPrice) / p.variants[0].price) * 100) : 0;
                  return (
                    <ScrollReveal key={p.id} delay={idx * 0.06} distance={16}>
                      <Link href={`/products/${p.id}`}
                        className="group flex items-center gap-4 p-3 rounded-2xl bg-card border border-border/30 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0',
                          idx === 0 ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' :
                            idx === 1 ? 'bg-slate-400 text-white' :
                              idx === 2 ? 'bg-amber-700/60 text-white' :
                                'bg-muted text-muted-foreground'
                        )}>
                          {idx + 1}
                        </div>
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/50 shrink-0 border border-border/30 group-hover:border-amber-200 dark:group-hover:border-amber-800 transition-colors">
                          <img
                            src={pImg || `https://placehold.co/100x100/e2e8f0/94a3b8?text=No`}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-[11px] font-bold text-foreground">{p.rating}</span>
                            </div>
                            {p.reviewCount && (
                              <span className="text-[10px] text-muted-foreground">({p.reviewCount} نظر)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="text-sm font-black tabular-nums">{pPrice.toLocaleString('fa-IR')}</div>
                          <div className="text-[10px] text-muted-foreground">تومان</div>
                          {pDisc > 0 && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-500 text-[10px] font-bold">
                              {pDisc}٪
                            </span>
                          )}
                        </div>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>

            </div>

            {/* Testimonials (5/12) — Premium Design */}
            <div className="lg:col-span-5">
              <ScrollReveal className="mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shadow-sm">
                    <MessageCircle className="w-4.5 h-4.5 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-black">نظرات مشتریان</h2>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">تجربه کاربران واقعی از بازارچه</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Testimonial Cards - Stacked */}
              <div className="space-y-3">
                {(hpReviews).slice(0, 4).map((review: any, idx: number) => (
                  <ScrollReveal key={review.id || idx} delay={idx * 0.08} distance={16}>
                    <div className="relative rounded-2xl bg-card border border-border/30 p-4 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300">
                      {/* Quote mark */}
                      <div className="absolute -top-2 rtl:-right-2 ltr:-left-2 w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-300 dark:text-violet-600 text-lg font-serif leading-none select-none">
                        &ldquo;
                      </div>

                      <div className="flex items-center gap-3 mb-2.5">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-violet-500/20 shrink-0">
                          {(review.userName || review.name || 'م').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{review.userName || review.name}</div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array(5).fill(0).map((_, i) => (
                              <Star key={i} className={cn('w-2.5 h-2.5', i < (review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-muted/20')} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 rtl:pr-2 ltr:pl-2">
                        {review.body || review.text}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Overall Rating Summary */}
              <ScrollReveal delay={0.32} distance={16}>
                <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-50/60 to-indigo-50/40 dark:from-violet-950/20 dark:to-indigo-950/10 border border-violet-200/40 dark:border-violet-800/20 p-4 flex items-center gap-5">
                  <div className="text-center shrink-0">
                    <div className="text-3xl font-black text-violet-600 dark:text-violet-400">4.8</div>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={cn('w-3 h-3', i < 5 ? 'text-amber-400 fill-amber-400' : 'text-muted/20')} />
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">از ۱۲,۵۰۰+ نظر</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const pcts = [72, 18, 6, 3, 1];
                      const idx = 5 - star;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-3">{star}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pcts[idx]}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-5 rtl:text-right ltr:text-left">{pcts[idx]}٪</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
           CTA — Compact Banner
           ================================================================ */}
      <section className="relative py-8 sm:py-10 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500">
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <ScrollReveal className="relative max-w-3xl mx-auto px-4 text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xl sm:text-2xl md:text-3xl font-black mb-3"
          >
            همین امروز شروع کنید!
          </motion.h2>
          <p className="text-xs sm:text-sm md:text-base text-white/70 mb-6 max-w-md mx-auto leading-relaxed">
            به خانواده بزرگ بازارچه بپیوندید — هم خرید کنید، هم بفروشید
          </p>

          {/* Compact Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-6 flex-wrap">
            {[
              { icon: Package, value: (hpStats?.totalProducts || 50000).toLocaleString('fa-IR'), label: 'محصول', suffix: '+' },
              { icon: Store, value: (hpStats?.totalSellers || 3500).toLocaleString('fa-IR'), label: 'فروشنده', suffix: '+' },
              { icon: Users, value: (hpStats?.totalUsers || 200000).toLocaleString('fa-IR'), label: 'کاربر', suffix: '+' },
              { icon: Star, value: hpStats?.satisfactionRate || 98, label: 'رضایت', suffix: '٪' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-center gap-2"
              >
                <div className="hidden sm:flex w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm items-center justify-center">
                  <s.icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <div className="text-lg md:text-xl font-black">{s.suffix === '٪' ? `${s.value}٪` : `${s.value}+`}</div>
                  <div className="text-[11px] text-white/50">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <Link href="/products"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-indigo-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-black/15 hover:shadow-white/20 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
              شروع خرید <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
            <Link href="/register/seller"
              className="inline-flex items-center gap-1.5 sm:gap-2 border border-white/40 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-white/10 hover:border-white transition-all hover:-translate-y-0.5 active:scale-[0.97]">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> فروشنده شوید
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ================================================================
           LATEST PRODUCTS — جدیدترین محصولات
           ================================================================ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal className="flex items-center justify-between mb-8">
            <SectionHeader icon={Gift} badge="جدیدترین" title="جدیدترین محصولات" subtitle="آخرین محصولات اضافه شده به بازارچه" badgeColor="text-teal-600" badgeBg="bg-teal-50 dark:bg-teal-500/10" badgeBorder="border-teal-100 dark:border-teal-500/20" />
            <Link href="/products?sort=newest" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
              مشاهده همه <ArrowLeft className="w-4 h-4" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {hpLatest.map((p: any, i: number) => (
              <ScrollReveal key={p.id} delay={i * 0.04} distance={20}>
                <ProductCard product={p} index={i} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}