import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import SearchClient from './SearchClient';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const isFa = locale === 'fa';
  const query = q?.trim();

  const title = query
    ? isFa
      ? `جستجو برای «${query}» | بازارچه`
      : `Search results for “${query}” | Marketino`
    : isFa
      ? 'جستجوی محصولات | بازارچه — پیدا کردن بهترین کالا'
      : 'Product Search | Marketino — Find the best deals';

  const description = query
    ? isFa
      ? `نتایج جستجو برای ${query} در فروشگاه بازارچه. مقایسه قیمت، فیلتر برند و دسته‌بندی، خرید با ارسال سریع.`
      : `Search results for ${query} on Marketino. Compare prices, filter by brand and category, fast shipping.`
    : isFa
      ? 'جستجوی پیشرفته در هزاران محصول بازارچه. فیلتر قیمت با اسلایدر، مرتب‌سازی بر اساس فروش و امتیاز، و خرید مطمئن.'
      : 'Advanced search across thousands of Marketino products. Price range slider, sort by sales and rating, secure checkout.';

  return {
    title,
    description,
    keywords: isFa
      ? ['جستجو', 'محصولات', 'بازارچه', 'خرید آنلاین', 'فیلتر قیمت', query].filter(Boolean) as string[]
      : ['search', 'products', 'marketino', 'online shop', 'price filter', query].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isFa ? 'fa_IR' : 'en_US',
      siteName: isFa ? 'بازارچه' : 'Marketino',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: query ? `/${locale}/search?q=${encodeURIComponent(query)}` : `/${locale}/search`,
      languages: {
        fa: query ? `/fa/search?q=${encodeURIComponent(query)}` : '/fa/search',
        en: query ? `/en/search?q=${encodeURIComponent(query)}` : '/en/search',
      },
    },
    robots: {
      index: !query, // generic search indexable; query pages often noindex in big shops — keep indexed for marketing
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const isFa = locale === 'fa';
  const query = q?.trim() || '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: query
      ? isFa
        ? `نتایج جستجو برای ${query}`
        : `Search results for ${query}`
      : isFa
        ? 'جستجوی محصولات بازارچه'
        : 'Marketino product search',
    description: isFa
      ? 'صفحه جستجو و فیلتر محصولات فروشگاه اینترنتی بازارچه'
      : 'Product search and filter page of Marketino online store',
    url: query ? `/${locale}/search?q=${encodeURIComponent(query)}` : `/${locale}/search`,
    isPartOf: {
      '@type': 'WebSite',
      name: isFa ? 'بازارچه' : 'Marketino',
      url: '/',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `/${locale}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
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
          name: isFa ? 'جستجو' : 'Search',
          item: `/${locale}/search`,
        },
        ...(query
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: query,
                item: `/${locale}/search?q=${encodeURIComponent(query)}`,
              },
            ]
          : []),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">
        {query
          ? isFa
            ? `نتایج جستجو برای ${query}`
            : `Search results for ${query}`
          : isFa
            ? 'جستجوی محصولات فروشگاه بازارچه'
            : 'Marketino product search'}
      </h1>
      <SearchClient initialQuery={query} />
    </>
  );
}
