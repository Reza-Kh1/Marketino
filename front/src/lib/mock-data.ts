import { delay } from './utils';

export interface Product {
  id: string; title: string; description: string; price: number;
  discountPrice?: number; image: string; images: string[];
  category: string; rating: number; reviewCount: number; stock: number;
  isFeatured: boolean; isNew: boolean; tags: string[];
  seller: { name: string; id: string }; specs: Record<string, string>;
  colors?: string[]; sizes?: string[];
}

export interface Category {
  id: string; name: string; slug: string; icon: string;
  image: string; parentId: string | null; count: number;
}

export interface Banner {
  id: string; title: string; subtitle: string;
  image: string; link: string; ctaText: string;
}

export interface Review {
  id: string; productId: string; userName: string; rating: number;
  title: string; body: string; createdAt: string;
}

const IMG = (cat: string, i: number) =>
  `https://picsum.photos/seed/${cat}${i}/600/600`;

export const mockProducts: Product[] = [
  {
    id: 'p1', title: 'گوشی هوشمند مدل X1 Pro', description: 'صفحه نمایش ۶.۷ اینچی Super AMOLED، حافظه ۲۵۶ گیگابایت، دوربین ۱۰۸ مگاپیکسلی با لرزشگیر اپتیکال، باتری ۵۰۰۰ میلی‌آمپر با شارژ سریع ۶۷ وات',
    price: 24_500_000, discountPrice: 21_990_000,
    image: IMG('phone', 1), images: [IMG('phone', 1), IMG('phone', 2), IMG('phone', 3), IMG('phone', 4)],
    category: 'electronics', rating: 4.7, reviewCount: 234, stock: 15,
    isFeatured: true, isNew: true,
    tags: ['پر فروش', 'تخفیف خورده', 'گارانتی'],
    seller: { name: 'فروشگاه مرکزی', id: 's1' },
    specs: { 'صفحه نمایش': '۶.۷ اینچ Super AMOLED', 'پردازنده': 'Snapdragon 8 Gen 3', 'حافظه': '۲۵۶ گیگ', 'دوربین': '۱۰۸ مگاپیکسل', 'باتری': '۵۰۰۰ میلی‌آمپر' },
    colors: ['مشکی', 'نقره‌ای', 'آبی'], sizes: [],
  },
  {
    id: 'p2', title: 'لپ تاپ ۱۵.۶ اینچی Nitro V', description: 'پردازنده Intel Core i7 نسل ۱۴، ۳۲ گیگ رم DDR5، SSD یک ترابایت NVMe، کارت گرافیک RTX 4060',
    price: 58_000_000, discountPrice: 52_900_000,
    image: IMG('laptop', 1), images: [IMG('laptop', 1), IMG('laptop', 2), IMG('laptop', 3)],
    category: 'electronics', rating: 4.8, reviewCount: 156, stock: 5,
    isFeatured: true, isNew: false,
    tags: ['پرفروش', 'گیمینگ'],
    seller: { name: 'دیجی کالا', id: 's1' },
    specs: { 'پردازنده': 'Core i7-14700H', 'رم': '۳۲ گیگ DDR5', 'حافظه': '۱ ترابایت SSD', 'گرافیک': 'RTX 4060 8GB', 'صفحه': '۱۵.۶ اینچ FHD 165Hz' },
    colors: ['مشکی'], sizes: [],
  },
  {
    id: 'p3', title: 'تیشرت مردانه طرح مینیمال', description: 'جنس نخ پنبه ارگانیک، یقه گرد، دوخت با کیفیت، مناسب استفاده روزمره و مهمانی',
    price: 549_000, discountPrice: 399_000,
    image: IMG('tshirt', 1), images: [IMG('tshirt', 1), IMG('tshirt', 2), IMG('tshirt', 3)],
    category: 'clothing', rating: 4.3, reviewCount: 89, stock: 50,
    isFeatured: true, isNew: true,
    tags: ['فروش ویژه', 'پرفروش'],
    seller: { name: 'مد پوشاک', id: 's2' },
    specs: { 'جنس': '۱۰۰٪ پنبه ارگانیک', 'طرح': 'مینیمال', 'شستشو': 'قابل شستشو با ماشین' },
    colors: ['سفید', 'مشکی', 'طوسی', 'سرمه‌ای'], sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'p4', title: 'میز تحریر چوبی مدرن', description: 'MDF با روکش بلوط طبیعی، طراحی ارگونومیک، دارای کشو و جای کتاب',
    price: 7_800_000,
    image: IMG('furniture', 1), images: [IMG('furniture', 1), IMG('furniture', 2), IMG('furniture', 3)],
    category: 'home', rating: 4.5, reviewCount: 67, stock: 8,
    isFeatured: true, isNew: true,
    tags: ['جدید', 'ارگونومیک'],
    seller: { name: 'خانه مدرن', id: 's3' },
    specs: { 'جنس': 'MDF + روکش بلوط', 'ابعاد': '۱۲۰×۶۰×۷۵ سانتی‌متر', 'وزن': '۲۵ کیلوگرم', 'تعداد کشو': '۳ عدد' },
  },
  {
    id: 'p5', title: 'هدفون بیسیم ANC Pro', description: 'نویز کنسلینگ فعال، ۴۰ ساعت شارژدهی، صدای Hi-Res، اتصال همزمان به دو دستگاه',
    price: 4_200_000, discountPrice: 3_690_000,
    image: IMG('headphone', 1), images: [IMG('headphone', 1), IMG('headphone', 2), IMG('headphone', 3)],
    category: 'electronics', rating: 4.6, reviewCount: 312, stock: 25,
    isFeatured: true, isNew: true,
    tags: ['جدید', 'گارانتی', 'پرفروش'],
    seller: { name: 'فروشگاه مرکزی', id: 's1' },
    specs: { 'نوع': 'Over-Ear بیسیم', 'نویز کنسلینگ': 'Active (ANC)', 'باتری': '۴۰ ساعت', 'کدک': 'LDAC / AAC / SBC' },
    colors: ['مشکی', 'نقره‌ای', 'سرمه‌ای'], sizes: [],
  },
  {
    id: 'p6', title: 'کفش پیاده‌روی حرفه‌ای', description: 'زیره EVA جذب ضربه، رویه مش تنفس‌پذیر، کفی طبی',
    price: 2_890_000, discountPrice: 2_190_000,
    image: IMG('shoe', 1), images: [IMG('shoe', 1), IMG('shoe', 2), IMG('shoe', 3)],
    category: 'clothing', rating: 4.2, reviewCount: 145, stock: 35,
    isFeatured: false, isNew: false,
    tags: ['تخفیف', 'ورزشی'],
    seller: { name: 'اسپرت کالا', id: 's4' },
    specs: { 'جنس رویه': 'مش + چرم مصنوعی', 'زیره': 'EVA', 'نوع': 'پیاده‌روی', 'وزن': '۲۸۰ گرم' },
    colors: ['مشکی', 'طوسی', 'آبی'], sizes: ['39', '40', '41', '42', '43', '44'],
  },
  {
    id: 'p7', title: 'مانیتور گیمینگ ۲۷ اینچ 4K', description: 'وضوح 4K UHD، پنل IPS، نرخ نوسازی ۱۴۴ هرتز، زمان پاسخ‌دهی ۱ms، AMD FreeSync',
    price: 18_900_000, discountPrice: 16_500_000,
    image: IMG('monitor', 1), images: [IMG('monitor', 1), IMG('monitor', 2), IMG('monitor', 3)],
    category: 'electronics', rating: 4.7, reviewCount: 98, stock: 10,
    isFeatured: true, isNew: false,
    tags: ['گیمینگ', 'تخفیف'],
    seller: { name: 'دیجی کالا', id: 's1' },
    specs: { 'سایز': '۲۷ اینچ', 'رزولوشن': '3840×2160 (4K)', 'نرخ نوسازی': '۱۴۴ هرتز', 'پنل': 'IPS', 'زمان پاسخ': '۱ میلی‌ثانیه' },
  },
  {
    id: 'p8', title: 'دستگاه اسپرسوساز اتوماتیک', description: 'پمپ ۲۰ بار، مخزن ۱.۸ لیتری، بخاردهی شیر، مناسب مصارف خانگی و اداری',
    price: 5_600_000,
    image: IMG('coffee', 1), images: [IMG('coffee', 1), IMG('coffee', 2)],
    category: 'home', rating: 4.4, reviewCount: 203, stock: 18,
    isFeatured: true, isNew: false,
    tags: ['پر فروش', 'گارانتی'],
    seller: { name: 'خانه مدرن', id: 's3' },
    specs: { 'فشار پمپ': '۲۰ بار', 'مخزن آب': '۱.۸ لیتر', 'توان': '۱۴۵۰ وات', 'نوع': 'اتوماتیک' },
    colors: ['مشکی', 'استیل'], sizes: [],
  },
  {
    id: 'p9', title: 'تبلت ۱۱ اینچی Pro', description: 'صفحه Liquid Retina، تراشه M2، ۱۲۸ گیگ حافظه، پشتیبانی از Apple Pencil',
    price: 32_000_000, discountPrice: 28_900_000,
    image: IMG('tablet', 1), images: [IMG('tablet', 1), IMG('tablet', 2), IMG('tablet', 3)],
    category: 'electronics', rating: 4.9, reviewCount: 421, stock: 7,
    isFeatured: false, isNew: true,
    tags: ['جدید', 'حرفه‌ای'],
    seller: { name: 'فروشگاه مرکزی', id: 's1' },
    specs: { 'صفحه': '۱۱ اینچ Liquid Retina', 'تراشه': 'Apple M2', 'حافظه': '۱۲۸ گیگ', 'باتری': 'تا ۱۰ ساعت' },
    colors: ['نقره‌ای', 'خاکستری'], sizes: [],
  },
  {
    id: 'p10', title: 'مانتو بهاره طرح مدرن', description: 'جنس کرپ، طرح گلدار مدرن، آستین سه ربع، مناسب مهمانی و روزمره',
    price: 1_290_000, discountPrice: 990_000,
    image: IMG('manto', 1), images: [IMG('manto', 1), IMG('manto', 2)],
    category: 'clothing', rating: 4.1, reviewCount: 72, stock: 45,
    isFeatured: false, isNew: true,
    tags: ['بهاره', 'جدید'],
    seller: { name: 'مد پوشاک', id: 's2' },
    specs: { 'جنس': 'کرپ', 'فصل': 'بهار/تابستان', 'طرح': 'گلدار مدرن' },
    colors: ['صورتی', 'آبی', 'سبز', 'کرم'], sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'p11', title: 'گلدان سرامیکی دست‌ساز', description: 'ارتفاع ۳۵ سانتی‌متر، لعاب مات، طرح مینیمال اسکاندیناوی',
    price: 680_000,
    image: IMG('vase', 1), images: [IMG('vase', 1), IMG('vase', 2)],
    category: 'home', rating: 4.8, reviewCount: 34, stock: 6,
    isFeatured: false, isNew: true,
    tags: ['دست‌ساز', 'خاص'],
    seller: { name: 'هنر سرامیک', id: 's5' },
    specs: { 'ارتفاع': '۳۵ سانتی‌متر', 'جنس': 'سرامیک', 'لعاب': 'مات', 'سبک': 'اسکاندیناوی' },
    colors: ['سفید مات', 'کرم', 'سبز یشمی'], sizes: [],
  },
  {
    id: 'p12', title: 'ماشین لباسشویی ۹ کیلویی', description: 'موتور Inverter کم‌صدا، مصرف انرژی +++A، ۱۴ برنامه شستشو، Steam Wash',
    price: 28_500_000, discountPrice: 25_900_000,
    image: IMG('washer', 1), images: [IMG('washer', 1), IMG('washer', 2)],
    category: 'home', rating: 4.6, reviewCount: 178, stock: 9,
    isFeatured: false, isNew: false,
    tags: ['پرفروش', 'کم مصرف'],
    seller: { name: 'خانه مدرن', id: 's3' },
    specs: { 'ظرفیت': '۹ کیلوگرم', 'موتور': 'Inverter Direct Drive', 'انرژی': '+++A', 'برنامه': '۱۴ برنامه', 'بخارشوی': 'دارد' },
  },
];

