/**
 * Prisma Seed - داده‌های اولیه دیتابیس
 * اجرا: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';

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

function getRandomImage(seed: number): string {
  return IMAGE_PATHS[seed % IMAGE_PATHS.length];
}

async function main() {
  console.log('🌱 شروع seeding دیتابیس...');
  console.log('🗑️ پاک‌سازی کامل دیتابیس...');

  // پاک‌سازی جداول با توجه به وابستگی‌ها (به ترتیب معکوس FK)
  await prisma.wishlistItem.deleteMany();
  await prisma.compareItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.storeReview.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.qna.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.variantAttributeValue.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeDefinition.deleteMany();
  await prisma.discountCodeUsage.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.storeRating.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.color.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  await prisma.otpCode.deleteMany();

  console.log('✅ دیتابیس پاک شد');

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
  const bcrypt = await import('bcryptjs');
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
      role: 'superAdmin',
      permissions: JSON.stringify(['all']),
      isVerified: true,
      emailVerified: true,
      hasSetPassword: true,
      isActive: true,
    },
  });
  console.log('✅ کاربر ادمین ایجاد شد');

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
        isVerified: true,
        emailVerified: true,
        hasSetPassword: true,
        isActive: true,
      },
    });
    sellers.push(seller);
  }
  console.log(`✅ ${sellers.length} فروشنده ایجاد شد`);

  // ============================================
  // ۲.۵. فروشگاه‌ها (Stores)
  // ============================================
  const stores: any[] = [];
  for (let i = 0; i < sellers.length; i++) {
    const s = sellers[i];
    const storeName = s.storeName || s.firstName + ' ' + s.lastName;
    const store = await prisma.store.upsert({
      where: { ownerId: s.id },
      update: {},
      create: {
        ownerId: s.id,
        name: storeName,
        nameEn: storeName,
        slug: `${s.username}-store-${i + 1}`,
        status: 'approved' as any,
        commissionRate: 10,
        isVerified: true,
        isActive: true,
      },
    });
    stores.push(store);
  }
  console.log(`✅ ${stores.length} فروشگاه ایجاد شد`);

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
    { name: 'بلو', nameEn: 'Blue', slug: 'blue', description: 'بلو，لوازم صوتی' },
  ];

  const createdBrands: any[] = [];
  for (const brand of brandsData) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { name: brand.name, nameEn: brand.nameEn, slug: brand.slug, description: brand.description },
    });
    createdBrands.push(createdBrand);
  }
  console.log(`✅ ${createdBrands.length} برند ایجاد شد`);

  // ============================================
  // ۵. رنگ‌ها (Colors)
  // ============================================
  const colorsData = [
    { name: 'مشکی', nameEn: 'Black', hexCode: '#000000', slug: 'black' },
    { name: 'سفید', nameEn: 'White', hexCode: '#FFFFFF', slug: 'white' },
    { name: 'قرمز', nameEn: 'Red', hexCode: '#FF0000', slug: 'red' },
    { name: 'آبی', nameEn: 'Blue', hexCode: '#0066FF', slug: 'blue' },
    { name: 'سبز', nameEn: 'Green', hexCode: '#00AA00', slug: 'green' },
    { name: 'زرد', nameEn: 'Yellow', hexCode: '#FFD700', slug: 'yellow' },
    { name: 'نارنجی', nameEn: 'Orange', hexCode: '#FF8C00', slug: 'orange' },
    { name: 'بنفش', nameEn: 'Purple', hexCode: '#800080', slug: 'purple' },
    { name: 'صورتی', nameEn: 'Pink', hexCode: '#FFC0CB', slug: 'pink' },
    { name: 'سورمه‌ای', nameEn: 'Navy', hexCode: '#000080', slug: 'navy' },
    { name: 'خاکستری', nameEn: 'Gray', hexCode: '#808080', slug: 'gray' },
    { name: 'قهوه‌ای', nameEn: 'Brown', hexCode: '#8B4513', slug: 'brown' },
  ];

  const createdColors: any[] = [];
  for (const c of colorsData) {
    const color = await prisma.color.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, nameEn: c.nameEn, hexCode: c.hexCode, slug: c.slug },
    });
    createdColors.push(color);
  }
  console.log(`✅ ${createdColors.length} رنگ ایجاد شد`);

  // نگاشت slug رنگ به id
  const colorById: Record<string, string> = {};
  for (const c of createdColors) {
    colorById[c.slug] = c.id;
  }

  // ============================================
  // ۶. محصولات نمونه (~30 محصول)
  // ============================================
  const productsData = [
    // موبایل (7 محصول)
    { title: 'گوشی سامسونگ Galaxy S24', slug: 'samsung-s24', desc: 'پرچمدار سامسونگ با دوربین 200 مگاپیکسل', price: 45999000, qty: 10, brand: 'samsung', cat: 'mobile-phones', storeIdx: 0 },
    { title: 'گوشی سامسونگ Galaxy A34', slug: 'samsung-a34', desc: 'میانی رده سامسونگ', price: 9999000, qty: 25, brand: 'samsung', cat: 'mobile-phones', storeIdx: 1 },
    { title: 'گوشی سامسونگ Galaxy A14', slug: 'samsung-a14', desc: 'اقتصادی سامسونگ', price: 5999000, qty: 40, brand: 'samsung', cat: 'mobile-phones', storeIdx: 1 },
    { title: 'گوشی آیفون 15 پرو', slug: 'iphone-15-pro', desc: 'پرچمدار اپل', price: 79999000, qty: 5, brand: 'apple', cat: 'mobile-phones', storeIdx: 2 },
    { title: 'گوشی آیفون 15', slug: 'iphone-15', desc: 'آیفون استاندارد', price: 59999000, qty: 8, brand: 'apple', cat: 'mobile-phones', storeIdx: 2 },
    { title: 'گوشی شیائومی 14', slug: 'xiaomi-14', desc: 'پرچمدار شیائومی', price: 29999000, qty: 12, brand: 'xiaomi', cat: 'mobile-phones', storeIdx: 3 },
    { title: 'گوشی شیائومی Redmi Note 13', slug: 'redmi-note-13', desc: 'میانی رده شیائومی', price: 8999000, qty: 30, brand: 'xiaomi', cat: 'mobile-phones', storeIdx: 3 },

    // لپ تاپ (5 محصول)
    { title: 'لپ تاپ لنوو IdeaPad 5', slug: 'lenovo-ideapad-5', desc: 'کاربری عمومی', price: 35999000, qty: 8, brand: 'lenovo', cat: 'laptops', storeIdx: 0 },
    { title: 'لپ تاپ ایسوس VivoBook', slug: 'asus-vivobook', desc: 'سبک و قابل حمل', price: 28999000, qty: 12, brand: 'asus', cat: 'laptops', storeIdx: 1 },
    { title: 'مک بوک ایر M3', slug: 'macbook-air-m3', desc: 'اپل سبک', price: 69999000, qty: 4, brand: 'apple', cat: 'laptops', storeIdx: 2 },
    { title: 'لپ تاپ گیمینگ ایسوس TUF', slug: 'asus-tuf-gaming', desc: 'بازی حرفه‌ای', price: 52999000, qty: 5, brand: 'asus', cat: 'laptops', storeIdx: 1 },
    { title: 'لپ تاپ لنوو Legion', slug: 'lenovo-legion', desc: 'گیمینگ لنوو', price: 48999000, qty: 6, brand: 'lenovo', cat: 'laptops', storeIdx: 0 },

    // هدفون (4 محصول)
    { title: 'ایرپاد پرو 2', slug: 'airpod-pro-2', desc: 'اپل بی‌سیم', price: 12999000, qty: 15, brand: 'apple', cat: 'headphones', storeIdx: 2 },
    { title: 'هدفون سونی WH-1000XM5', slug: 'sony-xm5', desc: 'نویز کنسلینگ', price: 18999000, qty: 8, brand: 'sony', cat: 'headphones', storeIdx: 3 },
    { title: 'هدفون بلو Tune 770', slug: 'blue-tune-770', desc: 'بلو بی‌سیم', price: 4999000, qty: 25, brand: 'blue', cat: 'headphones', storeIdx: 4 },
    { title: 'هندزفری شیائومی Buds', slug: 'xiaomi-buds-4', desc: 'شیائومی بلوتوث', price: 3499000, qty: 30, brand: 'xiaomi', cat: 'headphones', storeIdx: 3 },

    // ساعت هوشمند (3 محصول)
    { title: 'اپل واچ Ultra 2', slug: 'apple-watch-ultra-2', desc: 'اپل حرفه‌ای', price: 39999000, qty: 5, brand: 'apple', cat: 'smart-watches', storeIdx: 2 },
    { title: 'ساعت سامسونگ Watch 6', slug: 'samsung-watch-6', desc: 'سامسونگ کلاسیک', price: 15999000, qty: 12, brand: 'samsung', cat: 'smart-watches', storeIdx: 1 },
    { title: 'ساعت شیائومی Band 8', slug: 'xiaomi-band-8', desc: 'اقتصادی', price: 2999000, qty: 40, brand: 'xiaomi', cat: 'smart-watches', storeIdx: 3 },

    // پوشاک مردانه (4 محصول)
    { title: 'پیراهن مردانه اسلیم', slug: 'men-slim-shirt', desc: 'اسلیم فیت نخی', price: 690000, qty: 50, brand: 'mod-barta', cat: 'men-fashion', storeIdx: 2 },
    { title: 'شلوار جین مردانه', slug: 'men-jeans', desc: 'جین اصل', price: 1290000, qty: 35, brand: 'mod-barta', cat: 'men-fashion', storeIdx: 2 },
    { title: 'تیشرت مردانه یقه گرد', slug: 'men-tshirt', desc: 'نخی راحت', price: 390000, qty: 80, brand: 'mod-barta', cat: 'men-fashion', storeIdx: 2 },
    { title: 'هودی مردانه', slug: 'men-hoodie', desc: 'کلاه‌دار', price: 890000, qty: 45, brand: 'mod-barta', cat: 'men-fashion', storeIdx: 2 },

    // پوشاک زنانه (4 محصول)
    { title: 'مانتو زنانه مجلسی', slug: 'women-manto-formal', desc: 'مجلسی شیک', price: 1890000, qty: 20, brand: 'mod-barta', cat: 'women-fashion', storeIdx: 2 },
    { title: 'شلوار زنانه پارچه‌ای', slug: 'women-trousers', desc: 'رسمی', price: 790000, qty: 35, brand: 'iran-fashion', cat: 'women-fashion', storeIdx: 3 },
    { title: 'بلوز زنانه مجلسی', slug: 'women-blouse', desc: 'شیک', price: 690000, qty: 40, brand: 'mod-barta', cat: 'women-fashion', storeIdx: 2 },
    { title: 'لباس زنانه مجلس', slug: 'women-dress', desc: 'بلند', price: 2290000, qty: 18, brand: 'mod-barta', cat: 'women-fashion', storeIdx: 2 },

    // لوازم خانگی (3 محصول)
    { title: 'سرویس قابلمه 10 پارچه', slug: 'cookware-10pc', desc: 'گرانیتی', price: 6990000, qty: 10, brand: 'tefal', cat: 'home-kitchen', storeIdx: 4 },
    { title: 'سرخ‌کن بدون روغن', slug: 'air-fryer', desc: '5 لیتری', price: 5490000, qty: 8, brand: 'hyundai', cat: 'home-kitchen', storeIdx: 4 },
    { title: 'جاروبرقی بوش', slug: 'bosch-vacuum', desc: 'قوی', price: 12990000, qty: 5, brand: 'bosch', cat: 'home-kitchen', storeIdx: 4 },

    // ورزشی (3 محصول)
    { title: 'کفش دویدن نایک پیموس', slug: 'nike-pegasus', desc: 'دویدن', price: 6990000, qty: 15, brand: 'nike', cat: 'sports', storeIdx: 3 },
    { title: 'کفش آدیداس Ultraboost', slug: 'adidas-ultraboost', desc: 'راحتی بالا', price: 7490000, qty: 12, brand: 'adidas', cat: 'sports', storeIdx: 3 },
    { title: 'مت یوگا', slug: 'yoga-mat', desc: 'ضد لغزش', price: 490000, qty: 50, brand: 'nike', cat: 'sports', storeIdx: 3 },

    // زیبایی و سلامت (3 محصول)
    { title: 'کرم ضد آفتاب 50', slug: 'spf50-cream', desc: 'ضد آفتاب', price: 450000, qty: 60, brand: 'cinere', cat: 'beauty', storeIdx: 4 },
    { title: 'سرم ویتامین C', slug: 'vitamin-c-serum', desc: 'روشن‌کننده', price: 690000, qty: 40, brand: 'loreal', cat: 'beauty', storeIdx: 4 },
    { title: 'ادکلن مردانه', slug: 'men-parfum', desc: 'خوشبو', price: 1890000, qty: 20, brand: 'loreal', cat: 'beauty', storeIdx: 4 },
  ];

  let productCount = 0;
  const createdProducts: any[] = [];

  for (const prod of productsData) {
    const category = await prisma.category.findUnique({ where: { slug: prod.cat } });
    if (!category) {
      console.log(`⚠️ دسته‌بندی ${prod.cat} یافت نشد`);
      continue;
    }

    const brand = createdBrands.find((b: any) => b.slug === prod.brand);
    const store = stores[prod.storeIdx % stores.length];

    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const newProduct = await prisma.product.create({
        data: {
          title: prod.title,
          titleEn: prod.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          slug: prod.slug,
          slugEn: prod.slug,
          description: prod.desc,
          descriptionEn: prod.desc,
          brandId: brand?.id || null,
          storeId: store.id,
          categoryId: category.id,
          status: 'approved',
          isFeatured: Math.random() > 0.7,
          viewCount: Math.floor(Math.random() * 500),
          saleCount: Math.floor(Math.random() * 100),
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 50),
        },
      });

      // تصاویر محصول
      const imageCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < imageCount; i++) {
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

      // ایجاد default Variant
      const sku = `PRD-${prod.slug.toUpperCase().replace(/[^A-Z0-9]/g, '')}-001`;
      const defaultVariant = await prisma.productVariant.create({
        data: {
          productId: newProduct.id,
          name: 'پیش‌فرض',
          nameEn: 'Default',
          sku: sku.substring(0, 100),
          price: prod.price,
          quantity: prod.qty,
        },
      });

      createdProducts.push({ ...newProduct, defaultVariantPrice: prod.price, defaultVariantSku: defaultVariant.sku, defaultVariantId: defaultVariant.id, store: store });
      productCount++;
    }
  }
  console.log(`✅ ${productCount} محصول جدید ایجاد شد`);

  // ============================================
  // ۶.۵. اطمینان از ساخت attribute definitionها
  // ============================================
  const attrKeys = ['storage', 'ram', 'gen', 'size', 'pieces', 'capacity', 'color', 'material'];
  for (const key of attrKeys) {
    await prisma.attributeDefinition.upsert({
      where: { key },
      update: {},
      create: { key, label: key },
    });
  }
  console.log('✅ Attribute definitions ساخته شدند');

  // ============================================
  // ۷. Variant اضافی با VariantAttributeValue
  // ============================================
  async function createVariantWithAttributes(
    productSlug: string,
    variantName: string,
    variantNameEn: string,
    sku: string,
    price: number,
    quantity: number,
    colorSlug: string,
    attributeKey: string,
    attributeValue: string,
  ) {
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) return;
    const basePrice = (await prisma.productVariant.findFirst({ where: { productId: product.id } }))?.price;

    await prisma.productVariant.upsert({
      where: { sku },
      update: {},
      create: {
        productId: product.id,
        name: variantName,
        nameEn: variantNameEn,
        sku,
        price: price ?? basePrice,
        quantity,
        colorId: colorById[colorSlug] || null,
        attributes: {
          create: {
            attributeId: (await prisma.attributeDefinition.findFirst({ where: { key: attributeKey } }))?.id || '',
            value: attributeValue,
          },
        },
      },
    });
  }

  // موبایل: رنگ + حافظه
  await createVariantWithAttributes('samsung-s24', 'مشکی - 128GB', 'Black - 128GB', 'SAM-S24-BLK-128', 45999000, 5, 'black', 'storage', '128GB');
  await createVariantWithAttributes('samsung-s24', 'سفید - 256GB', 'White - 256GB', 'SAM-S24-WHT-256', 49999000, 3, 'white', 'storage', '256GB');
  await createVariantWithAttributes('samsung-s24', 'بنفش - 256GB', 'Purple - 256GB', 'SAM-S24-PUR-256', 49999000, 4, 'purple', 'storage', '256GB');

  await createVariantWithAttributes('iphone-15-pro', 'مشکی تیتانیوم', 'Black Titanium', 'APL-IP15P-BLK', 79999000, 3, 'black', 'storage', '256GB');
  await createVariantWithAttributes('iphone-15-pro', 'سفید تیتانیوم', 'White Titanium', 'APL-IP15P-WHT', 79999000, 2, 'white', 'storage', '512GB');

  await createVariantWithAttributes('xiaomi-14', 'مشکی', 'Black', 'XMI-X14-BLK', 29999000, 6, 'black', 'storage', '256GB');
  await createVariantWithAttributes('xiaomi-14', 'سبز', 'Green', 'XMI-X14-GRN', 29999000, 6, 'green', 'storage', '256GB');

  // لپ تاپ: رنگ
  await createVariantWithAttributes('lenovo-ideapad-5', 'خاکستری', 'Gray', 'LNV-IDP5-GRY', 35999000, 4, 'gray', 'ram', '8GB');
  await createVariantWithAttributes('lenovo-ideapad-5', 'مشکی', 'Black', 'LNV-IDP5-BLK', 37999000, 4, 'black', 'ram', '16GB');

  await createVariantWithAttributes('macbook-air-m3', 'نقره‌ای', 'Silver', 'APL-MBA-M3-SLV', 69999000, 2, 'gray', 'ram', '8GB');
  await createVariantWithAttributes('macbook-air-m3', 'طلایی', 'Gold', 'APL-MBA-M3-GOLD', 71999000, 2, 'yellow', 'ram', '16GB');

  // هدفون: رنگ
  await createVariantWithAttributes('airpod-pro-2', 'سفید', 'White', 'APL-APP2-WHT', 12999000, 8, 'white', 'gen', '2');
  await createVariantWithAttributes('sony-xm5', 'مشکی', 'Black', 'SNY-XM5-BLK', 18999000, 4, 'black', 'gen', '5');
  await createVariantWithAttributes('sony-xm5', 'نقره‌ای', 'Silver', 'SNY-XM5-SLV', 18999000, 4, 'gray', 'gen', '5');

  // ساعت هوشمند: رنگ
  await createVariantWithAttributes('apple-watch-ultra-2', 'نارنجی', 'Orange', 'APL-AWU2-ORG', 39999000, 3, 'orange', 'size', '49mm');
  await createVariantWithAttributes('samsung-watch-6', 'مشکی', 'Black', 'SAM-SW6-BLK', 15999000, 6, 'black', 'size', '44mm');

  // پوشاک مردانه: سایز + رنگ
  await createVariantWithAttributes('men-slim-shirt', 'M - آبی', 'M - Blue', 'SHR-SLM-M-BLU', 690000, 15, 'blue', 'size', 'M');
  await createVariantWithAttributes('men-slim-shirt', 'L - آبی', 'L - Blue', 'SHR-SLM-L-BLU', 690000, 15, 'blue', 'size', 'L');
  await createVariantWithAttributes('men-slim-shirt', 'XL - سفید', 'XL - White', 'SHR-SLM-XL-WHT', 690000, 10, 'white', 'size', 'XL');
  await createVariantWithAttributes('men-slim-shirt', 'M - سفید', 'M - White', 'SHR-SLM-M-WHT', 690000, 10, 'white', 'size', 'M');

  await createVariantWithAttributes('men-jeans', '32 - آبی تیره', '32 - Dark Blue', 'JNS-MN-32-DBL', 1290000, 12, 'blue', 'size', '32');
  await createVariantWithAttributes('men-jeans', '34 - آبی تیره', '34 - Dark Blue', 'JNS-MN-34-DBL', 1290000, 12, 'blue', 'size', '34');
  await createVariantWithAttributes('men-jeans', '36 - مشکی', '36 - Black', 'JNS-MN-36-BLK', 1290000, 10, 'black', 'size', '36');

  await createVariantWithAttributes('men-tshirt', 'M - سفید', 'M - White', 'TSH-MN-M-WHT', 390000, 25, 'white', 'size', 'M');
  await createVariantWithAttributes('men-tshirt', 'L - مشکی', 'L - Black', 'TSH-MN-L-BLK', 390000, 25, 'black', 'size', 'L');
  await createVariantWithAttributes('men-tshirt', 'XL - آبی', 'XL - Blue', 'TSH-MN-XL-BLU', 390000, 20, 'blue', 'size', 'XL');

  await createVariantWithAttributes('men-hoodie', 'M - خاکستری', 'M - Gray', 'HOD-MN-M-GRY', 890000, 15, 'gray', 'size', 'M');
  await createVariantWithAttributes('men-hoodie', 'L - مشکی', 'L - Black', 'HOD-MN-L-BLK', 890000, 15, 'black', 'size', 'L');

  // پوشاک زنانه: سایز + رنگ
  await createVariantWithAttributes('women-manto-formal', 'S - مشکی', 'S - Black', 'MNT-FRM-S-BLK', 1890000, 6, 'black', 'size', 'S');
  await createVariantWithAttributes('women-manto-formal', 'M - مشکی', 'M - Black', 'MNT-FRM-M-BLK', 1890000, 6, 'black', 'size', 'M');
  await createVariantWithAttributes('women-manto-formal', 'L - سورمه‌ای', 'L - Navy', 'MNT-FRM-L-NVY', 1890000, 5, 'navy', 'size', 'L');

  await createVariantWithAttributes('women-trousers', 'S - مشکی', 'S - Black', 'TRS-WMN-S-BLK', 790000, 12, 'black', 'size', 'S');
  await createVariantWithAttributes('women-trousers', 'M - سورمه‌ای', 'M - Navy', 'TRS-WMN-M-NVY', 790000, 12, 'navy', 'size', 'M');

  await createVariantWithAttributes('women-blouse', 'S - سفید', 'S - White', 'BLS-WMN-S-WHT', 690000, 15, 'white', 'size', 'S');
  await createVariantWithAttributes('women-blouse', 'M - صورتی', 'M - Pink', 'BLS-WMN-M-PNK', 690000, 15, 'pink', 'size', 'M');

  await createVariantWithAttributes('women-dress', 'S - مشکی', 'S - Black', 'DRS-WMN-S-BLK', 2290000, 8, 'black', 'size', 'S');
  await createVariantWithAttributes('women-dress', 'M - قرمز', 'M - Red', 'DRS-WMN-M-RED', 2290000, 8, 'red', 'size', 'M');

  // لوازم خانگی
  await createVariantWithAttributes('cookware-10pc', '8 پارچه', '8-Piece', 'CKW-GRN-8PC', 5990000, 8, 'gray', 'pieces', '8');
  await createVariantWithAttributes('cookware-10pc', '12 پارچه', '12-Piece', 'CKW-GRN-12PC', 7990000, 10, 'gray', 'pieces', '12');

  await createVariantWithAttributes('air-fryer', '4 لیتری', '4L', 'FRY-HY-4L', 4490000, 5, 'black', 'capacity', '4L');
  await createVariantWithAttributes('air-fryer', '6 لیتری', '6L', 'FRY-HY-6L', 5990000, 5, 'black', 'capacity', '6L');

  // ورزشی: سایز + رنگ
  await createVariantWithAttributes('nike-pegasus', '40 - قرمز', '40 - Red', 'NIKE-PEG-40-RED', 6990000, 6, 'red', 'size', '40');
  await createVariantWithAttributes('nike-pegasus', '42 - آبی', '42 - Blue', 'NIKE-PEG-42-BLU', 6990000, 6, 'blue', 'size', '42');
  await createVariantWithAttributes('nike-pegasus', '44 - مشکی', '44 - Black', 'NIKE-PEG-44-BLK', 6990000, 5, 'black', 'size', '44');

  await createVariantWithAttributes('adidas-ultraboost', '40 - سفید', '40 - White', 'ADI-UB-40-WHT', 7490000, 6, 'white', 'size', '40');
  await createVariantWithAttributes('adidas-ultraboost', '42 - مشکی', '42 - Black', 'ADI-UB-42-BLK', 7490000, 6, 'black', 'size', '42');

  // زیبایی
  await createVariantWithAttributes('spf50-cream', '50ml', '50ml', 'SPF-50ML', 450000, 30, 'white', 'size', '50ml');
  await createVariantWithAttributes('spf50-cream', '100ml', '100ml', 'SPF-100ML', 750000, 25, 'white', 'size', '100ml');

  await createVariantWithAttributes('vitamin-c-serum', '30ml', '30ml', 'VTC-30ML', 690000, 20, 'orange', 'size', '30ml');
  await createVariantWithAttributes('vitamin-c-serum', '50ml', '50ml', 'VTC-50ML', 990000, 15, 'orange', 'size', '50ml');

  await createVariantWithAttributes('men-parfum', '100ml', '100ml', 'PRF-MN-100', 1890000, 10, 'black', 'size', '100ml');
  await createVariantWithAttributes('men-parfum', '50ml', '50ml', 'PRF-MN-50', 1190000, 10, 'black', 'size', '50ml');

  console.log('✅ Variant محصولات با مدل جدید ایجاد شدند');

  // ============================================
  // ۸. کدهای تخفیف
  // ============================================
  const discountCodes = [
    { code: 'WELCOME10', type: 'percentage' as any, value: 10, minOrder: 1000000, maxDisc: 500000, limit: 100, desc: 'خوش‌آمدگویی ۱۰٪' },
    { code: 'FREE50', type: 'fixed' as any, value: 50000, minOrder: 500000, limit: 50, desc: '۵۰ هزار تومان ثابت' },
    { code: 'SUMMER20', type: 'percentage' as any, value: 20, minOrder: 2000000, maxDisc: 1000000, limit: 200, desc: 'تابستانه ۲۰٪' },
    { code: 'NEWYEAR15', type: 'percentage' as any, value: 15, minOrder: 1500000, maxDisc: 750000, limit: 150, desc: 'سال نو ۱۵٪' },
    { code: 'FLASH30', type: 'percentage' as any, value: 30, minOrder: 3000000, maxDisc: 2000000, limit: 30, desc: 'فلاش ۳۰٪' },
    { code: 'BIG100', type: 'fixed' as any, value: 100000, minOrder: 5000000, limit: 25, desc: '۱۰۰ هزار تومان بزرگ' },
    { code: 'FIRST5', type: 'percentage' as any, value: 5, minOrder: 0, limit: 9999, desc: 'اولین خرید ۵٪' },
    { code: 'VIP20', type: 'percentage' as any, value: 20, minOrder: 4000000, maxDisc: 1500000, limit: 50, desc: 'وی‌آی‌پی ۲۰٪' },
    { code: 'MOBILE15', type: 'percentage' as any, value: 15, minOrder: 5000000, maxDisc: 2000000, limit: 40, desc: 'موبایل ۱۵٪' },
    { code: 'FASHION25', type: 'percentage' as any, value: 25, minOrder: 1000000, maxDisc: 500000, limit: 80, desc: 'مد و پوشاک ۲۵٪' },
    { code: 'HOME30', type: 'fixed' as any, value: 300000, minOrder: 8000000, limit: 20, desc: 'لوازم خانگی ۳۰۰ هزار' },
    { code: 'BOOKS10', type: 'percentage' as any, value: 10, minOrder: 200000, limit: 200, desc: 'کتاب ۱۰٪' },
    { code: 'SPORT15', type: 'percentage' as any, value: 15, minOrder: 2000000, maxDisc: 800000, limit: 60, desc: 'ورزشی ۱۵٪' },
    { code: 'BEAUTY20', type: 'percentage' as any, value: 20, minOrder: 1000000, maxDisc: 400000, limit: 70, desc: 'زیبایی ۲۰٪' },
    { code: 'NIGHT40', type: 'fixed' as any, value: 40000, minOrder: 300000, limit: 100, desc: 'شب تا صبح ۴۰ هزار' },
    { code: 'FLASH2', type: 'percentage' as any, value: 50, minOrder: 1000000, maxDisc: 1000000, limit: 10, desc: 'فلاش ۲ ساعته ۵۰٪' },
    { code: 'LOYALTY', type: 'percentage' as any, value: 8, minOrder: 0, limit: 9999, desc: 'وفاداری ۸٪' },
    { code: 'REFER25', type: 'fixed' as any, value: 25000, minOrder: 500000, limit: 500, desc: 'معرفی ۲۵ هزار' },
    { code: 'HOLIDAY35', type: 'percentage' as any, value: 35, minOrder: 2000000, maxDisc: 1500000, limit: 45, desc: 'تعطیلات ۳۵٪' },
    { code: 'EXTRA10', type: 'fixed' as any, value: 10000, minOrder: 100000, limit: 1000, desc: 'اضافه ۱۰ هزار' },
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
          storeId: stores[discountCount % stores.length].id,
        },
      });
      discountCount++;
    }
  }
  console.log(`✅ ${discountCount} کد تخفیف جدید ایجاد شد`);

  // ============================================
  // ۹. روش‌های ارسال
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
  // ۱۰. بنرها
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
  // ۱۱. آدرس‌های نمونه
  // ============================================
  const addresses = [
    { userId: admin.id, title: 'دفتر', fullName: 'مدیر سیستم', phone: '09120000000', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، شماره ۱', postalCode: '1234567890', isDefault: true },
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
  // ۱۲. بلاگ پست‌ها
  // ============================================
  const blogPosts = [
    { title: 'راهنمای خرید گوشی هوشمند', slug: 'smartphone-buying-guide', excerpt: 'نکات مهم خرید', content: 'محتوای راهنمای خرید...', status: 'published' as any },
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
  // ۱۳. نظرات نمونه
  // ============================================
  const allProducts = await prisma.product.findMany({ where: { status: 'approved' }, take: 30 });
  const reviewTexts = [
    'محصول عالی، کاملاً راضی',
    'کیفیت خوب بود ولی کمی گران',
    'ارسال سریع، بسته‌بندی مناسب',
    'متوسط بود، انتظار بیشتری داشتم',
    'خیلی خوب، پیشنهاد می‌کنم',
    'محصول اصل بود， ممنون',
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
      await prisma.review.upsert({
        where: { userId_productId: { userId: randomBuyer.id, productId: product.id } },
        update: {},
        create: {
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
  // ۱۳.۵. نظرات فیک لپ تاپ لنوو Legion
  // ============================================
  const legionProduct = await prisma.product.findUnique({ where: { slug: 'lenovo-legion' } });
  if (legionProduct) {
    const reviewTextsLegion = [
      'لپ تاپ فوق‌العاده‌ای برای گیمینگ. سرعت بالا و خنک‌کننده عالی.',
      'کارت گرافیک قوی، برای بازی‌های سنگین عالیه.',
      'صفحه نمایش رنگ‌های زنده و شارپ داره.',
      'کیبورد نورانی با تجربه تایپ عالی.',
      'باتری در حد انتظار، برای گیم باید شارژر همراه باشه.',
      'وزن مناسب برای یه لپ تاپ گیمینگ.',
      'دقت لمسی تاچ‌پد خوبه ولی برای گیم ماوس بهتره.',
      'صدای فن زیر فشار زیاد میشه ولی طبیعیه.',
      'اسپیکرهای استریو با کیفیت عالی.',
      'پورت‌های متنوع و دسترسی آسان.',
      'حافظه SSD سرعت بوت فوق‌العاده‌ای داره.',
      'رم قابل ارتقا هست و خوشبختانه خونه یدونه دیگه هم داره.',
      'برای رندرینگ ویدیو هم خوب عمل می‌کنه.',
      'درب لپ تاپ کمی لق میشه ولی مشکل بزرگ نیست.',
      'قیمت نسبت بهspecs خوبه ولی رقبا هم هستند.',
      'سیستم خنک‌کننده در برابر رقبا بهتر عمل می‌کنه.',
      'پنجره نوت بوک رو به راحتی بالا میاره.',
      'برنامه‌های چت و وبگردی بدون هیچ کندی.',
      'برای استریم کردن هم مناسب هست.',
      'اگه بودجه‌شو دارید مطمئناً ارزش خریدشو داره.',
    ];
    for (let i = 0; i < 20; i++) {
      const randomBuyer = buyers[i % buyers.length];
      await prisma.review.upsert({
        where: { userId_productId: { userId: randomBuyer.id, productId: legionProduct.id } },
        update: {},
        create: {
          rating: 3 + (i % 3),
          title: reviewTextsLegion[i],
          body: reviewTextsLegion[i] + ' - Lenovo Legion',
          isApproved: true,
          userId: randomBuyer.id,
          productId: legionProduct.id,
        },
      });
    }
    console.log('✅ 20 نظر فیک برای لپ تاپ لنوو Legion ایجاد شد');

    // ============================================
    // ۱۳.۶. پرسش و پاسخ فیک لپ تاپ لنوو Legion
    // ============================================
    const qnasLegion = [
      { content: 'آیا این لپ تاپ قابلیت ارتقای رم داره؟', role: 'buyer', status: 'approved' },
      { content: 'حافظه SSD از چه نوعیه؟ NVMe؟', role: 'buyer', status: 'approved' },
      { content: 'آیا برای کارهای گرافیکی هم مناسبه؟', role: 'buyer', status: 'approved' },
      { content: 'وزن دقیق دستگاه چقدره؟', role: 'buyer', status: 'approved' },
      { content: 'چند پورت USB داره؟', role: 'buyer', status: 'approved' },
      { content: 'آیا پورت HDMI داره؟', role: 'buyer', status: 'approved' },
      { content: 'دقت صفحه نمایش چقدره؟', role: 'buyer', status: 'approved' },
      { content: 'آیا برای پردازش ویدیو 4K مناسبه؟', role: 'buyer', status: 'approved' },
      { content: 'چند سال گارانتی داره؟', role: 'buyer', status: 'approved' },
      { content: 'آیا تاچ اسکرینه؟', role: 'buyer', status: 'approved' },
      { content: 'دوربین وب کیفیتش چطوره؟', role: 'buyer', status: 'approved' },
      { content: 'بلوتوثش چندمه؟', role: 'buyer', status: 'approved' },
      { content: 'آیا از وای‌فای 6 پشتیبانی می‌کنه؟', role: 'buyer', status: 'approved' },
      { content: 'شارژر 200 وات هست یا کمتر؟', role: 'buyer', status: 'approved' },
      { content: 'آیا امکان خرید رم اضافه هست؟', role: 'buyer', status: 'approved' },
      { content: 'هیت سینکش چقدر سر و صدا داره؟', role: 'buyer', status: 'approved' },
      { content: 'آیا برای برنامه‌نویسی مناسبه؟', role: 'buyer', status: 'approved' },
      { content: 'رنگش واقعاً مشکیه یا خاکستری؟', role: 'buyer', status: 'approved' },
      { content: 'آیا برای کارهای مهندسی هم خوبه؟', role: 'buyer', status: 'approved' },
      { content: 'کدوم مدل گیمینگ بهتره Legion یا IdeaPad؟', role: 'buyer', status: 'approved' },
    ];
    for (let i = 0; i < 20; i++) {
      const randomBuyer = buyers[i % buyers.length];
      await prisma.qna.create({
        data: {
          content: qnasLegion[i].content,
          role: qnasLegion[i].role as any,
          status: qnasLegion[i].status as any,
          userId: randomBuyer.id,
          productId: legionProduct.id,
        },
      });
    }
    console.log('✅ 20 پرسش و پاسخ فیک برای لپ تاپ لنوو Legion ایجاد شد');
  }
  // ============================================
  // ۱۳.۷. نظرات و پرسش‌وپاسخ غنی برای فروشگاه‌های نمونه
  // (فروشگاه ۰ و ۲ - بیشترین محصول)
  // ============================================
  const store0Products = await prisma.product.findMany({
    where: { storeId: stores[0].id, status: 'approved' },
    select: { id: true, slug: true, title: true },
  });
  const store1Products = await prisma.product.findMany({
    where: { storeId: stores[2].id, status: 'approved' },
    select: { id: true, slug: true, title: true },
  });

  const reviewTextsRich = [
    'محصول عالی و با کیفیت، کاملاً راضی هستم. ارسال هم سریع بود.',
    'کیفیت ساخت فوق‌العاده‌ست. دقیقاً همون چیزی بود که انتظار داشتم.',
    'بعد از دو هفته استفاده هنوز هم مثل روز اول کار می‌کنه. ارزش خرید بالایی داره.',
    'بسته‌بندی عالی بود و محصول بدون هیچ آسیبی رسید. ممنون از فروشنده.',
    'قیمت نسبت به کیفیت محصول واقعاً منصفانه‌ست. پیشنهاد می‌کنم.',
    'در اولین خریدم از این فروشگاه بود و اصلاً پشیمون نیستم.',
    'محصول اصل هست و گارانتی هم داره. پشتیبانی فروشگاه هم عالیه.',
    'رنگ و طراحی دقیقاً مثل عکس سایت بود. خیلی خوشحالم.',
    'برای هدیه خریدم و بسته‌بندی‌ش خیلی شیک و حرفه‌ای بود.',
    'سه بار دیگه هم از همین فروشگاه خرید کردم، همیشه راضی بودم.',
    'کیفیت نسبت به رقبا خیلی بهتره. حتماً برمی‌گردم.',
    'ارسال سریع، بسته‌بندی استاندارد و محصول بدون نقص. عالی!',
    'با اینکه قیمتش متوسط بود ولی کیفیتش از خیلی برندهای گرون‌تر بهتره.',
    'مشتری‌مداری فروشگاه واقعاً عالیه. به همه پیشنهاد می‌دم.',
    'نصفه‌شب سفارش دادم صبح همون روز تحویل گرفتم. باورنکردنی!',
    'برای استفاده روزمره عالیه. دستکم ۶ ماه استفاده کردم بدون هیچ مشکلی.',
    'مقایسه‌اش کردم با مدل‌های دیگه، این بهترین گزینه توی این بازه قیمتی بود.',
    'نکته مثبت دیگه خدمات پس از فروششونه که واقعاً جوابگو هستن.',
    'از زمان سفارش تا تحویل همه مراحل شفاف و سریع بود.',
    'یه خرید عالی بود. حتماً به دوستانم هم پیشنهاد می‌دم.',
  ];

  const answerTexts = [
    'سلام، ممنون از حسن انتخابتون. امیدواریم همیشه راضی باشید.',
    'متشکریم! پشتیبانی ما ۲۴ ساعته در خدمتتون هست.',
    'خوشحالم که راضی بودید. برای خریدهای بعدی هم تخفیف ویژه داریم.',
    'سپاسگزاریم. گارانتی محصول ۱۸ ماهه هست و در دسترسه.',
    'ممنون از لطف شما. نظراتتون بهمون انگیزه میده.',
  ];

  async function seedRichReviews(
    products: { id: string; slug: string; title: string }[],
    prefix: string,
    sellerOwnerId: string,
  ) {
    for (const product of products) {
      const numReviews = 18 + Math.floor(Math.random() * 5);
      for (let i = 0; i < numReviews; i++) {
        const buyer = buyers[i % buyers.length];
        const rating = i < 3 ? 5 : i < 8 ? 4 : i < 12 ? 5 : 4;
        await prisma.review.upsert({
          where: { userId_productId: { userId: buyer.id, productId: product.id } },
          update: {},
          create: {
            rating,
            title: reviewTextsRich[i % reviewTextsRich.length],
            body: reviewTextsRich[i % reviewTextsRich.length] +
              ' - ' + product.title +
              (i % 4 === 0 ? ' (خرید واقعی)' : ''),
            isApproved: true,
            verifiedPurchase: i % 3 !== 0,
            userId: buyer.id,
            productId: product.id,
            variantInfo: i % 2 === 0 ? { color: 'مشکی', size: 'استاندارد' } : undefined,
          },
        });
      }
      // QNA: 15-20 سؤال + جواب
      const qnaCount = 15 + Math.floor(Math.random() * 6);
      const buyerQnaIds: string[] = [];
      for (let i = 0; i < qnaCount; i++) {
        const buyer = buyers[i % buyers.length];
        const question = {
          content: `سؤال ${i + 1} درباره ${product.title}: ${['آیا گارانتی داره؟', 'تحویل چقدر طول می‌کشه؟', 'رنگ‌بندی کامل چیه؟', 'آیا امکان مرجوعی هست؟', 'ضمانت اصالت کالا دارید؟', 'قیمت توجیهی‌تر کدوم مدله؟', 'آیا استوک دارید؟', 'امکان پرداخت در محل هست؟', 'ساعت کاری فروشگاه کی‌هست؟', 'تخفیف عمده دارید؟'][i % 10]}`,
          role: 'buyer' as any,
          status: 'approved' as any,
        };
        const createdQna = await prisma.qna.create({
          data: {
            content: question.content,
            role: question.role,
            status: question.status,
            userId: buyer.id,
            productId: product.id,
          },
        });
        buyerQnaIds.push(createdQna.id);
        // جواب فروشنده
        await prisma.qna.create({
          data: {
            content: answerTexts[i % answerTexts.length] + ` - درباره ${product.title}`,
            role: 'seller' as any,
            status: 'approved' as any,
            parentId: buyerQnaIds[buyerQnaIds.length - 1],
            userId: sellerOwnerId,
            productId: product.id,
          },
        });
      }
      console.log(`   ✅ ${product.title}: ${numReviews} نظر + ${qnaCount} پرسش‌وپاسخ`);
    }
  }

  console.log('\n📝 پر کردن داده‌های فروشگاه ۰...');
  await seedRichReviews(store0Products, 'store0', stores[0].ownerId);
  console.log('📝 پر کردن داده‌های فروشگاه ۲...');
  await seedRichReviews(store1Products, 'store1', stores[2].ownerId);
  console.log('✅ نظرات و پرسش‌وپاسخ غنی ایجاد شد');



  // ============================================
  // ۱۴. سفارشات نمونه
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
        paymentStatus: 'paid',
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
            price,
            quantity: qty,
            total,
            sku: cp.defaultVariantSku || `SKU-${cp.slug.toUpperCase()}`,
            variantName: 'پیش‌فرض',
            image: `/${getRandomImage(999)}`,
            productId: cp.id,
            sellerId: cp.store?.ownerId,
            variantId: cp.defaultVariantId,
          },
        },
      },
    });
  }
  console.log('✅ ۱۵ سفارش نمونه ایجاد شد');

  // ============================================
  // ۱۵. سبد خرید نمونه
  // ============================================
  const allVariants = await prisma.productVariant.findMany({ take: 50 });
  for (const buyer of buyers.slice(0, 5)) {
    const numItems = 1 + Math.floor(Math.random() * 4);
    const shuffled = [...allVariants].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numItems; j++) {
      const variant = shuffled[j];
      if (!variant) continue;
      await prisma.cartItem.upsert({
        where: { userId_variantId: { userId: buyer.id, variantId: variant.id } },
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
  // ۱۶. لیست علاقه‌مندی
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
  // ۱۷. کیف پول - تراکنش‌ها
  // ============================================
  for (const buyer of buyers.slice(0, 5)) {
    const balanceBefore = 0;
    const depositAmount = 5000000 + Math.floor(Math.random() * 20000000);
    await prisma.walletTransaction.create({
      data: {
        type: 'deposit',
        amount: depositAmount,
        balanceBefore,
        balanceAfter: depositAmount,
        description: 'شارژ کیف پول',
        status: 'completed',
        reference: `REF-${Date.now()}`,
        userId: buyer.id,
      },
    });
  }
  console.log('✅ تراکنش‌های کیف پول ایجاد شد');

  // ============================================
  // ۱۸. نوتیفیکیشن نمونه
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
  // ۱۹. رتبه‌بندی فروشگاه‌ها
  // ============================================

  // StoreReview (نظرات خریداران روی فروشگاه)
  const storeReviewTexts = [
    'فروشگاه بسیار قابل اعتمادی هست. محصول اصل و ارسال سریع.',
    'از خریدم راضی هستم. قیمت‌ها منصفانه و محصولات با کیفیت.',
    'پشتیبانی عالی! پاسخگویی سریع و حرفه‌ای.',
    'فروشگاه مورد اعتمادیه، چندین بار خرید کردم.',
    'بسته‌بندی عالی و محصول دقیقاً مطابق توضیحات بود.',
    'حتماً دوباره از این فروشگاه خرید می‌کنم.',
    'تنوع محصولات عالیه و قیمت‌ها رقابتی.',
    'ارسال خیلی سریع بود، همون روز سفارش دادم فردا رسید.',
    'کیفیت محصولاتشون حرف نداره.',
    'تجربه خرید خوبی بود، ممنون.',
    'محصولات اصل و با گارانتی معتبر هستن.',
    'سرویس پس از فروششون عالیه.',
    'قیمت‌ها نسبت به بازار خیلی مناسب‌تره.',
    'پیشنهاد می‌کنم، فروشگاه مطمئنی هست.',
    'محصولاتشون همیشه تازه و به‌روز هست.',
  ];
  const storeReviewTopics = ['product_quality', 'shipping', 'communication', 'price', 'packaging'] as any[];
  for (let s = 0; s < stores.length; s++) {
    const store = stores[s];
    const count = s < 2 ? 12 : 3; // 12 نظر برای دو فروشگاه ویژه، ۳ تا بقیه
    for (let i = 0; i < count; i++) {
      const buyer = buyers[i % buyers.length];
      await prisma.storeReview.create({
        data: {
          userId: buyer.id,
          storeId: store.id,
          rating: s < 2 ? (i < 3 ? 5 : i < 8 ? 4 : 5) : 4,
          body: storeReviewTexts[i % storeReviewTexts.length],
          productQuality: s < 2 ? 4 + (i % 2) : 4,
          status: 'approved' as any,
          verifiedPurchase: i % 3 !== 0,
        },
      });
    }
  }
  console.log('✅ نظرات فروشگاه‌ها (StoreReview) ایجاد شد');

  // StoreRating کامل برای دو فروشگاه ویژه
  const featuredStores = [stores[0], stores[2]];
  const featuredRatings = [
    // فروشگاه ۰ (الکترونیک - seller1)
    {
      avgRating: 4.7,
      totalReviews: 47,
      productCount: 8,
      productQuality: 4.8,
      productQualityTotal: 38.4,
      productQualityCount: 8,
      totalResponseRequests: 34,
      answeredResponses: 32,
      totalResponseTime: 6.2,
      responseRate: 94.1,
      responseTime: 1.8,
      saleCount: 156,
      onTimeDelivery: 96.5,
      communication: 4.6,
    },
    // فروشگاه ۲ (پوشاک - seller_fashion)
    {
      avgRating: 4.5,
      totalReviews: 38,
      productCount: 10,
      productQuality: 4.5,
      productQualityTotal: 45.0,
      productQualityCount: 10,
      totalResponseRequests: 28,
      answeredResponses: 26,
      totalResponseTime: 8.4,
      responseRate: 92.8,
      responseTime: 3.0,
      saleCount: 124,
      onTimeDelivery: 94.0,
      communication: 4.4,
    },
  ];
  for (let i = 0; i < featuredStores.length; i++) {
    const store = featuredStores[i];
    const rating = featuredRatings[i];
    await prisma.storeRating.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        storeId: store.id,
        avgRating: rating.avgRating,
        totalReviews: rating.totalReviews,
        productCount: rating.productCount,
        productQuality: rating.productQuality,
        productQualityTotal: rating.productQualityTotal,
        productQualityCount: rating.productQualityCount,
        totalResponseRequests: rating.totalResponseRequests,
        answeredResponses: rating.answeredResponses,
        totalResponseTime: rating.totalResponseTime,
        responseRate: rating.responseRate,
        responseTime: rating.responseTime,
        saleCount: rating.saleCount,
        onTimeDelivery: rating.onTimeDelivery,
        communication: rating.communication,
      },
    });
  }

  // StoreRating معمولی برای بقیه
  for (const store of stores.slice(0, 3)) {
    if (featuredStores.find(s => s.id === store.id)) continue;
    await prisma.storeRating.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        storeId: store.id,
        avgRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        totalReviews: Math.floor(Math.random() * 50),
        productCount: 3 + Math.floor(Math.random() * 5),
        responseRate: 70 + Math.floor(Math.random() * 30),
        responseTime: parseFloat((1 + Math.random() * 10).toFixed(1)),
        onTimeDelivery: 80 + Math.floor(Math.random() * 20),
        productQuality: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        communication: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      },
    });
  }
  console.log('✅ رتبه‌بندی فروشگاه‌ها ایجاد شد');

  console.log('');
  console.log('🎉 Seeding با موفقیت کامل شد!');
  console.log('');
  console.log('📊 آمار داده‌های ایجاد شده:');
  console.log(`   - برندها: ${createdBrands.length}`);
  console.log(`   - محصولات: ${productCount}`);
  console.log(`   - رنگ‌ها: ${createdColors.length}`);
  console.log(`   - کدهای تخفیف: ${discountCount}`);
  console.log(`   - بلاگ پست‌ها: ${blogPosts.length}`);
  console.log(`   - نظرات: ${reviewCount}`);
  console.log(`   - سفارشات: ۱۵`);
  const storeReviewCount = await prisma.storeReview.count();
  console.log(`   - نظرات فروشگاه: ${storeReviewCount}`);
  console.log('');
  console.log('📋 اطلاعات ورود:');
  console.log('   ادمین:     admin / 123');
  console.log('   فروشنده:   seller1 / seller123');
  console.log('   خریدار:    buyer1 / buyer123');
}

main()
  .catch((e: any) => {
    console.error('❌ خطا در seeding:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });