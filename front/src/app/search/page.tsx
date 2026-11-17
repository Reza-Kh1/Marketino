import type { Metadata } from 'next';
import SearchClient from './SearchClient';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  const title = query
    ? `جستجو برای «${query}» | بازارچه`
    :
    'جستجوی محصولات | بازارچه — پیدا کردن بهترین کالا'

  const description = query
    ?
    `نتایج جستجو برای ${query} در فروشگاه بازارچه. مقایسه قیمت، فیلتر برند و دسته‌بندی، خرید با ارسال سریع.`
    :
    'جستجوی پیشرفته در هزاران محصول بازارچه. فیلتر قیمت با اسلایدر، مرتب‌سازی بر اساس فروش و امتیاز، و خرید مطمئن.'

  return {
    title,
    description,
    keywords: ['جستجو', 'محصولات', 'بازارچه', 'خرید آنلاین', 'فیلتر قیمت', query].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fa_IR',
      siteName: 'بازارچه',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: query ? `/search?q=${encodeURIComponent(query)}` : `/search`,
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

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const query = q?.trim() || '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: query
      ? `نتایج جستجو برای ${query}`
      :
      'جستجوی محصولات بازارچه'
    ,
    description: 'صفحه جستجو و فیلتر محصولات فروشگاه اینترنتی بازارچه',
    url: query ? `/search?q=${encodeURIComponent(query)}` : `/search`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'بازارچه',
      url: '/',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `/search?q={search_term_string}`,
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
          name: 'خانه',
          item: `/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'جستجو',
          item: `/search`,
        },
        ...(query
          ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: query,
              item: `/search?q=${encodeURIComponent(query)}`,
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
          ? `نتایج جستجو برای ${query}`
          :
          'جستجوی محصولات فروشگاه بازارچه'
        },
      </h1>
      <SearchClient initialQuery={query} />
    </>
  );
}
