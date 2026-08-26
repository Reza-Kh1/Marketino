import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { fetchApi } from '@/lib/fetchApi';
import StoreHero from '@/components/store/StoreHero';
import { Building, CheckCircle2, FileText, Info, LayoutGrid, MessageSquare, Globe, Package, Star, XCircle, Calendar, ArrowLeft, Truck, ShieldCheck, Store as StoreIcon, Store } from 'lucide-react';
import StoreContactCard from '@/components/store/StoreContactCard';
import StoreReviewsList from '@/components/store/StoreReviewsList';
import StoreRatingPanel from '@/components/store/StoreRatingPanel';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import { Link } from '@/i18n/navigation';
import { Store as StoreType } from '@/services/store.service';
import ReviewForm from '@/components/product/ReviewForm';
import StoreReviewCard from '@/components/store/StoreReviewCard';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: Promise<{ tab?: string }> | { tab?: string }; // سازگار با Next.js 15 و نسخه های قبل
};
type TabId = 'products' | 'about' | 'ratings' | 'reviews';

const TABS: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'محصولات', icon: LayoutGrid },
  { id: 'about', label: 'درباره فروشگاه', icon: Info },
  { id: 'ratings', label: 'امتیاز و عملکرد', icon: Star },
  { id: 'reviews', label: 'نظرات', icon: MessageSquare },
];

export async function getStore(slug: string) {
  const res = await fetchApi({ url: `stores/${slug}`, cache: 'no-cache' })
  if (res.status === 404) {
    notFound()
  }
  if (!res.success) {
    throw new Error(`Failed to load post: ${res.status}`)
  }
  return res
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const { data: store } = await getStore(slug);
  const isFa = locale === 'fa';

  if (!store) {
    return {
      title: isFa ? 'فروشگاه یافت نشد' : 'Store not found',
    };
  }

  const title = isFa
    ? `${store.name} | فروشگاه در بازارچه`
    : `${store.nameEn || store.name} | Store on Marketino`;

  const description =
    (isFa ? store.description : store.descriptionEn || store.description) ||
    (isFa
      ? `مشاهده محصولات و امتیاز فروشگاه ${store.name} در بازارچه`
      : `View products and ratings for ${store.name} on Marketino`);

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: 'profile',
      locale: isFa ? 'fa_IR' : 'en_US',
      images: store.banner || store.logo ? [{ url: (store.banner || store.logo)! }] : undefined,
    },
    alternates: {
      canonical: `/${locale}/store/${store.slug}`,
      languages: {
        fa: `/fa/store/${store.slug}`,
        en: `/en/store/${store.slug}`,
      },
    },
    robots: { index: true, follow: true },
  };
}



