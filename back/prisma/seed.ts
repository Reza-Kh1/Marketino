/**
 * Prisma Seed - داده‌های اولیه دیتابیس
 * اجرا: npx prisma db seed
 * 
 * مدل‌های خالی (بدون دیتا):
 * BlogPost, Banner, SiteSetting, OtpCode, TrackingEvent, CompareItem, Conversation, Message
 */
import { PrismaClient, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// داده‌های ثابت
// ============================================

const IMAGE_PATHS = [
  'marketino/image/2026/07/images-1-853487-2020.jpg',
  'marketino/image/2026/07/images-2-852916-9207.jpg',
  'marketino/image/2026/07/images-3-851310-1553.jpg',
  'marketino/image/2026/07/images-4-851822-9497.jpg',
  'marketino/image/2026/07/images-5-850293-7598.jpg',
  'marketino/image/2026/07/images-6-849343-1990.jpg',
  'marketino/image/2026/07/images-7-820836-5261.jpg',
  'marketino/image/2026/07/images-8-819756-8033.jpg',
  'marketino/image/2026/07/images-9-820133-6613.jpg',
  'marketino/image/2026/07/images-10-817629-1874.jpg',
  'marketino/image/2026/07/images-11-816559-3402.jpg',
  'marketino/image/2026/07/images-12-815550-8157.jpg',
  'marketino/image/2026/07/images-13-818376-8872.jpg',
  'marketino/image/2026/07/images-14-814312-8790.jpg',
  'marketino/image/2026/07/images-15-813758-9368.jpg',
  'marketino/image/2026/07/images-854433-3345.jpg',
];

function getImg(seed: number): string {
  return IMAGE_PATHS[seed % IMAGE_PATHS.length];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 شروع seeding...\n');

  // ============================================
  // پاک‌سازی دیتابیس
  // ============================================
  console.log('🗑️  پاک‌سازی دیتابیس...');

  await prisma.$transaction([
    prisma.wishlistItem.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.ticketMessage.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.address.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.storeReview.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.qna.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.variantAttributeValue.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.attributeDefinition.deleteMany(),
    prisma.discountCodeUsage.deleteMany(),
    prisma.discountCode.deleteMany(),
    prisma.shippingMethod.deleteMany(),
    prisma.storeRating.deleteMany(),
    prisma.walletTransaction.deleteMany(),
    prisma.withdrawRequest.deleteMany(),
    prisma.bankAccount.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.color.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.category.deleteMany(),
    prisma.store.deleteMany(),
    prisma.user.deleteMany(),
    // مدل‌های خالی (فقط پاک میشوند)
    prisma.blogPost.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.otpCode.deleteMany(),
    prisma.trackingEvent.deleteMany(),
    prisma.compareItem.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.message.deleteMany(),
  ]);

  console.log('✅ دیتابیس پاک شد\n');

  // ============================================
  // ۱. کاربران
  // ============================================
  console.log('👤 ایجاد کاربران...');

  const adminPassword = await bcrypt.hash('123', 12);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@marketino.ir',
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

  const sellerMainPassword = await bcrypt.hash('seller123', 12);
  const sellerMain = await prisma.user.create({
    data: {
      username: 'seller_main',
      email: 'seller.main@marketino.ir',
      phone: '09121112233',
      password: sellerMainPassword,
      firstName: 'محسن',
      lastName: 'رضایی',
      role: 'seller',
      isVerified: true,
      emailVerified: true,
      hasSetPassword: true,
      isActive: true,
    },
  });

  const sellerSecondPassword = await bcrypt.hash('seller123', 12);
  const sellerSecond = await prisma.user.create({
    data: {
      username: 'seller_second',
      email: 'seller.second@marketino.ir',
      phone: '09129998877',
      password: sellerSecondPassword,
      firstName: 'فاطمه',
      lastName: 'محمدی',
      role: 'seller',
      isVerified: true,
      emailVerified: true,
      hasSetPassword: true,
      isActive: true,
    },
  });

  // جمع‌آوری فروشنده‌ها در یک آرایه
  const sellers = [sellerMain, sellerSecond];

  // ۱۰ خریدار
  const buyerData = [
    { username: 'buyer1', firstName: 'علی', lastName: 'احمدی', email: 'ali.buyer@email.ir', phone: '09122223344' },
    { username: 'buyer2', firstName: 'سارا', lastName: 'کریمی', email: 'sara.buyer@email.ir', phone: '09123334455' },
    { username: 'buyer3', firstName: 'محمد', lastName: 'حسینی', email: 'mohammad.buyer@email.ir', phone: '09124445566' },
    { username: 'buyer4', firstName: 'زهرا', lastName: 'موسوی', email: 'zahra.buyer@email.ir', phone: '09125556677' },
    { username: 'buyer5', firstName: 'رضا', lastName: 'نوری', email: 'reza.buyer@email.ir', phone: '09126667788' },
    { username: 'buyer6', firstName: 'مریم', lastName: 'رضایی', email: 'maryam.buyer@email.ir', phone: '09127778899' },
    { username: 'buyer7', firstName: 'حسین', lastName: 'جعفری', email: 'hossein.buyer@email.ir', phone: '09128889900' },
    { username: 'buyer8', firstName: 'فاطمه', lastName: 'عبدی', email: 'fatemeh.buyer@email.ir', phone: '09129990011' },
    { username: 'buyer9', firstName: 'امیر', lastName: 'رضوی', email: 'amir.buyer@email.ir', phone: '09130001122' },
    { username: 'buyer10', firstName: 'نرگس', lastName: 'محمدی', email: 'narges.buyer@email.ir', phone: '09131112233' },
  ];

  const buyers: any[] = [];
  for (const b of buyerData) {
    const buyerPassword = await bcrypt.hash('buyer123', 12);
    const buyer = await prisma.user.create({
      data: {
        username: b.username,
        email: b.email,
        phone: b.phone,
        firstName: b.firstName,
        lastName: b.lastName,
        role: 'buyer',
        isVerified: true,
        emailVerified: true,
        hasSetPassword: true,
        isActive: true,
        password: buyerPassword,
      },
    });
    buyers.push(buyer);
  }

  console.log(`✅ ${buyers.length + 3} کاربر ایجاد شد\n`);

  // ============================================
  // ۲. فروشگاه‌ها
  // ============================================
  console.log('🏪 ایجاد فروشگاه‌ها...');

  const storeMain = await prisma.store.create({
    data: {
      ownerId: sellerMain.id,
      name: 'فروشگاه محسن رضایی',
      nameEn: 'Mohsen Rezaei Store',
      slug: 'mohsen-rezaei-store',
      description: 'فروشگاه تخصصی محصولات الکترونیک و موبایل با بهترین قیمت‌ها',
      descriptionEn: 'Specialized store for electronics and mobile phones with best prices',
      businessType: 'حقیقی',
      nationalId: '1234567890',
      commissionRate: 10,
      status: 'approved',
      isActive: true,
      isVerified: true,
      province: 'تهران',
      city: 'تهران',
      address: 'خیابان ولیعصر، پلاک ۱۲۳',
      phone: '021-22334455',
      email: 'store@mohsen.ir',
      instagram: 'mohsen_store',
      telegram: 'mohsen_store',
      workingHours: 'شنبه تا چهارشنبه ۹-۱۸',
      hasPhysicalStore: true,
    },
  });

  const storeSecond = await prisma.store.create({
    data: {
      ownerId: sellerSecond.id,
      name: 'فروشگاه فاطمه محمدی',
      nameEn: 'Fatemeh Mohammadi Store',
      slug: 'fatemeh-mohammadi-store',
      description: 'فروشگاه مد، پوشاک و اکسسوری با کیفیت بالا',
      descriptionEn: 'Fashion, clothing and accessories store with high quality',
      businessType: 'حقیقی',
      nationalId: '0987654321',
      commissionRate: 8,
      status: 'approved',
      isActive: true,
      isVerified: true,
      province: 'اصفهان',
      city: 'اصفهان',
      address: 'خیابان چهارباغ، پلاک ۴۵۶',
      phone: '031-33445566',
      email: 'store@fatemeh.ir',
      instagram: 'fatemeh_store',
      telegram: 'fatemeh_store',
      workingHours: 'شنبه تا چهارشنبه ۱۰-۲۰',
      hasPhysicalStore: true,
    },
  });

  const stores = [storeMain, storeSecond];
  console.log(`✅ ${stores.length} فروشگاه ایجاد شد\n`);

  // ============================================
  // ۳. دسته‌بندی‌ها
  // ============================================
  console.log('📂 ایجاد دسته‌بندی‌ها...');

  await prisma.category.createMany({
    data: [
      { name: 'الکترونیک', nameEn: 'Electronics', slug: 'electronics', sortOrder: 1, isActive: true },
      { name: 'موبایل', nameEn: 'Mobile Phones', slug: 'mobile-phones', sortOrder: 2, isActive: true },
      { name: 'لپ‌تاپ', nameEn: 'Laptops', slug: 'laptops', sortOrder: 3, isActive: true },
      { name: 'هدفون', nameEn: 'Headphones', slug: 'headphones', sortOrder: 4, isActive: true },
      { name: 'ساعت هوشمند', nameEn: 'Smart Watch', slug: 'smart-watch', sortOrder: 5, isActive: true },
      { name: 'لوازم جانبی موبایل', nameEn: 'Mobile Accessories', slug: 'mobile-accessories', sortOrder: 6, isActive: true },
      { name: 'مد و پوشاک', nameEn: 'Fashion', slug: 'fashion', sortOrder: 7, isActive: true },
      { name: 'کفش', nameEn: 'Shoes', slug: 'shoes', sortOrder: 8, isActive: true },
      { name: 'کیف', nameEn: 'Bags', slug: 'bags', sortOrder: 9, isActive: true },
      { name: 'زیبایی و سلامت', nameEn: 'Beauty & Health', slug: 'beauty-health', sortOrder: 10, isActive: true },
    ],
  });

  const allCategories = await prisma.category.findMany();
  console.log(`✅ ${allCategories.length} دسته‌بندی ایجاد شد\n`);

  // ============================================
  // ۴. برندها
  // ============================================
  console.log('🏷️ ایجاد برندها...');

  await prisma.brand.createMany({
    data: [
      { name: 'سامسونگ', nameEn: 'Samsung', slug: 'samsung' },
      { name: 'اپل', nameEn: 'Apple', slug: 'apple' },
      { name: 'شیائومی', nameEn: 'Xiaomi', slug: 'xiaomi' },
      { name: 'هوآوی', nameEn: 'Huawei', slug: 'huawei' },
      { name: 'نایک', nameEn: 'Nike', slug: 'nike' },
      { name: 'آدیداس', nameEn: 'Adidas', slug: 'adidas' },
      { name: 'سونی', nameEn: 'Sony', slug: 'sony' },
      { name: 'ال‌جی', nameEn: 'LG', slug: 'lg' },
      { name: 'بوش', nameEn: 'Bosch', slug: 'bosch' },
      { name: 'تفلون', nameEn: 'Tefal', slug: 'tefal' },
      { name: 'هایلو', nameEn: 'HiLO', slug: 'hilo' },
      { name: 'انکر', nameEn: 'Anker', slug: 'anker' },
    ],
  });

  const allBrands = await prisma.brand.findMany();
  console.log(`✅ ${allBrands.length} برند ایجاد شد\n`);

  // ============================================
  // ۵. رنگ‌ها
  // ============================================
  console.log('🎨 ایجاد رنگ‌ها...');

  await prisma.color.createMany({
    data: [
      { name: 'مشکی', nameEn: 'Black', hexCode: '#000000', slug: 'black' },
      { name: 'سفید', nameEn: 'White', hexCode: '#FFFFFF', slug: 'white' },
      { name: 'قرمز', nameEn: 'Red', hexCode: '#FF0000', slug: 'red' },
      { name: 'آبی', nameEn: 'Blue', hexCode: '#0066FF', slug: 'blue' },
      { name: 'سبز', nameEn: 'Green', hexCode: '#00AA00', slug: 'green' },
      { name: 'زرد', nameEn: 'Yellow', hexCode: '#FFDD00', slug: 'yellow' },
      { name: 'طلایی', nameEn: 'Gold', hexCode: '#FFD700', slug: 'gold' },
      { name: 'نقره‌ای', nameEn: 'Silver', hexCode: '#C0C0C0', slug: 'silver' },
      { name: 'بنفش', nameEn: 'Purple', hexCode: '#800080', slug: 'purple' },
      { name: 'صورتی', nameEn: 'Pink', hexCode: '#FF69B4', slug: 'pink' },
    ],
  });

  const allColors = await prisma.color.findMany();
  console.log(`✅ ${allColors.length} رنگ ایجاد شد\n`);

  // ============================================
  // ۶. ویژگی‌ها (AttributeDefinition)
  // ============================================
  console.log('📋 ایجاد ویژگی‌ها...');

  await prisma.attributeDefinition.createMany({
    data: [
      { key: 'storage', label: 'حافظه داخلی' },
      { key: 'ram', label: 'رم' },
      { key: 'screen', label: 'اندازه صفحه' },
      { key: 'battery', label: 'باتری' },
      { key: 'weight', label: 'وزن' },
      { key: 'capacity', label: 'ظرفیت' },
      { key: 'size', label: 'سایز' },
      { key: 'cpu', label: 'پردازنده' },
      { key: 'camera', label: 'دوربین' },
      { key: 'material', label: 'جنس' },
    ],
  });

  const allAttrs = await prisma.attributeDefinition.findMany();
  console.log(`✅ ${allAttrs.length} ویژگی ایجاد شد\n`);

  // ============================================
  // ۷. محصولات (۱۲ محصول با تنوع بالا)
  // ============================================
  console.log('📱 ایجاد محصولات...');

  async function createProductWithDetails(
    title: string,
    titleEn: string,
    category: any,
    brand: any,
    store: any,
    price: number,
    description: string,
    content: any,
    isDigital: boolean = false,
    condition: string = 'new'
  ) {
    const slug = generateSlug(title);
    const product = await prisma.product.create({
      data: {
        title,
        titleEn,
        slug,
        description,
        content,
        originalPrice: price,
        minPrice: price * 0.85,
        discountPercent: `${randomInt(5, 25)}%`,
        condition: condition as any,
        status: 'approved' as ProductStatus,
        isFeatured: Math.random() > 0.6,
        isDigital,
        viewCount: randomInt(100, 5000),
        saleCount: randomInt(5, 200),
        rating: randomFloat(3.5, 5),
        reviewCount: randomInt(3, 50),
        categoryId: category.id,
        brandId: brand.id,
        storeId: store.id,
      },
    });

    // ایجاد ۳-۵ تصویر
    for (let i = 1; i <= randomInt(3, 5); i++) {
      await prisma.productImage.create({
        data: {
          url: `https://picsum.photos/seed/${slug}-${i}/600/600`,
          alt: `${title} - تصویر ${i}`,
          sortOrder: i,
          isMain: i === 1,
          productId: product.id,
        },
      });
    }

    // ایجاد ۲-۴ واریانت
    const numVariants = randomInt(2, 4);
    const colors = allColors.slice(0, numVariants);
    for (const color of colors) {
      const variantPrice = price * randomFloat(0.85, 1.15);
      const variant = await prisma.productVariant.create({
        data: {
          name: color.name,
          nameEn: color.nameEn,
          sku: `${slug}-${color.slug}`,
          price: variantPrice,
          quantity: randomInt(5, 50),
          colorId: color.id,
          image: `https://picsum.photos/seed/${slug}-${color.slug}/200/200`,
          saleCount: randomInt(0, 30),
          productId: product.id,
        },
      });

      const selectedAttrs = allAttrs.slice(0, randomInt(2, 4));
      for (const attr of selectedAttrs) {
        await prisma.variantAttributeValue.create({
          data: {
            value: `${attr.key}-${randomInt(1, 100)}`,
            valueEn: `${attr.key}-${randomInt(1, 100)}`,
            variantId: variant.id,
            attributeId: attr.id,
          },
        });
      }
    }

    return product;
  }

  const catElectronics = allCategories.find(c => c.slug === 'electronics');
  const catMobile = allCategories.find(c => c.slug === 'mobile-phones');
  const catLaptop = allCategories.find(c => c.slug === 'laptops');
  const catHeadphone = allCategories.find(c => c.slug === 'headphones');
  const catWatch = allCategories.find(c => c.slug === 'smart-watch');
  const catAccessory = allCategories.find(c => c.slug === 'mobile-accessories');
  const catFashion = allCategories.find(c => c.slug === 'fashion');
  const catShoes = allCategories.find(c => c.slug === 'shoes');
  const catBags = allCategories.find(c => c.slug === 'bags');

  const brandSamsung = allBrands.find(b => b.slug === 'samsung');
  const brandApple = allBrands.find(b => b.slug === 'apple');
  const brandXiaomi = allBrands.find(b => b.slug === 'xiaomi');
  const brandSony = allBrands.find(b => b.slug === 'sony');
  const brandAnker = allBrands.find(b => b.slug === 'anker');
  const brandNike = allBrands.find(b => b.slug === 'nike');
  const brandAdidas = allBrands.find(b => b.slug === 'adidas');

  const products: any[] = [];

  // محصولات فروشگاه اول (الکترونیک)
  const p1 = await createProductWithDetails(
    'سامسونگ گلکسی اس۲۴ اولترا',
    'Samsung Galaxy S24 Ultra',
    catMobile || catElectronics,
    brandSamsung || allBrands[0],
    storeMain,
    12000000,
    'پرچمدار جدید سامسونگ با دوربین ۲۰۰ مگاپیکسل و نمایشگر ۶.۸ اینچی',
    { features: ['دوربین ۲۰۰MP', 'باتری ۵۰۰۰mAh', 'شارژ سریع ۴۵W'] }
  );
  products.push(p1);

  const p2 = await createProductWithDetails(
    'اپل آیفون ۱۵ پرو مکس',
    'Apple iPhone 15 Pro Max',
    catMobile || catElectronics,
    brandApple || allBrands[0],
    storeMain,
    15000000,
    'جدیدترین آیفون با تراشه A17 Pro و سیستم دوربین حرفه‌ای',
    { features: ['تراشه A17 Pro', 'دوربین ۴۸MP', 'باتری ۴۴۲۲mAh'] }
  );
  products.push(p2);

  const p3 = await createProductWithDetails(
    'لپ‌تاپ سامسونگ بوک ۴',
    'Samsung Galaxy Book 4',
    catLaptop || catElectronics,
    brandSamsung || allBrands[0],
    storeMain,
    18000000,
    'لپ‌تاپ فوق‌سبک با صفحه نمایش ۱۵.۶ اینچ و پردازنده اینتل نسل ۱۳',
    { features: ['پردازنده Intel i7', 'رم ۱۶GB', 'SSD 512GB'] }
  );
  products.push(p3);

  const p4 = await createProductWithDetails(
    'هدفون بی‌سیم سونی WH-1000XM5',
    'Sony WH-1000XM5 Wireless Headphones',
    catHeadphone || catElectronics,
    brandSony || allBrands[0],
    storeMain,
    4500000,
    'هدفون نویز کنسلینگ حرفه‌ای با صدای فوق‌العاده و باتری طولانی',
    { features: ['نویز کنسلینگ', 'باتری ۳۰ ساعت', 'کیفیت صدای Hi-Res'] }
  );
  products.push(p4);

  const p5 = await createProductWithDetails(
    'ساعت هوشمند اپل واچ سری ۹',
    'Apple Watch Series 9',
    catWatch || catElectronics,
    brandApple || allBrands[0],
    storeMain,
    8000000,
    'ساعت هوشمند با صفحه نمایش همیشه روشن و قابلیت‌های پیشرفته سلامت',
    { features: ['صفحه نمایش Always-On', 'ECG', 'اندازه‌گیری اکسیژن خون'] }
  );
  products.push(p5);

  const p6 = await createProductWithDetails(
    'پاوربانک انکر ۲۰۰۰۰ میلی‌آمپر',
    'Anker Power Bank 20000mAh',
    catAccessory || catElectronics,
    brandAnker || allBrands[0],
    storeMain,
    1200000,
    'پاوربانک با ظرفیت بالا و شارژ سریع ۳۰ وات',
    { features: ['ظرفیت ۲۰۰۰۰mAh', 'شارژ سریع ۳۰W', 'دو پورت USB-C'] }
  );
  products.push(p6);

  // محصولات فروشگاه دوم (مد و پوشاک)
  const p7 = await createProductWithDetails(
    'کفش ورزشی نایک ایر مکس',
    'Nike Air Max',
    catShoes || catFashion,
    brandNike || allBrands[0],
    storeSecond,
    3500000,
    'کفش ورزشی با فناوری ایر مکس و طراحی مدرن',
    { features: ['فناوری Air Max', 'وزن سبک', 'مناسب برای دویدن'] }
  );
  products.push(p7);

  const p8 = await createProductWithDetails(
    'کفش آدیداس اولترابوست',
    'Adidas Ultraboost',
    catShoes || catFashion,
    brandAdidas || allBrands[0],
    storeSecond,
    3200000,
    'کفش با زیره بوتس و راحتی فوق‌العاده',
    { features: ['زیره Boost', 'راحتی بالا', 'طراحی ارگونومیک'] }
  );
  products.push(p8);

  const p9 = await createProductWithDetails(
    'کیف چرمی دست‌ساز',
    'Handmade Leather Bag',
    catBags || catFashion,
    allBrands.find(b => b.slug === 'hilo') || allBrands[0],
    storeSecond,
    2800000,
    'کیف چرم طبیعی با کیفیت بالا و طراحی کلاسیک',
    { features: ['چرم مرغوب', 'دست‌ساز', 'دوخت ظریف'] }
  );
  products.push(p9);

  const p10 = await createProductWithDetails(
    'ست ورزشی مردانه',
    'Men\'s Sport Set',
    catFashion || allCategories[0],
    brandNike || allBrands[0],
    storeSecond,
    1500000,
    'ست ورزشی شامل تی شرت و شلوارک با کیفیت بالا',
    { features: ['پارچه Dri-FIT', 'سبک و راحت', 'مناسب تمرین'] }
  );
  products.push(p10);

  const p11 = await createProductWithDetails(
    'هدفون بلوتوثی شیائومی',
    'Xiaomi Bluetooth Headphones',
    catHeadphone || catElectronics,
    brandXiaomi || allBrands[0],
    storeSecond,
    1800000,
    'هدفون بی‌سیم با کیفیت صدای خوب و قیمت مناسب',
    { features: ['بلوتوث ۵.۲', 'باتری ۲۰ ساعت', 'کیفیت صدای مناسب'] }
  );
  products.push(p11);

  const p12 = await createProductWithDetails(
    'ساعت هوشمند شیائومی می بند ۸',
    'Xiaomi Mi Band 8',
    catWatch || catElectronics,
    brandXiaomi || allBrands[0],
    storeSecond,
    800000,
    'دستبند هوشمند با نمایشگر آمولد و قابلیت‌های کامل سلامت',
    { features: ['نمایشگر AMOLED', 'GPS', 'ضربان‌سنج'] }
  );
  products.push(p12);

  console.log(`✅ ${products.length} محصول ایجاد شد\n`);

  // ============================================
  // ۸. نظرات (Reviews)
  // ============================================
  console.log('⭐ ایجاد نظرات محصولات...');

  const reviewTexts = [
    'عالی بود، دقیقاً مطابق انتظار. کیفیت ساخت فوق‌العاده و عملکرد روان.',
    'خیلی خوبه، اما کاش قیمت پایین‌تر بود. با این حال راضی‌ام.',
    'بهترین محصولی که تا حالا خریدم! حتماً به دوستان هم پیشنهاد میکنم.',
    'متوسط بود، خیلی ادعا داشت ولی انتظارم رو برآورده نکرد.',
    'کیفیت خوب، تحویل سریع، پشتیبانی عالی. ممنون از فروشنده.',
    'کاملاً راضی هستم، محصول عالی و با کیفیت.',
    'اندازه مناسبی داشت، ولی رنگش کمی با تصویر فرق داشت.',
    'فوق‌العاده است! هم قیمت خوب و هم کیفیت بالا.',
    'خیلی سبک و راحت، استفاده ازش لذت‌بخشه.',
    'متأسفانه مشکل داشتم، اما پشتیبانی خیلی خوب پاسخ دادن و راهنمایی کردن.',
  ];

  const reviewTitles = [
    'تجربه عالی', 'خوب بود', 'پیشنهاد میکنم', 'متوسط', 'عالی',
    'راضی‌کننده', 'انتظار داشتم بهتر باشه', 'بین‌نظیر', 'مناسب', 'قابل قبول',
  ];

  for (const product of products) {
    const numReviews = randomInt(3, 6);
    const productBuyers = buyers.slice(0, numReviews);

    for (let i = 0; i < numReviews && i < productBuyers.length; i++) {
      const buyer = productBuyers[i];
      const rating = randomInt(3, 5);
      const reviewIdx = randomInt(0, reviewTexts.length - 1);

      await prisma.review.create({
        data: {
          rating,
          title: reviewTitles[randomInt(0, reviewTitles.length - 1)],
          body: reviewTexts[reviewIdx],
          isApproved: Math.random() > 0.15,
          verifiedPurchase: Math.random() > 0.3,
          userId: buyer.id,
          productId: product.id,
        },
      });
    }
  }

  console.log(`✅ نظرات محصولات ایجاد شد\n`);

  // ============================================
  // ۹. نظرات فروشگاه (StoreReview)
  // ============================================
  console.log('🏪 ایجاد نظرات فروشگاه‌ها...');

  const storeReviewTexts = [
    'فروشگاه عالی، برخورد خوب و ارسال سریع.',
    'محصولات با کیفیت، اما زمان ارسال کمی طول کشید.',
    'خیلی راضی هستم، حتماً دوباره خرید میکنم.',
    'خدمات خوب، پاسخگویی سریع.',
    'قیمت‌ها مناسب، ولی کاش تنوع محصولات بیشتر بود.',
    'از خریدم راضیم، تشکر از فروشنده.',
    'بسته‌بندی خیلی خوب، محصول سالم رسید.',
    'کیفیت محصولات عالی و قیمت مناسب.',
  ];

  for (const store of stores) {
    const storeBuyers = buyers.slice(0, 4);
    for (let i = 0; i < storeBuyers.length; i++) {
      const buyer = storeBuyers[i];
      const rating = randomInt(3, 5);
      const txtIdx = randomInt(0, storeReviewTexts.length - 1);

      await prisma.storeReview.create({
        data: {
          rating,
          body: storeReviewTexts[txtIdx],
          productQuality: randomInt(3, 5),
          verifiedPurchase: Math.random() > 0.4,
          status: Math.random() > 0.2 ? 'approved' : 'pending',
          userId: buyer.id,
          storeId: store.id,
          answerReview: Math.random() > 0.6 ? 'ممنون از نظر شما، خوشحالیم که راضی بودید.' : undefined,
          answerAt: Math.random() > 0.6 ? new Date() : undefined,
        },
      });
    }
  }

  console.log(`✅ نظرات فروشگاه‌ها ایجاد شد\n`);

  // ============================================
  // ۱۰. پرسش و پاسخ (QnA)
  // ============================================
  console.log('❓ ایجاد پرسش و پاسخ...');

  const qnaQuestions = [
    'آیا این محصول گارانتی دارد؟',
    'رنگ مشکی موجود هست؟',
    'زمان تحویل چقدر است؟',
    'آیا این محصول اصل است؟',
    'آیا امکان تعویض وجود دارد؟',
    'هزینه ارسال چقدر است؟',
    'آیا شارژر همراه محصول هست؟',
    'اندازه این محصول دقیقاً چقدر است؟',
    'آیا چند رنگ مختلف موجود است؟',
    'آیا این محصول ضد آب است؟',
    'وزن محصول چقدر است؟',
    'آیا امکان نصب روی دیوار هست؟',
    'جنس بدنه از چیست؟',
    'آیا قابلیت اتصال به گوشی دارد؟',
    'مدت زمان گارانتی چقدر است؟',
    'آیا آموزش استفاده همراه محصول هست؟',
    'آیا این محصول برای کودکان مناسب است؟',
    'آیا قابلیت ارتقا دارد؟',
    'آیا قطعات یدکی موجود است؟',
    'آیا این محصول جدید است یا کارکرده؟',
    'قیمت نسبت به رقبا چطور است؟',
    'آیا امکان پرداخت اقساطی وجود دارد؟',
    'آیا این محصول در انبار موجود است؟',
    'آیا میتوانم قبل از خرید تست کنم؟',
    'آیا گارانتی شامل تعویض قطعات هم میشود؟',
    'آیا محصول اورجینال است؟',
    'آیا کابل یا آداپتور همراه است؟',
    'سایز دقیق محصول چقدر است؟',
    'آیا برای استفاده روزمره مناسب است؟',
    'آیا رنگ‌بندی دیگری هم دارید؟',
  ];

  const qnaAnswers = [
    'سلام، بله این محصول دارای گارانتی ۱۸ ماهه معتبر است.',
    'بله، رنگ مشکی در انبار موجود است.',
    'زمان تحویل معمولاً ۲-۳ روز کاری پس از ثبت سفارش است.',
    'بله، تمام محصولات ما اصل و با ضمانت اصالت کالا هستند.',
    'بله، امکان تعویض در صورت وجود مشکل ظرف ۷ روز وجود دارد.',
    'هزینه ارسال بر اساس وزن و محل تحویل محاسبه میشود.',
    'بله، شارژر اصلی به همراه کابل در جعبه محصول موجود است.',
    'اندازه دقیق محصول در بخش مشخصات فنی درج شده است.',
    'بله، این محصول در ۵ رنگ مختلف عرضه میشود.',
    'بله، این محصول دارای استاندارد ضد آب IP67 است.',
    'وزن محصول حدود ۲۵۰ گرم است.',
    'بله، قابلیت نصب روی دیوار با براکت مخصوص را دارد.',
    'جنس بدنه از آلومینیوم با کیفیت بالا ساخته شده است.',
    'بله، از طریق بلوتوث و وای‌فای به گوشی متصل میشود.',
    'گارانتی این محصول ۲۴ ماهه است و شامل خدمات پس از فروش میشود.',
    'بله، دفترچه راهنما به صورت کامل همراه محصول است.',
    'این محصول برای سنین بالای ۳ سال مناسب است.',
    'بله، قابلیت ارتقا رم و حافظه را دارد.',
    'بله، قطعات یدکی در نمایندگی‌های مجاز موجود است.',
    'همه محصولات ما نو و با کیفیت درجه یک هستند.',
    'قیمت ما نسبت به رقبا بسیار رقابتی و مناسب است.',
    'بله، امکان پرداخت اقساطی از طریق بانک‌های معتبر وجود دارد.',
    'بله، محصول در انبار موجود است و آماده ارسال میباشد.',
    'بله، در نمایندگی‌های ما امکان تست محصول وجود دارد.',
    'بله، گارانتی شامل تعویض قطعات معیوب به صورت رایگان است.',
    'همه محصولات ما اصل و با کد رهگیری معتبر هستند.',
    'بله، کابل USB-C به همراه آداپتور شارژر در جعبه موجود است.',
    'ابعاد محصول ۲۰ در ۱۵ در ۵ سانتیمتر است.',
    'بله، این محصول برای استفاده روزانه بسیار مناسب و مقاوم است.',
    'بله، برای مشاهده رنگ‌های دیگر به بخش تصاویر محصول مراجعه کنید.',
  ];

  for (const product of products) {
    const numQna = randomInt(3, 6);
    const usedBuyers = [...buyers].sort(() => Math.random() - 0.5).slice(0, numQna);

    for (let i = 0; i < numQna && i < usedBuyers.length; i++) {
      const buyer = usedBuyers[i];
      const qIdx = randomInt(0, qnaQuestions.length - 1);
      const aIdx = randomInt(0, qnaAnswers.length - 1);

      // سوال خریدار
      const question = await prisma.qna.create({
        data: {
          content: qnaQuestions[qIdx],
          role: 'buyer',
          status: Math.random() > 0.15 ? 'approved' : 'pending',
          userId: buyer.id,
          productId: product.id,
        },
      });

      // پاسخ فروشنده (با ۸۰٪ احتمال)
      if (Math.random() > 0.2) {
        // پیدا کردن مالک فروشگاه محصول
        const productWithStore = await prisma.product.findUnique({
          where: { id: product.id },
          include: { store: true },
        });
        const sellerId = productWithStore?.store?.ownerId || sellers[0]?.id || buyers[0].id;

        await prisma.qna.create({
          data: {
            content: qnaAnswers[aIdx],
            role: 'seller',
            status: 'approved',
            parentId: question.id,
            userId: sellerId,
            productId: product.id,
          },
        });
      }
    }
  }

  console.log(`✅ پرسش و پاسخ محصولات ایجاد شد\n`);

  // ============================================
  // ۱۱. کیف پول (Wallet) و تراکنش‌ها
  // ============================================
  console.log('💰 ایجاد کیف پول و تراکنش‌ها...');

  // ایجاد کیف پول برای همه کاربران
  const allUsers = [admin, ...sellers, ...buyers];
  for (const user of allUsers) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: randomInt(100000, 5000000),
        pendingBalance: randomInt(0, 500000),
        frozenBalance: randomInt(0, 100000),
      },
    });
  }

  // تراکنش‌های نمونه برای خریداران
  for (const buyer of buyers.slice(0, 5)) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: buyer.id },
    });
    if (wallet) {
      const amount = randomInt(100000, 2000000);
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: buyer.id,
          type: 'deposit',
          amount: amount,
          balanceBefore: 0,
          balanceAfter: amount,
          description: 'شارژ کیف پول',
          status: 'completed',
          reference: `REF-${Date.now()}-${randomInt(1000, 9999)}`,
        },
      });
    }
  }

  console.log(`✅ کیف پول و تراکنش‌ها ایجاد شد\n`);

  // ============================================
  // ۱۲. حساب‌های بانکی
  // ============================================
  console.log('🏦 ایجاد حساب‌های بانکی...');

  for (const seller of sellers) {
    await prisma.bankAccount.create({
      data: {
        storeId: stores.find(s => s.ownerId === seller.id)?.id || '',
        userId: seller.id,
        bankName: pickRandom(['ملت', 'ملی', 'صادرات', 'تجارت', 'رفاه']),
        accountHolder: `${seller.firstName} ${seller.lastName}`,
        iban: `IR${String(randomInt(10, 99))}${String(randomInt(100000000000000, 999999999999999))}`,
        cardNumber: `${String(randomInt(6037, 6369))}${String(randomInt(100000000000000, 999999999999999))}`.slice(0, 16),
        isDefault: true,
        isVerified: true,
      },
    });
  }

  console.log(`✅ حساب‌های بانکی ایجاد شد\n`);

  // ============================================
  // ۱۳. روش‌های ارسال
  // ============================================
  console.log('📦 ایجاد روش‌های ارسال...');

  await prisma.shippingMethod.createMany({
    data: [
      { name: 'پست پیشتاز', nameEn: 'Express Post', cost: 45000, freeThreshold: 500000, estimatedDays: '۲-۴ روز', sortOrder: 1, isActive: true },
      { name: 'پست سفارشی', nameEn: 'Regular Post', cost: 30000, freeThreshold: 300000, estimatedDays: '۵-۷ روز', sortOrder: 2, isActive: true },
      { name: 'تیپاکس', nameEn: 'Tipax', cost: 55000, freeThreshold: 800000, estimatedDays: '۱-۲ روز', sortOrder: 3, isActive: true },
      { name: 'ارسال اکسپرس', nameEn: 'Express Delivery', cost: 85000, freeThreshold: 1000000, estimatedDays: 'همان روز', sortOrder: 4, isActive: true },
      { name: 'پیک موتوری', nameEn: 'Motor Courier', cost: 25000, freeThreshold: 200000, estimatedDays: '۱-۳ ساعت', sortOrder: 5, isActive: true },
    ],
  });

  console.log(`✅ روش‌های ارسال ایجاد شد\n`);

  // ============================================
  // ۱۴. کدهای تخفیف
  // ============================================
  console.log('🎫 ایجاد کدهای تخفیف...');

  const discountCodes = [
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 1000000, maxDisc: 500000, limit: 100, desc: 'خوش‌آمدگویی ۱۰٪' },
    { code: 'SUMMER20', type: 'percentage', value: 20, minOrder: 2000000, maxDisc: 1000000, limit: 200, desc: 'تابستانه ۲۰٪' },
    { code: 'FIRST5', type: 'percentage', value: 5, minOrder: 0, limit: 9999, desc: 'اولین خرید ۵٪' },
    { code: 'FREE50', type: 'fixed', value: 50000, minOrder: 500000, limit: 50, desc: '۵۰ هزار تومان ثابت' },
    { code: 'VIP20', type: 'percentage', value: 20, minOrder: 4000000, maxDisc: 1500000, limit: 50, desc: 'وی‌آی‌پی ۲۰٪' },
  ];

  for (const d of discountCodes) {
    await prisma.discountCode.create({
      data: {
        code: d.code,
        type: d.type as any,
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
        storeId: pickRandom(stores).id,
      },
    });
  }

  console.log(`✅ کدهای تخفیف ایجاد شد\n`);

  // ============================================
  // ۱۵. سفارشات نمونه
  // ============================================
  console.log('📋 ایجاد سفارشات نمونه...');

  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  for (let i = 0; i < 10; i++) {
    const randomBuyer = pickRandom(buyers);
    const randomProduct = pickRandom(products);
    const qty = randomInt(1, 3);
    const price = randomProduct.originalPrice || 1000000;
    const total = Number(price) * qty;

    // ابتدا یک Checkout ایجاد کن
    const checkout = await prisma.checkout.create({
      data: {
        checkoutNumber: `CHK-${Date.now()}-${String(i).padStart(4, '0')}`,
        userId: randomBuyer.id,
        totalAmount: total,
        discountAmount: 0,
        paymentStatus: 'pending',
        createdAt: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000),
      },
    });

    // سپس Order با checkoutId معتبر
    await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${String(i).padStart(4, '0')}`,
        checkoutId: checkout.id,
        storeId: randomProduct.storeId || stores[0].id,
        userId: randomBuyer.id,
        status: pickRandom(orderStatuses) as any,
        subtotal: total,
        shippingCost: randomInt(20000, 80000),
        discountAmount: Math.floor(total * 0.1),
        commissionAmount: Math.floor(total * 0.1),
        total: total - Math.floor(total * 0.1) + randomInt(20000, 80000),
        createdAt: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000),
        items: {
          create: {
            title: randomProduct.title,
            price: Number(price),
            quantity: qty,
            total: Number(price) * qty,
            image: `https://picsum.photos/seed/${randomProduct.slug}/200/200`,
            productId: randomProduct.id,
            storeId: randomProduct.storeId || stores[0].id,
            sku: `SKU-${randomProduct.slug?.toUpperCase() || 'UNKNOWN'}`,
            variantId: (await prisma.productVariant.findFirst({ where: { productId: randomProduct.id } }))?.id || '',
            variantName: 'پیش‌فرض',
          },
        },
      },
    });
  }

  console.log(`✅ ۱۰ سفارش نمونه ایجاد شد\n`);

  // ============================================
  // ۱۶. سبد خرید و لیست علاقه‌مندی
  // ============================================
  console.log('🛒 ایجاد سبد خرید و لیست علاقه‌مندی...');

  for (const buyer of buyers.slice(0, 5)) {
    const randomProducts = [...products].sort(() => Math.random() - 0.5).slice(0, randomInt(2, 5));

    for (const product of randomProducts) {
      const variant = await prisma.productVariant.findFirst({
        where: { productId: product.id },
      });
      if (variant) {
        // سبد خرید
        await prisma.cartItem.upsert({
          where: {
            userId_variantId: {
              userId: buyer.id,
              variantId: variant.id,
            },
          },
          update: {
            quantity: { increment: 1 },
          },
          create: {
            userId: buyer.id,
            productId: product.id,
            variantId: variant.id,
            quantity: randomInt(1, 3),
          },
        });

        // لیست علاقه‌مندی
        await prisma.wishlistItem.upsert({
          where: {
            userId_productId: {
              userId: buyer.id,
              productId: product.id,
            },
          },
          update: {},
          create: {
            userId: buyer.id,
            productId: product.id,
          },
        });
      }
    }
  }

  console.log(`✅ سبد خرید و لیست علاقه‌مندی ایجاد شد\n`);

  // ============================================
  // ۱۷. نوتیفیکیشن
  // ============================================
  console.log('🔔 ایجاد نوتیفیکیشن‌ها...');

  const notificationTypes = ['order', 'message', 'system', 'promotion'];

  for (const buyer of buyers.slice(0, 5)) {
    for (let n = 0; n < 3; n++) {
      await prisma.notification.create({
        data: {
          type: pickRandom(notificationTypes) as any,
          title: pickRandom(['اطلاعیه جدید', 'تخفیف ویژه', 'وضعیت سفارش', 'پیام جدید']),
          body: pickRandom([
            'سفارش شما با موفقیت ثبت شد.',
            'کد تخفیف جدید برای شما فعال شد.',
            'پیام جدید از فروشنده دریافت کردید.',
            'وضعیت سفارش شما تغییر کرد.',
          ]),
          isRead: Math.random() > 0.5,
          userId: buyer.id,
        },
      });
    }
  }

  console.log(`✅ نوتیفیکیشن‌ها ایجاد شد\n`);

  // ============================================
  // ۱۸. رتبه‌بندی فروشگاه‌ها
  // ============================================
  console.log('⭐ ایجاد رتبه‌بندی فروشگاه‌ها...');

  for (const store of stores) {
    const reviews = await prisma.storeReview.findMany({
      where: { storeId: store.id },
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 4.5;

    await prisma.storeRating.upsert({
      where: { storeId: store.id },
      update: {
        avgRating: avgRating,
        totalReviews: totalReviews,
        productCount: await prisma.product.count({ where: { storeId: store.id } }),
        responseRate: 85 + Math.random() * 15,
        responseTime: 2 + Math.random() * 5,
        onTimeDelivery: 90 + Math.random() * 10,
        productQuality: 4 + Math.random() * 1,
        communication: 4 + Math.random() * 1,
      },
      create: {
        storeId: store.id,
        avgRating: avgRating,
        totalReviews: totalReviews,
        productCount: await prisma.product.count({ where: { storeId: store.id } }),
        productQuality: 4 + Math.random() * 1,
        productQualityTotal: 0,
        productQualityCount: 0,
        totalResponseRequests: 0,
        answeredResponses: 0,
        totalResponseTime: 0,
        responseRate: 85 + Math.random() * 15,
        responseTime: 2 + Math.random() * 5,
        saleCount: randomInt(50, 500),
        onTimeDelivery: 90 + Math.random() * 10,
        communication: 4 + Math.random() * 1,
      },
    });
  }

  console.log(`✅ رتبه‌بندی فروشگاه‌ها ایجاد شد\n`);

  // ============================================
  // جمع‌بندی نهایی
  // ============================================
  console.log('🎉 Seeding با موفقیت کامل شد!');
  console.log('');
  console.log('📊 آمار داده‌های ایجاد شده:');
  console.log(`   - کاربران: ${allUsers.length} (ادمین: ۱، فروشنده: ۲، خریدار: ۱۰)`);
  console.log(`   - فروشگاه‌ها: ${stores.length}`);
  console.log(`   - دسته‌بندی‌ها: ${allCategories.length}`);
  console.log(`   - برندها: ${allBrands.length}`);
  console.log(`   - رنگ‌ها: ${allColors.length}`);
  console.log(`   - ویژگی‌ها: ${allAttrs.length}`);
  console.log(`   - محصولات: ${products.length}`);
  console.log(`   - کیف پول: ${allUsers.length}`);
  console.log(`   - حساب بانکی: ${sellers.length}`);
  console.log(`   - روش ارسال: ۵`);
  console.log(`   - کد تخفیف: ${discountCodes.length}`);
  console.log(`   - سفارش: ۱۰`);
  console.log('');
  console.log('📋 اطلاعات ورود:');
  console.log('   ادمین:     admin / 123');
  console.log('   فروشنده:   seller_main / seller123');
  console.log('   فروشنده:   seller_second / seller123');
  console.log('   خریدار:    buyer1 / buyer123');
  console.log('');
  console.log('⚠️  مدل‌های خالی (بدون دیتا):');
  console.log('   BlogPost, Banner, SiteSetting, OtpCode,');
  console.log('   TrackingEvent, CompareItem, Conversation, Message');
}

main()
  .catch((e: any) => {
    console.error('❌ خطا در seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });