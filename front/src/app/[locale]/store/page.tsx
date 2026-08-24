import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { fetchApi } from '@/lib/fetchApi';
import { AllStoreResponseEntity } from '@/services/store.service';
import { notFound } from 'next/navigation';
import { Flame, Package, Search, SlidersHorizontal, Sparkles, Star, Store } from 'lucide-react';
import StoreCard from '@/components/store/StoreCard';
import { Link } from '@/i18n/navigation';
import SearchStore from './SearchStore';
import MotionWrapper from '@/components/motion/MotionWrapper';
import Breadcrumb from '@/components/product/Breadcrumb';
import CustomButton from '@/components/CustomButton';
import { cn } from '@/lib/utils';
import PaginationUser from '@/components/PaginationUser';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'جدید ترین', icon: Sparkles },
  { value: 'best_selling' as const, label: 'بیش‌ ترین فروش', icon: Flame },
  { value: 'more_reviews' as const, label: 'محبوب‌ ترین', icon: Star },
  { value: 'more_products' as const, label: 'تعداد محصول', icon: Package },
];

export async function getStores(params: any) {
  let res;
  if (params) {
    const cleanFilters = Object.fromEntries(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    res = await fetchApi({ url: `stores?${queryString}`, cache: 'no-cache' })
  } else {
    res = await fetchApi({ url: 'stores?sortBy=more_rate', cache: 'default' })
  }
  if (res.status === 404) {
    notFound()
  }
  if (!res.success) {
    throw new Error(`Failed to load post: ${res.status}`)
  }
  return res
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';

  const title = isFa
    ? 'فروشگاه‌ها | بازارچه — خرید از فروشنده‌های معتبر'
    : 'Stores | Marketino — Shop from verified sellers';

  const description = isFa
    ? 'لیست فروشگاه‌های تایید‌شده بازارچه با امتیاز، نرخ پاسخ‌گویی و ارسال به‌موقع. خرید مطمئن از فروشنده‌های حرفه‌ای.'
    : 'Browse verified Marketino stores with ratings, response rates and on-time delivery. Shop confidently from professional sellers.';

  return {
    title,
    description,
    keywords: isFa
      ? ['فروشگاه', 'فروشنده', 'بازارچه', 'خرید آنلاین', 'فروشگاه تایید شده']
      : ['store', 'seller', 'marketino', 'verified shop', 'online marketplace'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isFa ? 'fa_IR' : 'en_US',
      siteName: isFa ? 'بازارچه' : 'Marketino',
    },
    alternates: {
      canonical: `/${locale}/store`,
      languages: { fa: '/fa/store', en: '/en/store' },
    },
    robots: { index: true, follow: true },
  };
}

export default async function StoreListPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams
  setRequestLocale(locale);
  const isFa = locale === 'fa';
  const { data }: { data: AllStoreResponseEntity } = await getStores(sp)
  const { stores, pagination } = data
  const { sortBy, page, search } = sp
  const hasParams = sp && Object.keys(sp).length > 0;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `/${locale}/store#page`,
        name: isFa ? 'فروشگاه‌های بازارچه' : 'Marketino Stores',
        description: isFa
          ? 'فهرست فروشگاه‌های فعال در بازارچه'
          : 'List of active stores on Marketino',
        url: `/${locale}/store`,
        isPartOf: {
          '@type': 'WebSite',
          name: isFa ? 'بازارچه' : 'Marketino',
          url: '/',
        },
        mainEntity: { '@id': `/${locale}/store#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `/${locale}/store#list`,
        numberOfItems: data.pagination.total,
        itemListElement: data.stores.map((store, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `/${locale}/store/${store.slug}`,
          name: store.name,
          ...(store.logo ? { image: store.logo } : {}),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isFa ? 'خانه' : 'Home', item: `/${locale}` },
          { '@type': 'ListItem', position: 2, name: isFa ? 'فروشگاه‌ها' : 'Stores', item: `/${locale}/store` },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <h1 className="sr-only">
          {isFa ? 'فهرست فروشگاه‌های بازارچه' : 'Marketino store directory'}
        </h1>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-violet-500/10 pointer-events-none" />
          <div className="absolute -top-24 -right-20 size-72 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-16 size-80 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-14">
            <Breadcrumb pageName={{
              name: 'فروشگاه',
              nameEn: 'store',
              slug: 'store',
            }}
            />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                  <Store className="size-3.5" />
                  {data?.stores?.length.toLocaleString('fa-IR')}+ فروشگاه فعال
                </div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  فروشگاه‌های{' '}
                  <span className="bg-linear-to-l from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                    بازارچه
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
                  از فروشنده‌های تایید‌شده با امتیاز بالا خرید کن. کیفیت، ارسال به‌موقع و پشتیبانی واقعی.
                </p>
              </div>
              <SearchStore />
            </div>
            {/* Top 3 highlight */}
            {!hasParams && (
              <div className="mt-10">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Sparkles className="size-3.5 text-amber-500" />
                  برترین فروشگاه‌ها از نظر امتیاز
                </div>
                <MotionWrapper preset='slideUpBlur' staggerChildren={0.1} triggerOnScroll className='grid gap-3 sm:grid-cols-3'>
                  {data?.stores?.map((s, i) => {
                    if (i++ >= 3) return
                    return <StoreCard key={s.id} store={s} rank={i++} variant="compact" />
                  })}
                </MotionWrapper>
              </div>
            )}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-8">
            <div className="flex-1 min-w-0 space-y-5">

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/70 px-3.5 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <button type="button"
                    className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                    <SlidersHorizontal className="w-3.5 h-3.5" />فیلتر
                  </button>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground tabular-nums">
                      {pagination.total || 0}
                    </span> فروشگاه
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-1 rounded-xl border border-border p-0.5 bg-background/50">
                  {SORT_OPTIONS.map(o => {
                    const Icon = o.icon;
                    return (
                      <Link href={`?${new URLSearchParams({
                        ...sp,
                        sortBy: o.value,
                      }).toString()}`}
                        key={o.value} type="button"
                        className={cn('inline-flex items-center cursor-pointer gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all',
                          sortBy === o.value ? 'bg-cyan-500/15 text-cyan-700 shadow-sm' : 'text-muted-foreground hover:bg-muted/60')}>
                        <Icon className="w-3 h-3" />{o.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Results */}
              {!stores?.length ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center space-y-3">
                  <Store className="w-12 h-12 mx-auto text-muted-foreground/40" />
                  <h2 className="text-base font-bold">نتیجه‌ای پیدا نشد</h2>
                  <CustomButton link='/store' type="button" color="blueRadinat" name="شروع دوباره" />
                </div>
              ) : (
                <MotionWrapper preset='slideUpBlur' staggerChildren={0.1} triggerOnScroll className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {data?.stores?.map((s, i) => (
                    <StoreCard key={s.id} store={s} variant="compact" />
                  ))}
                </MotionWrapper>
              )}
            </div>
            <PaginationUser pathName='/store' searchParams={sp} pagination={pagination} />
          </div>
        </div>
      </div>
    </>
  );
}