export const mockCategories: Category[] = [
  { id: 'electronics', name: 'کالای دیجیتال', slug: 'electronics', icon: '📱', image: IMG('cat-elec', 1), parentId: null, count: 324 },
  { id: 'clothing', name: 'پوشاک', slug: 'clothing', icon: '👕', image: IMG('cat-cloth', 1), parentId: null, count: 567 },
  { id: 'home', name: 'خانه و آشپزخانه', slug: 'home', icon: '🏠', image: IMG('cat-home', 1), parentId: null, count: 892 },
  { id: 'sports', name: 'ورزش و سفر', slug: 'sports', icon: '⚽', image: IMG('cat-sport', 1), parentId: null, count: 234 },
  { id: 'beauty', name: 'زیبایی و سلامت', slug: 'beauty', icon: '💄', image: IMG('cat-beauty', 1), parentId: null, count: 456 },
  { id: 'books', name: 'کتاب و لوازم تحریر', slug: 'books', icon: '📚', image: IMG('cat-book', 1), parentId: null, count: 678 },
  { id: 'toys', name: 'اسباب‌بازی و کودک', slug: 'toys', icon: '🧸', image: IMG('cat-toy', 1), parentId: null, count: 345 },
  { id: 'food', name: 'خوراکی و سوپرمارکت', slug: 'food', icon: '🍫', image: IMG('cat-food', 1), parentId: null, count: 1023 },
];

