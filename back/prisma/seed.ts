import {
  PrismaClient,
  ProductCondition,
  ProductStatus,
  StoreStatus,
  UserRole,
  ReviewApproval,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ============================================================
// 🔐 تنظیمات - پسورد دلخواه خودتون رو اینجا تغییر بدید
// ============================================================
const DEFAULT_PASSWORD = '123'; // ← این رو به هر چی دوست دارید تغییر بدید

// ============================================================

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

const id = (prefix: string, value: string | number) => `seed-${prefix}-${value}`;

// هش کردن پسورد
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Types
type SellerWithStore = {
  user: Awaited<ReturnType<typeof prisma.user.upsert>>;
  store: Awaited<ReturnType<typeof prisma.store.upsert>>;
};

type Buyer = Awaited<ReturnType<typeof prisma.user.upsert>>;
type Product = Awaited<ReturnType<typeof prisma.product.upsert>>;

type ColorWithName = {
  id: string;
  hexCode: string;
  name: string;
  nameEn: string;
};

async function main() {
  // هش کردن پسورد
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
  console.log(`🔐 Password: "${DEFAULT_PASSWORD}"`);

  /*
   * ------------------------------------------------------
   * 1. Province / City
   * ------------------------------------------------------
   */

  const province = await prisma.province.upsert({
    where: { name: 'تهران' },
    update: {},
    create: {
      id: id('province', 'tehran'),
      name: 'تهران',
      nameEn: 'Tehran',
    },
  });

  const city = await prisma.city.upsert({
    where: {
      provinceId_name: {
        provinceId: province.id,
        name: 'تهران',
      },
    },
    update: {},
    create: {
      id: id('city', 'tehran'),
      name: 'تهران',
      nameEn: 'Tehran',
      provinceId: province.id,
    },
  });

  console.log(`📍 Province: ${province.name}, City: ${city.name}`);

  /*
   * ------------------------------------------------------
   * 2. Super Admin
   * ------------------------------------------------------
   */

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {
      email: 'superadmin@seed.local',
      firstName: 'مدیر',
      lastName: 'کل',
      role: UserRole.superAdmin,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      password: hashedPassword,
    },
    create: {
      id: id('user', 'superadmin'),
      username: 'superadmin',
      email: 'superadmin@seed.local',
      password: hashedPassword,
      firstName: 'مدیر',
      lastName: 'کل',
      phone: '0912000000',
      role: UserRole.superAdmin,
      isActive: true,
      isVerified: true,
      emailVerified: true,
    },
  });

  console.log(`👑 Super Admin: ${superAdmin.username}`);

  /*
   * ------------------------------------------------------
   * 3. Sellers (3 فروشنده)
   * ------------------------------------------------------
   */

  const sellersData = [
    {
      id: id('user', 'seller-1'),
      username: 'seller_tech',
      email: 'seller-tech@seed.local',
      firstName: 'علی',
      lastName: 'رضایی',
      storeName: 'تکنولند',
      storeNameEn: 'TechnoLand',
      slug: 'technoland',
      description: 'فروش تخصصی کالاهای دیجیتال',
      phone: '0912000001',
      storePhone: '0214400001',
    },
    {
      id: id('user', 'seller-2'),
      username: 'seller_digital',
      email: 'seller-digital@seed.local',
      firstName: 'محمد',
      lastName: 'احمدی',
      storeName: 'دیجیتال سنتر',
      storeNameEn: 'Digital Center',
      slug: 'digital-center',
      description: 'عرضه محصولات دیجیتال و لوازم جانبی',
      phone: '0912000002',
      storePhone: '0214400002',
    },
    {
      id: id('user', 'seller-3'),
      username: 'seller_home',
      email: 'seller-home@seed.local',
      firstName: 'امیر',
      lastName: 'کریمی',
      storeName: 'خانه مدرن',
      storeNameEn: 'Modern Home',
      slug: 'modern-home',
      description: 'محصولات خانه و لوازم هوشمند',
      phone: '0912000003',
      storePhone: '0214400003',
    },
  ];

  const sellers: SellerWithStore[] = [];

  for (let index = 0; index < sellersData.length; index++) {
    const sellerData = sellersData[index];

    const user = await prisma.user.upsert({
      where: { username: sellerData.username },
      update: {
        email: sellerData.email,
        firstName: sellerData.firstName,
        lastName: sellerData.lastName,
        role: UserRole.seller,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        password: hashedPassword,
        phone: sellerData.phone,
      },
      create: {
        id: sellerData.id,
        username: sellerData.username,
        email: sellerData.email,
        password: hashedPassword,
        firstName: sellerData.firstName,
        lastName: sellerData.lastName,
        phone: sellerData.phone,
        role: UserRole.seller,
        isActive: true,
        isVerified: true,
        emailVerified: true,
      },
    });

    const store = await prisma.store.upsert({
      where: { ownerId: user.id },
      update: {
        name: sellerData.storeName,
        nameEn: sellerData.storeNameEn,
        slug: sellerData.slug,
        description: sellerData.description,
        status: StoreStatus.approved,
        isActive: true,
        isVerified: true,
        provinceId: province.id,
        cityId: city.id,
        phone: sellerData.storePhone,
        email: sellerData.email,
      },
      create: {
        id: id('store', sellerData.username),
        ownerId: user.id,
        name: sellerData.storeName,
        nameEn: sellerData.storeNameEn,
        slug: sellerData.slug,
        description: sellerData.description,
        descriptionEn: sellerData.storeNameEn,
        businessType: 'حقیقی',
        status: StoreStatus.approved,
        isActive: true,
        isVerified: true,
        address: `تهران، خیابان ولیعصر، پلاک ${index + 1}`,
        phone: sellerData.storePhone,
        email: sellerData.email,
        shippingTime: '1 تا 3 روز کاری',
        workingHours: '09:00 - 20:00',
        provinceId: province.id,
        cityId: city.id,
      },
    });

    sellers.push({ user, store });
    console.log(`🏪 Seller ${index + 1}: ${user.username} - Store: ${store.name}`);
  }

  /*
   * ------------------------------------------------------
   * 4. Buyer (1 خریدار)
   * ------------------------------------------------------
   */

  const buyers: Buyer[] = [];

  const buyer = await prisma.user.upsert({
    where: { username: 'buyer' },
    update: {
      email: 'buyer@seed.local',
      firstName: 'کاربر',
      lastName: 'عادی',
      role: UserRole.buyer,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      password: hashedPassword,
    },
    create: {
      id: id('user', 'buyer'),
      username: 'buyer',
      email: 'buyer@seed.local',
      password: hashedPassword,
      firstName: 'کاربر',
      lastName: 'عادی',
      phone: '0912000010',
      role: UserRole.buyer,
      isActive: true,
      isVerified: true,
      emailVerified: true,
    },
  });
  buyers.push(buyer);

  console.log(`👤 Buyer: ${buyer.username}`);

  /*
   * ------------------------------------------------------
   * 5. Brands
   * ------------------------------------------------------
   */

  const brandsData = [
    ['acer', 'ایسر', 'Acer'],
    ['lenovo', 'لنوو', 'Lenovo'],
    ['samsung', 'سامسونگ', 'Samsung'],
    ['xiaomi', 'شیائومی', 'Xiaomi'],
    ['sony', 'سونی', 'Sony'],
    ['philips', 'فیلیپس', 'Philips'],
    ['apple', 'اپل', 'Apple'],
    ['huawei', 'هوآوی', 'Huawei'],
    ['nokia', 'نوکیا', 'Nokia'],
    ['lg', 'الجی', 'LG'],
    ['panasonic', 'پاناسونیک', 'Panasonic'],
    ['bosch', 'بوش', 'Bosch'],
  ];

  const brands: Record<string, { id: string }> = {};

  for (const [slug, name, nameEn] of brandsData) {
    brands[slug] = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: {
        id: id('brand', slug),
        name,
        nameEn,
        slug,
      },
    });
  }

  console.log(`🏷️ Brands: ${Object.keys(brands).length}`);

  /*
   * ------------------------------------------------------
   * 6. Categories - 3 levels
   * ------------------------------------------------------
   */

  const categories = [
    // سطح 1: دسته‌بندی‌های اصلی
    {
      id: id('category', 'technology'),
      slug: 'technology',
      slugEn: 'technology',
      name: 'کالای دیجیتال',
      nameEn: 'Technology',
      parentId: null,
      ancestorIds: [],
      isActive: true,
    },
    {
      id: id('category', 'home'),
      slug: 'home',
      slugEn: 'home',
      name: 'خانه و آشپزخانه',
      nameEn: 'Home & Kitchen',
      parentId: null,
      ancestorIds: [],
      isActive: true,
    },
    {
      id: id('category', 'mobile-accessories'),
      slug: 'mobile-accessories',
      slugEn: 'mobile-accessories',
      name: 'لوازم جانبی موبایل',
      nameEn: 'Mobile Accessories',
      parentId: null,
      ancestorIds: [],
      isActive: true,
    },

    // سطح 2: زیردسته‌های کالای دیجیتال
    {
      id: id('category', 'technology-laptop'),
      slug: 'laptop',
      slugEn: 'laptop',
      name: 'لپ تاپ',
      nameEn: 'Laptop',
      parentId: id('category', 'technology'),
      ancestorIds: [id('category', 'technology')],
      isActive: true,
    },
    {
      id: id('category', 'technology-mobile'),
      slug: 'mobile',
      slugEn: 'mobile',
      name: 'موبایل',
      nameEn: 'Mobile',
      parentId: id('category', 'technology'),
      ancestorIds: [id('category', 'technology')],
      isActive: true,
    },
    {
      id: id('category', 'technology-tablet'),
      slug: 'tablet',
      slugEn: 'tablet',
      name: 'تبلت',
      nameEn: 'Tablet',
      parentId: id('category', 'technology'),
      ancestorIds: [id('category', 'technology')],
      isActive: true,
    },

    // سطح 2: زیردسته‌های خانه و آشپزخانه
    {
      id: id('category', 'home-audio'),
      slug: 'audio',
      slugEn: 'audio',
      name: 'صوتی و تصویری',
      nameEn: 'Audio & Visual',
      parentId: id('category', 'home'),
      ancestorIds: [id('category', 'home')],
      isActive: true,
    },
    {
      id: id('category', 'home-appliances'),
      slug: 'appliances',
      slugEn: 'appliances',
      name: 'لوازم خانگی',
      nameEn: 'Appliances',
      parentId: id('category', 'home'),
      ancestorIds: [id('category', 'home')],
      isActive: true,
    },
    {
      id: id('category', 'home-kitchen'),
      slug: 'kitchen',
      slugEn: 'kitchen',
      name: 'آشپزخانه',
      nameEn: 'Kitchen',
      parentId: id('category', 'home'),
      ancestorIds: [id('category', 'home')],
      isActive: true,
    },

    // سطح 2: زیردسته‌های لوازم جانبی
    {
      id: id('category', 'accessories-case'),
      slug: 'case',
      slugEn: 'case',
      name: 'قاب و محافظ',
      nameEn: 'Cases & Protection',
      parentId: id('category', 'mobile-accessories'),
      ancestorIds: [id('category', 'mobile-accessories')],
      isActive: true,
    },
    {
      id: id('category', 'accessories-charger'),
      slug: 'charger',
      slugEn: 'charger',
      name: 'شارژر و کابل',
      nameEn: 'Chargers & Cables',
      parentId: id('category', 'mobile-accessories'),
      ancestorIds: [id('category', 'mobile-accessories')],
      isActive: true,
    },

    // سطح 3: برندهای لپ تاپ
    {
      id: id('category', 'technology-laptop-acer'),
      slug: 'acer',
      slugEn: 'acer',
      name: 'ایسر',
      nameEn: 'Acer',
      parentId: id('category', 'technology-laptop'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-laptop')],
      isActive: true,
    },
    {
      id: id('category', 'technology-laptop-lenovo'),
      slug: 'lenovo',
      slugEn: 'lenovo',
      name: 'لنوو',
      nameEn: 'Lenovo',
      parentId: id('category', 'technology-laptop'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-laptop')],
      isActive: true,
    },
    {
      id: id('category', 'technology-laptop-apple'),
      slug: 'apple',
      slugEn: 'apple',
      name: 'اپل',
      nameEn: 'Apple',
      parentId: id('category', 'technology-laptop'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-laptop')],
      isActive: true,
    },

    // سطح 3: برندهای موبایل
    {
      id: id('category', 'technology-mobile-samsung'),
      slug: 'samsung',
      slugEn: 'samsung',
      name: 'سامسونگ',
      nameEn: 'Samsung',
      parentId: id('category', 'technology-mobile'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-mobile')],
      isActive: true,
    },
    {
      id: id('category', 'technology-mobile-xiaomi'),
      slug: 'xiaomi',
      slugEn: 'xiaomi',
      name: 'شیائومی',
      nameEn: 'Xiaomi',
      parentId: id('category', 'technology-mobile'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-mobile')],
      isActive: true,
    },
    {
      id: id('category', 'technology-mobile-huawei'),
      slug: 'huawei',
      slugEn: 'huawei',
      name: 'هوآوی',
      nameEn: 'Huawei',
      parentId: id('category', 'technology-mobile'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-mobile')],
      isActive: true,
    },

    // سطح 3: برندهای تبلت
    {
      id: id('category', 'technology-tablet-apple'),
      slug: 'apple-tablet',
      slugEn: 'apple-tablet',
      name: 'اپل',
      nameEn: 'Apple',
      parentId: id('category', 'technology-tablet'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-tablet')],
      isActive: true,
    },
    {
      id: id('category', 'technology-tablet-samsung'),
      slug: 'samsung-tablet',
      slugEn: 'samsung-tablet',
      name: 'سامسونگ',
      nameEn: 'Samsung',
      parentId: id('category', 'technology-tablet'),
      ancestorIds: [id('category', 'technology'), id('category', 'technology-tablet')],
      isActive: true,
    },

    // سطح 3: برندهای صوتی
    {
      id: id('category', 'home-audio-sony'),
      slug: 'sony',
      slugEn: 'sony',
      name: 'سونی',
      nameEn: 'Sony',
      parentId: id('category', 'home-audio'),
      ancestorIds: [id('category', 'home'), id('category', 'home-audio')],
      isActive: true,
    },
    {
      id: id('category', 'home-audio-lg'),
      slug: 'lg-audio',
      slugEn: 'lg-audio',
      name: 'الجی',
      nameEn: 'LG',
      parentId: id('category', 'home-audio'),
      ancestorIds: [id('category', 'home'), id('category', 'home-audio')],
      isActive: true,
    },

    // سطح 3: برندهای لوازم خانگی
    {
      id: id('category', 'home-appliances-philips'),
      slug: 'philips',
      slugEn: 'philips',
      name: 'فیلیپس',
      nameEn: 'Philips',
      parentId: id('category', 'home-appliances'),
      ancestorIds: [id('category', 'home'), id('category', 'home-appliances')],
      isActive: true,
    },
    {
      id: id('category', 'home-appliances-bosch'),
      slug: 'bosch',
      slugEn: 'bosch',
      name: 'بوش',
      nameEn: 'Bosch',
      parentId: id('category', 'home-appliances'),
      ancestorIds: [id('category', 'home'), id('category', 'home-appliances')],
      isActive: true,
    },
    {
      id: id('category', 'home-appliances-panasonic'),
      slug: 'panasonic',
      slugEn: 'panasonic',
      name: 'پاناسونیک',
      nameEn: 'Panasonic',
      parentId: id('category', 'home-appliances'),
      ancestorIds: [id('category', 'home'), id('category', 'home-appliances')],
      isActive: true,
    },

    // سطح 3: برندهای آشپزخانه
    {
      id: id('category', 'home-kitchen-philips'),
      slug: 'philips-kitchen',
      slugEn: 'philips-kitchen',
      name: 'فیلیپس',
      nameEn: 'Philips',
      parentId: id('category', 'home-kitchen'),
      ancestorIds: [id('category', 'home'), id('category', 'home-kitchen')],
      isActive: true,
    },
    {
      id: id('category', 'home-kitchen-bosch'),
      slug: 'bosch-kitchen',
      slugEn: 'bosch-kitchen',
      name: 'بوش',
      nameEn: 'Bosch',
      parentId: id('category', 'home-kitchen'),
      ancestorIds: [id('category', 'home'), id('category', 'home-kitchen')],
      isActive: true,
    },

    // سطح 3: برندهای لوازم جانبی
    {
      id: id('category', 'accessories-case-apple'),
      slug: 'apple-case',
      slugEn: 'apple-case',
      name: 'اپل',
      nameEn: 'Apple',
      parentId: id('category', 'accessories-case'),
      ancestorIds: [id('category', 'mobile-accessories'), id('category', 'accessories-case')],
      isActive: true,
    },
    {
      id: id('category', 'accessories-charger-samsung'),
      slug: 'samsung-charger',
      slugEn: 'samsung-charger',
      name: 'سامسونگ',
      nameEn: 'Samsung',
      parentId: id('category', 'accessories-charger'),
      ancestorIds: [id('category', 'mobile-accessories'), id('category', 'accessories-charger')],
      isActive: true,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        nameEn: category.nameEn,
        parentId: category.parentId,
        ancestorIds: category.ancestorIds,
        isActive: true,
      },
      create: category,
    });
  }

  console.log(`📁 Categories: ${categories.length}`);

  /*
   * ------------------------------------------------------
   * 7. Attributes
   * ------------------------------------------------------
   */

  const leafCategories = [
    id('category', 'technology-laptop-acer'),
    id('category', 'technology-laptop-lenovo'),
    id('category', 'technology-laptop-apple'),
    id('category', 'technology-mobile-samsung'),
    id('category', 'technology-mobile-xiaomi'),
    id('category', 'technology-mobile-huawei'),
    id('category', 'technology-tablet-apple'),
    id('category', 'technology-tablet-samsung'),
    id('category', 'home-audio-sony'),
    id('category', 'home-audio-lg'),
    id('category', 'home-appliances-philips'),
    id('category', 'home-appliances-bosch'),
    id('category', 'home-appliances-panasonic'),
    id('category', 'home-kitchen-philips'),
    id('category', 'home-kitchen-bosch'),
    id('category', 'accessories-case-apple'),
    id('category', 'accessories-charger-samsung'),
  ];

  const attributes = [
    ['ram', 'حافظه رم', 'RAM'],
    ['storage', 'حافظه داخلی', 'Storage'],
    ['screen', 'اندازه صفحه', 'Screen Size'],
    ['cpu', 'پردازنده', 'CPU'],
    ['color', 'رنگ', 'Color'],
    ['warranty', 'گارانتی', 'Warranty'],
    ['battery', 'ظرفیت باتری', 'Battery Capacity'],
    ['camera', 'دوربین', 'Camera'],
    ['weight', 'وزن', 'Weight'],
    ['dimensions', 'ابعاد', 'Dimensions'],
    ['material', 'جنس', 'Material'],
    ['connectivity', 'اتصال', 'Connectivity'],
  ];

  const attrMap: Record<string, string> = {};

  for (const [key, label] of attributes) {
    const attr = await prisma.attributeDefinition.upsert({
      where: { key },
      update: {
        label,
        category: {
          connect: leafCategories.map((categoryId) => ({ id: categoryId })),
        },
      },
      create: {
        id: uuidv4(),
        key,
        label,
        category: {
          connect: leafCategories.map((categoryId) => ({ id: categoryId })),
        },
      },
    });

    attrMap[key] = attr.id;
  }

  console.log(`🏷️ Attributes: ${Object.keys(attrMap).length}`);

  /*
   * ------------------------------------------------------
   * 8. Colors
   * ------------------------------------------------------
   */

  const colorData = [
    ['black', 'مشکی', 'Black', '#111111'],
    ['silver', 'نقره‌ای', 'Silver', '#C0C0C0'],
    ['blue', 'آبی', 'Blue', '#2563EB'],
    ['green', 'سبز', 'Green', '#16A34A'],
    ['white', 'سفید', 'White', '#FFFFFF'],
    ['gray', 'خاکستری', 'Gray', '#6B7280'],
    ['gold', 'طلایی', 'Gold', '#FFD700'],
    ['rose-gold', 'رزگلد', 'Rose Gold', '#B76E79'],
    ['red', 'قرمز', 'Red', '#DC2626'],
    ['purple', 'بنفش', 'Purple', '#7C3AED'],
  ];

  const colors: Record<string, ColorWithName> = {};

  for (const [slug, name, nameEn, hexCode] of colorData) {
    const color = await prisma.color.upsert({
      where: { slug },
      update: {},
      create: {
        id: uuidv4(),
        name,
        nameEn,
        hexCode,
        slug,
      },
    });
    colors[slug] = color;
  }

  console.log(`🎨 Colors: ${Object.keys(colors).length}`);

  /*
   * ------------------------------------------------------
   * 9. Products (12 محصول - 4 تا برای هر فروشنده)
   * ------------------------------------------------------
   */

  const products = [
    // ===== فروشنده 1 (تکنولند) - محصولات دیجیتال =====
    {
      slug: 'acer-aspire-5-a515',
      title: 'لپ تاپ ایسر Aspire 5 A515',
      titleEn: 'Acer Aspire 5 A515 Laptop',
      brand: 'acer',
      category: 'technology-laptop-acer',
      seller: 0,
      basePrice: 42500000,
      originalPrice: 47000000,
      desc: 'لپ تاپ مناسب کارهای روزمره، برنامه‌نویسی و استفاده اداری با پردازنده قدرتمند Intel Core i7 و نمایشگر 15.6 اینچ Full HD.',
      specs: ['16GB', '32GB'],
      specs2: ['512GB SSD', '1TB SSD'],
      attrs: ['ram', 'storage', 'cpu', 'screen'],
      cpu: 'Intel Core i7-1165G7',
      colors: ['silver', 'black'],
      features: ['پردازنده نسل یازدهم', 'گرافیک مجزا', 'باتری 10 ساعته'],
    },
    {
      slug: 'acer-nitro-v15',
      title: 'لپ تاپ گیمینگ ایسر Nitro V15',
      titleEn: 'Acer Nitro V15 Gaming Laptop',
      brand: 'acer',
      category: 'technology-laptop-acer',
      seller: 0,
      basePrice: 58500000,
      originalPrice: 64000000,
      desc: 'لپ تاپ گیمینگ با گرافیک مجزا NVIDIA GeForce RTX 3050، سیستم خنک‌کننده قدرتمند و صفحه نمایش 144Hz مناسب بازی‌های سنگین.',
      specs: ['16GB', '32GB'],
      specs2: ['512GB SSD', '1TB SSD'],
      attrs: ['ram', 'storage', 'cpu', 'screen'],
      cpu: 'Intel Core i7-12700H',
      colors: ['black', 'gray'],
      features: ['RTX 3050', 'صفحه 144Hz', 'خنک‌کننده پیشرفته'],
    },
    {
      slug: 'lenovo-ideapad-3',
      title: 'لپ تاپ لنوو IdeaPad 3',
      titleEn: 'Lenovo IdeaPad 3 Laptop',
      brand: 'lenovo',
      category: 'technology-laptop-lenovo',
      seller: 0,
      basePrice: 36500000,
      originalPrice: 40000000,
      desc: 'لپ تاپ اقتصادی و کاربردی برای دانشجویان، کارهای اداری و استفاده روزانه با پردازنده Intel Core i5 و نمایشگر 15.6 اینچ.',
      specs: ['8GB', '16GB'],
      specs2: ['256GB SSD', '512GB SSD'],
      attrs: ['ram', 'storage', 'cpu', 'screen'],
      cpu: 'Intel Core i5-1135G7',
      colors: ['gray', 'silver'],
      features: ['مناسب دانشجویی', 'وزن سبک', 'باتری 8 ساعته'],
    },
    {
      slug: 'samsung-galaxy-s24-fe',
      title: 'گوشی سامسونگ Galaxy S24 FE',
      titleEn: 'Samsung Galaxy S24 FE',
      brand: 'samsung',
      category: 'technology-mobile-samsung',
      seller: 0,
      basePrice: 38500000,
      originalPrice: 42000000,
      desc: 'پرچمدار اقتصادی سامسونگ با نمایشگر Dynamic AMOLED 6.7 اینچ، دوربین 50 مگاپیکسلی و عملکرد بسیار سریع با پردازنده Exynos 2400.',
      specs: ['8GB', '12GB'],
      specs2: ['128GB', '256GB'],
      attrs: ['ram', 'storage', 'camera', 'battery'],
      cpu: 'Exynos 2400',
      colors: ['green', 'gray', 'blue'],
      features: ['AMOLED 120Hz', 'دوربین 50MP', 'باتری 4500mAh'],
    },

    // ===== فروشنده 2 (دیجیتال سنتر) - محصولات دیجیتال =====
    {
      slug: 'xiaomi-redmi-note-14',
      title: 'گوشی شیائومی Redmi Note 14 Pro',
      titleEn: 'Xiaomi Redmi Note 14 Pro',
      brand: 'xiaomi',
      category: 'technology-mobile-xiaomi',
      seller: 1,
      basePrice: 15500000,
      originalPrice: 17500000,
      desc: 'گوشی اقتصادی با باتری قدرتمند 5000mAh، نمایشگر AMOLED 6.67 اینچ 120Hz و دوربین اصلی 108 مگاپیکسلی.',
      specs: ['8GB', '12GB'],
      specs2: ['128GB', '256GB'],
      attrs: ['ram', 'storage', 'camera', 'battery'],
      cpu: 'MediaTek Dimensity 7200',
      colors: ['black', 'blue', 'green'],
      features: ['AMOLED 120Hz', 'دوربین 108MP', 'باتری 5000mAh'],
    },
    {
      slug: 'xiaomi-poco-x7',
      title: 'گوشی شیائومی Poco X7 Pro',
      titleEn: 'Xiaomi Poco X7 Pro',
      brand: 'xiaomi',
      category: 'technology-mobile-xiaomi',
      seller: 1,
      basePrice: 23500000,
      originalPrice: 26000000,
      desc: 'گوشی قدرتمند برای بازی و استفاده روزانه با پردازنده سریع Dimensity 8300 و نمایشگر AMOLED 6.67 اینچ 120Hz.',
      specs: ['8GB', '12GB'],
      specs2: ['256GB', '512GB'],
      attrs: ['ram', 'storage', 'camera', 'battery'],
      cpu: 'MediaTek Dimensity 8300',
      colors: ['black', 'green', 'yellow'],
      features: ['AMOLED 120Hz', 'دوربین 64MP', 'باتری 5100mAh'],
    },
    {
      slug: 'huawei-nova-12',
      title: 'گوشی هوآوی Nova 12',
      titleEn: 'Huawei Nova 12',
      brand: 'huawei',
      category: 'technology-mobile-huawei',
      seller: 1,
      basePrice: 19500000,
      originalPrice: 22000000,
      desc: 'گوشی میان‌رده با طراحی زیبا، نمایشگر OLED 6.7 اینچ و دوربین 50 مگاپیکسلی با کیفیت عکاسی فوق‌العاده.',
      specs: ['8GB', '12GB'],
      specs2: ['128GB', '256GB'],
      attrs: ['ram', 'storage', 'camera', 'battery'],
      cpu: 'Kirin 9000S',
      colors: ['black', 'white', 'purple'],
      features: ['OLED 120Hz', 'دوربین 50MP', 'شارژ 66W'],
    },
    {
      slug: 'apple-ipad-air',
      title: 'تبلت اپل iPad Air M2',
      titleEn: 'Apple iPad Air M2',
      brand: 'apple',
      category: 'technology-tablet-apple',
      seller: 1,
      basePrice: 32000000,
      originalPrice: 35000000,
      desc: 'تبلت قدرتمند با تراشه M2، صفحه نمایش Liquid Retina 10.9 اینچ و پشتیبانی از Apple Pencil نسل دوم.',
      specs: ['8GB', '16GB'],
      specs2: ['64GB', '256GB'],
      attrs: ['ram', 'storage', 'screen'],
      cpu: 'Apple M2',
      colors: ['silver', 'gray', 'gold'],
      features: ['Liquid Retina', 'Apple Pencil', 'Face ID'],
    },

    // ===== فروشنده 3 (خانه مدرن) - محصولات خانه =====
    {
      slug: 'sony-wh-1000xm5',
      title: 'هدفون بی‌سیم سونی WH-1000XM5',
      titleEn: 'Sony WH-1000XM5 Wireless Headphone',
      brand: 'sony',
      category: 'home-audio-sony',
      seller: 2,
      basePrice: 18500000,
      originalPrice: 20500000,
      desc: 'هدفون حرفه‌ای با حذف نویز فعال پیشرفته، کیفیت صدای بالا با پشتیبانی از LDAC و باتری 30 ساعته.',
      specs: ['مشکی', 'نقره‌ای', 'سفید'],
      specs2: ['1 سال گارانتی', '2 سال گارانتی'],
      attrs: ['color', 'warranty', 'connectivity', 'battery'],
      colors: ['black', 'silver', 'white'],
      features: ['Noise Cancelling', 'LDAC', 'باتری 30h'],
    },
    {
      slug: 'sony-ult-field-7',
      title: 'اسپیکر قابل حمل سونی ULT Field 7',
      titleEn: 'Sony ULT Field 7 Speaker',
      brand: 'sony',
      category: 'home-audio-sony',
      seller: 2,
      basePrice: 31500000,
      originalPrice: 35000000,
      desc: 'اسپیکر قدرتمند قابل حمل با صدای بیس عمیق، مقاوم در برابر آب و گرد و غبار (IP67) و باتری 25 ساعته.',
      specs: ['مشکی', 'سبز', 'آبی'],
      specs2: ['1 سال گارانتی', '2 سال گارانتی'],
      attrs: ['color', 'warranty', 'connectivity', 'battery'],
      colors: ['black', 'green', 'blue'],
      features: ['IP67', 'باس عمیق', 'باتری 25h'],
    },
    {
      slug: 'philips-airfryer-hd9270',
      title: 'سرخ کن بدون روغن فیلیپس HD9270',
      titleEn: 'Philips HD9270 Airfryer',
      brand: 'philips',
      category: 'home-appliances-philips',
      seller: 2, // ✅ اینجا seller هست نه sender
      basePrice: 11800000,
      originalPrice: 13500000,
      desc: 'سرخ‌کن بدون روغن فیلیپس با ظرفیت 7.3 لیتر، تکنولوژی Rapid Air و صفحه نمایش دیجیتال مناسب خانواده.',
      specs: ['6.2L', '7.3L'],
      specs2: ['1 سال گارانتی', '2 سال گارانتی'],
      attrs: ['screen', 'warranty', 'weight', 'dimensions'],
      colors: ['black', 'silver'],
      features: ['Rapid Air', '7.3L ظرفیت', 'دیجیتال'],
    },
    {
      slug: 'philips-7000-blender',
      title: 'مخلوط کن فیلیپس سری 7000',
      titleEn: 'Philips 7000 Blender',
      brand: 'philips',
      category: 'home-kitchen-philips',
      seller: 2,
      basePrice: 9200000,
      originalPrice: 10500000,
      desc: 'مخلوط‌کن قدرتمند فیلیپس با تیغه استیل ProBlend، موتور 1400 وات و 12 برنامه هوشمند برای استفاده روزمره.',
      specs: ['1400W', '1600W'],
      specs2: ['1 سال گارانتی', '2 سال گارانتی'],
      attrs: ['cpu', 'warranty', 'weight', 'material'],
      cpu: '1400W Motor',
      colors: ['black', 'white'],
      features: ['ProBlend', '1400W', '12 برنامه'],
    },
  ];

  /*
   * ------------------------------------------------------
   * 10. Create Products + Images + Variants
   * ------------------------------------------------------
   */

  const createdProducts: Product[] = [];

  for (let pIndex = 0; pIndex < products.length; pIndex++) {
    const p = products[pIndex];

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        titleEn: p.titleEn,
        description: p.desc,
        originalPrice: p.originalPrice,
        status: ProductStatus.approved,
        condition: ProductCondition.new,
        isFeatured: pIndex < 4,
        isDigital: false,
        viewCount: 500 + pIndex * 137,
        saleCount: 20 + pIndex * 5,
        rating: 4.3 + (pIndex % 5) * 0.1,
        reviewCount: 3 + pIndex,
        categoryId: uuidv4(),
        brandId: brands[p.brand].id,
        storeId: sellers[p.seller].store.id,
        productTable: {
          brand: p.brand,
          category: p.category,
          availableVariants: 4,
          features: p.features || [],
        },
        productTableEn: {
          brand: p.brand,
          category: p.category,
          availableVariants: 4,
          features: p.features || [],
        },
      },
      create: {
        id: uuidv4(),
        title: p.title,
        titleEn: p.titleEn,
        slug: p.slug,
        slugEn: p.slug,
        metaTitle: p.title,
        metaTitleEn: p.titleEn,
        description: p.desc,
        descriptionEn: p.desc,
        originalPrice: p.originalPrice,
        minPrice: p.basePrice,
        discountPercent: '15',
        condition: ProductCondition.new,
        status: ProductStatus.approved,
        isFeatured: pIndex < 4,
        isDigital: false,
        viewCount: 500 + pIndex * 137,
        saleCount: 20 + pIndex * 5,
        rating: 4.3 + (pIndex % 5) * 0.1,
        reviewCount: 3 + pIndex,
        productTable: {
          brand: p.brand,
          category: p.category,
          availableVariants: 4,
          features: p.features || [],
        },
        productTableEn: {
          brand: p.brand,
          category: p.category,
          availableVariants: 4,
          features: p.features || [],
        },
        categoryId: id('category', p.category),
        brandId: brands[p.brand].id,
        storeId: sellers[p.seller].store.id,
      },
    });

    createdProducts.push(product);

    // Images - هر محصول 2 تصویر
    const startImage = (pIndex * 2) % images.length;
    const imageCount = 2;

    for (let i = 0; i < imageCount; i++) {
      const url = images[(startImage + i) % images.length];

      await prisma.productImage.upsert({
        where: { url: `${url}-${product.id}` },
        update: {
          productId: product.id,
          alt: `${p.title} - تصویر ${i + 1}`,
          sortOrder: i,
          isMain: i === 0,
          url: `${url}-${product.id}`,
        },
        create: {
          id: id('image', `${p.slug}-${i + 1}-${Date.now()}-${Math.random()}`), // ← این خط رو تغییر بدید
          url: `${url}-${product.id}`,
          alt: `${p.title} - تصویر ${i + 1}`,
          sortOrder: i,
          isMain: i === 0,
          productId: product.id,
        },
      });
    }
    for (let v = 0; v < 4; v++) {
      const firstValue = p.specs[v % 2];
      const secondValue = p.specs2[Math.floor(v / 2)];
      const colorKey = p.colors[v % p.colors.length] || 'black';
      let color = colors[colorKey];

      // اگر رنگ وجود نداشت، از اولین رنگ موجود استفاده کن
      if (!color) {
        const firstColorKey = Object.keys(colors)[0];
        color = colors[firstColorKey];
        console.warn(`⚠️ Color "${colorKey}" not found, using "${firstColorKey}" instead`);
      }

      // ادامه کد با color...
      const variantId = id('variant', `${p.slug}-${v + 1}`);

      // قیمت‌های مختلف برای هر واریانت
      const variantPrice = p.basePrice + v * 500000 + (v % 2) * 200000;

      const variant = await prisma.productVariant.upsert({
        where: { id: variantId },
        update: {
          name: `${firstValue} / ${secondValue} / ${color.name}`,
          nameEn: `${firstValue} / ${secondValue} / ${color.nameEn}`,
          price: variantPrice,
          quantity: 8 + v * 6 + (v % 3) * 4,
          colorId: color.id,
          image: `${images[startImage % images.length]}-${product.id}`,
          productId: product.id,
        },
        create: {
          id: variantId,
          name: `${firstValue} / ${secondValue} / ${color.name}`,
          nameEn: `${firstValue} / ${secondValue} / ${color.nameEn}`,
          sku: `SEED-${p.slug.toUpperCase()}-${v + 1}`,
          price: variantPrice,
          quantity: 8 + v * 6 + (v % 3) * 4,
          colorId: color.id,
          image: `${images[startImage % images.length]}-${product.id}`,
          productId: product.id,
        },
      });

      // پاک‌سازی attribute value های قبلی
      await prisma.variantAttributeValue.deleteMany({
        where: { variantId: variant.id },
      });

      const variantAttributes: {
        attributeId: string;
        value: string;
        valueEn: string;
      }[] = [];

      // ویژگی‌های مختلف بر اساس محصول
      if (p.attrs.includes('ram')) {
        variantAttributes.push({
          attributeId: attrMap.ram,
          value: firstValue,
          valueEn: firstValue,
        });
      }

      if (p.attrs.includes('storage')) {
        variantAttributes.push({
          attributeId: attrMap.storage,
          value: secondValue,
          valueEn: secondValue,
        });
      }

      if (p.attrs.includes('cpu') && p.cpu) {
        variantAttributes.push({
          attributeId: attrMap.cpu,
          value: `${p.cpu} ${firstValue}`,
          valueEn: `${p.cpu} ${firstValue}`,
        });
      }

      if (p.attrs.includes('screen')) {
        variantAttributes.push({
          attributeId: attrMap.screen,
          value: '15.6 اینچ',
          valueEn: '15.6 inch',
        });
      }

      if (p.attrs.includes('warranty')) {
        variantAttributes.push({
          attributeId: attrMap.warranty,
          value: secondValue,
          valueEn: secondValue,
        });
      }

      if (p.attrs.includes('color')) {
        variantAttributes.push({
          attributeId: attrMap.color,
          value: color.name,
          valueEn: color.nameEn,
        });
      }

      if (p.attrs.includes('battery')) {
        variantAttributes.push({
          attributeId: attrMap.battery,
          value: '4500mAh',
          valueEn: '4500mAh',
        });
      }

      if (p.attrs.includes('camera')) {
        variantAttributes.push({
          attributeId: attrMap.camera,
          value: '50 مگاپیکسل',
          valueEn: '50MP',
        });
      }

      if (p.attrs.includes('weight')) {
        variantAttributes.push({
          attributeId: attrMap.weight,
          value: '1.2 کیلوگرم',
          valueEn: '1.2 kg',
        });
      }

      if (p.attrs.includes('dimensions')) {
        variantAttributes.push({
          attributeId: attrMap.dimensions,
          value: '30x20x2 سانتی‌متر',
          valueEn: '30x20x2 cm',
        });
      }

      if (p.attrs.includes('material')) {
        variantAttributes.push({
          attributeId: attrMap.material,
          value: 'آلومینیوم',
          valueEn: 'Aluminum',
        });
      }

      if (p.attrs.includes('connectivity')) {
        variantAttributes.push({
          attributeId: attrMap.connectivity,
          value: 'Bluetooth 5.3',
          valueEn: 'Bluetooth 5.3',
        });
      }

      for (const attribute of variantAttributes) {
        await prisma.variantAttributeValue.create({
          data: {
            id: id('variant-attr', `${p.slug}-${v + 1}-${attribute.attributeId}`),
            value: attribute.value,
            valueEn: attribute.valueEn,
            variantId: variant.id,
            attributeId: attribute.attributeId,
          },
        });
      }
    }
  }

  console.log(`📦 Products: ${createdProducts.length}`);
  console.log(`🔀 Variants: ${createdProducts.length * 4}`);

  /*
   * ------------------------------------------------------
   * 11. Reviews - هر محصول 3 نظر
   * ------------------------------------------------------
   */

  const reviewTexts = [
    {
      title: 'کیفیت عالی',
      body: 'محصول دقیقاً مطابق توضیحات بود و کیفیت ساخت فوق‌العاده‌ای داره. حتماً پیشنهاد می‌کنم.',
      rating: 5,
    },
    {
      title: 'ارزش خرید بالا',
      body: 'نسبت به قیمت، عملکرد و کیفیت بسیار مناسبی داره. از خریدم راضی هستم.',
      rating: 4,
    },
    {
      title: 'پیشنهاد می‌کنم',
      body: 'بسته‌بندی مناسب بود و محصول بدون مشکل به دستم رسید. کیفیت خوبی داره.',
      rating: 5,
    },
  ];

  const reviewAnswers = [
    'ممنون از خرید و نظر ارزشمند شما. خوشحالیم که از محصول راضی هستید.',
    'خوشحالیم که از خریدتان راضی بودید. امیدواریم باز هم از محصولات ما استفاده کنید.',
    'سپاس از شما بابت خرید و نظر خوبتون. کیفیت برای ما اولویت اول است.',
  ];

  for (let pIndex = 0; pIndex < createdProducts.length; pIndex++) {
    const product = createdProducts[pIndex];

    for (let r = 0; r < 3; r++) {
      const buyerIndex = (pIndex + r) % buyers.length;
      const buyer = buyers[buyerIndex];
      const rating = reviewTexts[r].rating;


    }
  }

  console.log(`⭐ Reviews: ${createdProducts.length * 3}`);

  /*
   * ------------------------------------------------------
   * 12. Q&A - هر محصول 3 سوال و پاسخ
   * ------------------------------------------------------
   */

  const questions = [
    'آیا این محصول گارانتی دارد و گارانتی آن چند سال است؟',
    'آیا رنگ و مشخصات محصول دقیقاً مطابق تصاویر است؟',
    'زمان ارسال محصول معمولاً چقدر است و هزینه ارسال چقدر است؟',
  ];

  const questionAnswers = [
    'بله، محصول با گارانتی معتبر ۱۸ ماهه ارائه می‌شود. گارانتی شامل خدمات پس از فروش کامل است.',
    'بله، مشخصات و رنگ‌ها دقیقاً مطابق اطلاعات درج‌شده در صفحه محصول هستند و کیفیت رنگ‌ها با تصاویر تطابق دارد.',
    'معمولاً سفارش طی ۱ تا ۳ روز کاری ارسال می‌شود و هزینه ارسال بر اساس وزن و مقصد محاسبه می‌شود.',
  ];

  for (let pIndex = 0; pIndex < createdProducts.length; pIndex++) {
    const product = createdProducts[pIndex];
    const seller = sellers[pIndex % sellers.length];

    for (let q = 0; q < 3; q++) {
      const buyerIndex = (pIndex + q + 2) % buyers.length;
      const buyer = buyers[buyerIndex];

      const questionId = id('qna', `${product.id}-q-${q + 1}`);
      const answerId = id('qna', `${product.id}-a-${q + 1}`);

      await prisma.qna.upsert({
        where: { id: questionId },
        update: {
          content: questions[q],
          role: UserRole.buyer,
          status: ReviewApproval.approved,
          userId: buyer.id,
          productId: product.id,
          parentId: null,
        },
        create: {
          id: questionId,
          content: questions[q],
          role: UserRole.buyer,
          status: ReviewApproval.approved,
          userId: buyer.id,
          productId: product.id,
        },
      });

      await prisma.qna.upsert({
        where: { id: answerId },
        update: {
          content: questionAnswers[q],
          role: UserRole.seller,
          status: ReviewApproval.approved,
          userId: seller.user.id,
          productId: product.id,
          parentId: questionId,
        },
        create: {
          id: answerId,
          content: questionAnswers[q],
          role: UserRole.seller,
          status: ReviewApproval.approved,
          userId: seller.user.id,
          productId: product.id,
          parentId: questionId,
        },
      });
    }
  }

  console.log(`❓ Q&A threads: ${createdProducts.length * 3}`);

  /*
   * ------------------------------------------------------
   * 13. StoreRating - امتیاز فروشگاه‌ها
   * ------------------------------------------------------
   */

  for (const seller of sellers) {
    const storeProducts = createdProducts.filter(
      (product) => product.storeId === seller.store.id,
    );

    const totalSales = storeProducts.reduce((sum, product) => sum + product.saleCount, 0);
    const totalReviews = storeProducts.length * 3;

    await prisma.storeRating.upsert({
      where: { storeId: seller.store.id },
      update: {
        avgRating: 4.7,
        ratingTotal: 14.1,
        totalReviews: totalReviews,
        productCount: storeProducts.length,
        productQuality: 4.8,
        productQualityTotal: 14.4,
        productQualityCount: 3,
        totalResponseRequests: totalReviews,
        answeredResponses: totalReviews,
        totalResponseTime: totalReviews * 5,
        responseRate: 100,
        responseTime: 5,
        saleCount: totalSales,
        returnCount: 0,
      },
      create: {
        id: id('store-rating', seller.store.id),
        avgRating: 4.7,
        ratingTotal: 14.1,
        totalReviews: totalReviews,
        productCount: storeProducts.length,
        productQuality: 4.8,
        productQualityTotal: 14.4,
        productQualityCount: 3,
        totalResponseRequests: totalReviews,
        answeredResponses: totalReviews,
        totalResponseTime: totalReviews * 5,
        responseRate: 100,
        responseTime: 5,
        saleCount: totalSales,
        returnCount: 0,
        storeId: seller.store.id,
      },
    });
  }

  /*
   * ------------------------------------------------------
   * 14. Summary
   * ------------------------------------------------------
   */

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Seed completed successfully!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('👑 Super Admin: superadmin');
  console.log('👤 Buyer: buyer');
  console.log(`🔐 Password: ${DEFAULT_PASSWORD}`);
  console.log('');
  console.log('🏪 Sellers:');
  sellers.forEach((seller, index) => {
    console.log(`   ${index + 1}. ${seller.user.username} - ${seller.store.name}`);
  });
  console.log('');
  console.log(`📦 Products: ${createdProducts.length} (4 per seller)`);
  console.log(`🔀 Variants: ${createdProducts.length * 4}`);
  console.log(`⭐ Reviews: ${createdProducts.length * 3}`);
  console.log(`❓ Q&A: ${createdProducts.length * 3}`);
  console.log(`📁 Categories: ${categories.length}`);
  console.log(`🏷️ Brands: ${Object.keys(brands).length}`);
  console.log(`🎨 Colors: ${Object.keys(colors).length}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });