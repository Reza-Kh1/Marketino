// prisma/seed.ts
import { PrismaClient, UserRole, StoreStatus, ProductCondition, ProductStatus, BannerPosition, ImageUseCase } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning database...')
  await prisma.$transaction([
    prisma.message.deleteMany(), prisma.conversation.deleteMany(), prisma.compareItem.deleteMany(),
    prisma.trackingEvent.deleteMany(), prisma.qna.deleteMany(), prisma.reports.deleteMany(),
    prisma.ticketMessage.deleteMany(), prisma.ticket.deleteMany(),
    prisma.discountCodeUsage.deleteMany(), prisma.discountCodeStore.deleteMany(), prisma.discountCode.deleteMany(),
    prisma.withdrawRequest.deleteMany(), prisma.walletTransaction.deleteMany(), prisma.wallet.deleteMany(),
    prisma.notification.deleteMany(), prisma.wishlistItem.deleteMany(), prisma.storeReview.deleteMany(),
    prisma.review.deleteMany(), prisma.returnItem.deleteMany(), prisma.returnRequest.deleteMany(),
    prisma.invoice.deleteMany(), prisma.payment.deleteMany(), prisma.orderItem.deleteMany(), prisma.order.deleteMany(),
    prisma.checkout.deleteMany(), prisma.cartItem.deleteMany(), prisma.address.deleteMany(),
    prisma.productImage.deleteMany(), prisma.productVariant.deleteMany(), prisma.product.deleteMany(),
    prisma.brand.deleteMany(), prisma.category.deleteMany(), prisma.storeRating.deleteMany(),
    prisma.shippingMethod.deleteMany(), prisma.storeShippingMethod.deleteMany(), prisma.storeShippingRate.deleteMany(),
    prisma.store.deleteMany(), prisma.user.deleteMany(), prisma.banner.deleteMany(),
    prisma.siteSetting.deleteMany(), prisma.color.deleteMany(), prisma.city.deleteMany(), prisma.province.deleteMany(),
  ])
  console.log('✅ Database cleaned\n')

  // ─── Users ─────────────────────────────────────────────────────────────────
  console.log('👤 Creating users...')
  const [admin, seller1, seller2, seller3, buyer] = await Promise.all([
    prisma.user.create({ data: { username: 'admin', email: 'admin@example.com', password: await hash('123', 10), firstName: 'مدیر', lastName: 'سیستم', role: UserRole.superAdmin, isVerified: true, emailVerified: true, phone: '09120000000' } }),
    prisma.user.create({ data: { username: 'seller1', email: 'seller1@example.com', password: await hash('123', 10), firstName: 'علی', lastName: 'محمدی', role: UserRole.seller, isVerified: true, emailVerified: true, phone: '09121111111' } }),
    prisma.user.create({ data: { username: 'seller2', email: 'seller2@example.com', password: await hash('123', 10), firstName: 'مریم', lastName: 'احمدی', role: UserRole.seller, isVerified: true, emailVerified: true, phone: '09122222222' } }),
    prisma.user.create({ data: { username: 'seller3', email: 'seller3@example.com', password: await hash('123', 10), firstName: 'حسن', lastName: 'رضایی', role: UserRole.seller, isVerified: true, emailVerified: true, phone: '09123333333' } }),
    prisma.user.create({ data: { username: 'buyer', email: 'buyer@example.com', password: await hash('123', 10), firstName: 'رضا', lastName: 'کریمی', role: UserRole.buyer, isVerified: true, emailVerified: true, phone: '09124444444' } }),
  ])
  console.log('   ✔ admin, seller1, seller2, seller3, buyer\n')
  console.log('📍 Creating provinces & cities...')
  const [tehranProv, isfahanProv] = await Promise.all([
    prisma.province.create({ data: { name: 'تهران', nameEn: 'Tehran' } }),
    prisma.province.create({ data: { name: 'اصفهان', nameEn: 'Isfahan' } }),
  ])
  const [tehranCity, isfahanCity] = await Promise.all([
    prisma.city.create({ data: { name: 'تهران', nameEn: 'Tehran', provinceId: tehranProv.id } }),
    prisma.city.create({ data: { name: 'اصفهان', nameEn: 'Isfahan', provinceId: isfahanProv.id } }),
  ])
  console.log('   ✔ Tehran, Isfahan\n')
  console.log('📂 Creating categories...')
  const [catElectronics, catFashion, catHome, catSports] = await Promise.all([
    prisma.category.create({ data: { name: 'الکترونیک', nameEn: 'Electronics', slug: 'electronics', slugEn: 'electronics' } }),
    prisma.category.create({ data: { name: 'پوشاک', nameEn: 'Fashion', slug: 'fashion', slugEn: 'fashion' } }),
    prisma.category.create({ data: { name: 'خانه و آشپزخانه', nameEn: 'Home & Kitchen', slug: 'home-kitchen', slugEn: 'home-kitchen' } }),
    prisma.category.create({ data: { name: 'ورزش و سلامت', nameEn: 'Sports', slug: 'sports', slugEn: 'sports' } }),
  ])
  console.log('   ✔ 4 categories\n')
  console.log('🏷️  Creating brands...')
  const [brand1, brand2, brand3] = await Promise.all([
    prisma.brand.create({ data: { name: 'سامسونگ', nameEn: 'Samsung', slug: 'samsung' } }),
    prisma.brand.create({ data: { name: 'اپل', nameEn: 'Apple', slug: 'apple' } }),
    prisma.brand.create({ data: { name: 'نایک', nameEn: 'Nike', slug: 'nike' } }),
  ])
  console.log('   ✔ 3 brands\n')
  console.log('🎨 Creating colors...')
  const [colorBlack, colorWhite, colorRed] = await Promise.all([
    prisma.color.create({ data: { name: 'مشکی', nameEn: 'Black', hexCode: '#000000', slug: 'black' } }),
    prisma.color.create({ data: { name: 'سفید', nameEn: 'White', hexCode: '#FFFFFF', slug: 'white' } }),
    prisma.color.create({ data: { name: 'قرمز', nameEn: 'Red', hexCode: '#FF0000', slug: 'red' } }),
  ])
  console.log('   ✔ 3 colors\n')
  console.log('🏪 Creating stores...')
  const [store1, store2, store3] = await Promise.all([
    prisma.store.create({ data: { ownerId: seller1.id, name: 'فروشگاه دیجی‌تک', nameEn: 'DigiTech Store', slug: 'digitech', status: StoreStatus.approved, isActive: true, isVerified: true, commissionRate: 10, address: 'تهران، خیابان ولیعصر', phone: '021-11111111', description: 'فروشگاه لوازم الکتroنیکی', provinceId: tehranProv.id, cityId: tehranCity.id, rating: { create: { avgRating: 4.5, totalReviews: 30, productQuality: 4.5 } } } }),
    prisma.store.create({ data: { ownerId: seller2.id, name: 'پوشاک مدرن', nameEn: 'Modern Fashion', slug: 'modern-fashion', status: StoreStatus.approved, isActive: true, isVerified: true, commissionRate: 15, address: 'اصفهان، چهارباغ', phone: '031-22222222', description: 'فروشگاه پوشاک زنانه و مردانه', provinceId: isfahanProv.id, cityId: isfahanCity.id, rating: { create: { avgRating: 4.0, totalReviews: 20, productQuality: 4.0 } } } }),
    prisma.store.create({ data: { ownerId: seller3.id, name: 'لوازم ورزشی اسپرت', nameEn: 'Sport Gear', slug: 'sport-gear', status: StoreStatus.approved, isActive: true, isVerified: true, commissionRate: 12, address: 'تهران، میدان ونک', phone: '021-33333333', description: 'تجهیزات ورزشی', provinceId: tehranProv.id, cityId: tehranCity.id, rating: { create: { avgRating: 4.2, totalReviews: 15, productQuality: 4.2 } } } }),
  ])
  console.log('   ✔ 3 stores\n')
  console.log('🚚 Creating shipping methods...')
  const [shipPost, shipExpress, shipFree] = await Promise.all([
    prisma.shippingMethod.create({ data: { name: 'پست پیشتاز', nameEn: 'Post', isFreeMethod: false, isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'پیک موتوری', nameEn: 'Courier', isFreeMethod: false, isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'ارسال رایگان', nameEn: 'Free Shipping', isFreeMethod: true, isActive: true } }),
  ])
  for (const store of [store1, store2, store3]) {
    await Promise.all([
      prisma.storeShippingMethod.create({ data: { storeId: store.id, shippingMethodId: shipPost.id, minDays: 3, maxDays: 5 } }),
      prisma.storeShippingMethod.create({ data: { storeId: store.id, shippingMethodId: shipExpress.id, minDays: 1, maxDays: 2 } }),
      prisma.storeShippingMethod.create({ data: { storeId: store.id, shippingMethodId: shipFree.id, minDays: 5, maxDays: 7 } }),
    ])
  }
  console.log('   ✔ 3 shipping methods × 3 stores\n')
  console.log('📦 Creating 10 products...')
  const products = await Promise.all([
    prisma.product.create({ data: { title: 'گوشی موبایل سامسونگ گلکسی S24', titleEn: 'Samsung Galaxy S24', slug: 'samsung-s24', slugEn: 'samsung-s24', description: 'گوشی پرچم‌دار سامسونگ با دوربین ۲۰۰ مگاپیکسلی', descriptionEn: 'Flagship Samsung phone', categoryId: catElectronics.id, brandId: brand1.id, storeId: store1.id, originalPrice: 45000000, minPrice: 42000000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'لپ‌تاپ اپل مک‌بوک ایر M3', titleEn: 'MacBook Air M3', slug: 'macbook-air-m3', slugEn: 'macbook-air-m3', description: 'لپ‌تاپ سبک و قدرتمند اپل', descriptionEn: 'Lightweight Apple laptop', categoryId: catElectronics.id, brandId: brand2.id, storeId: store1.id, originalPrice: 75000000, minPrice: 72000000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'هدفون بی‌سیم سونی WH-1000XM5', titleEn: 'Sony WH-1000XM5', slug: 'sony-headphone', slugEn: 'sony-headphone', description: 'هدفون نویزکنسلینگ سونی', descriptionEn: 'Sony noise-cancelling headphones', categoryId: catElectronics.id, brandId: brand1.id, storeId: store1.id, originalPrice: 12000000, minPrice: 10500000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'ساعت هوشمند اپل واچ سری ۹', titleEn: 'Apple Watch Series 9', slug: 'apple-watch-9', slugEn: 'apple-watch-9', description: 'ساعت هوشمند اپل', descriptionEn: 'Apple smartwatch', categoryId: catElectronics.id, brandId: brand2.id, storeId: store1.id, originalPrice: 25000000, minPrice: 23000000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'کت و شلوار مردانه اسلیم', titleEn: 'Men Slim Suit', slug: 'mens-suit', slugEn: 'mens-suit', description: 'کت و شلوار مردانه با دوخت عالی', descriptionEn: 'Men slim fit suit', categoryId: catFashion.id, storeId: store2.id, originalPrice: 8500000, minPrice: 7500000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'مانتو زنانه بلند طرح‌دار', titleEn: 'Womens Long Mantoo', slug: 'womens-mantoo', slugEn: 'womens-mantoo', description: 'مانتو زنانه بلند با طرح گلدار', descriptionEn: 'Floral print womens mantoo', categoryId: catFashion.id, storeId: store2.id, originalPrice: 3200000, minPrice: 2800000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'کفش ورزشی نایک ایر مکس', titleEn: 'Nike Air Max', slug: 'nike-air-max', slugEn: 'nike-air-max', description: 'کفش ورزشی نایک ایر مکس ۹۰', descriptionEn: 'Nike Air Max 90 shoes', categoryId: catFashion.id, brandId: brand3.id, storeId: store2.id, originalPrice: 5800000, minPrice: 5200000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'تردمیل خانگی پروفرم ۵۴۰۰', titleEn: 'Proform 5400 Treadmill', slug: 'proform-treadmill', slugEn: 'proform-treadmill', description: 'تردمیل خانگی با ۱۲ برنامه تمرینی', descriptionEn: 'Home treadmill', categoryId: catSports.id, storeId: store3.id, originalPrice: 45000000, minPrice: 42000000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'ست دمبل ۲۰ کیلویی تنظیمی', titleEn: 'Adjustable Dumbbell Set', slug: 'dumbbell-set', slugEn: 'dumbbell-set', description: 'ست دمبل ۲ تا ۲۰ کیلوگرم', descriptionEn: '2-20kg dumbbell set', categoryId: catSports.id, storeId: store3.id, originalPrice: 4500000, minPrice: 3900000, status: ProductStatus.approved, condition: ProductCondition.new } }),
    prisma.product.create({ data: { title: 'توپ فوتبال آدیداس گل لئو', titleEn: 'Adidas Goal Leo Ball', slug: 'adidas-football', slugEn: 'adidas-football', description: 'توپ فوتبال آدیداس سایز ۵', descriptionEn: 'Adidas size 5 football', categoryId: catSports.id, storeId: store3.id, originalPrice: 1800000, minPrice: 1500000, status: ProductStatus.approved, condition: ProductCondition.new } }),
  ])
  console.log('   ✔ ' + products.length + ' products\n')
  console.log('🔧 Creating product variants...')
  const variants: any[] = []
  for (const product of products) {
    const price = Number(product.minPrice ?? 0)
    const v1 = await prisma.productVariant.create({ data: { name: 'پایه', sku: 'VAR-' + product.id.slice(0, 6), price, quantity: 20, productId: product.id } })
    const v2 = await prisma.productVariant.create({ data: { name: 'پرو', sku: 'VARP-' + product.id.slice(0, 6), price: Math.round(price * 1.2), quantity: 10, colorId: colorBlack.id, productId: product.id } })
    variants.push(v1, v2)
  }
  console.log('   ✔ ' + variants.length + ' variants\n')
  console.log('🖼️  Creating product images...')
  for (let i = 0; i < products.length; i++) {
    await prisma.productImage.create({ data: { url: 'https://picsum.photos/seed/' + (i * 100 + 1) + '/400/400', alt: products[i].title, isMain: true, productId: products[i].id, useCase: ImageUseCase.PRODUCT } })
    await prisma.productImage.create({ data: { url: 'https://picsum.photos/seed/' + (i * 100 + 2) + '/400/400', alt: products[i].title + ' 2', isMain: false, productId: products[i].id, useCase: ImageUseCase.PRODUCT } })
  }
  console.log('   ✔ ' + products.length * 2 + ' images\n')
  console.log('⭐ Creating product reviews...')
  const reviewTexts = [
    'محصول عالی بود، دقیقا همون چیزی که می‌خواستم.',
    'کیفیت خوبیه ولی قیمتش کمی بالاست.',
    'رضایت کامل، ارسال سریع و بسته‌بندی عالی.',
    'متوسط بود. انتظار بیشتری داشتم.',
    'بهترین خریدم امسال! پیشنهاد می‌کنم.',
  ]
  const reviews: any[] = []
  for (let i = 0; i < products.length; i++) {
    const reviewCount = 2 + (i % 3)
    const reviewUsers = [buyer, seller1, seller2, seller3]
    for (let r = 0; r < reviewCount; r++) {
      const rating = 3 + (r % 3)
      reviews.push(prisma.review.create({
        data: { rating, title: reviewTexts[r % reviewTexts.length], body: reviewTexts[(r + 2) % reviewTexts.length], isApproved: true, verifiedPurchase: r === 0, userId: reviewUsers[r % reviewUsers.length].id, productId: products[i].id, variantInfo: { name: 'پایه', color: 'مشکی' } }
      }))
    }
  }
  await Promise.all(reviews)
  console.log('   ✔ ' + reviews.length + ' reviews\n')
  console.log('⭐ Creating store reviews...')
  await Promise.all([
    prisma.storeReview.create({ data: { userId: buyer.id, storeId: store1.id, rating: 5, body: 'فروشگاه عالی، محصولات اصل و ارسال سریع.', productQuality: 5, status: StoreStatus.approved } }),
    prisma.storeReview.create({ data: { userId: buyer.id, storeId: store2.id, rating: 4, body: 'کیفیت خوب، پشتیبانی متوسط.', productQuality: 4, status: StoreStatus.approved } }),
    prisma.storeReview.create({ data: { userId: buyer.id, storeId: store3.id, rating: 4, body: 'محصولات ورزشی اصل و قیمت مناسب.', productQuality: 4, status: StoreStatus.approved } }),
  ])
  console.log('   ✔ 3 store reviews\n')
  console.log('❓ Creating Q&A entries...')
  const qaPairs = [
    { question: 'آیا این محصول گارانتی داره؟', answer: 'بله، تمام محصولات گارانتی ۱۸ ماهه دارند.', productId: products[0].id, userId: seller1.id },
    { question: 'رنگ دیگری هم داره؟', answer: 'فعلا فقط رنگ مشکی موجوده.', productId: products[1].id, userId: seller1.id },
    { question: 'آیا ارسال رایگان داره؟', answer: 'بله، سفارش‌های بالای ۱۰ میلیون ارسال رایگان دارند.', productId: products[2].id, userId: seller1.id },
    { question: 'سایزبندی لباس چطوره؟', answer: 'سایزبندی استاندارد ایرانیه.', productId: products[4].id, userId: seller2.id },
    { question: 'جنس پارچه‌اش چیه؟', answer: 'پارچه پلی‌استر درجه یک با آستر نخی.', productId: products[5].id, userId: seller2.id },
    { question: 'وزن توپ چقدره؟', answer: 'وزن استاندارد ۴۳۰ گرم.', productId: products[8].id, userId: seller3.id },
  ]
  for (const qa of qaPairs) {
    const qna = await prisma.qna.create({ data: { content: qa.question, role: UserRole.buyer, status: 'approved', userId: buyer.id, productId: qa.productId } })
    await prisma.qna.create({ data: { content: qa.answer, role: UserRole.seller, status: 'approved', userId: qa.userId, productId: qa.productId, parentId: qna.id } })
  }
  console.log('   ✔ ' + qaPairs.length * 2 + ' Q&A entries\n')
  console.log('📍 Creating addresses...')
  await prisma.address.createMany({
    data: [
      { userId: buyer.id, title: 'خانه', fullName: 'رضا کریمی', phone: '09124444444', provinceId: tehranProv.id, cityId: tehranCity.id, address: 'خیابان انقلاب، کوچه ۱۲، پلاک ۵', postalCode: '1234567890', isDefault: true },
      { userId: buyer.id, title: 'محل کار', fullName: 'رضا کریمی', phone: '09124444444', provinceId: tehranProv.id, cityId: tehranCity.id, address: 'خیابان شریعتی، برج آسمان، طبقه ۱۰', postalCode: '0987654321', isDefault: false },
    ],
  })
  console.log('   ✔ 2 addresses\n')
  console.log('🎨 Creating banners...')
  await prisma.banner.createMany({
    data: [
      { title: 'تخفیف ویژه', titleEn: 'Special Discount', subtitle: 'تا ۳۰٪ تخفیف', subtitleEn: 'Up to 30% off', image: 'https://picsum.photos/seed/banner1/1200/400', link: '/products', position: BannerPosition.home_top, isActive: true, sortOrder: 1 },
      { title: 'فروش ویژه', titleEn: 'Special Sale', image: 'https://picsum.photos/seed/banner2/1200/400', link: '/products', position: BannerPosition.home_middle, isActive: true, sortOrder: 2 },
    ],
  })
  console.log('   ✔ 2 banners\n')
  console.log('⚙️  Creating site settings...')
  await prisma.siteSetting.createMany({
    data: [
      { key: 'site_name', value: 'مارکتینو', type: 'string' },
      { key: 'site_description', value: 'فروشگاه اینترنتی مارکتینو', type: 'string' },
      { key: 'currency', value: 'تومان', type: 'string' },
      { key: 'free_shipping_threshold', value: '10000000', type: 'number' },
    ],
  })
  console.log('   ✔ settings\n')
  console.log('✅ Seed completed successfully!')
  console.log('─────────────────────────────────────')
  console.log('👤 Admin:    admin@example.com    / 123')
  console.log('👤 Seller1:  seller1@example.com  / 123')
  console.log('👤 Seller2:  seller2@example.com  / 123')
  console.log('👤 Seller3:  seller3@example.com  / 123')
  console.log('👤 Buyer:    buyer@example.com    / 123')
  console.log('─────────────────────────────────────')
}

main().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