export const mockBanners: Banner[] = [
  { id: 'b1', title: 'فروش ویژه تابستانه', subtitle: 'تا ۵۰٪ تخفیف برای محصولات منتخب', image: IMG('banner', 1), link: '/products?tag=تخفیف', ctaText: 'مشاهده تخفیف‌ها' },
  { id: 'b2', title: 'تکنولوژی ۲۰۲۶', subtitle: 'جدیدترین گجت‌ها و لوازم الکترونیک', image: IMG('banner', 2), link: '/products?category=electronics', ctaText: 'همین حالا ببین' },
  { id: 'b3', title: 'ارسال رایگان', subtitle: 'برای خریدهای بالای ۵۰۰ هزار تومان', image: IMG('banner', 3), link: '/products', ctaText: 'شروع خرید' },
];

export const mockReviews: Review[] = [
  { id: 'r1', productId: 'p1', userName: 'حسین محمدی', rating: 5, title: 'فوق‌العاده', body: 'کیفیت ساخت عالی، دوربین حرفه‌ای، باتری بسیار خوب. ارزش خرید بالایی داره.', createdAt: '۲۰۲۶-۰۵-۱۵' },
  { id: 'r2', productId: 'p1', userName: 'سارا احمدی', rating: 4, title: 'خوب ولی گرون', body: 'گوشی خوبیه ولی قیمتش یکم بالاست. صفحه نمایش خیلی خوبه.', createdAt: '۲۰۲۶-۰۵-۱۰' },
  { id: 'r3', productId: 'p1', userName: 'علی کریمی', rating: 5, title: 'بهترین خرید', body: 'بعد از دو هفته استفاده، کاملا راضیم. شارژ سریع واقعا عالیه.', createdAt: '۲۰۲۶-۰۴-۲۸' },
  { id: 'r4', productId: 'p2', userName: 'رضا جوادی', rating: 5, title: 'گیمینگ عالی', body: 'با این لپ تاپ همه بازی‌ها رو روی Ultra اجرا می‌کنم. واقعا ارزش خرید داره.', createdAt: '۲۰۲۶-۰۵-۲۰' },
  { id: 'r5', productId: 'p3', userName: 'مریم حسنی', rating: 4, title: 'جنس خوب', body: 'جنسش عالیه و خیلی راحته. رنگش هم دقیقا همون چیزی بود که می‌خواستم.', createdAt: '۲۰۲۶-۰۵-۱۸' },
  { id: 'r6', productId: 'p5', userName: 'امیر رضایی', rating: 5, title: 'هدفون بی‌نظیر', body: 'نویز کنسلینگش واقعا خوبه، توی مترو استفاده می‌کنم و کاملا صدای بیرون قطع میشه.', createdAt: '۲۰۲۶-۰۵-۲۲' },
];

export const testimonials = [
  { name: 'نگار حسینی', role: 'خریدار', text: 'بهترین تجربه خرید آنلاین رو داشتم. ارسال سریع و بسته‌بندی عالی. سایت خیلی حرفه‌ایه.', avatar: '👩🏻', rating: 5 },
  { name: 'محمد جوادی', role: 'فروشنده', text: 'بعد از پیوستن به بازارچه، فروشم ۳ برابر شد. پنل فروشندگی خیلی کار راه بندازه.', avatar: '👨🏻', rating: 5 },
  { name: 'سارا محمدی', role: 'خریدار', text: 'تنوع محصولات فوق‌العاده‌ست. از خرید کتاب تا لوازم خونه رو یه‌جا می‌تونم پیدا کنم.', avatar: '👩🏼', rating: 4 },
];

// Users
const USER_BASE = { name: 'کاربر تست', email: 'user@test.com' };
export const mockUser = { id: 'u1', ...USER_BASE, role: 'user', wallet: 50_000_000 };
export const mockSellerUser = { id: 'u2', ...USER_BASE, email: 'seller@test.com', role: 'seller', wallet: 10_000_000 };
export const mockAdminUser = { id: 'u3', ...USER_BASE, email: 'admin@test.com', role: 'admin', wallet: 100_000_000 };
