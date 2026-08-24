import React from 'react'
import PageClient from './PageClient'
import { ArrowLeft, CreditCard, Flame, Gift, Headphones, Package, RefreshCw, Search, Shield, Sparkles, Star, Store, TrendingUp, Truck, Users, Zap } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import MotionWrapper from '@/components/motion/MotionWrapper'
import SearchBar from '@/components/SearchBar'
import SectionHeader from './products/SectionHeader'
import { setRequestLocale } from 'next-intl/server'
import { fetchApi } from '@/lib/fetchApi'
import { ProductEntity } from '@/services/product.service'
import { CategorysTypes } from '@/services/category.service'
import { categoryGradients } from './products/page'
import { cn } from '@/lib/utils'
import ProductCard from '@/components/product/ProductCard'

interface Props {
  params: Promise<{ locale: string }>;
}

type ProductsPayload = {
  products: ProductEntity[];
  total?: number;
  pages?: number;
};

const hpBanners = ({
  heroCtas: [
    { title: 'تخفیف‌های ویژه', desc: 'تا ۵۰٪ تخفیف محصولات منتخب', icon: Sparkles, link: '/search?hasoffer=true', color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600' },
    { title: 'جدیدترین محصولات', desc: 'محصولات تازه وارد بازار', icon: Gift, link: '/search', color: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600' },
    { title: 'پرفروش‌ترین‌ها', desc: 'محبوب‌ترین محصولات هفته', icon: TrendingUp, link: '/search?sortBy=best_selling', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600' },
  ]
});

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetchApi({ url, cache: 'no-cache' });
    if (res.status === 404) return null;
    if (!res.success) return null;
    return res.data as T;
  } catch {
    return null;
  }
}

export const getLastProducts = async () =>
  safeFetch<ProductsPayload>('search?limit=8&sortBy=newest');

export const getFeatured = async () =>
  safeFetch<ProductsPayload>('search?featured=true&limit=4&sortBy=best_selling');

export const getCategorys = async () =>
  safeFetch<CategorysTypes[]>('categories/products?parentId=true');

export default async function page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === 'fa';
  const [lastProducts, featuredData, categoryData] =
    await Promise.all([
      getLastProducts(),
      getFeatured(),
      getCategorys(),
    ]);
  const featuredProducts = featuredData?.products ?? [];
  const latestProducts = lastProducts?.products ?? [];
  const categories = categoryData ?? [];
  const hpStats = { totalProducts: 0, totalSellers: 0, totalUsers: 0, satisfactionRate: 0 };

  return (
    <>
      <div className="bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-500 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 min-h-9 sm:h-10 flex items-center justify-between text-xs sm:text-sm gap-2 flex-nowrap">
          <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap min-w-0">
            <MotionWrapper preset='slideLTR' className="inline-flex items-center gap-1 sm:gap-1.5">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="font-bold truncate">تخفیف ویژه تا ۵۰٪</span>
              <span className="hidden sm:inline text-white/70">•</span>
              <span className="hidden sm:inline text-white/80 truncate">ارسال رایگان بالای ۵۰۰ هزار تومان</span>
            </MotionWrapper>
          </div>
          <Link href="/search?hasOffer=true" className="shrink-0 text-[11px] sm:text-xs font-bold bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition-colors">
            تخفیف‌ها
          </Link>
        </div>
      </div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-background">
        {/* Background decorations - RTL/LTR aware */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 rtl:-right-40 ltr:-left-40 w-96 h-96 rounded-full bg-indigo-400/5 dark:bg-indigo-500/3 blur-3xl" />
          <div className="absolute -bottom-40 rtl:-left-40 ltr:-right-40 w-96 h-96 rounded-full bg-violet-400/5 dark:bg-violet-500/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-linear-to-br from-indigo-400/3 via-violet-400/3 to-transparent blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20 md:pt-24 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Top badge */}
            <MotionWrapper preset='slideUpBlur' className="mb-7">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <Sparkles className="w-4 h-4" />
                بازار آنلاین خرید و فروش
              </span>
            </MotionWrapper>
            <h1>
              <MotionWrapper preset='slideUpBlur' className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-[1.15] sm:leading-[1.1] tracking-tight">
                <span className="block text-foreground">هر چیزی که نیاز داری،</span>
                <span className="block mt-2 sm:mt-3">
                  از{' '}
                  <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                    هزاران فروشنده
                  </span>{' '}
                  معتبر
                </span>
              </MotionWrapper>
            </h1>

            <MotionWrapper preset='slideUpBlur' className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              سریع، مطمئن و حرفه‌ای — خرید کنید یا بفروشید. با ضمانت اصالت کالا و ارسال سریع.
            </MotionWrapper>
            {/* Trust Badges */}
            <MotionWrapper preset='slideUpBlur' className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-4 md:gap-8 flex-wrap">
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
            </MotionWrapper>
            {/* Search Bar */}
            <MotionWrapper preset='slideUpBlur' className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-4 md:gap-8 flex-wrap">
              <SearchBar />
            </MotionWrapper>
            {/* CTA Buttons */}
            <MotionWrapper preset='slideUpBlur' className="mt-8 flex items-center gap-3 justify-center flex-wrap">
              <Link href="/products"
                className="h-10 sm:h-12 md:h-14 px-5 sm:px-7 md:px-9 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm md:text-base inline-flex items-center gap-1.5 sm:gap-2 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
                شروع خرید <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <Link href="/register/buyer"
                className="h-10 sm:h-12 md:h-14 px-5 sm:px-7 md:px-9 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm md:text-base inline-flex items-center gap-1.5 sm:gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ثبت نام کنید
              </Link>
            </MotionWrapper>
          </div>

          {/* Quick Action Cards */}
          <MotionWrapper preset='slideUpBlur' className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
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
          </MotionWrapper>
        </div>
      </section>
      {/* ───────── CATEGORIES ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <SectionHeader
          badge={isFa ? 'دسته‌بندی‌ها' : 'Categories'}
          title={isFa ? 'از کجا شروع می‌کنی؟' : 'Where do you start?'}
          subtitle={
            isFa
              ? 'دسته‌بندی محبوب را انتخاب کن و مستقیم به نتایج مرتبط برو.'
              : 'Pick a popular category and jump straight to matching results.'
          }
          href="/search"
          hrefLabel={isFa ? 'همه دسته‌ها' : 'All categories'}
          badgeIcon={Package}
          accent="cyan"
        />
        {categories.length ? (
          <MotionWrapper
            preset="slideUpBlur"
            staggerChildren={0.08}
            triggerOnScroll
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {categories.map((cat, i) => (
              <Link
                key={cat.id || cat.slug || i}
                href={'/main/' + cat.slug}
                className={cn(
                  'group relative flex flex-col items-center gap-2.5 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 text-center shadow-sm transition-all duration-300',
                  'hover:-translate-y-1 hover:border-cyan-500/35 hover:shadow-lg hover:shadow-cyan-500/10'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-linear-to-br',
                    categoryGradients[i % categoryGradients.length]
                  )}
                >
                  {cat.icon || '📦'}
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {cat.name}
                </div>
              </Link>
            ))}
          </MotionWrapper>
        ) : null}
      </section>

      {/* ───────── FEATURED (violet theme) ───────── */}
      {featuredProducts.length ? (
        <section
          id="featured"
          className="relative border-y border-violet-500/15 bg-linear-to-b from-violet-500/6 via-muted/10 to-indigo-500/5"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 right-10 w-64 h-64 rounded-full bg-violet-400/10 blur-3xl" />
            <div className="absolute -bottom-16 left-8 w-48 h-48 rounded-full bg-indigo-400/10 blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
            <SectionHeader
              badge={isFa ? 'منتخب سردبیر' : 'Editor’s pick'}
              title={isFa ? 'محصولات ویژه' : 'Featured products'}
              subtitle={
                isFa
                  ? 'کالاهایی که تیم بازارچه برای کیفیت، قیمت و محبوبیت انتخاب کرده.'
                  : 'Items our team chose for quality, price and popularity.'
              }
              href="/search?featured=true"
              hrefLabel={isFa ? 'بیشتر ببین' : 'See more'}
              badgeIcon={Sparkles}
              accent="violet"
            />
            <MotionWrapper
              preset="slideUpBlur"
              staggerChildren={0.1}
              triggerOnScroll
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {featuredProducts.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </MotionWrapper>
          </div>
        </section>
      ) : null}

      {/* ───────── Why us ───────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <MotionWrapper staggerChildren={0.1} preset='slideUpBlur' triggerOnScroll className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black">چرا بازارچه؟</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-lg mx-auto">تجربه‌ای متفاوت از خرید و فروش آنلاین</p>
          </MotionWrapper>

          <MotionWrapper staggerChildren={0.2} preset='slideUpBlur' triggerOnScroll className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'ارسال سریع', desc: 'تحویل زیر ۴۸ ساعت در تهران و ۳-۵ روز در شهرستان', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
              { icon: Shield, title: 'ضمانت اصالت', desc: 'تضمین ۱۰۰٪ اصل بودن کالا با امکان مرجوعی', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20' },
              { icon: Headphones, title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی سریع و حرفه‌ای در تمام ساعات شبانه‌روز', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20' },
              { icon: CreditCard, title: 'پرداخت امن', desc: 'درگاه پرداخت امن با پشتیبانی از تمام کارت‌های بانکی', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
            ].map((item, i) => (
              <div className={cn('p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-0.5', item.bg, item.border)}>
                <div className={cn('w-12 h-12 rounded-xl bg-white dark:bg-card flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300', item.color)}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </MotionWrapper>
        </div>
      </section>

      {/* ───────── Banner ───────── */}
      <section className="relative py-8 sm:py-10 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-500">
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <MotionWrapper preset='slideUpBlur' triggerOnScroll staggerChildren={0.1} className="relative max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3">همین امروز شروع کنید!</h2>
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
              <MotionWrapper key={i++} className="flex items-center gap-2"
              >
                <div className="hidden sm:flex w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm items-center justify-center">
                  <s.icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <div className="text-lg md:text-xl font-black">{s.suffix === '٪' ? `${s.value}٪` : `${s.value}+`}</div>
                  <div className="text-[11px] text-white/50">{s.label}</div>
                </div>
              </MotionWrapper>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <Link href="/products"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-indigo-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-black/15 hover:shadow-white/20 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
              شروع خرید <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
            <Link href="/register/buyer"
              className="inline-flex items-center gap-1.5 sm:gap-2 border border-white/40 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-white/10 hover:border-white transition-all hover:-translate-y-0.5 active:scale-[0.97]">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ثبت نام کنید
            </Link>
          </div>
        </MotionWrapper>
      </section>

      {/* ───────── BESTSELLERS / LATEST (amber theme) ───────── */}
      {latestProducts.length ? (
        <section
          id="new"
          className="relative border-y border-cyan-500/15 bg-linear-to-b from-cyan-500/6 via-muted/10 to-cyan-500/5"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 right-10 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -bottom-16 left-8 w-48 h-48 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14'>
            <SectionHeader
              badge={isFa ? 'تازه‌ها و پرفروش‌ها' : 'New & bestsellers'}
              title={
                isFa ? 'چیزی که همه می‌خرند' : 'What everyone’s buying'
              }
              subtitle={
                isFa
                  ? 'بر اساس فروش واقعی و تازه‌ترین موجودی بازارچه.'
                  : 'Based on real sales and the latest stock on Marketino.'
              }
              href="/search"
              hrefLabel={isFa ? 'نمایش کامل' : 'View all'}
              badgeIcon={Flame}
              accent="cyan"
            />
            <MotionWrapper
              preset="slideUpBlur"
              staggerChildren={0.1}
              triggerOnScroll
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {latestProducts.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </MotionWrapper>
          </div>
        </section>
      ) : null}

      <PageClient />
    </>
  )
}
