import { fetchApi } from '@/lib/fetchApi';
import ProductDetailClient from '../../../../components/product/state';
export const productData = {
    id: "17016927",
    title: "کت زنانه سرژه مدل 228148",
    englishTitle: "Women's Serge Jacket Model 228148",
    brand: "مدل 228148",
    category: ["کت و کاپشن زنانه", "پوشاک زنانه"],

    // امتیازات
    rating: 4.3,
    reviewsCount: 127,

    // قیمت
    price: 2850000,
    discountPercentage: 15,

    // تصاویر
    mainImage: "/images/jacket-main.jpg",
    gallery: [
        "/images/jacket-1.jpg",
        "/images/jacket-2.jpg",
        "/images/jacket-3.jpg",
        "/images/jacket-4.jpg"
    ],

    // ویژگی‌های محصول
    colors: [
        { name: "مشکی", code: "#1a1a1a", inStock: true },
        { name: "کرم", code: "#f5e6d3", inStock: true },
        { name: "خاکی", code: "#8b7d6b", inStock: false },
        { name: "سرمه‌ای", code: "#2c3e50", inStock: true }
    ],

    sizes: [
        { name: "XS", inStock: true },
        { name: "S", inStock: true },
        { name: "M", inStock: true },
        { name: "L", inStock: false },
        { name: "XL", inStock: true },
        { name: "XXL", inStock: false }
    ],

    // توضیحات کامل
    description: "کت زنانه سرژه با طراحی کلاسیک و مدرن، مناسب برای فصل‌های خنک سال. جنس پارچه از نوع سرژه مرغوب با درصد بالای پشم است که گرما و دوام بالایی را به همراه دارد. این کت با طراحی منحصر به فرد خود، انتخابی عالی برای استایل‌های رسمی و نیمه رسمی است.",

    // ویژگی‌های فنی
    specifications: {
        "جنس": "سرژه با کیفیت بالا (۷۰٪ پشم، ۳۰٪ پلی‌استر)",
        "آستر": "پلی‌استر نرم و ضد حساسیت",
        "یقه": "ایستاده با قابلیت تغییر به یقه‌باز",
        "قد": "تا پایین باسن (۶۵ سانتیمتر)",
        "آستین": "بلند با سرآستین دکمه‌دار",
        "جیب": "دو جیب جلو با دکمه و دو جیب داخلی",
        "دکمه": "۳ دکمه جلو با طراحی خاص",
        "وزن": "۷۵۰ گرم",
        "شماره مدل": "228148"
    },

    // ویژگی‌های برجسته
    highlights: [
        "طراحی کلاسیک و مدرن",
        "پارچه سرژه با کیفیت بالا",
        "مناسب برای فصل‌های خنک",
        "قابل شستشو در ماشین لباسشویی",
        "مقاوم در برابر چروک"
    ],

    // خدمات
    services: {
        expressDelivery: true, // تحویل اکسپرس
        cashOnDelivery: true, // پرداخت در محل
        sevenDayReturn: true, // ۷ روز ضمانت بازگشت
        authenticityGuarantee: true // ضمانت اصل بودن
    },

    seller: "فروشگاه اینترنتی دیجی‌کالا",
    sellerRating: 4.8,
    sellerReviews: 15234,
    guarantee: "گارانتی اصالت و سلامت فیزیکی کالا",
    warranty: "۱۸ ماه گارانتی خدمات پس از فروش",

    // نظرات کاربران
    reviews: [
        {
            id: 1,
            user: "سارا محمدی",
            rating: 5,
            date: "۱۴۰۲/۱۰/۱۵",
            title: "عالی بود!",
            comment: "کت بسیار باکیفیت و خوش‌دوختیه. جنس پارچه عالی و دقیقاً مطابق عکس بود. اندازه‌اش هم دقیقاً اندازه خودم بود. پیشنهاد میکنم حتماً تهیه کنید.",
            likes: 24,
            dislikes: 2,
            images: ["/review-1.jpg"],
            sellerResponse: "سپاس از شما، خوشحالیم که راضی بودید."
        },
        {
            id: 2,
            user: "مریم احمدی",
            rating: 4,
            date: "۱۴۰۲/۱۰/۱۲",
            title: "کیفیت خوب، اما سایز کمی بزرگ",
            comment: "جنس پارچه واقعاً خوبه و طراحی زیبایی داره. تنها نکته اینه که سایز M کمی بزرگتر از حد معموله، پیشنهاد میکنم یک سایز کوچکتر انتخاب کنید.",
            likes: 18,
            dislikes: 3,
            images: [],
            sellerResponse: "ممنون از نظر شما، سایزبندی محصولات ما استاندارده اما راهنمای سایز در صفحه موجود است."
        },
        {
            id: 3,
            user: "زهرا کریمی",
            rating: 5,
            date: "۱۴۰۲/۱۰/۱۰",
            title: "دقیقاً همون چیزی که می‌خواستم",
            comment: "کت رو برای مهمانی تهیه کردم و واقعاً عالی بود. پارچه لطیف و دوخت بسیار تمیزی داشت. همه از استایلم تعریف کردند.",
            likes: 32,
            dislikes: 1,
            images: ["/review-3.jpg", "/review-3-2.jpg"],
            sellerResponse: "بسیار خوشحالیم که رضایت داشتید."
        },
        {
            id: 4,
            user: "نیلوفر رضایی",
            rating: 3,
            date: "۱۴۰۲/۱۰/۰۸",
            title: "متوسط",
            comment: "رنگ محصول کمی با عکس تفاوت داشت و جنس پارچه کمی زبرتر از چیزی بود که انتظار داشتم. البته دوخت خوب بود.",
            likes: 7,
            dislikes: 12,
            images: [],
            sellerResponse: "با عرض پوزش، کیفیت محصولات ما تضمینی است و در صورت نارضایتی امکان بازگشت وجود دارد."
        }
    ],

    // محصولات مرتبط
    relatedProducts: [
        { id: 1, name: "شلوار جین زنانه اسلیم", price: 1200000, discount: 10, image: "/related1.jpg", rating: 4.5 },
        { id: 2, name: "بلوز پشمی زنانه", price: 980000, discount: 0, image: "/related2.jpg", rating: 4.2 },
        { id: 3, name: "مانتو پاییزه زنانه", price: 1850000, discount: 20, image: "/related3.jpg", rating: 4.7 },
        { id: 4, name: "شال گردن پشمی", price: 450000, discount: 0, image: "/related4.jpg", rating: 4.0 }
    ],

    // سوالات متداول
    faqs: [
        {
            question: "آیا این کت قابل شستشو در ماشین لباسشویی است؟",
            answer: "بله، این کت قابل شستشو در ماشین لباسشویی با برنامه شستشوی پشم و آب سرد است."
        },
        {
            question: "آیا امکان تعویض سایز وجود دارد؟",
            answer: "بله، تا ۷ روز پس از تحویل کالا امکان تعویض سایز با هماهنگی با پشتیبانی وجود دارد."
        },
        {
            question: "زمان ارسال چقدر است؟",
            answer: "ارسال معمولی ۲ تا ۳ روز کاری و ارسال اکسپرس ۲۴ ساعته است."
        }
    ]
};

interface ProductPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function getData(slug: string) {
    return fetchApi({ url: `products/${slug}`, revalidate: 5000, tags: ['products', slug] })
}

export async function generateMetadata() {
    const product = productData;
    return {
        title: `خرید ${product.title} | قیمت و مشخصات | دیجی‌کالا`,
        description: product.description,
        keywords: `${product.title}, کت زنانه, پوشاک زنانه, مدل ${product.brand}`,
        openGraph: {
            title: product.title,
            description: product.description,
            images: [product.mainImage],
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug, locale } = await params;
    const data = await getData(slug)
    console.log(data);

    const product = productData;
    const discountedPrice = Math.round(product.price * (1 - product.discountPercentage / 100));

    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description,
        brand: { "@type": "Brand", name: product.brand },
        offers: {
            "@type": "Offer",
            price: discountedPrice,
            priceCurrency: "IRR",
            availability: "https://schema.org/InStock",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewsCount,
        },
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