/**
 * Prisma Seed - داده‌های اولیه دیتابیس
 * اجرا: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// آدرس‌های عکس محصولات
const IMAGE_PATHS = [
  'marketino/image/2026/07/images-1-853487-2020.jpg',
  'marketino/image/2026/07/images-10-817629-1874.jpg',
  'marketino/image/2026/07/images-11-816559-3402.jpg',
  'marketino/image/2026/07/images-12-815550-8157.jpg',
  'marketino/image/2026/07/images-13-818376-8872.jpg',
  'marketino/image/2026/07/images-14-814312-8790.jpg',
  'marketino/image/2026/07/images-15-813758-9368.jpg',
  'marketino/image/2026/07/images-2-852916-9207.jpg',
  'marketino/image/2026/07/images-3-851310-1553.jpg',
  'marketino/image/2026/07/images-4-851822-9497.jpg',
  'marketino/image/2026/07/images-5-850293-7598.jpg',
  'marketino/image/2026/07/images-6-849343-1990.jpg',
  'marketino/image/2026/07/images-7-820836-5261.jpg',
  'marketino/image/2026/07/images-8-819756-8033.jpg',
  'marketino/image/2026/07/images-854433-3345.jpg',
  'marketino/image/2026/07/images-9-820133-6613.jpg',
];

// انتخاب رندوم از آدرس‌های عکس
function getRandomImage(seed: number): string {
  const index = seed % IMAGE_PATHS.length;
  return IMAGE_PATHS[index];
}

async function main() {
  console.log('🌱 شروع seeding دیتابیس...');

  // ============================================
  // ۱. تنظیمات سایت
  // ============================================
  const siteSettings = [
    { key: 'site_name', value: 'بازارچه آنلاین', type: 'string' },
    { key: 'site_name_en', value: 'Online Marketplace', type: 'string' },
    { key: 'site_description', value: 'بازارچه آنلاین - خرید و فروش محصولات', type: 'string' },
    { key: 'site_description_en', value: 'Online Marketplace - Buy and Sell Products', type: 'string' },
    { key: 'site_logo', value: '/images/logo.svg', type: 'string' },
    { key: 'site_favicon', value: '/favicon.ico', type: 'string' },
    { key: 'contact_email', value: 'info@marketplace.com', type: 'string' },
    { key: 'contact_phone', value: '021-12345678', type: 'string' },
    { key: 'contact_address', value: 'تهران، ایران', type: 'string' },
    { key: 'social_instagram', value: '', type: 'string' },
    { key: 'social_telegram', value: '', type: 'string' },
    { key: 'social_twitter', value: '', type: 'string' },
    { key: 'currency', value: 'تومان', type: 'string' },
    { key: 'currency_symbol', value: 'تومان', type: 'string' },
    { key: 'free_shipping_threshold', value: '500000', type: 'number' },
    { key: 'commission_rate', value: '10', type: 'number' },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type },
      create: setting,
    });
  }
  console.log('✅ تنظیمات سایت ایجاد شد');

  // ============================================
  // ۲. کاربران (ادمین، فروشنده، خریدار)
  // ============================================
  const adminPassword = await bcrypt.hash('123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'r.khani1385.66@gmail.com',
      password: adminPassword,
      firstName: 'مدیر',
      lastName: 'سیستم',
      role: 'admin',
      isSuperAdmin: true,
      permissions: JSON.stringify(['all']),
      isVerified: true,
      emailVerified: true,
      hasSetPassword: true,
      isActive: true,
    },
  });
  console.log('✅ کاربر ادمین ایجاد شد');

  // ایجاد چند فروشنده نمونه
  const sellers: any[] = [];
  const sellerNames = [
    { username: 'seller1', name: 'فروشنده نمونه', store: 'فروشگاه نمونه', email: 'seller@marketplace.com' },
    { username: 'seller_tech', name: 'فروشگاه تکنولوژی', store: 'تک شاپ', email: 'tech@shop.com' },
    { username: 'seller_fashion', name: 'فروشگاه مد', store: 'مد روز', email: 'fashion@shop.com' },
    { username: 'seller_home', name: 'فروشگاه خانه', store: 'خانه زیبا', email: 'home@shop.com' },
    { username: 'seller_sport', name: 'فروشگاه ورزش', store: 'اسپورت شاپ', email: 'sport@shop.com' },
  ];

  for (const s of sellerNames) {
    const sellerPassword = await bcrypt.hash('seller123', 12);
    const seller = await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        username: s.username,
        email: s.email,
        password: sellerPassword,
        firstName: s.name.split(' ')[0],
        lastName: s.name.split(' ')[1] || '',
        role: 'seller',
        sellerStatus: 'approved',
        storeName: s.store,
        storeDescription: `${s.store} - بهترین محصولات`,
        commissionRate: 10,
        isVerified: true,
        emailVerified: true,
        hasSetPassword: true,
        isActive: true,
      },
    });
    sellers.push(seller);
  }
  console.log(`✅ ${sellers.length} فروشنده ایجاد شد`);

  // ایجاد چند خریدار نمونه
  const buyers: any[] = [];
  const buyerNames = [
    { username: 'buyer1', name: 'خریدار نمونه', email: 'buyer@marketplace.com' },
    { username: 'buyer_ali', name: 'علی محمدی', email: 'ali@email.com' },
    { username: 'buyer_sara', name: 'سارا احمدی', email: 'sara@email.com' },
    { username: 'buyer_reza', name: 'رضا کریمی', email: 'reza@email.com' },
    { username: 'buyer_mina', name: 'مینا حسینی', email: 'mina@email.com' },
    { username: 'buyer_hossein', name: 'حسین رضایی', email: 'hossein@email.com' },
    { username: 'buyer_zahra', name: 'زهرا موسوی', email: 'zahra@email.com' },
    { username: 'buyer_amir', name: 'امیر جعفری', email: 'amir@email.com' },
  ];

  for (const b of buyerNames) {
    const buyerPassword = await bcrypt.hash('buyer123', 12);
    const buyer = await prisma.user.upsert({
      where: { username: b.username },
      update: {},
      create: {
        username: b.username,
        email: b.email,
        password: buyerPassword,
        firstName: b.name.split(' ')[0],
        lastName: b.name.split(' ').slice(1).join(' '),
        role: 'buyer',
        isVerified: true,
        emailVerified: true,
        hasSetPassword: true,
        isActive: true,
      },
    });
    buyers.push(buyer);
  }
  console.log(`✅ ${buyers.length} خریدار ایجاد شد`);

  // ============================================
  // ۳. دسته‌بندی‌ها
  // ============================================
  const categoriesData = [
    { name: 'الکترونیک', nameEn: 'Electronics', slug: 'electronics', icon: '📱', sortOrder: 1 },
    { name: 'مد و پوشاک', nameEn: 'Fashion', slug: 'fashion', icon: '👗', sortOrder: 2 },
    { name: 'خانه و آشپزخانه', nameEn: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠', sortOrder: 3 },
    { name: 'کتاب و لوازم تحریر', nameEn: 'Books & Stationery', slug: 'books', icon: '📚', sortOrder: 4 },
    { name: 'ورزش و سفر', nameEn: 'Sports & Travel', slug: 'sports', icon: '⚽', sortOrder: 5 },
    { name: 'زیبایی و سلامت', nameEn: 'Beauty & Health', slug: 'beauty', icon: '💄', sortOrder: 6 },
    { name: 'اسباب بازی و کودک', nameEn: 'Toys & Kids', slug: 'toys', icon: '🧸', sortOrder: 7 },
    { name: 'خودرو و موتور', nameEn: 'Auto & Moto', slug: 'auto', icon: '🚗', sortOrder: 8 },
  ];

  const createdCategories: any[] = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        nameEn: cat.nameEn,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    createdCategories.push(category);
  }

  // زیردسته‌های الکترونیک
  const electronicsSubs = [
    { name: 'موبایل', nameEn: 'Mobile Phones', slug: 'mobile-phones', parentId: createdCategories[0].id },
    { name: 'لپ تاپ', nameEn: 'Laptops', slug: 'laptops', parentId: createdCategories[0].id },
    { name: 'هدفون و هندزفری', nameEn: 'Headphones', slug: 'headphones', parentId: createdCategories[0].id },
    { name: 'ساعت هوشمند', nameEn: 'Smart Watches', slug: 'smart-watches', parentId: createdCategories[0].id },
    { name: 'تبلت', nameEn: 'Tablets', slug: 'tablets', parentId: createdCategories[0].id },
    { name: 'دوربین', nameEn: 'Cameras', slug: 'cameras', parentId: createdCategories[0].id },
  ];

  for (const sub of electronicsSubs) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: { ...sub, isActive: true },
    });
  }

  // زیردسته‌های مد و پوشاک
  const fashionSubs = [
    { name: 'مردانه', nameEn: 'Men', slug: 'men-fashion', parentId: createdCategories[1].id },
    { name: 'زنانه', nameEn: 'Women', slug: 'women-fashion', parentId: createdCategories[1].id },
    { name: 'بچگانه', nameEn: 'Kids', slug: 'kids-fashion', parentId: createdCategories[1].id },
  ];

  for (const sub of fashionSubs) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: { ...sub, isActive: true },
    });
  }
  console.log('✅ دسته‌بندی‌ها ایجاد شدند');

  // ============================================
  // ۴. برندها
  // ============================================
  const brandsData = [
    { name: 'سامسونگ', nameEn: 'Samsung', slug: 'samsung', description: 'سامسونگ، تولیدکننده الکترونیک' },
    { name: 'لنوو', nameEn: 'Lenovo', slug: 'lenovo', description: 'لنوو، تولیدکننده لپ تاپ' },
    { name: 'شیائومی', nameEn: 'Xiaomi', slug: 'xiaomi', description: 'شیائومی، گوشی و لوازم' },
    { name: 'اپل', nameEn: 'Apple', slug: 'apple', description: 'اپل، محصولات دیجیتال' },
    { name: 'نایک', nameEn: 'Nike', slug: 'nike', description: 'نایک، کفش و پوشاک ورزشی' },
    { name: 'آدیداس', nameEn: 'Adidas', slug: 'adidas', description: 'آدیداس، برند ورزشی' },
    { name: 'پوما', nameEn: 'Puma', slug: 'puma', description: 'پوما، لوازم ورزشی' },
    { name: 'سینره', nameEn: 'Cinere', slug: 'cinere', description: 'سینره، مراقبت پوست' },
    { name: 'لورئال', nameEn: 'Loreal', slug: 'loreal', description: 'لورئال، آرایشی بهداشتی' },
    { name: 'تفال', nameEn: 'Tefal', slug: 'tefal', description: 'تفال، لوازم آشپزخانه' },
    { name: 'بوش', nameEn: 'Bosch', slug: 'bosch', description: 'بوش، لوازم خانگی' },
    { name: 'ال جی', nameEn: 'LG', slug: 'lg', description: 'ال جی، الکترونیک' },
    { name: 'سونی', nameEn: 'Sony', slug: 'sony', description: 'سونی، الکترونیک' },
    { name: 'هیوندای', nameEn: 'Hyundai', slug: 'hyundai', description: 'هیوندای، لوازم خانگی' },
    { name: 'جی پلاس', nameEn: 'G Plus', slug: 'g-plus', description: 'جی پلاس، الکترونیک' },
    { name: 'ایسوس', nameEn: 'Asus', slug: 'asus', description: 'ایسوس، لپ تاپ' },
    { name: 'اچ‌پی', nameEn: 'HP', slug: 'hp', description: 'اچ‌پی، پرینتر و لپ تاپ' },
    { name: 'دل', nameEn: 'Dell', slug: 'dell', description: 'دل، کامپیوتر' },
    { name: 'مارشال', nameEn: 'Marshall', slug: 'marshall', description: 'مارشال، اسپیکر' },
    { name: 'بلو', nameEn: 'Blue', slug: 'blue', description: 'بلو، لوازم صوتی' },
  ];

  const createdBrands: any[] = [];
  for (const brand of brandsData) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        name: brand.name,
        nameEn: brand.nameEn,
        slug: brand.slug,
        description: brand.description,
      },
    });
    createdBrands.push(createdBrand);
  }
  console.log(`✅ ${createdBrands.length} برند ایجاد شد`);

  // ============================================
  // ۵. محصولات نمونه (۶۰ محصول)
  // ============================================
  const productsData = [
    // موبایل (10 محصول)
    { title: 'گوشی سامسونگ Galaxy S24', slug: 'samsung-s24', desc: 'پرچمدار سامسونگ', price: 45999000, qty: 10, brand: 'samsung', cat: 'mobile-phones' },
    { title: 'گوشی سامسونگ Galaxy A34', slug: 'samsung-a34', desc: 'میانی رده سامسونگ', price: 9999000, qty: 25, brand: 'samsung', cat: 'mobile-phones' },
    { title: 'گوشی سامسونگ Galaxy A14', slug: 'samsung-a14', desc: 'اقتصادی سامسونگ', price: 5999000, qty: 40, brand: 'samsung', cat: 'mobile-phones' },
    { title: 'گوشی آیفون 15 پرو', slug: 'iphone-15-pro', desc: 'پرچمدار اپل', price: 79999000, qty: 5, brand: 'apple', cat: 'mobile-phones' },
    { title: 'گوشی آیفون 15', slug: 'iphone-15', desc: 'آیفون استاندارد', price: 59999000, qty: 8, brand: 'apple', cat: 'mobile-phones' },
    { title: 'گوشی آیفون SE', slug: 'iphone-se', desc: 'اقتصادی اپل', price: 29999000, qty: 15, brand: 'apple', cat: 'mobile-phones' },
    { title: 'گوشی شیائومی 14', slug: 'xiaomi-14', desc: 'پرچمدار شیائومی', price: 29999000, qty: 12, brand: 'xiaomi', cat: 'mobile-phones' },
    { title: 'گوشی شیائومی Redmi Note 13', slug: 'redmi-note-13', desc: 'میانی رده شیائومی', price: 8999000, qty: 30, brand: 'xiaomi', cat: 'mobile-phones' },
    { title: 'گوشی شیائومی Poco X6', slug: 'poco-x6', desc: 'گیمینگ اقتصادی', price: 12999000, qty: 20, brand: 'xiaomi', cat: 'mobile-phones' },
    { title: 'گوشی ال جی Velvet', slug: 'lg-velvet', desc: 'طراحی زیبا', price: 18999000, qty: 7, brand: 'lg', cat: 'mobile-phones' },

    // لپ تاپ (8 محصول)
    { title: 'لپ تاپ لنوو IdeaPad 5', slug: 'lenovo-ideapad-5', desc: 'کاربری عمومی', price: 35999000, qty: 8, brand: 'lenovo', cat: 'laptops' },
    { title: 'لپ تاپ ایسوس VivoBook', slug: 'asus-vivobook', desc: 'سبک و قابل حمل', price: 28999000, qty: 12, brand: 'asus', cat: 'laptops' },
    { title: 'لپ تاپ اچ‌پ۴۵۰', slug: 'hp-pro-450', desc: 'تجاری', price: 32999000, qty: 6, brand: 'hp', cat: 'laptops' },
    { title: 'لپ تاپ دل Inspiron', slug: 'dell-inspiron', desc: 'خانگی و اداری', price: 27999000, qty: 10, brand: 'dell', cat: 'laptops' },
    { title: 'مک بوک ایر M3', slug: 'macbook-air-m3', desc: 'اپل سبک', price: 69999000, qty: 4, brand: 'apple', cat: 'laptops' },
    { title: 'لپ تاپ گیمینگ ایسوس TUF', slug: 'asus-tuf-gaming', desc: 'بازی حرفه‌ای', price: 52999000, qty: 5, brand: 'asus', cat: 'laptops' },
    { title: 'لپ تاپ لنوو Legion', slug: 'lenovo-legion', desc: 'گیمینگ لنوو', price: 48999000, qty: 6, brand: 'lenovo', cat: 'laptops' },
    { title: 'لپ تاپ سرفیس لنوو', slug: 'lenovo-surface', desc: 'دو حالته', price: 42999000, qty: 7, brand: 'lenovo', cat: 'laptops' },

    // هدفون (6 محصول)
    { title: 'ایرپاد پرو 2', slug: 'airpod-pro-2', desc: 'اپل بی‌سیم', price: 12999000, qty: 15, brand: 'apple', cat: 'headphones' },
    { title: 'هدفون سونی WH-1000XM5', slug: 'sony-xm5', desc: 'نویز کنسلینگ', price: 18999000, qty: 8, brand: 'sony', cat: 'headphones' },
    { title: 'ایرپاد نسل 3', slug: 'airpod-gen3', desc: 'اپل استاندارد', price: 7999000, qty: 20, brand: 'apple', cat: 'headphones' },
    { title: 'هدفون بلو Tune 770', slug: 'blue-tune-770', desc: 'بلو بی‌سیم', price: 4999000, qty: 25, brand: 'blue', cat: 'headphones' },
    { title: 'هدفون مارشال Major IV', slug: 'marshall-major-4', desc: 'مارشال کلاسیک', price: 8999000, qty: 10, brand: 'marshall', cat: 'headphones' },
    { title: 'هندزفری شیائومی Buds', slug: 'xiaomi-buds-4', desc: 'شیائومی بلوتوث', price: 3499000, qty: 30, brand: 'xiaomi', cat: 'headphones' },

    // ساعت هوشمند (4 محصول)
    { title: 'اپل واچ Ultra 2', slug: 'apple-watch-ultra-2', desc: 'اپل حرفه‌ای', price: 39999000, qty: 5, brand: 'apple', cat: 'smart-watches' },
    { title: 'ساعت سامسونگ Watch 6', slug: 'samsung-watch-6', desc: 'سامسونگ کلاسیک', price: 15999000, qty: 12, brand: 'samsung', cat: 'smart-watches' },
    { title: 'ساعت شیائومی Band 8', slug: 'xiaomi-band-8', desc: 'اقتصادی', price: 2999000, qty: 40, brand: 'xiaomi', cat: 'smart-watches' },
    { title: 'ساعت گارمین Venu 3', slug: 'garmin-venu-3', desc: 'ورزشی', price: 22999000, qty: 7, brand: 'garmin', cat: 'smart-watches' },

    // پوشاک مردانه (8 محصول)
    { title: 'پیراهن مردانه اسلیم', slug: 'men-slim-shirt', desc: 'اسلیم فیت', price: 690000, qty: 50, brand: 'iran-fashion', cat: 'men-fashion' },
    { title: 'شلوار جین مردانه', slug: 'men-jeans', desc: 'جین اصل', price: 1290000, qty: 35, brand: 'mod-barta', cat: 'men-fashion' },
    { title: 'کاپشن مردانه زمستانی', slug: 'men-jacket', desc: 'کاپشن گرم', price: 2890000, qty: 20, brand: 'iran-fashion', cat: 'men-fashion' },
    { title: 'تیشرت مردانه یقه گرد', slug: 'men-tshirt', desc: 'نخی راحت', price: 390000, qty: 80, brand: 'mod-barta', cat: 'men-fashion' },
    { title: 'پالتو مردانه بلند', slug: 'men-coat', desc: 'رسمی', price: 4590000, qty: 12, brand: 'iran-fashion', cat: 'men-fashion' },
    { title: 'هودی مردانه', slug: 'men-hoodie', desc: 'کلاه‌دار', price: 890000, qty: 45, brand: 'mod-barta', cat: 'men-fashion' },
    { title: 'شلوار کتان مردانه', slug: 'men-khaki-pants', desc: 'کتان راحت', price: 790000, qty: 40, brand: 'iran-fashion', cat: 'men-fashion' },
    { title: 'ژاکت مردانه اسپرت', slug: 'men-sport-jacket', desc: 'سبک', price: 1590000, qty: 25, brand: 'mod-barta', cat: 'men-fashion' },

    // پوشاک زنانه (8 محصول)
    { title: 'مانتو زنانه مجلسی', slug: 'women-manto-formal', desc: 'مجلسی', price: 1890000, qty: 20, brand: 'mod-barta', cat: 'women-fashion' },
    { title: 'شلوار زنانه پارچه‌ای', slug: 'women-trousers', desc: 'رسمی', price: 790000, qty: 35, brand: 'iran-fashion', cat: 'women-fashion' },
    { title: 'بلوز زنانه مجلسی', slug: 'women-blouse', desc: 'شیک', price: 690000, qty: 40, brand: 'mod-barta', cat: 'women-fashion' },
    { title: 'پالتو زنانه بلند', slug: 'women-coat-long', desc: 'زمستانی', price: 3490000, qty: 15, brand: 'iran-fashion', cat: 'women-fashion' },
    { title: 'لباس زنانه مجلس', slug: 'women-dress', desc: 'بلند', price: 2290000, qty: 18, brand: 'mod-barta', cat: 'women-fashion' },
    { title: 'کیف زنانه دستی', slug: 'women-handbag', desc: 'چرم', price: 1590000, qty: 25, brand: 'iran-fashion', cat: 'women-fashion' },
    { title: 'شال و روسری', slug: 'women-shawl', desc: 'ابریشم', price: 490000, qty: 60, brand: 'mod-barta', cat: 'women-fashion' },
    { title: 'کفش پاشنه‌دار زنانه', slug: 'women-heels', desc: 'پاشنه بلند', price: 1890000, qty: 22, brand: 'iran-fashion', cat: 'women-fashion' },

    // لوازم خانگی (6 محصول)
    { title: 'سرویس قابلمه ۱۰ پارچه', slug: 'cookware-10pc', desc: 'گرانیتی', price: 6990000, qty: 10, brand: 'tefal', cat: 'home-kitchen' },
    { title: 'سرویس چای‌خوری', slug: 'tea-set', desc: 'سرامیکی', price: 2490000, qty: 15, brand: 'bosh', cat: 'home-kitchen' },
    { title: 'مخلوط‌کن ال جی', slug: 'lg-blender', desc: '۵ تیغه', price: 3990000, qty: 12, brand: 'lg', cat: 'home-kitchen' },
    { title: 'سرخ‌کن بدون روغن', slug: 'air-fryer', desc: '۵ لیتری', price: 5490000, qty: 8, brand: 'hyundai', cat: 'home-kitchen' },
    { title: 'جاروبرقی بوش', slug: 'bosch-vacuum', desc: 'قوی', price: 12990000, qty: 5, brand: 'bosh', cat: 'home-kitchen' },
    { title: 'ست قابلمه هیوندای', slug: 'hyundai-cookware', desc: '۱۲ پارچه', price: 4990000, qty: 10, brand: 'hyundai', cat: 'home-kitchen' },

    // کتاب (6 محصول)
    { title: 'کتاب اثر مرکب', slug: 'compound-effect-book', desc: 'دارن هاردی', price: 180000, qty: 100, brand: 'tech-publisher', cat: 'books' },
    { title: 'کتاب عادت‌های اتمی', slug: 'atomic-habits-book', desc: 'جیمز کلیر', price: 220000, qty: 80, brand: 'tech-publisher', cat: 'books' },
    { title: 'کتاب ذهن بی‌نهایت', slug: 'infinite-mind-book', desc: 'آموزش تمرکز', price: 150000, qty: 90, brand: 'tech-publisher', cat: 'books' },
    { title: 'کتاب قدرت در حال حاضر', slug: 'power-now-book', desc: 'اگرت هلولین', price: 190000, qty: 70, brand: 'tech-publisher', cat: 'books' },
    { title: 'کتاب فروشنده بزرگ', slug: 'biggest-seller-book', desc: 'زک باتن', price: 160000, qty: 85, brand: 'tech-publisher', cat: 'books' },
    { title: 'کتاب هنر ظریف بی‌خیالی', slug: 'art-subtle-art-book', desc: 'مارک منسن', price: 170000, qty: 75, brand: 'tech-publisher', cat: 'books' },

    // ورزشی (8 محصول)
    { title: 'کفش دویدن نایک پیموس', slug: 'nike-pegasus', desc: 'دویدن', price: 6990000, qty: 15, brand: 'nike', cat: 'sports' },
    { title: 'کفش آدیداس Ultraboost', slug: 'adidas-ultraboost', desc: 'راحتی بالا', price: 7490000, qty: 12, brand: 'adidas', cat: 'sports' },
    { title: 'تردمیل خانگی', slug: 'home-treadmill', desc: 'تاشو', price: 29990000, qty: 3, brand: 'hyundai', cat: 'sports' },
    { title: 'دمبل ۱۰ کیلویی', slug: 'dumbbell-10kg', desc: 'جفت', price: 890000, qty: 30, brand: 'puma', cat: 'sports' },
    { title: 'مت یوگا', slug: 'yoga-mat', desc: 'ضد لغزش', price: 490000, qty: 50, brand: 'nike', cat: 'sports' },
    { title: 'کیسه بوکس', slug: 'boxing-bag', desc: '۱ متری', price: 4990000, qty: 8, brand: 'puma', cat: 'sports' },
    { title: 'توپ فوتبال آدیداس', slug: 'adidas-football', desc: 'سایز ۵', price: 1290000, qty: 25, brand: 'adidas', cat: 'sports' },
    { title: 'رکورت ورزشی', slug: 'sport-bench', desc: 'قابل تنظیم', price: 8990000, qty: 5, brand: 'puma', cat: 'sports' },

    // زیبایی و سلامت (8 محصول)
    { title: 'کرم ضد آفتاب ۵۰', slug: 'spf50-cream', desc: 'ضد آفتاب', price: 450000, qty: 60, brand: 'cinere', cat: 'beauty' },
    { title: 'سرم ویتامین C', slug: 'vitamin-c-serum', desc: 'روشن‌کننده', price: 690000, qty: 40, brand: 'loreal', cat: 'beauty' },
    { title: 'ادکلن مردانه', slug: 'men-parfum', desc: 'خوشبو', price: 1890000, qty: 20, brand: 'loreal', cat: 'beauty' },
    { title: 'ریمل حجم‌دهنده', slug: 'volume-mascara', desc: 'ریمل حرفه‌ای', price: 390000, qty: 50, brand: 'cinere', cat: 'beauty' },
    { title: 'رژ لب مات', slug: 'matte-lipstick', desc: 'ماندگار', price: 290000, qty: 70, brand: 'loreal', cat: 'beauty' },
    { title: 'شامپو ضد ریزش', slug: 'anti-hairfall-shampoo', desc: 'درمان', price: 520000, qty: 45, brand: 'cinere', cat: 'beauty' },
    { title: 'ساعت هوشمند ورزشی', slug: 'sport-smartwatch', desc: 'ضربه مقاوم', price: 5990000, qty: 10, brand: 'samsung', cat: 'beauty' },
    { title: 'ست مراقبت پوست', slug: 'skincare-set', desc: '۵ مرحله‌ای', price: 2490000, qty: 18, brand: 'loreal', cat: 'beauty' },
  ];

  let productCount = 0;
  // نگاشت slug -> product برای دسترسی بعدی
  const createdProducts: any[] = [];

  for (const prod of productsData) {
    const category = await prisma.category.findUnique({ where: { slug: prod.cat } });
    if (!category) {
      console.log(`⚠️ دسته‌بندی ${prod.cat} یافت نشد`);
      continue;
    }

    const brand = createdBrands.find((b: any) => b.slug === prod.brand);
    const randSeller = sellers[Math.floor(Math.random() * sellers.length)];

    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const newProduct = await prisma.product.create({
        data: {
          title: prod.title,
          titleEn: prod.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          slug: prod.slug,
          slugEn: prod.slug,
          description: prod.desc,
          descriptionEn: prod.desc,
          brandId: brand?.id || null,
          sellerId: randSeller.id,
          categoryId: category.id,
          status: 'approved' as any,
          isFeatured: Math.random() > 0.7,
          viewCount: Math.floor(Math.random() * 500),
          saleCount: Math.floor(Math.random() * 100),
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 50),
        },
      });

      // تصاویر (حداقل ۱ عکس برای هر محصول - انتخاب رندوم از آدرس‌های محلی)
      const imageCount = 1 + Math.floor(Math.random() * 3); // 1 تا 3 عکس
      for (let i = 0; i < imageCount; i++) {
        // استفاده از seed منحصر به فرد برای هر تصویر محصول تا URL تکراری نباشد
        const imgPath = IMAGE_PATHS[(productCount * 10 + i) % IMAGE_PATHS.length];
        await prisma.productImage.upsert({
          where: { url: `/${imgPath}` },
          update: {},
          create: {
            url: `/${imgPath}`,
            alt: `${prod.title} - تصویر ${i + 1}`,
            sortOrder: i + 1,
            isMain: i === 0,
            productId: newProduct.id,
          },
        });
      }

      // ایجاد default Variant با قیمت و موجودی
      const sku = `PRD-${prod.slug.toUpperCase().replace(/[^A-Z0-9]/g, '')}-001`;
      const defaultVariant = await prisma.productVariant.create({
        data: {
          productId: newProduct.id,
          name: 'پیش‌فرض',
          nameEn: 'Default',
          sku: sku.substring(0, 100),
          price: prod.price,
          quantity: prod.qty,
          attributes: JSON.stringify({}) as any,
          attributesEn: JSON.stringify({}) as any,
        },
      });

      createdProducts.push({ ...newProduct, defaultVariantPrice: prod.price, defaultVariantSku: defaultVariant.sku, defaultVariantId: defaultVariant.id });
      productCount++;
    }
  }
  console.log(`✅ ${productCount} محصول جدید ایجاد شد`);

  // ============================================
  // ۶. Variant اضافی برای محصولات نمونه (JSON format)
  // ============================================
  async function createVariants(productSlug: string, variants: { name: string; nameEn: string; sku: string; price?: number; quantity: number; attributes: Record<string, string | number>; attributesEn: Record<string, string | number> }[]) {
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      console.log(`⚠️ محصول ${productSlug} یافت نشد`);
      return;
    }
    // دریافت قیمت پایه از default variant
    const defaultVariant = await prisma.productVariant.findFirst({ where: { productId: product.id } });
    const basePrice = defaultVariant?.price || 0;
    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId: product.id,
          name: v.name,
          nameEn: v.nameEn,
          sku: v.sku,
          price: v.price ?? basePrice,
          quantity: v.quantity,
          attributes: JSON.stringify(v.attributes) as any,
          attributesEn: JSON.stringify(v.attributesEn) as any,
        },
      });
    }
  }

  await createVariants('samsung-s24', [
    { name: 'مشکی - ۱۲۸GB', nameEn: 'Black - 128GB', sku: 'SAM-S24-BLK-128', quantity: 5, attributes: { color: 'مشکی', storage: 128 }, attributesEn: { color: 'Black', storage: 128 } },
    { name: 'سفید - ۲۵۶GB', nameEn: 'White - 256GB', sku: 'SAM-S24-WHT-256', quantity: 3, attributes: { color: 'سفید', storage: 256 }, attributesEn: { color: 'White', storage: 256 } },
    { name: 'بنفش - ۲۵۶GB', nameEn: 'Purple - 256GB', sku: 'SAM-S24-PUR-256', quantity: 4, attributes: { color: 'بنفش', storage: 256 }, attributesEn: { color: 'Purple', storage: 256 } },
  ]);

  await createVariants('nike-pegasus', [
    { name: 'سایز ۴۰ - قرمز', nameEn: 'Size 40 - Red', sku: 'NIKE-PEG-40-RED', quantity: 8, attributes: { size: '40', color: 'قرمز' }, attributesEn: { size: '40', color: 'Red' } },
    { name: 'سایز ۴۲ - آبی', nameEn: 'Size 42 - Blue', sku: 'NIKE-PEG-42-BLU', quantity: 7, attributes: { size: '42', color: 'آبی' }, attributesEn: { size: '42', color: 'Blue' } },
    { name: 'سایز ۴۴ - مشکی', nameEn: 'Size 44 - Black', sku: 'NIKE-PEG-44-BLK', quantity: 5, attributes: { size: '44', color: 'مشکی' }, attributesEn: { size: '44', color: 'Black' } },
  ]);

  await createVariants('men-slim-shirt', [
    { name: 'M - آبی', nameEn: 'M - Blue', sku: 'SHIRT-SLIM-M-BLU', quantity: 15, attributes: { size: 'M', color: 'آبی', material: 'نخی' }, attributesEn: { size: 'M', color: 'Blue', material: 'Cotton' } },
    { name: 'L - آبی', nameEn: 'L - Blue', sku: 'SHIRT-SLIM-L-BLU', quantity: 15, attributes: { size: 'L', color: 'آبی', material: 'نخی' }, attributesEn: { size: 'L', color: 'Blue', material: 'Cotton' } },
    { name: 'XL - سفید', nameEn: 'XL - White', sku: 'SHIRT-SLIM-XL-WHT', quantity: 10, attributes: { size: 'XL', color: 'سفید', material: 'نخی' }, attributesEn: { size: 'XL', color: 'White', material: 'Cotton' } },
    { name: 'M - سفید', nameEn: 'M - White', sku: 'SHIRT-SLIM-M-WHT', quantity: 10, attributes: { size: 'M', color: 'سفید', material: 'نخی' }, attributesEn: { size: 'M', color: 'White', material: 'Cotton' } },
  ]);

  await createVariants('women-manto-formal', [
    { name: 'S - مشکی', nameEn: 'S - Black', sku: 'MANTO-FRM-S-BLK', quantity: 8, attributes: { size: 'S', color: 'مشکی' }, attributesEn: { size: 'S', color: 'Black' } },
    { name: 'M - مشکی', nameEn: 'M - Black', sku: 'MANTO-FRM-M-BLK', quantity: 8, attributes: { size: 'M', color: 'مشکی' }, attributesEn: { size: 'M', color: 'Black' } },
    { name: 'L - سورمه‌ای', nameEn: 'L - Navy', sku: 'MANTO-FRM-L-NVY', quantity: 5, attributes: { size: 'L', color: 'سورمه‌ای' }, attributesEn: { size: 'L', color: 'Navy' } },
  ]);

  await createVariants('cookware-10pc', [
    { name: '۸ پارچه', nameEn: '8-Piece', sku: 'COOK-GRN-8PC', quantity: 8, attributes: { pieces: 8, material: 'گرانیتی' }, attributesEn: { pieces: 8, material: 'Granite' } },
    { name: '۱۲ پارچه', nameEn: '12-Piece', sku: 'COOK-GRN-12PC', quantity: 10, attributes: { pieces: 12, material: 'گرانیتی' }, attributesEn: { pieces: 12, material: 'Granite' } },
  ]);
  console.log('✅ Variant محصولات ایجاد شدند');

  // ============================================
  // ۷. کدهای تخفیف (۲۰ کد)
  // ============================================
  const discountCodes = [
    { code: 'WELCOME10', type: 'percentage' as const, value: 10, minOrder: 1000000, maxDisc: 500000, limit: 100, desc: 'خوش‌آمدگویی ۱۰٪' },
    { code: 'FREE50', type: 'fixed' as const, value: 50000, minOrder: 500000, limit: 50, desc: '۵۰ هزار تومان ثابت' },
    { code: 'SUMMER20', type: 'percentage' as const, value: 20, minOrder: 2000000, maxDisc: 1000000, limit: 200, desc: 'تابستانه ۲۰٪' },
    { code: 'NEWYEAR15', type: 'percentage' as const, value: 15, minOrder: 1500000, maxDisc: 750000, limit: 150, desc: 'سال نو ۱۵٪' },
    { code: 'FLASH30', type: 'percentage' as const, value: 30, minOrder: 3000000, maxDisc: 2000000, limit: 30, desc: 'فلاش ۳۰٪' },
    { code: 'BIG100', type: 'fixed' as const, value: 100000, minOrder: 5000000, limit: 25, desc: '۱۰۰ هزار تومان بزرگ' },
    { code: 'FIRST5', type: 'percentage' as const, value: 5, minOrder: 0, limit: 9999, desc: 'اولین خرید ۵٪' },
    { code: 'VIP20', type: 'percentage' as const, value: 20, minOrder: 4000000, maxDisc: 1500000, limit: 50, desc: 'وی‌آی‌پی ۲۰٪' },
    { code: 'MOBILE15', type: 'percentage' as const, value: 15, minOrder: 5000000, maxDisc: 2000000, limit: 40, desc: 'موبایل ۱۵٪' },
    { code: 'FASHION25', type: 'percentage' as const, value: 25, minOrder: 1000000, maxDisc: 500000, limit: 80, desc: 'مد و پوشاک ۲۵٪' },
    { code: 'HOME30', type: 'fixed' as const, value: 300000, minOrder: 8000000, limit: 20, desc: 'لوازم خانگی ۳۰۰ هزار' },
    { code: 'BOOKS10', type: 'percentage' as const, value: 10, minOrder: 200000, limit: 200, desc: 'کتاب ۱۰٪' },
    { code: 'SPORT15', type: 'percentage' as const, value: 15, minOrder: 2000000, maxDisc: 800000, limit: 60, desc: 'ورزشی ۱۵٪' },
    { code: 'BEAUTY20', type: 'percentage' as const, value: 20, minOrder: 1000000, maxDisc: 400000, limit: 70, desc: 'زیبایی ۲۰٪' },
    { code: 'NIGHT40', type: 'fixed' as const, value: 40000, minOrder: 300000, limit: 100, desc: 'شب تا صبح ۴۰ هزار' },
    { code: 'FLASH2', type: 'percentage' as const, value: 50, minOrder: 1000000, maxDisc: 1000000, limit: 10, desc: 'فلاش ۲ ساعته ۵۰٪' },
    { code: 'LOYALTY', type: 'percentage' as const, value: 8, minOrder: 0, limit: 9999, desc: 'وفاداری ۸٪' },
    { code: 'REFER25', type: 'fixed' as const, value: 25000, minOrder: 500000, limit: 500, desc: 'معرفی ۲۵ هزار' },
    { code: 'HOLIDAY35', type: 'percentage' as const, value: 35, minOrder: 2000000, maxDisc: 1500000, limit: 45, desc: 'تعطیلات ۳۵٪' },
    { code: 'EXTRA10', type: 'fixed' as const, value: 10000, minOrder: 100000, limit: 1000, desc: 'اضافه ۱۰ هزار' },
  ];

  let discountCount = 0;
  for (const d of discountCodes) {
    const existing = await prisma.discountCode.findUnique({ where: { code: d.code } });
    if (!existing) {
      await prisma.discountCode.create({
        data: {
          code: d.code,
          type: d.type,
          value: d.value,
          minOrderAmount: d.minOrder,
          maxDiscount: d.maxDisc || undefined,
          usageLimit: d.limit,
          perUserLimit: d.type === 'percentage' ? 1 : 3,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          isActive: true,
          description: d.desc,
          creatorId: admin.id,
        },
      });
      discountCount++;
    }
  }
  console.log(`✅ ${discountCount} کد تخفیف جدید ایجاد شد`);

  // ============================================
  // ۸. روش‌های ارسال
  // ============================================
  const shippingMethods = [
    { name: 'پست پیشتاز', nameEn: 'Express Post', cost: 45000, freeThreshold: 500000, estimatedDays: '2-4', sortOrder: 1 },
    { name: 'پست سفارشی', nameEn: 'Regular Post', cost: 30000, freeThreshold: 300000, estimatedDays: '5-7', sortOrder: 2 },
    { name: 'تیپاکس', nameEn: 'Tipax', cost: 55000, freeThreshold: 800000, estimatedDays: '1-2', sortOrder: 3 },
    { name: 'ارسال اکسپرس', nameEn: 'Express Delivery', cost: 85000, freeThreshold: 1000000, estimatedDays: 'same-day', sortOrder: 4 },
    { name: 'پیک موتوری', nameEn: 'Motor Courier', cost: 25000, freeThreshold: 200000, estimatedDays: '1-3h', sortOrder: 5 },
  ];

  for (const method of shippingMethods) {
    await prisma.shippingMethod.create({ data: method });
  }
  console.log('✅ روش‌های ارسال ایجاد شدند');

  // ============================================
  // ۹. بنرها (۱۰ بنر)
  // ============================================
  const bannersData = [
    { title: 'تخفیفات تابستانه', subtitle: 'تا ۵۰٪ تخفیف', image: 'https://picsum.photos/seed/banner1/1200/400', link: '/products?sort=price_asc', position: 'home_top' as any, sortOrder: 1 },
    { title: 'جدیدترین موبایل‌ها', subtitle: 'با گارانتی معتبر', image: 'https://picsum.photos/seed/banner2/1200/400', link: '/categories/electronics', position: 'home_middle' as any, sortOrder: 2 },
    { title: 'ارسال رایگان', subtitle: 'سفارش‌های بالای ۵۰۰ هزار', image: 'https://picsum.photos/seed/banner3/1200/400', link: '/products', position: 'sidebar' as any, sortOrder: 3 },
    { title: 'فروش ویژه پوشاک', subtitle: 'مد و لباس', image: 'https://picsum.photos/seed/banner4/1200/400', link: '/categories/fashion', position: 'home_top' as any, sortOrder: 4 },
    { title: 'لوازم خانگی', subtitle: 'بهترین قیمت', image: 'https://picsum.photos/seed/banner5/1200/400', link: '/categories/home-kitchen', position: 'home_middle' as any, sortOrder: 5 },
    { title: 'کتاب‌های پرفروش', subtitle: 'منتخب خوانندگان', image: 'https://picsum.photos/seed/banner6/1200/400', link: '/categories/books', position: 'sidebar' as any, sortOrder: 6 },
    { title: 'محصولات ورزشی', subtitle: 'آماده تمرین', image: 'https://picsum.photos/seed/banner7/1200/400', link: '/categories/sports', position: 'home_top' as any, sortOrder: 7 },
    { title: 'آرایشی و بهداشتی', subtitle: 'اصالت تضمین شده', image: 'https://picsum.photos/seed/banner8/1200/400', link: '/categories/beauty', position: 'home_middle' as any, sortOrder: 8 },
    { title: 'ساعت هوشمند', subtitle: 'تکنولوژی روی مچ', image: 'https://picsum.photos/seed/banner9/1200/400', link: '/products/smart-watches', position: 'sidebar' as any, sortOrder: 9 },
    { title: 'هدیه ویژه', subtitle: 'مناسب هدیه', image: 'https://picsum.photos/seed/banner10/1200/400', link: '/products?tag=gift', position: 'home_top' as any, sortOrder: 10 },
  ];

  for (const banner of bannersData) {
    await prisma.banner.create({ data: banner });
  }
  console.log('✅ ۱۰ بنر ایجاد شد');

  // ============================================
  // ۱۰. آدرس‌های نمونه
  // ============================================
  const addresses = [
    { userId: admin.id, title: 'دفتر', fullName: 'مدیر سیستم', phone: '09120000000', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، شماره ۱', postalCode: '1234567890', isDefault: true },
    { userId: sellers[0].id, title: 'انبار', fullName: sellers[0].firstName, phone: '09121111111', province: 'اصفهان', city: 'اصفهان', address: 'خیابان امیرکبیر، شماره ۱۰', postalCode: '9876543210', isDefault: true },
    { userId: buyers[0].id, title: 'خانه', fullName: buyers[0].firstName, phone: '09122222222', province: 'تهران', city: 'تهران', address: 'خیابان آزادی، پلاک ۵', postalCode: '1112223334', isDefault: true },
    { userId: buyers[1].id, title: 'خانه', fullName: buyers[1].firstName, phone: '09123333333', province: 'اصفهان', city: 'اصفهان', address: 'خیابان چهارباغ', postalCode: '2223334445', isDefault: true },
    { userId: buyers[1].id, title: 'کار', fullName: buyers[1].firstName, phone: '09123333333', province: 'اصفهان', city: 'اصفهان', address: 'بلوار صنعت، شرکت الف', postalCode: '2223334446', isDefault: false },
    { userId: buyers[2].id, title: 'خانه', fullName: buyers[2].firstName, phone: '09124444444', province: 'شیراز', city: 'شیراز', address: 'خیابان زند', postalCode: '7158763123', isDefault: true },
    { userId: buyers[3].id, title: 'خانه', fullName: buyers[3].firstName, phone: '09125555555', province: 'مشهد', city: 'مشهد', address: 'خیابان آزادی', postalCode: '9173564123', isDefault: true },
    { userId: buyers[4].id, title: 'خانه', fullName: buyers[4].firstName, phone: '09126666666', province: 'تبریز', city: 'تبریز', address: 'خیابان امام', postalCode: '5166543210', isDefault: true },
    { userId: buyers[5].id, title: 'خانه', fullName: buyers[5].firstName, phone: '09127777777', province: 'تهران', city: 'کرج', address: 'بلوار ارگان', postalCode: '3148569870', isDefault: true },
    { userId: buyers[6].id, title: 'خانه', fullName: buyers[6].firstName, phone: '09128888888', province: 'اصفهان', city: 'کاشان', address: 'خیابان پیرنیا', postalCode: '8129567430', isDefault: true },
    { userId: buyers[7].id, title: 'خانه', fullName: buyers[7].firstName, phone: '09129999999', province: 'تهران', city: 'تهران', address: 'خیابان شریعتی', postalCode: '1345678901', isDefault: true },
  ];

  for (const addr of addresses) {
    await prisma.address.create({ data: addr });
  }
  console.log('✅ آدرس‌های نمونه ایجاد شدند');

  // ============================================
  // ۱۱. بلاگ پست‌ها (۱۵ پست)
  // ============================================
  const blogPosts = [
    { title: 'راهنمای خرید گوشی هوشمند', slug: 'smartphone-buying-guide', excerpt: 'نکات مهم在购买手机', content: 'محتوای راهنمای خرید...', status: 'published' as any },
    { title: 'بهترین لپ تاپ‌های ۱۴۰۳', slug: 'best-laptops-1403', excerpt: 'معرفی بهترین‌ها', content: 'محتوای لپ تاپ...', status: 'published' as any },
    { title: 'تفاوت رنگ‌های پارچه', slug: 'fabric-colors', excerpt: 'آشنایی با انواع پارچه', content: 'محتوای پارچه...', status: 'published' as any },
    { title: 'نحوه مراقبت از پوست در تابستان', slug: 'summer-skincare', excerpt: 'مراقبت پوستی', content: 'محتوای پوست...', status: 'published' as any },
    { title: 'ورزش‌های خانگی', slug: 'home-workouts', excerpt: 'تمرین در خانه', content: 'محتوای ورزش...', status: 'published' as any },
    { title: 'معرفی کتاب‌های سال', slug: 'books-of-year', excerpt: 'بهترین کتاب‌ها', content: 'محتوای کتاب...', status: 'published' as any },
    { title: 'راهنمای انتخاب کفش ورزشی', slug: 'sports-shoes-guide', excerpt: 'کفش مناسب', content: 'محتوای کفش...', status: 'published' as any },
    { title: 'آشنایی با برندهای ساعت هوشمند', slug: 'smartwatch-brands', excerpt: 'ساعت‌های محبوب', content: 'محتوای ساعت...', status: 'published' as any },
    { title: 'نکات نگهداری از لوازم خانگی', slug: 'home-appliance-care', excerpt: 'طول عمر بیشتر', content: 'محتوای لوازم...', status: 'published' as any },
    { title: 'ترندهای مد ۱۴۰۳', slug: 'fashion-trends-1403', excerpt: 'مد روز', content: 'محتوای مد...', status: 'published' as any },
    { title: 'چگونه یک هدیه خوب بخریم', slug: 'gift-buying-tips', excerpt: 'هدیه مناسب', content: 'محتوای هدیه...', status: 'published' as any },
    { title: 'راهنمای خرید هدفون', slug: 'headphone-buying-guide', excerpt: 'صدای با کیفیت', content: 'محتوای هدفون...', status: 'published' as any },
    { title: 'مقایسه نایک و آدیداس', slug: 'nike-vs-adidas', excerpt: 'دو برند بزرگ', content: 'محتوای مقایسه...', status: 'published' as any },
    { title: 'تأثیر تکنولوژی بر زندگی', slug: 'tech-impact-life', excerpt: 'تکنولوژی مدرن', content: 'محتوای تکنولوژی...', status: 'published' as any },
    { title: 'سلامت چشم هنگام کار با موبایل', slug: 'eye-health-mobile', excerpt: 'مراقبت از چشم', content: 'محتوای سلامت...', status: 'published' as any },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        publishedAt: new Date(),
        authorId: admin.id,
        viewCount: Math.floor(Math.random() * 1000),
      },
    });
  }
  console.log('✅ ۱۵ بلاگ پست ایجاد شد');

  // ============================================
  // ۱۲. نظرات نمونه
  // ============================================
  const allProducts = await prisma.product.findMany({ where: { status: 'approved' }, take: 30 });
  const reviewTexts = [
    'محصول عالی، کاملاً راضی',
    'کیفیت خوب بود ولی کمی گران',
    'ارسال سریع، بسته‌بندی مناسب',
    'متوسط بود، انتظار بیشتری داشتم',
    'خیلی خوب، پیشنهاد می‌کنم',
    'محصول اصل بود، ممنون',
    'کیفیت ساخت پایین‌تر از انتظار',
    'ارزش خرید دارد',
    'بعد از یک ماه هنوز خوشنم',
    'بهترین خرید سال من بود',
  ];

  let reviewCount = 0;
  for (const product of allProducts) {
    const numReviews = Math.floor(Math.random() * 3);
    for (let r = 0; r < numReviews; r++) {
      const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
      await prisma.review.create({
        data: {
          rating: Math.floor(3 + Math.random() * 3),
          title: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          body: reviewTexts[Math.floor(Math.random() * reviewTexts.length)] + ' - ' + product.title,
          isApproved: Math.random() > 0.2,
          userId: randomBuyer.id,
          productId: product.id,
        },
      });
      reviewCount++;
    }
  }
  console.log(`✅ ${reviewCount} نظر ایجاد شد`);

  // ============================================
  // ۱۳. سفارشات نمونه (۱۵ سفارش)
  // ============================================
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as any[];
  const paymentMethods = ['card', 'wallet', 'zarinpal'] as any[];

  for (let i = 0; i < 15; i++) {
    const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
    const cp = createdProducts[Math.floor(Math.random() * createdProducts.length)];
    const qty = 1 + Math.floor(Math.random() * 3);
    const price = cp.defaultVariantPrice;
    const total = price * qty;

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${i.toString().padStart(4, '0')}`,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: 'paid' as any,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        subtotal: total,
        shippingCost: Math.floor(Math.random() * 50000),
        discountAmount: Math.floor(total * 0.1),
        commissionAmount: Math.floor(total * 0.1),
        total: total - Math.floor(total * 0.1),
        shippingAddress: 'خیابان اصلی، پلاک ۱',
        shippingCity: ['تهران', 'اصفهان', 'شیراز', 'مشهد'][Math.floor(Math.random() * 4)],
        shippingProvince: ['تهران', 'اصفهان', 'فارس', 'خراسان'][Math.floor(Math.random() * 4)],
        trackingCode: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
        userId: randomBuyer.id,
        items: {
          create: {
            title: cp.title,
            price: price,
            quantity: qty,
            total: total,
            sku: cp.defaultVariantSku || `SKU-${cp.slug.toUpperCase()}`,
            variantName: 'پیش‌فرض',
             image: `/${getRandomImage(999)}`,
            productId: cp.id,
            sellerId: cp.sellerId,
            variantId: cp.defaultVariantId,
          },
        },
      },
    });
  }
  console.log('✅ ۱۵ سفارش نمونه ایجاد شد');

  // ============================================
  // ۱۴. سبد خرید نمونه
  // ============================================
  const allVariants = await prisma.productVariant.findMany({ take: 50 });
  for (const buyer of buyers.slice(0, 5)) {
    const numItems = 1 + Math.floor(Math.random() * 4);
    const shuffled = [...allVariants].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numItems; j++) {
      const variant = shuffled[j];
      if (!variant) continue;
      await prisma.cartItem.upsert({
        where: { userId_productId: { userId: buyer.id, productId: variant.productId } },
        update: { quantity: { increment: 1 } },
        create: {
          userId: buyer.id,
          productId: variant.productId,
          variantId: variant.id,
          quantity: 1 + Math.floor(Math.random() * 2),
        },
      });
    }
  }
  console.log('✅ سبد خرید نمونه ایجاد شد');

  // ============================================
  // ۱۵. لیست علاقه‌مندی
  // ============================================
  for (const buyer of buyers.slice(0, 6)) {
    const numItems = 2 + Math.floor(Math.random() * 5);
    const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numItems; j++) {
      await prisma.wishlistItem.upsert({
        where: { userId_productId: { userId: buyer.id, productId: shuffled[j].id } },
        update: {},
        create: {
          userId: buyer.id,
          productId: shuffled[j].id,
        },
      });
    }
  }
  console.log('✅ لیست علاقه‌مندی ایجاد شد');

  // ============================================
  // ۱۶. کیف پول - تراکنش‌ها
  // ============================================
  for (const buyer of buyers.slice(0, 5)) {
    const balanceBefore = 0;
    const depositAmount = 5000000 + Math.floor(Math.random() * 20000000);
    await prisma.walletTransaction.create({
      data: {
        type: 'deposit' as any,
        amount: depositAmount,
        balanceBefore,
        balanceAfter: depositAmount,
        description: 'شارژ کیف پول',
        status: 'completed' as any,
        reference: `REF-${Date.now()}`,
        userId: buyer.id,
      },
    });
  }
  console.log('✅ تراکنش‌های کیف پول ایجاد شد');

  // ============================================
  // ۱۷. نوتیفیکیشن نمونه
  // ============================================
  const notificationTypes = ['order', 'message', 'system', 'promotion'] as any[];
  for (const buyer of buyers.slice(0, 5)) {
    for (let n = 0; n < 5; n++) {
      await prisma.notification.create({
        data: {
          type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
          title: 'اطلاع‌رسانی',
          body: 'این یک اطلاع‌رسانی نمونه است',
          isRead: Math.random() > 0.5,
          userId: buyer.id,
        },
      });
    }
  }
  console.log('✅ نوتیفیکیشن‌های نمونه ایجاد شدند');

  // ============================================
  // ۱۸. رتبه‌بندی فروشنده
  // ============================================
  for (const seller of sellers.slice(0, 3)) {
    await prisma.sellerRating.upsert({
      where: { sellerId: seller.id },
      update: {},
      create: {
        sellerId: seller.id,
        avgRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        totalReviews: Math.floor(Math.random() * 50),
        responseRate: 70 + Math.floor(Math.random() * 30),
        responseTime: parseFloat((1 + Math.random() * 10).toFixed(1)),
        onTimeDelivery: 80 + Math.floor(Math.random() * 20),
        productQuality: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        communication: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      },
    });
  }
  console.log('✅ رتبه‌بندی فروشندگان ایجاد شد');

  console.log('');
  console.log('🎉 Seeding با موفقیت کامل شد!');
  console.log('');
  console.log('📊 آمار داده‌های ایجاد شده:');
  console.log(`   - برندها: ${createdBrands.length}`);
  console.log(`   - محصولات: ${productCount}`);
  console.log(`   - کدهای تخفیف: ${discountCount}`);
  console.log(`   - بلاگ پست‌ها: ${blogPosts.length}`);
  console.log(`   - نظرات: ${reviewCount}`);
  console.log(`   - سفارشات: ۱۵`);
  console.log('');
  console.log('📋 اطلاعات ورود:');
  console.log('   ادمین:     admin / 123');
  console.log('   فروشنده:   seller1 / seller123');
  console.log('   خریدار:    buyer1 / buyer123');
}

main()
  .catch((e) => {
    console.error('❌ خطا در seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });