import { PrismaClient, UserRole, StoreStatus, ProductCondition, ProductStatus, StatusDiscount, DiscountType, ImageUseCase, ReviewApproval } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const images = [
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

async function main() {
  console.log('Starting seed...');

  // ==================== PROVINCES & CITIES ====================
  const provinceData = [
    { name: 'تهران', cities: [{ name: 'تهران' }, { name: 'اسلامشهر' }, { name: 'شهریار' }, { name: 'قدس' }, { name: 'ملارد' }] },
    { name: 'البرز', cities: [{ name: 'کرج' }, { name: 'فردیس' }, { name: 'نظرآباد' }, { name: 'هشتگرد' }] },
    { name: 'اصفهان', cities: [{ name: 'اصفهان' }, { name: 'کاشان' }, { name: 'نجف‌آباد' }, { name: 'خمینی‌شهر' }] },
    { name: 'فارس', cities: [{ name: 'شیراز' }, { name: 'مرودشت' }, { name: 'جهرم' }, { name: 'فسا' }] },
    { name: 'خراسان رضوی', cities: [{ name: 'مشهد' }, { name: 'نیشابور' }, { name: 'سبزوار' }, { name: 'تربت حیدریه' }] },
    { name: 'آذربایجان شرقی', cities: [{ name: 'تبریز' }, { name: 'مراغه' }, { name: 'مرند' }, { name: 'اهر' }] },
    { name: 'آذربایجان غربی', cities: [{ name: 'ارومیه' }, { name: 'خوی' }, { name: 'مهاباد' }, { name: 'بوکان' }] },
    { name: 'خوزستان', cities: [{ name: 'اهواز' }, { name: 'آبادان' }, { name: 'دزفول' }, { name: 'خرمشهر' }] },
    { name: 'مازندران', cities: [{ name: 'ساری' }, { name: 'بابل' }, { name: 'آمل' }, { name: 'قائم‌شهر' }] },
    { name: 'گیلان', cities: [{ name: 'رشت' }, { name: 'بندرانزلی' }, { name: 'لاهیجان' }, { name: 'آستارا' }] },
    { name: 'کرمان', cities: [{ name: 'کرمان' }, { name: 'رفسنجان' }, { name: 'جیرفت' }, { name: 'سیرجان' }] },
    { name: 'سیستان و بلوچستان', cities: [{ name: 'زاهدان' }, { name: 'چابهار' }, { name: 'ایرانشهر' }, { name: 'زابل' }] },
    { name: 'همدان', cities: [{ name: 'همدان' }, { name: 'ملایر' }, { name: 'نهاوند' }] },
    { name: 'کرمانشاه', cities: [{ name: 'کرمانشاه' }, { name: 'اسلام‌آباد غرب' }, { name: 'سنقر' }] },
    { name: 'لرستان', cities: [{ name: 'خرم‌آباد' }, { name: 'بروجرد' }, { name: 'دورود' }] },
    { name: 'کردستان', cities: [{ name: 'سنندج' }, { name: 'سقز' }, { name: 'مریوان' }] },
    { name: 'مرکزی', cities: [{ name: 'اراک' }, { name: 'ساوه' }, { name: 'خمین' }] },
    { name: 'قم', cities: [{ name: 'قم' }] },
    { name: 'قزوین', cities: [{ name: 'قزوین' }, { name: 'تاکستان' }, { name: 'آبیک' }] },
    { name: 'اردبیل', cities: [{ name: 'اردبیل' }, { name: 'پارس‌آباد' }, { name: 'مشگین‌شهر' }] },
    { name: 'زنجان', cities: [{ name: 'زنجان' }, { name: 'ابهر' }, { name: 'خدابنده' }] },
    { name: 'گلستان', cities: [{ name: 'گرگان' }, { name: 'گنبد کاووس' }, { name: 'علی‌آباد کتول' }] },
    { name: 'هرمزگان', cities: [{ name: 'بندرعباس' }, { name: 'میناب' }, { name: 'قشم' }] },
    { name: 'بوشهر', cities: [{ name: 'بوشهر' }, { name: 'بندرگناوه' }, { name: 'دیر' }] },
    { name: 'یزد', cities: [{ name: 'یزد' }, { name: 'اردکان' }, { name: 'میبد' }] },
    { name: 'سمنان', cities: [{ name: 'سمنان' }, { name: 'شاهرود' }, { name: 'دامغان' }] },
    { name: 'چهارمحال و بختیاری', cities: [{ name: 'شهرکرد' }, { name: 'بروجن' }, { name: 'فارسان' }] },
    { name: 'کهگیلویه و بویراحمد', cities: [{ name: 'یاسوج' }, { name: 'گچساران' }, { name: 'دهدشت' }] },
    { name: 'ایلام', cities: [{ name: 'ایلام' }, { name: 'دهلران' }, { name: 'آبدانان' }] },
    { name: 'خراسان شمالی', cities: [{ name: 'بجنورد' }, { name: 'شیروان' }, { name: 'اسفراین' }] },
    { name: 'خراسان جنوبی', cities: [{ name: 'بیرجند' }, { name: 'قائن' }, { name: 'فردوس' }] },
  ];

  const provinces: { id: string; name: string }[] = [];
  const citiesMap: Record<string, string> = {}; // name -> id

  for (const p of provinceData) {
    const province = await prisma.province.create({
      data: { name: p.name },
    });
    provinces.push({ id: province.id, name: p.name });

    for (const c of p.cities) {
      const city = await prisma.city.create({
        data: {
          name: c.name,
          provinceId: province.id,
        },
      });
      citiesMap[c.name] = city.id;
    }
  }
  console.log(`Created ${provinces.length} provinces and cities`);
  const salt = await bcrypt.genSalt(12);

  const hashedPassword = await bcrypt.hash('123', salt);
  // ==================== USERS (1 SuperAdmin + 2 Sellers) ====================
  const superAdmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@marketino.ir',
      password: hashedPassword,
      firstName: 'مدیر',
      lastName: 'سیستم',
      role: UserRole.superAdmin,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      language: 'fa',
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      username: 'seller_tehran',
      email: 'seller1@marketino.ir',
      password: hashedPassword,
      firstName: 'علی',
      lastName: 'محمدی',
      phone: '09121234567',
      role: UserRole.seller,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      language: 'fa',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      username: 'seller_isfahan',
      email: 'seller2@marketino.ir',
      password: hashedPassword,
      firstName: 'مریم',
      lastName: 'احمدی',
      phone: '09131112233',
      role: UserRole.seller,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      language: 'fa',
    },
  });

  // ==================== BUYERS (for reviews) ====================
  const buyer1 = await prisma.user.create({
    data: {
      username: 'buyer1',
      email: 'buyer1@marketino.ir',
      password: hashedPassword,
      firstName: 'رضا',
      lastName: 'کریمی',
      role: UserRole.buyer,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      language: 'fa',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      username: 'buyer2',
      email: 'buyer2@marketino.ir',
      password: hashedPassword,
      firstName: 'سارا',
      lastName: 'رضایی',
      role: UserRole.buyer,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      language: 'fa',
    },
  });

  const buyer3 = await prisma.user.create({
    data: {
      username: 'buyer3',
      email: 'buyer3@marketino.ir',
      password: hashedPassword,
      firstName: 'امیر',
      lastName: 'حسینی',
      role: UserRole.buyer,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      language: 'fa',
    },
  });

  const buyers = [buyer1, buyer2, buyer3];
  console.log('Created 3 buyers');

  console.log('Created 3 users (superAdmin + 2 sellers)');

  // ==================== STORES ====================
  const tehranProvince = provinces.find((p) => p.name === 'تهران')!;
  const isfahanProvince = provinces.find((p) => p.name === 'اصفهان')!;

  const store1 = await prisma.store.create({
    data: {
      slug: 'tehran-electronics',
      name: 'فروشگاه الکترونیک تهران',
      description: 'تامین‌کننده معتبر لوازم الکترونیکی و دیجیتال',
      nationalId: '1234567890',
      businessType: 'حقوقی',
      commissionRate: 8.5,
      status: StoreStatus.approved,
      isActive: true,
      isVerified: true,
      address: 'تهران، خیابان ولیعصر، پلاک ۱۲۰',
      phone: '02188776655',
      email: 'info@tehranelectronics.ir',
      taxRate: 9,
      ownerId: seller1.id,
      provinceId: tehranProvince.id,
      cityId: citiesMap['تهران'],
    },
  });

  const store2 = await prisma.store.create({
    data: {
      slug: 'isfahan-home',
      name: 'خانه و آشپزخانه اصفهان',
      description: 'محصولات باکیفیت خانه و آشپزخانه',
      nationalId: '0987654321',
      businessType: 'حقیقی',
      commissionRate: 7.0,
      status: StoreStatus.approved,
      isActive: true,
      isVerified: true,
      address: 'اصفهان، خیابان چهارباغ، کوچه گلستان',
      phone: '03132221100',
      email: 'info@isfahanhome.ir',
      taxRate: 9,
      ownerId: seller2.id,
      provinceId: isfahanProvince.id,
      cityId: citiesMap['اصفهان'],
    },
  });

  // Store Ratings
  await prisma.storeRating.create({
    data: {
      storeId: store1.id,
      avgRating: 4.6,
      ratingTotal: 92,
      totalReviews: 20,
      productCount: 3,
      productQuality: 4.7,
      saleCount: 45,
    },
  });
  await prisma.storeRating.create({
    data: {
      storeId: store2.id,
      avgRating: 4.4,
      ratingTotal: 66,
      totalReviews: 15,
      productCount: 3,
      productQuality: 4.5,
      saleCount: 32,
    },
  });

  console.log('Created 2 stores with ratings');

  // ==================== WALLETS ====================
  await prisma.wallet.create({ data: { userId: seller1.id, balance: 12500000, pendingBalance: 850000 } });
  await prisma.wallet.create({ data: { userId: seller2.id, balance: 8700000, pendingBalance: 420000 } });
  await prisma.wallet.create({ data: { isPlatform: true, balance: 2500000, pendingBalance: 0 } });

  // ==================== CATEGORIES (3 levels, ~8 categories) ====================
  const catElectronics = await prisma.category.create({
    data: {
      name: 'الکترونیک',
      slug: 'electronics',
      sortOrder: 1,
      isActive: true,
    },
  });
  const catMobile = await prisma.category.create({
    data: {
      name: 'موبایل و تبلت',
      slug: 'mobile-tablet',
      parentId: catElectronics.id,
      ancestorIds: [catElectronics.id],
      sortOrder: 1,
      isActive: true,
    },
  });
  const catAccessories = await prisma.category.create({
    data: {
      name: 'لوازم جانبی موبایل',
      slug: 'mobile-accessories',
      parentId: catMobile.id,
      ancestorIds: [catElectronics.id, catMobile.id],
      sortOrder: 1,
      isActive: true,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: 'خانه و آشپزخانه',
      slug: 'home-kitchen',
      sortOrder: 2,
      isActive: true,
    },
  });
  const catKitchen = await prisma.category.create({
    data: {
      name: 'لوازم آشپزخانه',
      slug: 'kitchen-appliances',
      parentId: catHome.id,
      ancestorIds: [catHome.id],
      sortOrder: 1,
      isActive: true,
    },
  });
  const catCookware = await prisma.category.create({
    data: {
      name: 'ظروف پخت و پز',
      slug: 'cookware',
      parentId: catKitchen.id,
      ancestorIds: [catHome.id, catKitchen.id],
      sortOrder: 1,
      isActive: true,
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      name: 'مد و پوشاک',
      slug: 'fashion',
      sortOrder: 3,
      isActive: true,
    },
  });
  const catMen = await prisma.category.create({
    data: {
      name: 'پوشاک مردانه',
      slug: 'men-clothing',
      parentId: catFashion.id,
      ancestorIds: [catFashion.id],
      sortOrder: 1,
      isActive: true,
    },
  });

  console.log('Created categories (3 levels)');

  // ==================== BRANDS (20) ====================
  const brandNames = [
    { name: 'سامسونگ', slug: 'samsung' },
    { name: 'شیائومی', slug: 'xiaomi' },
    { name: 'اپل', slug: 'apple' },
    { name: 'هواوی', slug: 'huawei' },
    { name: 'سونی', slug: 'sony' },
    { name: 'ال‌جی', slug: 'lg' },
    { name: 'پاناسونیک', slug: 'panasonic' },
    { name: 'بوش', slug: 'bosch' },
    { name: 'فیلیپس', slug: 'philips' },
    { name: 'هایسنس', slug: 'hisense' },
    { name: 'هاکوپیان', slug: 'hakoupian' },
    { name: 'گراد', slug: 'grad' },
    { name: 'ماکسیم', slug: 'maxim' },
    { name: 'پاتن جامه', slug: 'patn-jameh' },
    { name: 'تولیپ', slug: 'tulip' },
    { name: 'زرین', slug: 'zarin' },
    { name: 'پارس خزر', slug: 'pars-khazar' },
    { name: 'اسنوا', slug: 'snowa' },
    { name: 'دوو', slug: 'daewoo' },
    { name: 'جی‌پلاس', slug: 'gplus' },
  ];

  const brands: { id: string }[] = []
  for (let i = 0; i < brandNames.length; i++) {
    const b = await prisma.brand.create({
      data: {
        name: brandNames[i].name,
        slug: brandNames[i].slug,
        sortOrder: i + 1,
      },
    });
    brands.push(b);
  }
  console.log('Created 20 brands');

  // ==================== COLORS (20) ====================
  const colorData = [
    { name: 'مشکی', hex: '#000000', slug: 'black' },
    { name: 'سفید', hex: '#FFFFFF', slug: 'white' },
    { name: 'قرمز', hex: '#FF0000', slug: 'red' },
    { name: 'آبی', hex: '#0000FF', slug: 'blue' },
    { name: 'سبز', hex: '#008000', slug: 'green' },
    { name: 'زرد', hex: '#FFFF00', slug: 'yellow' },
    { name: 'نارنجی', hex: '#FFA500', slug: 'orange' },
    { name: 'بنفش', hex: '#800080', slug: 'purple' },
    { name: 'صورتی', hex: '#FFC0CB', slug: 'pink' },
    { name: 'خاکستری', hex: '#808080', slug: 'gray' },
    { name: 'قهوه‌ای', hex: '#A52A2A', slug: 'brown' },
    { name: 'طلایی', hex: '#FFD700', slug: 'gold' },
    { name: 'نقره‌ای', hex: '#C0C0C0', slug: 'silver' },
    { name: 'سرمه‌ای', hex: '#000080', slug: 'navy' },
    { name: 'زیتونی', hex: '#808000', slug: 'olive' },
    { name: 'فیروزه‌ای', hex: '#40E0D0', slug: 'turquoise' },
    { name: 'بژ', hex: '#F5F5DC', slug: 'beige' },
    { name: 'کرم', hex: '#FFFDD0', slug: 'cream' },
    { name: 'ارغوانی', hex: '#800000', slug: 'maroon' },
    { name: 'آبی آسمانی', hex: '#87CEEB', slug: 'sky-blue' },
  ];

  const colors: { id: string }[] = []
  for (const c of colorData) {
    const color = await prisma.color.create({
      data: { name: c.name, hexCode: c.hex, slug: c.slug },
    });
    colors.push(color);
  }
  console.log('Created 20 colors');

  // ==================== ATTRIBUTE DEFINITIONS ====================
  const attrSize = await prisma.attributeDefinition.create({
    data: { key: 'size', label: 'سایز' },
  });
  const attrMaterial = await prisma.attributeDefinition.create({
    data: { key: 'material', label: 'جنس' },
  });
  const attrWarranty = await prisma.attributeDefinition.create({
    data: { key: 'warranty', label: 'گارانتی' },
  });
  const attrCapacity = await prisma.attributeDefinition.create({
    data: { key: 'capacity', label: 'ظرفیت' },
  });

  // Connect attributes to categories (many-to-many)
  await prisma.category.update({
    where: { id: catAccessories.id },
    data: { attributeDefinitions: { connect: [{ id: attrSize.id }, { id: attrMaterial.id }, { id: attrWarranty.id }] } },
  });
  await prisma.category.update({
    where: { id: catCookware.id },
    data: { attributeDefinitions: { connect: [{ id: attrMaterial.id }, { id: attrCapacity.id }, { id: attrWarranty.id }] } },
  });
  await prisma.category.update({
    where: { id: catMen.id },
    data: { attributeDefinitions: { connect: [{ id: attrSize.id }, { id: attrMaterial.id }] } },
  });

  console.log('Created attribute definitions');

  // ==================== PRODUCTS (3 per store = 6) ====================
  // Store 1 products (Electronics)
  const product1 = await prisma.product.create({
    data: {
      title: 'گوشی موبایل سامسونگ گلکسی A54',
      slug: 'samsung-galaxy-a54',
      description: 'گوشی هوشمند سامسونگ با صفحه‌نمایش ۶.۴ اینچی و دوربین سه‌گانه',
      originalPrice: 18500000,
      minPrice: 17200000,
      discountPercent: '7',
      condition: ProductCondition.new,
      status: ProductStatus.approved,
      isFeatured: true,
      categoryId: catMobile.id,
      brandId: brands[0].id,
      storeId: store1.id,
      rating: 4.5,
      reviewCount: 3,
      saleCount: 28,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      title: 'هندزفری بی‌سیم شیائومی',
      slug: 'xiaomi-wireless-earbuds',
      description: 'هندزفری بلوتوثی با کیفیت صدای عالی و باتری طولانی',
      originalPrice: 1450000,
      minPrice: 1290000,
      discountPercent: '11',
      condition: ProductCondition.new,
      status: ProductStatus.approved,
      categoryId: catAccessories.id,
      brandId: brands[1].id,
      storeId: store1.id,
      rating: 4.3,
      reviewCount: 3,
      saleCount: 67,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      title: 'شارژر سریع ۶۵ وات',
      slug: 'fast-charger-65w',
      description: 'شارژر دیواری سریع سازگار با اکثر گوشی‌های اندروید',
      originalPrice: 890000,
      minPrice: 790000,
      condition: ProductCondition.new,
      status: ProductStatus.approved,
      categoryId: catAccessories.id,
      brandId: brands[1].id,
      storeId: store1.id,
      rating: 4.7,
      reviewCount: 3,
      saleCount: 112,
    },
  });

  // Store 2 products (Home)
  const product4 = await prisma.product.create({
    data: {
      title: 'سرویس قابلمه ۸ پارچه استیل',
      slug: 'cookware-set-8pcs',
      description: 'سرویس قابلمه استیل ضدزنگ با درب شیشه‌ای',
      originalPrice: 4200000,
      minPrice: 3850000,
      discountPercent: '8',
      condition: ProductCondition.new,
      status: ProductStatus.approved,
      isFeatured: true,
      categoryId: catCookware.id,
      brandId: brands[15].id,
      storeId: store2.id,
      rating: 4.6,
      reviewCount: 3,
      saleCount: 19,
    },
  });

  const product5 = await prisma.product.create({
    data: {
      title: 'کتری برقی پارس خزر',
      slug: 'pars-khazar-kettle',
      description: 'کتری برقی ۱.۷ لیتری با بدنه استیل',
      originalPrice: 1650000,
      minPrice: 1490000,
      condition: ProductCondition.new,
      status: ProductStatus.approved,
      categoryId: catKitchen.id,
      brandId: brands[16].id,
      storeId: store2.id,
      rating: 4.4,
      reviewCount: 3,
      saleCount: 41,
    },
  });

  const product6 = await prisma.product.create({
    data: {
      title: 'پیراهن مردانه رسمی هاکوپیان',
      slug: 'hakoupian-men-shirt',
      description: 'پیراهن رسمی مردانه با پارچه باکیفیت و دوخت عالی',
      originalPrice: 2850000,
      minPrice: 2590000,
      discountPercent: '9',
      condition: ProductCondition.new,
      status: ProductStatus.approved,
      categoryId: catMen.id,
      brandId: brands[10].id,
      storeId: store2.id,
      rating: 4.8,
      reviewCount: 3,
      saleCount: 23,
    },
  });

  const products = [product1, product2, product3, product4, product5, product6];
  console.log('Created 6 products');

  // ==================== PRODUCT VARIANTS + ATTRIBUTE VALUES ====================
  async function createVariant(productId: string, name: string, price: number, quantity: number, colorId: string | null, attrs: { attrId: string; value: string }[]) {
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name,
        price,
        quantity,
        colorId,
        sku: `SKU-${randomUUID().slice(0, 8).toUpperCase()}`,
      },
    });
    for (const a of attrs) {
      await prisma.variantAttributeValue.create({
        data: {
          variantId: variant.id,
          attributeId: a.attrId,
          value: a.value,
        },
      });
    }
    return variant;
  }

  // Product 1 variants
  await createVariant(product1.id, 'مشکی - ۱۲۸ گیگ', 17200000, 15, colors[0].id, [
    { attrId: attrCapacity.id, value: '۱۲۸ گیگابایت' },
    { attrId: attrWarranty.id, value: '۱۸ ماه گارانتی' },
  ]);
  await createVariant(product1.id, 'آبی - ۲۵۶ گیگ', 18900000, 8, colors[3].id, [
    { attrId: attrCapacity.id, value: '۲۵۶ گیگابایت' },
    { attrId: attrWarranty.id, value: '۱۸ ماه گارانتی' },
  ]);

  // Product 2
  await createVariant(product2.id, 'سفید', 1290000, 40, colors[1].id, [
    { attrId: attrWarranty.id, value: '۱۲ ماه گارانتی' },
  ]);
  await createVariant(product2.id, 'مشکی', 1290000, 35, colors[0].id, [
    { attrId: attrWarranty.id, value: '۱۲ ماه گارانتی' },
  ]);

  // Product 3
  await createVariant(product3.id, 'سفید', 790000, 60, colors[1].id, [
    { attrId: attrWarranty.id, value: '۶ ماه گارانتی' },
  ]);

  // Product 4
  await createVariant(product4.id, 'استیل براق', 3850000, 12, colors[12].id, [
    { attrId: attrMaterial.id, value: 'استیل ضدزنگ' },
    { attrId: attrCapacity.id, value: '۸ پارچه' },
    { attrId: attrWarranty.id, value: '۲۴ ماه گارانتی' },
  ]);

  // Product 5
  await createVariant(product5.id, 'استیل', 1490000, 25, colors[12].id, [
    { attrId: attrMaterial.id, value: 'استیل' },
    { attrId: attrCapacity.id, value: '۱.۷ لیتر' },
    { attrId: attrWarranty.id, value: '۱۲ ماه گارانتی' },
  ]);

  // Product 6
  await createVariant(product6.id, 'سفید - سایز L', 2590000, 18, colors[1].id, [
    { attrId: attrSize.id, value: 'L' },
    { attrId: attrMaterial.id, value: 'پنبه' },
  ]);
  await createVariant(product6.id, 'آبی - سایز M', 2590000, 14, colors[3].id, [
    { attrId: attrSize.id, value: 'M' },
    { attrId: attrMaterial.id, value: 'پنبه' },
  ]);

  console.log('Created product variants and attribute values');

  // ==================== PRODUCT IMAGES (10) ====================
  const productIdsForImages = [product1.id, product1.id, product2.id, product3.id, product4.id, product4.id, product5.id, product6.id, product6.id, product2.id];
  for (let i = 0; i < 10; i++) {
    await prisma.productImage.create({
      data: {
        productId: productIdsForImages[i],
        url: images[i],
        alt: `تصویر محصول ${i + 1}`,
        useCase: ImageUseCase.PRODUCT,
        sortOrder: i,
        isMain: i % 3 === 0,
      },
    });
  }
  console.log('Created 10 product images');

  // ==================== REVIEWS (3 per product) ====================
  const reviewBodies = [
    'کیفیت عالی و ارسال سریع. کاملاً راضی هستم.',
    'محصول خوبیه ولی بسته‌بندی می‌تونست بهتر باشه.',
    'ارزش خرید داره. پیشنهاد می‌کنم.',
  ];

  for (const product of products) {
    for (let i = 0; i < 3; i++) {
      await prisma.review.create({
        data: {
          rating: 4 + (i % 2),
          title: `نظر خریدار ${i + 1}`,
          body: reviewBodies[i],
          isApproved: true,
          verifiedPurchase: true,
          userId: buyers[i].id,
          productId: product.id,
        },
      });
    }
  }
  console.log('Created reviews (3 per product)');

  // ==================== STORE REVIEWS (3 per store) ====================
  for (const store of [store1, store2]) {
    for (let i = 0; i < 3; i++) {
      await prisma.storeReview.create({
        data: {
          userId: buyers[i].id,
          storeId: store.id,
          rating: 4 + (i % 2),
          body: `تجربه خرید از این فروشگاه خوب بود. امتیاز ${4 + (i % 2)}`,
          productQuality: 4 + (i % 2),
          verifiedPurchase: true,
          status: StoreStatus.approved,
        },
      });
    }
  }
  console.log('Created store reviews');

  // ==================== QnA (2 per product) ====================
  for (const product of products) {
    const q1 = await prisma.qna.create({
      data: {
        content: 'آیا این محصول گارانتی معتبر دارد؟',
        role: UserRole.buyer,
        status: ReviewApproval.approved,
        userId: seller1.id,
        productId: product.id,
      },
    });
    await prisma.qna.create({
      data: {
        content: 'بله، گارانتی رسمی شرکت ارائه می‌شود.',
        role: UserRole.seller,
        status: ReviewApproval.approved,
        userId: product.storeId === store1.id ? seller1.id : seller2.id,
        productId: product.id,
        parentId: q1.id,
      },
    });
  }
  console.log('Created QnAs');

  // ==================== DISCOUNT CODES (one product variant linked per store) ====================
  const discount1 = await prisma.discountCode.create({
    data: {
      code: 'TEHRAN10',
      description: '۱۰ درصد تخفیف ویژه فروشگاه تهران',
      value: 10,
      type: DiscountType.percentage,
      status: StatusDiscount.STORE,
      minOrderAmount: 500000,
      usageLimit: 100,
      perUserLimit: 2,
      isActive: true,
      startsAt: new Date('2026-01-01'),
      endsAt: new Date('2026-12-31'),
      userId: seller1.id,
    },
  });
  await prisma.discountCodeStore.create({
    data: { discountCodeId: discount1.id, storeId: store1.id },
  });

  const discount2 = await prisma.discountCode.create({
    data: {
      code: 'ISFAHAN15',
      description: '۱۵ درصد تخفیف خانه و آشپزخانه',
      value: 15,
      type: DiscountType.percentage,
      status: StatusDiscount.STORE,
      minOrderAmount: 1000000,
      usageLimit: 50,
      perUserLimit: 1,
      isActive: true,
      startsAt: new Date('2026-01-01'),
      endsAt: new Date('2026-12-31'),
      userId: seller2.id,
    },
  });
  await prisma.discountCodeStore.create({
    data: { discountCodeId: discount2.id, storeId: store2.id },
  });

  // Link one variant of each store to a discount
  const variantsStore1 = await prisma.productVariant.findMany({ where: { product: { storeId: store1.id } }, take: 1 });
  if (variantsStore1[0]) {
    await prisma.productVariant.update({
      where: { id: variantsStore1[0].id },
      data: { discountId: discount1.id },
    });
  }
  const variantsStore2 = await prisma.productVariant.findMany({ where: { product: { storeId: store2.id } }, take: 1 });
  if (variantsStore2[0]) {
    await prisma.productVariant.update({
      where: { id: variantsStore2[0].id },
      data: { discountId: discount2.id },
    });
  }

  console.log('Created discount codes and linked to stores/variants');

  // ==================== SHIPPING METHODS (5) ====================
  const shippingMethods = await Promise.all([
    prisma.shippingMethod.create({ data: { name: 'پست ملی', isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'تیپاکس', isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'ارسال رایگان', isFreeMethod: true, isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'پیک موتوری', isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'باربری', isActive: true } }),
  ]);
  console.log('Created 5 shipping methods');

  // ==================== STORE SHIPPING METHODS (3 per store) ====================
  for (const store of [store1, store2]) {
    await prisma.storeShippingMethod.create({
      data: {
        storeId: store.id,
        shippingMethodId: shippingMethods[0].id,
        isActive: true,
        minDays: 2,
        maxDays: 5,
        defaultPrice: 45000,
        description: 'ارسال با پست ملی',
      },
    });
    await prisma.storeShippingMethod.create({
      data: {
        storeId: store.id,
        shippingMethodId: shippingMethods[1].id,
        isActive: true,
        minDays: 1,
        maxDays: 3,
        defaultPrice: 75000,
        description: 'ارسال سریع تیپاکس',
      },
    });
    await prisma.storeShippingMethod.create({
      data: {
        storeId: store.id,
        shippingMethodId: shippingMethods[2].id,
        isActive: true,
        minDays: 3,
        maxDays: 7,
        defaultPrice: 0,
        description: 'ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان',
      },
    });
  }
  console.log('Created store shipping methods (3 per store)');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });