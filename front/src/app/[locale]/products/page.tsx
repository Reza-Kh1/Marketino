import { Metadata } from 'next';
import ProductDetailClient from '../../../components/product/state';

// دیتای موقت و استاتیک محصول
const dummyProduct = {
  id: "232157",
  title: "تونیک زنانه سرژه مدل 232157",
  englishTitle: "Serje Women's Tunic Model 232157",
  price: 890000,
  discountPrice: 650000,
  discountPercentage: 27,
  inStock: true,
  stockCount: 4,
  sku: "SERJE-232157",
  rating: 4.6,
  reviewsCount: 18,
  brand: "سرژه (Serje)",
  category: "تونیک و شومیز زنانه",
  images: [
    "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"
  ],
  colors: [
    { name: "مشکی فضایی", code: "#0B0F19", available: true },
    { name: "آبی نئون", code: "#2563EB", available: true },
    { name: "شرابی دئپ", code: "#881337", available: false }
  ],
  sizes: ["S", "M", "L", "XL"],
  description: "تونیک زنانه سرژه مدل 232157 با پارچه کرپ باکیفیت و دوخت صنعتی درجه یک طراحی شده است. تن‌خور این کار آزاد و راحت بوده و برای استایل‌های کژوال و نیمه‌رسمی در تمامی فصول سال انتخابی بسیار هوشمندانه است.",
  specifications: [
    { key: "جنس پارچه", value: "کرپ حریر درجه یک" },
    { key: "قد لباس", value: "۸۵ سانتی‌متر" },
    { key: "نوع یقه", value: "گرد ایستاده" },
    { key: "نحوه بسته‌شدن", value: "دکمه مخفی پشت یقه" },
    { key: "کشور تولیدکننده", value: "ایران" }
  ]
};

// سئوی پیشرفته (Open Graph + Meta Tags)
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `قیمت و خرید ${dummyProduct.title} | فروشگاه لباس`,
    description: dummyProduct.description.slice(0, 150),
    openGraph: {
      title: dummyProduct.title,
      description: dummyProduct.description,
      images: [{ url: dummyProduct.images[0] }],
      type: 'article',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default function ProductPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: dummyProduct.title,
    image: dummyProduct.images,
    description: dummyProduct.description,
    sku: dummyProduct.sku,
    brand: {
      '@type': 'Brand',
      name: dummyProduct.brand,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: dummyProduct.discountPrice * 10, // تبدیل به ریال برای اسکیما
      availability: dummyProduct.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: dummyProduct.rating,
      reviewCount: dummyProduct.reviewsCount,
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient />
    </>
  );
}