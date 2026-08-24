import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import ImgTag from '@/components/ImgTag';
import {
  ArrowLeft,
  Award,
  BadgePercent,
  CheckCircle2,
  Flame,
  Package,
  RotateCcw,
  Shield,
  Sparkles,
  Store,
  Truck,
  Users,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import { fetchApi } from '@/lib/fetchApi';
import { ProductEntity } from '@/services/product.service';
import { cn } from '@/lib/utils';
import { CategorysTypes } from '@/services/category.service';
import SectionHeader from './SectionHeader';
import MotionWrapper from '@/components/motion/MotionWrapper';
import ProductCard from '@/components/product/ProductCard';
import { BrandType } from '@/services/brand.service';
import SwiperSlider from '@/components/swiper/SwiperSlider';

interface Props {
  params: Promise<{ locale: string }>;
}

type ProductsPayload = {
  products: ProductEntity[];
  total?: number;
  pages?: number;
};

export const categoryGradients = [
  'from-cyan-500/25 to-blue-500/10 text-cyan-700 dark:text-cyan-300',
  'from-fuchsia-500/25 to-pink-500/10 text-fuchsia-700 dark:text-fuchsia-300',
  'from-amber-500/25 to-orange-500/10 text-amber-700 dark:text-amber-300',
  'from-emerald-500/25 to-teal-500/10 text-emerald-700 dark:text-emerald-300',
  'from-violet-500/25 to-indigo-500/10 text-violet-700 dark:text-violet-300',
  'from-rose-500/25 to-red-500/10 text-rose-700 dark:text-rose-300',
  'from-blue-500/25 to-sky-500/10 text-blue-700 dark:text-blue-300',
  'from-lime-500/25 to-green-500/10 text-lime-700 dark:text-lime-300',
  'from-indigo-500/25 to-purple-500/10 text-indigo-700 dark:text-indigo-300',
  'from-teal-500/25 to-cyan-500/10 text-teal-700 dark:text-teal-300',
  'from-orange-500/25 to-amber-500/10 text-orange-700 dark:text-orange-300',
  'from-pink-500/25 to-rose-500/10 text-pink-700 dark:text-pink-300',
];

const brandAccents = [
  'from-indigo-600 to-violet-600',
  'from-cyan-600 to-blue-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-slate-700 to-slate-900',
  'from-fuchsia-600 to-purple-600',
  'from-sky-600 to-indigo-600',
  'from-lime-600 to-emerald-600',
  'from-red-600 to-rose-600',
];

const TRUST = [
  {
    icon: Truck,
    title: 'ارسال سریع',
    desc: 'تحویل در کمتر از ۴۸ ساعت در شهرهای اصلی',
    tone: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10',
  },
  {
    icon: Shield,
    title: 'ضمانت اصالت',
    desc: 'کالای اصل با گارانتی معتبر فروشنده',
    tone: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
  },
  {
    icon: RotateCcw,
    title: '۷ روز بازگشت',
    desc: 'بازگشت آسان بدون دردسر اداری',
    tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  },
  {
    icon: Award,
    title: 'پشتیبانی واقعی',
    desc: 'پاسخ‌گویی آنلاین از ۹ صبح تا ۱۲ شب',
    tone: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  },
];

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

export const getOffer = async () =>
  safeFetch<ProductsPayload>('search?hasOffer=true&sortBy=price_low&limit=8');

export const getLastProducts = async () =>
  safeFetch<ProductsPayload>('search?limit=10&sortBy=newest');

export const getBrands = async () =>
  safeFetch<BrandType[]>('brand?best=true&limit=12');

export const getFeatured = async () =>
  safeFetch<ProductsPayload>('search?featured=true&limit=4&sortBy=best_selling');

export const getCategorys = async () =>
  safeFetch<CategorysTypes[]>('categories/products?parentId=true');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';

  const title = isFa
    ? 'محصولات | بازارچه — خرید آنلاین با ضمانت اصالت و ارسال سریع'
    : 'Products | Marketino — Shop Online with Authenticity Guarantee';

  const description = isFa
    ? 'ویترین کامل محصولات بازارچه: کالاهای ویژه، تخفیف‌های محدود، برندهای محبوب، پرفروش‌ها و تازه‌ترین‌ها. خرید امن با ضمانت اصالت، ۷ روز بازگشت و ارسال سریع به سراسر ایران.'
    : 'Full Marketino product showcase: featured items, limited deals, popular brands, bestsellers and new arrivals. Secure shopping with authenticity guarantee, 7-day returns and fast shipping.';

  const keywords = isFa
    ? [
      'محصولات بازارچه',
      'خرید آنلاین',
      'فروشگاه اینترنتی',
      'تخفیف ویژه',
      'برندهای معتبر',
      'پرفروش‌ها',
      'ارسال سریع',
      'ضمانت اصالت',
      'بازارچه',
    ]
    : [
      'marketino products',
      'online shop',
      'ecommerce iran',
      'best deals',
      'popular brands',
      'bestsellers',
      'fast shipping',
      'authenticity guarantee',
    ];

  return {
    title,
    description,
    keywords,
    authors: [{ name: isFa ? 'بازارچه' : 'Marketino' }],
    creator: isFa ? 'بازارچه' : 'Marketino',
    publisher: isFa ? 'بازارچه' : 'Marketino',
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isFa ? 'fa_IR' : 'en_US',
      siteName: isFa ? 'بازارچه' : 'Marketino',
      url: `/${locale}/products`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${locale}/products`,
      languages: {
        fa: '/fa/products',
        en: '/en/products',
        'x-default': '/fa/products',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    category: 'shopping',
  };
}

function buildProductListItems(
  products: ProductEntity[] | undefined,
  locale: string,
  start = 1
) {
  if (!products?.length) return [];
  return products.slice(0, 12).map((p, i) => ({
    '@type': 'ListItem',
    position: start + i,
    name: p.title,
    url: `/${locale}/products/${p.slug}`,
    ...(p.images?.[0]?.url
      ? {
        image: p.images[0].url,
      }
      : {}),
  }));
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFa = locale === 'fa';

  const [lastProducts, brandData, offerData, featuredData, categoryData] =
    await Promise.all([
      getLastProducts(),
      getBrands(),
      getOffer(),
      getFeatured(),
      getCategorys(),
    ]);

  const featuredProducts = featuredData?.products ?? [];
  const offerProducts = offerData?.products ?? [];
  const latestProducts = lastProducts?.products ?? [];
  const brands = brandData ?? [];
  const categories = categoryData ?? [];

  const allForLd = [
    ...featuredProducts,
    ...offerProducts,
    ...latestProducts,
  ].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': '/#organization',
        name: isFa ? 'بازارچه' : 'Marketino',
        url: '/',
        logo: '/logo.png',
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': '/#website',
        name: isFa ? 'بازارچه' : 'Marketino',
        url: '/',
        publisher: { '@id': '/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `/${locale}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'CollectionPage',
        '@id': `/${locale}/products#page`,
        name: isFa ? 'محصولات بازارچه' : 'Marketino Products',
        description: isFa
          ? 'لیست و ویترین محصولات فروشگاه اینترنتی بازارچه'
          : 'Product listing and showcase of Marketino online store',
        url: `/${locale}/products`,
        isPartOf: { '@id': '/#website' },
        about: { '@id': '/#organization' },
        mainEntity: {
          '@type': 'ItemList',
          name: isFa ? 'ویترین محصولات' : 'Product showcase',
          itemListOrder: 'https://schema.org/ItemListUnordered',
          numberOfItems: allForLd.length,
          itemListElement: buildProductListItems(allForLd, locale),
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: isFa ? 'خانه' : 'Home',
              item: `/${locale}`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: isFa ? 'محصولات' : 'Products',
              item: `/${locale}/products`,
            },
          ],
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">
        {isFa
          ? 'لیست محصولات فروشگاه اینترنتی بازارچه — خرید آنلاین با ضمانت اصالت'
          : 'Marketino online store product listing — shop with authenticity guarantee'}
      </h1>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/12 via-transparent to-violet-500/12 dark:from-cyan-500/15 dark:to-violet-500/12 pointer-events-none" />
        <div className="absolute -top-28 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-fuchsia-400/15 dark:bg-fuchsia-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-105 h-105 rounded-full bg-blue-400/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-16">
          <nav
            aria-label={isFa ? 'مسیر صفحه' : 'Breadcrumb'}
            className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
          >
            <Link
              href="/"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {isFa ? 'خانه' : 'Home'}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground font-medium">
              {isFa ? 'محصولات' : 'Products'}
            </span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Flame className="w-3.5 h-3.5" />
                {isFa
                  ? 'پیشنهادهای منتخب این هفته'
                  : "This week's curated picks"}
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
                {isFa ? (
                  <>
                    هر چیزی که می‌خوای،{' '}
                    <span className="bg-linear-to-l from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                      یک‌جا در بازارچه
                    </span>
                  </>
                ) : (
                  <>
                    Everything you need,{' '}
                    <span className="bg-linear-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                      in one place
                    </span>
                  </>
                )}
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                {isFa
                  ? 'از کالای دیجیتال تا مد و خانه — بهترین‌ها را با ضمانت اصالت، ارسال سریع و قیمت رقابتی کشف کن. اینجا ویترین منتخب ماست؛ برای جستجوی دقیق به صفحه جستجو برو.'
                  : 'From gadgets to fashion and home — discover the best with authenticity guarantee, fast shipping and competitive prices. This is our curated showcase; head to search for precise results.'}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold px-5 py-2.5 shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98]"
                >
                  {isFa ? 'جستجوی پیشرفته' : 'Advanced search'}
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  href="/search?featured=true"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card hover:bg-muted text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  {isFa ? 'محصولات ویژه' : 'Featured'}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {TRUST.slice(0, 3).map(({ icon: Icon, title }) => (
                  <div
                    key={title}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/80 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    {title}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero mosaic — featured products */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-4 rounded-3xl bg-linear-to-br from-cyan-500/25 to-violet-500/25 blur-2xl" />
                <div className="relative grid grid-cols-2 gap-3 h-full">
                  {featuredProducts.length
                    ? featuredProducts.slice(0, 4).map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        className={cn(
                          'group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-cyan-500/30',
                          i === 0 && 'row-span-2'
                        )}
                      >
                        <ImgTag
                          src={p.images?.[0]?.url}
                          alt={p.title}
                          figureClass="h-full"
                          className="absolute! inset-0! w-full! h-full! object-cover! transition-transform! duration-500! group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                        <div className="absolute bottom-0 inset-x-0 p-3">
                          <p className="text-white text-xs font-bold line-clamp-2 drop-shadow">
                            {p.title}
                          </p>
                          {(Number(p.discountPercent) || 0) > 0 && (
                            <span className="inline-block mt-1 rounded-md bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5">
                              ٪
                              {(Number(p.discountPercent) || 0).toLocaleString(
                                'fa-IR'
                              )}{' '}
                              تخفیف
                            </span>
                          )}
                        </div>
                      </Link>
                    ))
                    : (
                      <div className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/50 text-muted-foreground gap-2 p-6">
                        <ShoppingBag className="w-8 h-8 opacity-40" />
                        <p className="text-sm font-medium">
                          {isFa
                            ? 'به‌زودی محصولات ویژه'
                            : 'Featured products coming soon'}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
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
      {/* ───────── FLASH DEALS (rose theme) ───────── */}
      {offerProducts.length ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="rounded-3xl border border-rose-500/25 bg-linear-to-br from-rose-500/9 via-card to-orange-500/8 p-5 sm:p-8 overflow-hidden relative shadow-sm shadow-rose-500/5">
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-rose-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-10 w-40 h-40 rounded-full bg-orange-400/15 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  <Zap className="w-3 h-3" />
                  {isFa ? 'فروش ویژه محدود' : 'Limited flash sale'}
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isFa ? 'تخفیف‌های آتشین' : 'Hot deals'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isFa
                    ? 'قبل از تمام شدن موجودی، فرصت را از دست نده.'
                    : 'Grab them before stock runs out.'}
                </p>
              </div>
              <Link
                href="/search?hasOffer=true"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0 self-start sm:self-auto"
              >
                {isFa ? 'همه تخفیف‌ها' : 'All deals'}
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
            <MotionWrapper
              preset="slideUpBlur"
              staggerChildren={0.1}
              triggerOnScroll
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {offerProducts.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </MotionWrapper>
          </div>
        </section>
      ) : null}
      {/* ───────── BRANDS (slate / premium) ───────── */}
      {brands.length ? (
        <section className="relative border-y border-slate-500/15 bg-linear-to-b from-slate-500/5 via-muted/15 to-indigo-500/4">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full bg-slate-400/10 blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
            <SectionHeader
              badge={isFa ? 'برندها' : 'Brands'}
              title={
                isFa
                  ? 'از برندهای محبوب خرید کن'
                  : 'Shop from favorite brands'
              }
              subtitle={
                isFa
                  ? 'همکاری با برندهای معتبر داخلی و خارجی — کیفیت تضمین‌شده.'
                  : 'Partnered with trusted local and global brands.'
              }
              href="/search"
              hrefLabel={isFa ? 'همه برندها' : 'All brands'}
              badgeIcon={Award}
              accent="slate"
            />

            {/* Horizontal scroll brands — no ugly swiper dependency */}
            <div className="mt-4 -mx-1">
              <SwiperSlider
                mobileSlides={2.1}
                slidesPerView1280={5}
                showPagination={false}
                spaceBetween={12}
              >
                {brands.map((b, i) => {
                  const initial =
                    (b.nameEn || b.name || '?').trim().charAt(0).toUpperCase() ||
                    '?';
                  const count = b._count?.products;
                  return (
                    <Link
                      key={b.id || b.slug}
                      href={`/search?brand=${encodeURIComponent(b.slug)}`}
                      className="group block w-full rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div
                          className={cn(
                            'relative size-14 rounded-2xl bg-linear-to-br text-white font-black text-lg flex items-center justify-center shadow-md ring-2 ring-white/20 dark:ring-white/10 overflow-hidden shrink-0',
                            brandAccents[i % brandAccents.length]
                          )}
                        >
                          {b.logo ? (
                            <ImgTag
                              src={b.logo}
                              alt={b.name}
                              figureClass="h-full w-full"
                              className="object-contain p-1.5"
                            />
                          ) : (
                            <span className="drop-shadow-sm">{initial}</span>
                          )}
                        </div>
                        <div className="min-w-0 w-full">
                          <div className="text-sm font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {b.name}
                          </div>
                          {typeof count === 'number' && count > 0 ? (
                            <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                              {count.toLocaleString('fa-IR')}{' '}
                              {isFa ? 'محصول' : 'products'}
                            </div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {isFa ? 'مشاهده محصولات' : 'View products'}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </SwiperSlider>
            </div>
          </div>
        </section>
      ) : null}
      {/* ───────── BESTSELLERS / LATEST (amber theme) ───────── */}
      {latestProducts.length ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
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
            accent="amber"
          />
          <div className="-mx-4 sm:mx-0">
            <div className="flex gap-3 overflow-x-auto px-4 sm:px-0 pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
              {latestProducts.map((p) => (
                <div
                  key={p.id}
                  className="snap-start shrink-0 w-40 sm:w-auto"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {/* ───────── TRUST ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <SectionHeader
          badge={isFa ? 'چرا بازارچه؟' : 'Why Marketino?'}
          title={
            isFa ? 'خرید مطمئن، تجربه بهتر' : 'Safer shopping, better experience'
          }
          subtitle={
            isFa
              ? 'چیزهایی که موقع خرید آنلاین واقعاً مهم‌اند.'
              : 'What actually matters when you shop online.'
          }
          badgeIcon={CheckCircle2}
          accent="emerald"
        />
        <MotionWrapper
          preset="slideUpBlur"
          staggerChildren={0.1}
          triggerOnScroll
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {TRUST.map(({ icon: Icon, title, desc, tone }) => (
            <div
              key={title}
              className="h-full rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:border-cyan-500/30 hover:shadow-md"
            >
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center mb-3',
                  tone
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </MotionWrapper>
      </section>
      {/* ───────── CTA ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-linear-to-l from-cyan-600 via-blue-600 to-violet-600 p-6 sm:p-10 text-white shadow-xl shadow-cyan-500/20">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <MotionWrapper preset='slideUpBlur' triggerOnScroll staggerChildren={0.1} className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
                <BadgePercent className="w-3.5 h-3.5" />
                {isFa ? 'عضویت رایگان' : 'Free membership'}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-snug">
                {isFa
                  ? 'اولین خریدت را با کد خوش‌آمدگویی ارزان‌تر تمام کن'
                  : 'Make your first order cheaper with a welcome code'}
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                {isFa
                  ? 'ثبت‌نام کن، کد تخفیف اختصاصی بگیر و از هزاران محصول با ارسال سریع لذت ببر.'
                  : 'Sign up, get your personal discount code, and enjoy thousands of products with fast shipping.'}
              </p>
            </MotionWrapper>
            <MotionWrapper preset='slideUpBlur' triggerOnScroll staggerChildren={0.1} className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-cyan-700 text-sm font-bold px-5 py-2.5 shadow-lg hover:bg-white/90 transition-colors active:scale-[0.98]"
              >
                <Users className="w-4 h-4" />
                {isFa ? 'ثبت‌ نام' : 'Sign up'}
              </Link>
              <Link
                href="/shops"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/20 transition-colors"
              >
                <Store className="w-4 h-4" />
                {isFa ? 'فروشگاه‌ها' : 'Shops'}
              </Link>
            </MotionWrapper>
          </div>
        </div>
      </section>
    </>
  );
}
