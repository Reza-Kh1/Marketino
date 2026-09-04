import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { fetchApi } from '@/lib/fetchApi';
import StoreHero from '@/components/store/StoreHero';
import { CheckCircle2, Info, LayoutGrid, MessageSquare, Package, Star, XCircle, Calendar, ArrowLeft, Truck, ShieldCheck, Store as StoreIcon, Store, Clock, } from 'lucide-react';
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
  searchParams?: Promise<{ tab?: string }>;
};

type TabId = 'products' | 'about' | 'ratings' | 'reviews';
const TABS: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'محصولات', icon: LayoutGrid },
  { id: 'about', label: 'درباره فروشگاه', icon: Info },
  { id: 'ratings', label: 'امتیاز و عملکرد', icon: Star },
  { id: 'reviews', label: 'نظرات', icon: MessageSquare },
];
export async function getStore(slug: string) {
  const res = await fetchApi({ url: `stores/${slug}`, cache: 'no-cache' });
  if (res.status === 404) {
    notFound();
  }
  if (!res.success) {
    throw new Error(`Failed to load store: ${res.status}`);
  }
  return res;
}

// ----------------------------------------------------
// 1. dynamic Metadata Function with Comprehensive SEO
// ----------------------------------------------------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const { data: store } = await getStore(slug);
  const isFa = locale === 'fa';

  if (!store) {
    return {
      title: isFa ? 'فروشگاه یافت نشد' : 'Store not found',
      robots: { index: false, follow: false },
    };
  }

  const storeName = isFa ? store.name : store.nameEn || store.name;
  const siteName = isFa ? 'بازارچه' : 'Marketino';

  const title = `${storeName} | ${isFa ? 'خرید انلاین و لیست قیمت محصولات' : 'Online Store'} | ${siteName}`;
  const rawDescription = isFa ? store.description : store.descriptionEn || store.description;
  const description =
    rawDescription?.trim() ||
    (isFa
      ? `مشاهده لیست قیمت، محصولات، امتیاز و نظرات مشتریان فروشگاه ${store.name} در ${siteName}.`
      : `View products, ratings and reviews for ${storeName} on ${siteName}.`);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const canonicalUrl = `${baseUrl}/${locale}/store/${store.slug}`;

  const storeImages = [];
  if (store.logo) storeImages.push({ url: store.logo, alt: store.name });
  if (store.banner) storeImages.push({ url: store.banner, alt: `${store.name} banner` });

  return {
    title,
    description: description.slice(0, 160),
    keywords: [
      store.name,
      store.nameEn,
      'فروشگاه آنلاین',
      'خرید آنلاین',
      store.city,
      store.province,
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'fa-IR': `${baseUrl}/fa/store/${store.slug}`,
        'en-US': `${baseUrl}/en/store/${store.slug}`,
      },
    },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: canonicalUrl,
      siteName,
      type: 'profile',
      locale: isFa ? 'fa_IR' : 'en_US',
      images: storeImages.length > 0 ? storeImages : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 160),
      images: store.banner || store.logo ? [(store.banner || store.logo)!] : [],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

