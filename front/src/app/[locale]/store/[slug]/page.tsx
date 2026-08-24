import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import StoreDetailClient from './StoreDetailClient';
import { fetchApi } from '@/lib/fetchApi';
import { Store } from '@/services/store.service';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

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

export default async function StoreDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { data: storeData }: { data: Store } = await getStore(slug)
  const isFa = locale === 'fa';
  const rating = storeData.rating;

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
      <StoreDetailClient store={storeData} />
    </>
  );
}