export default async function StoreDetailPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { data: storeData }: { data: StoreType } = await getStore(slug)
  const isFa = locale === 'fa';
  const rating = storeData.rating;
  const resolvedParams = searchParams ? await searchParams : {};
  const currentTab = (resolvedParams?.tab as TabId) || 'products';
  const productsCount = storeData.products?.length ?? 0;
  console.log(storeData);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: storeData.name,
    description: storeData.description || undefined,
    url: `/${locale}/store/${storeData.slug}`,
    image: storeData.logo || storeData.banner || undefined,
    telephone: storeData.phone || undefined,
    email: storeData.email || undefined,
    address: storeData.address
      ? {
        '@type': 'PostalAddress',
        streetAddress: storeData.address,
        addressLocality: storeData.city || undefined,
        addressRegion: storeData.province || undefined,
        addressCountry: 'IR',
      }
      : undefined,
    aggregateRating: rating
      ? {
        '@type': 'AggregateRating',
        ratingValue: rating.avgRating,
        reviewCount: rating.totalReviews,
        bestRating: 5,
        worstRating: 1,
      }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-cyan-500/20">
        <StoreHero store={storeData} />
        <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
              {TABS.map((t) => {
                const active = currentTab === t.id;
                const Icon = t.icon;
                return (
                  <Link
                    key={t.id}
                    href={`?tab=${t.id}`}
                    scroll={false}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 select-none',
                      active
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-xs ring-1 ring-cyan-500/30'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    {t.label}
                    {t.id === 'products' && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                          active
                            ? 'bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {productsCount.toLocaleString('fa-IR')}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Main Content Area */}
            <div className="min-w-0 flex-1 space-y-6">
              {/* Products Tab */}
              {currentTab === 'products' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
                    <h2 className="text-base font-black flex items-center gap-2">
                      <Package className="size-4 text-cyan-600 dark:text-cyan-400" />
                      محصولات فروشگاه
                    </h2>
                    <Link
                      href={`/search?storeId=${storeData.id}`}
                      className={cn('inline-flex items-center gap-1.5 text-xs font-bold hover:underline shrink-0')}
                    >
                      نمایش محصولات
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  {productsCount > 0 ? (
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
                      {storeData.products?.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mb-3">
                        <Package className="size-7" />
                      </div>
                      <p className="text-sm font-bold">هیچ محصولی ثبت نشده است</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        این فروشگاه فعلا محصولی برای عرضه ندارد.
                      </p>
                    </div>
                  )}
                </section>
              )}
              {currentTab === 'about' && (
                <section className="space-y-4">
                  <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
                    <h2 className="text-base font-black flex items-center gap-2">
                      <Info className="size-4 text-cyan-600 dark:text-cyan-400" />
                      درباره {storeData.name}
                    </h2>

                    <p className="text-sm leading-8 text-muted-foreground whitespace-pre-line">
                      {storeData.description || 'توضیحاتی برای این فروشگاه ثبت نشده است.'}
                    </p>

                    {storeData.descriptionEn && (
                      <div className="mt-4 border-t border-border/50 pt-4" dir="ltr">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                          About Store
                        </span>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {storeData.descriptionEn}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile
                      icon={Calendar}
                      label="تاریخ عضویت"
                      value={new Date(storeData.createdAt).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      badgeColor="text-blue-400 dark:text-blue-300 font-bold"
                      iconBgColor="bg-blue-500/15 text-blue-400 dark:text-blue-300"
                      borderColor="border-blue-500/20 hover:border-blue-500/40"
                    />
                    <InfoTile
                      icon={storeData.isActive ? CheckCircle2 : XCircle}
                      label="وضعیت فعالیت"
                      value={storeData.isActive ? 'فعال' : 'غیرفعال'}
                      badgeColor={
                        storeData.isActive
                          ? 'text-pink-400 dark:text-pink-300 font-extrabold'
                          : 'text-rose-400 dark:text-rose-300 font-extrabold'
                      }
                      iconBgColor={
                        storeData.isActive
                          ? 'bg-pink-500/15 text-pink-400 dark:text-pink-300'
                          : 'bg-rose-500/15 text-rose-400 dark:text-rose-300'
                      }
                      borderColor={
                        storeData.isActive
                          ? 'border-pink-500/20 hover:border-pink-500/40'
                          : 'border-rose-500/20 hover:border-rose-500/40'
                      }
                    />
                    {!storeData?.shippingTime && (
                      <InfoTile
                        icon={Truck}
                        label="زمان ارسال کالا"
                        value="۲-۳ روز کاری"
                        badgeColor="text-teal-300 dark:text-teal-300 font-extrabold"
                        iconBgColor="bg-teal-300/15 text-teal-300 dark:text-teal-300"
                        borderColor="border-teal-500/20 hover:border-teal-500/40"
                      />
                    )}
                    {storeData?.hasPhysicalStore !== undefined && (
                      <InfoTile
                        icon={StoreIcon}
                        label="نوع فروشگاه"
                        value={storeData.hasPhysicalStore ? 'فروشگاه حضوری' : 'آنلاین شاپ'}
                        badgeColor={
                          storeData.hasPhysicalStore
                            ? 'text-purple-400 dark:text-purple-300 font-extrabold'
                            : 'text-purple-400 dark:text-purple-300 font-extrabold'
                        }
                        iconBgColor="bg-purple-500/15 text-purple-400 dark:text-purple-300"
                        borderColor="border-purple-500/20 hover:border-purple-500/40"
                      />
                    )}
                    <InfoTile
                      icon={ShieldCheck}
                      label="وضعیت تایید اصالت"
                      value={storeData.isVerified ? 'تایید‌شده و رسمی' : 'در انتظار تایید'}
                      badgeColor={
                        storeData.isVerified
                          ? 'text-amber-400 dark:text-amber-300 font-extrabold'
                          : 'text-orange-400 dark:text-orange-300 font-extrabold'
                      }
                      iconBgColor={
                        storeData.isVerified
                          ? 'bg-amber-500/15 text-amber-400 dark:text-amber-300'
                          : 'bg-orange-500/15 text-orange-400 dark:text-orange-300'
                      }
                      borderColor={
                        storeData.isVerified
                          ? 'border-amber-500/20 hover:border-amber-500/40'
                          : 'border-orange-500/20 hover:border-orange-500/40'
                      }
                    />
                  </div>
                </section>
              )}
              {currentTab === 'ratings' && (
                <section className="space-y-4">
                  <h2 className="text-base font-black">عملکرد و امتیازها</h2>
                  <StoreRatingPanel rating={storeData.rating} />
                </section>
              )}
              {currentTab === 'reviews' && (
                <section className="space-y-4">
                  <h2 className="text-base font-black">نظرات خریداران</h2>
                  {/* <StoreReviewsList reviews={[]} /> */}
                  {!storeData.storeReview.length ?
                    <StoreReviewCard reviews={storeData.storeReview} />
                    :
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/40'
                      )}
                    >
                      <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Store className="size-7" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">هنوز نظری ثبت نشده است</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        اولین نفری باشید که تجربه خود را از این فروشگاه به اشتراک می‌گذارید.
                      </p>
                      <div className='mt-5 w-1/2'>
                        <ReviewForm productId='' store storeId={storeData.id} />
                      </div>
                    </div>
                  }
                </section>
              )}
            </div>

            <div className="w-full shrink-0 space-y-4 lg:w-80">
              <StoreContactCard store={storeData} className="lg:sticky lg:top-20" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  badgeColor,
  iconBgColor,
  borderColor = 'border-border/60 hover:border-primary/20' // مقدار پیش‌فرض
}: {
  iconBgColor?: string;
  icon: typeof Calendar;
  label: string;
  value: string;
  badgeColor?: string;
  borderColor?: string;
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-2xl border bg-card/60 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
      borderColor
    )}>
      <div className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
        iconBgColor ?? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
      )}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
        <div className={cn('mt-0.5 text-xs font-bold truncate', badgeColor ?? 'text-foreground')}>
          {value}
        </div>
      </div>
    </div>
  );
}