// ----------------------------------------------------
// 2. Main Page Component
// ----------------------------------------------------
export default async function StoreDetailPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { data: storeData }: { data: StoreType } = await getStore(slug);
  const isFa = locale === 'fa';
  const rating = storeData.rating;
  const resolvedParams = searchParams ? await searchParams : {};
  const currentTab = (resolvedParams?.tab as TabId) || 'products';
  const productsCount = storeData.products?.length ?? 0;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  // ----------------------------------------------------
  // Rich Structured Data (JSON-LD Schema)
  // ----------------------------------------------------
  const sameAsSocials = [
    storeData.instagram ? `https://instagram.com/${storeData.instagram}` : null,
    storeData.telegram ? `https://t.me/${storeData.telegram}` : null,
    storeData.whatsApp ? `https://wa.me/${storeData.whatsApp}` : null,
    storeData.bale ? `https://ble.ir/${storeData.bale}` : null,
    storeData.robika ? `https://rubika.ir/${storeData.robika}` : null,
  ].filter(Boolean);

  const jsonLdStore = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${baseUrl}/${locale}/store/${storeData.slug}#store`,
    name: storeData.name,
    alternateName: storeData.nameEn || undefined,
    description: storeData.description || undefined,
    url: `${baseUrl}/${locale}/store/${storeData.slug}`,
    logo: storeData.logo || undefined,
    image: storeData.banner || storeData.logo || undefined,
    telephone: storeData.phone || undefined,
    email: storeData.email || undefined,
    sameAs: sameAsSocials.length > 0 ? sameAsSocials : undefined,
    address: storeData.address
      ? {
        '@type': 'PostalAddress',
        streetAddress: storeData.address,
        addressLocality: storeData.city || undefined,
        addressRegion: storeData.province || undefined,
        addressCountry: 'IR',
      }
      : undefined,
    aggregateRating: rating?.totalReviews
      ? {
        '@type': 'AggregateRating',
        ratingValue: rating.avgRating || rating.productQuality || 5,
        reviewCount: rating.totalReviews,
        bestRating: 5,
        worstRating: 1,
      }
      : undefined,
    hasOfferCatalog: storeData.products?.length
      ? {
        '@type': 'OfferCatalog',
        name: `محصولات ${storeData.name}`,
        itemListElement: storeData.products.map((p, index) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: p.title,
            image: p.images?.[0]?.url || undefined,
            offers: {
              '@type': 'Offer',
              price: p.minPrice,
              priceCurrency: 'IRR',
              availability: 'https://schema.org/InStock',
            },
          },
          position: index + 1,
        })),
      }
      : undefined,
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isFa ? 'خانه' : 'Home',
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isFa ? 'فروشگاه‌ها' : 'Stores',
        item: `${baseUrl}/${locale}/stores`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: storeData.name,
        item: `${baseUrl}/${locale}/store/${storeData.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStore) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <main className="min-h-screen bg-background text-foreground antialiased selection:bg-cyan-500/20">
        {/* هدر و مشخصات کلی فروشگاه */}
        <StoreHero store={storeData} />

        {/* منوی تب‌ها */}
        <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav aria-label="Store Tabs" className="flex gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
              {TABS.map((t) => {
                const active = currentTab === t.id;
                const Icon = t.icon;
                return (
                  <Link
                    key={t.id}
                    href={`?tab=${t.id}`}
                    scroll={false}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 select-none',
                      active
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-xs ring-1 ring-cyan-500/30'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    {t.label}
                    {t.id === 'reviews' && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                          active
                            ? 'bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {storeData?._count?.storeReview?.toLocaleString('fa-IR') ?? 0}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* بخش اصلی محتوا */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">

            {/* باکس محتوای زبانه انتخاب شده */}
            <div className="min-w-0 flex-1 space-y-6">

              {/* تب محصولات */}
              {currentTab === 'products' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
                    <h1 className="text-base font-black flex items-center gap-2">
                      <Package className="size-4 text-cyan-600 dark:text-cyan-400" />
                      محصولات {storeData.name}
                    </h1>
                    <Link
                      href={`/search?storeId=${storeData.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:underline shrink-0"
                    >
                      مشاهده همه در جستجو
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
                        این فروشگاه فعلاً محصولی برای عرضه ندارد.
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* تب درباره فروشگاه */}
              {currentTab === 'about' && (
                <section className="space-y-4">
                  <article className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
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
                  </article>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile
                      icon={Calendar}
                      label="تاریخ عضویت"
                      value={new Date(storeData.createdAt).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      badgeColor="text-blue-500 dark:text-blue-300 font-bold"
                      iconBgColor="bg-blue-500/15 text-blue-500 dark:text-blue-300"
                      borderColor="border-blue-500/20 hover:border-blue-500/40"
                    />

                    {storeData.workingHours && (
                      <InfoTile
                        icon={Clock}
                        label="ساعات کاری"
                        value={storeData.workingHours}
                        badgeColor="text-emerald-500 dark:text-emerald-300 font-bold"
                        iconBgColor="bg-emerald-500/15 text-emerald-500 dark:text-emerald-300"
                        borderColor="border-emerald-500/20 hover:border-emerald-500/40"
                      />
                    )}

                    <InfoTile
                      icon={storeData.isActive ? CheckCircle2 : XCircle}
                      label="وضعیت فعالیت"
                      value={storeData.isActive ? 'فعال' : 'غیرفعال'}
                      badgeColor={
                        storeData.isActive
                          ? 'text-emerald-500 dark:text-emerald-400 font-extrabold'
                          : 'text-rose-500 dark:text-rose-400 font-extrabold'
                      }
                      iconBgColor={
                        storeData.isActive
                          ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-500 dark:text-rose-400'
                      }
                      borderColor={
                        storeData.isActive
                          ? 'border-emerald-500/20 hover:border-emerald-500/40'
                          : 'border-rose-500/20 hover:border-rose-500/40'
                      }
                    />

                    <InfoTile
                      icon={Truck}
                      label="زمان ارسال کالا"
                      value={storeData.shippingTime || '۲-۳ روز کاری'}
                      badgeColor="text-teal-500 dark:text-teal-300 font-extrabold"
                      iconBgColor="bg-teal-500/15 text-teal-500 dark:text-teal-300"
                      borderColor="border-teal-500/20 hover:border-teal-500/40"
                    />

                    {storeData.hasPhysicalStore !== undefined && (
                      <InfoTile
                        icon={StoreIcon}
                        label="نوع فروشگاه"
                        value={storeData.hasPhysicalStore ? 'فروشگاه حضوری و آنلاین' : 'آنلاین شاپ'}
                        badgeColor="text-purple-500 dark:text-purple-300 font-extrabold"
                        iconBgColor="bg-purple-500/15 text-purple-500 dark:text-purple-300"
                        borderColor="border-purple-500/20 hover:border-purple-500/40"
                      />
                    )}

                    <InfoTile
                      icon={ShieldCheck}
                      label="وضعیت تایید اصالت"
                      value={storeData.isVerified ? 'تایید‌شده و رسمی' : 'در انتظار تایید'}
                      badgeColor={
                        storeData.isVerified
                          ? 'text-amber-500 dark:text-amber-300 font-extrabold'
                          : 'text-orange-500 dark:text-orange-300 font-extrabold'
                      }
                      iconBgColor={
                        storeData.isVerified
                          ? 'bg-amber-500/15 text-amber-500 dark:text-amber-300'
                          : 'bg-orange-500/15 text-orange-500 dark:text-orange-300'
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

              {/* تب امتیاز و عملکرد */}
              {currentTab === 'ratings' && (
                <section className="space-y-4">
                  <h2 className="text-base font-black">عملکرد و امتیازها</h2>
                  <StoreRatingPanel rating={storeData.rating} />
                </section>
              )}

              {/* تب نظرات */}
              {currentTab === 'reviews' && (
                <section className="space-y-4">
                  <h2 className="text-base font-black">نظرات خریداران</h2>
                  {storeData.storeReview && storeData.storeReview.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between flex-col sm:flex-row rounded-2xl border border-dashed border-border/60 p-6 text-center bg-gradient-to-br from-card/40 to-card/10">
                        <div className="flex flex-col gap-1 sm:flex-row sm:gap-2 justify-center items-center mb-3 sm:mb-0">
                          <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-400">
                            <Store className="size-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              تجربه خود را با ما به اشتراک بگذارید
                            </h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground max-w-sm">
                              نظرات شما به بهبود خدمات ما کمک می‌کند.
                            </p>
                          </div>
                        </div>
                        <div className="min-w-40">
                          <ReviewForm productId="" store storeId={storeData.id} />
                        </div>
                      </div>
                      <StoreReviewCard reviews={storeData.storeReview} />
                      <StoreReviewsList
                        storeId={storeData.id}
                        getData={storeData._count.storeReview > 10}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/40">
                      <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Store className="size-7" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">هنوز نظری ثبت نشده است</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        اولین نفری باشید که تجربه خود را از این فروشگاه به اشتراک می‌گذارید.
                      </p>
                      <div className="mt-5 w-full sm:w-1/2">
                        <ReviewForm productId="" store storeId={storeData.id} />
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* کارت اطلاعات تماس و کارت جانبی */}
            <aside className="w-full shrink-0 space-y-4 lg:w-80">
              <StoreContactCard store={storeData} className="lg:sticky lg:top-20" />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  badgeColor,
  iconBgColor,
  borderColor = 'border-border/60 hover:border-primary/20',
}: {
  iconBgColor?: string;
  icon: typeof Calendar;
  label: string;
  value: string;
  badgeColor?: string;
  borderColor?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-card/60 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]',
        borderColor
      )}
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
          iconBgColor ?? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <span className="text-[11px] font-medium text-muted-foreground block">{label}</span>
        <span className={cn('mt-0.5 text-xs font-bold truncate block', badgeColor ?? 'text-foreground')}>
          {value}
        </span>
      </div>
    </div>
  );
}