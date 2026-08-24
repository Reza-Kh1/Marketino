/**
 * ============================================================
 * 🔌 API Client — حالت Mock (بدون نیاز به بک‌اند)
 * ============================================================
 *
 * تمام درخواست‌ها به صورت داخلی mock می‌شوند.
 * برای اتصال به بک‌اند واقعی، MOCK_MODE را false کنید.
 */

import { BrandType } from "@/services/brand.service";
import { MediaUseCase } from "@/services/media.service";
import { ProductEntity } from "@/services/product.service";

const MOCK_MODE = false;

/* ──────────────────────────────────────────────
 * 🧩 TYPES
 * ────────────────────────────────────────────── */

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'admin' | 'superAdmin';
  sellerStatus?: 'pending' | 'approved' | 'rejected';
  storeName?: string;
  storeLogo?: string;
  storeDescription?: string;
  businessType?: string;
  isVerified: boolean;
  isActive: boolean;
  wallet?: number;
  createdAt: string;
  permissions?: string[];
  commissionRate?: number;
}

export interface VariantType {
  id: string;
  name: string;
  nameEn: string | null;
  sku: string;
  price: number;
  quantity: number;
  attributes: any | null; // Json
  attributesEn: any | null; // Json
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  discountId: string | null;
  productId: string;
  product?: Product;
  discount?: DiscountCode | null;
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;       // backend field name (stock = alias)
  stock?: number;          // convenience alias for quantity
  brand?: string;
  status: 'pending' | 'approved' | 'inactive' | 'featured';
  isFeatured: boolean;
  viewCount: number;
  saleCount: number;
  rating: number;
  reviewCount: number;
  storeId: string;
  seller?: User;
  categoryId: string;
  category?: Category;
  image?: string;
  images: ProductImage[];
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;        // new product badge flag
  createdAt: string;
  variants: VariantType[]
}

export interface AllProduct {
  data: ProductEntity[]
  pagination: PaginationType
}

export interface SearchDefualtType {
  limit?: number | undefined
  page?: number | undefined
  order?: "desc" | "asc" | undefined
}
export interface CartsType {
  id: string;
  quantity: number;
  createdAt: Date | string;  // ممکن است Date یا string باشد
  product: {
    id: string;
    slug: string;
    slugEn: string | null;   // ممکن است null باشد
    title: string;
    titleEn: string | null;
    images: null | ProductImage[]
  };
  variant: {
    id: string;
    image: string | null;
    price: number;
    quantity: number;
    discount: null | DiscountCode
    discountId: string | null
    sku: string;
    updatedAt: Date | string;
    name?: string;
    attributes?: any;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: "buyer" | "seller" | "admin"; // Enum
    avatar: string | null;
    businessType: string | null;
    email: string;
    phone: string | null;
    isVerified: boolean;
    isActive: boolean;
  };
}

export interface AllCartsType {
  data: CartsType[]
  pagination: PaginationType
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  useCase: MediaUseCase
  sortOrder: number;
  isMain: boolean;
  createdAt: string; // یا Date
  productId: string | null;
  reportsId: string | null;
  ticketMessageId: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  shippingAddress?: string;
  shippingName?: string;
  shippingPhone?: string;
  trackingCode?: string;
  trackingHistory?: TrackingEvent[];
  commissionAmount?: number;
  items: OrderItem[];
  user?: User;
  createdAt: string;
}

export interface TrackingEvent {
  status: string;
  date: string;
  location?: string;
  description: string;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  storeId: string;
  seller?: User;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  body: string;
  userId: string;
  user?: User;
  productId: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  ctaText?: string;
  position: string;
  isActive: boolean;
}

export interface PaginationType {
  total: number,
  nextPage?: number
  prevPage?: number
}

export interface DiscountCode {
  code: string;
  createdAt: string; // ISO date string
  creatorId: string;
  description: string;
  endsAt: string; // ISO date string
  id: string;
  isActive: boolean;
  maxDiscount: null | number;
  minOrderAmount: number;
  perUserLimit: number;
  storeId: null | string;
  startsAt: string;
  type: "fixed" | "percentage";
  updatedAt: string;
  usageLimit: number;
  usedCount: number;
  value: number;
}

export interface AllDiscount {
  discounts: DiscountCode[] | []
  pagination: PaginationType
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  tags?: string;
  status: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  user?: User;
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketReply {
  id: string;
  message: string;
  userId: string;
  user?: User;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  targetLink?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  label: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'purchase' | 'refund' | 'commission';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
}

export interface ComparisonGroup {
  id: string;
  products: Product[];
  categoryName: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

/* ──────────────────────────────────────────────
 * 🎭 MOCK DATA GENERATORS
 * ────────────────────────────────────────────── */

function mockShop(overrides: Partial<User> = {}): User & { totalProducts?: number; avgRating?: number; totalSales?: number; productCount?: number; rating?: number } {
  return {
    id: overrides.id || `shop_${Math.random().toString(36).slice(2, 8)}`,
    username: overrides.username || 'shop',
    email: overrides.email || 'shop@bazarche.ir',
    firstName: overrides.firstName || 'فروشنده',
    role: 'seller',
    sellerStatus: 'approved',
    storeName: overrides.storeName || 'فروشگاه نمونه',
    storeLogo: overrides.storeLogo || '🏪',
    businessType: overrides.businessType || 'other',
    isVerified: overrides.isVerified ?? true,
    isActive: overrides.isActive ?? true,
    wallet: overrides.wallet ?? 0,
    createdAt: overrides.createdAt || new Date().toISOString(),
    ...overrides,
  };
}

function mockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: overrides.id || `prod_${Math.random().toString(36).slice(2, 8)}`,
    title: overrides.title || 'محصول نمونه',
    slug: overrides.slug || 'mock-product',
    description: overrides.description || 'توضیحات محصول نمونه',
    price: overrides.price ?? 1_000_000,
    discountPrice: overrides.discountPrice,
    quantity: overrides.quantity ?? 100,
    status: overrides.status || 'approved',
    isFeatured: overrides.isFeatured ?? false,
    viewCount: overrides.viewCount ?? 0,
    saleCount: overrides.saleCount ?? 0,
    rating: overrides.rating ?? 4.5,
    reviewCount: overrides.reviewCount ?? 0,
    storeId: overrides.storeId || 's1',
    seller: overrides.seller,
    categoryId: overrides.categoryId || 'cat1',
    image: overrides.image || 'https://picsum.photos/seed/prod/400/400',
    images: overrides.images || [],
    tags: overrides.tags || [],
    createdAt: overrides.createdAt || new Date().toISOString(),
    ...overrides,
  };
}

function mockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: overrides.id || `ord_${Math.random().toString(36).slice(2, 8)}`,
    orderNumber: overrides.orderNumber || `BC-${Date.now()}`,
    status: overrides.status || 'pending',
    paymentStatus: overrides.paymentStatus || 'unpaid',
    subtotal: overrides.subtotal ?? 1_000_000,
    shippingCost: overrides.shippingCost ?? 50_000,
    discountAmount: overrides.discountAmount ?? 0,
    total: overrides.total ?? 1_050_000,
    items: overrides.items || [],
    createdAt: overrides.createdAt || new Date().toISOString(),
    ...overrides,
  };
}

/* ──────────────────────────────────────────────
 * 🌐 MOCK REQUEST HANDLER
 * ────────────────────────────────────────────── */

/* ──────────────────────────────────────────────
 * 📦 RICH MOCK DATA
 * ────────────────────────────────────────────── */

const MOCK_USERS: User[] = [
  { id: 'u1', username: 'alireza', email: 'alireza@bazarche.ir', firstName: 'علیرضا', lastName: 'محمدی', phone: '09121234567', role: 'buyer', isVerified: true, isActive: true, wallet: 2500000, createdAt: '2025-11-15T08:30:00Z' },
  { id: 'u2', username: 'sara_ahmadi', email: 'sara@bazarche.ir', firstName: 'سارا', lastName: 'احمدی', phone: '09131234568', role: 'buyer', isVerified: true, isActive: true, wallet: 1800000, createdAt: '2025-12-01T10:15:00Z' },
  { id: 'u3', username: 'rezajavadi', email: 'reza@bazarche.ir', firstName: 'رضا', lastName: 'جوادی', phone: '09141234569', role: 'buyer', isVerified: true, isActive: true, wallet: 500000, createdAt: '2026-01-20T14:00:00Z' },
  { id: 'u4', username: 'maryam_h', email: 'maryam@bazarche.ir', firstName: 'مریم', lastName: 'حسنی', phone: '09151234570', role: 'buyer', isVerified: true, isActive: false, wallet: 0, createdAt: '2026-02-10T09:45:00Z' },
  { id: 'u5', username: 'amir_rezaei', email: 'amir@bazarche.ir', firstName: 'امیر', lastName: 'رضایی', phone: '09161234571', role: 'buyer', isVerified: true, isActive: true, wallet: 3200000, createdAt: '2026-03-05T16:20:00Z' },
  { id: 's1', username: 'digikala_markazi', email: 'digi@seller.ir', firstName: 'مدیر', lastName: 'دیجیکالا', role: 'seller', sellerStatus: 'approved', storeName: 'دیجی کالای مرکزی', storeLogo: '📱', businessType: 'electronics', isVerified: true, isActive: true, wallet: 45000000, commissionRate: 10, createdAt: '2025-06-01T08:00:00Z' },
  { id: 's2', username: 'mod_irani', email: 'mod@seller.ir', firstName: 'حسین', lastName: 'کریمی', role: 'seller', sellerStatus: 'approved', storeName: 'مد پوشاک ایرانی', storeLogo: '👕', businessType: 'clothing', isVerified: true, isActive: true, wallet: 28000000, commissionRate: 10, createdAt: '2025-07-15T09:00:00Z' },
  { id: 's3', username: 'khaneye_modern', email: 'home@seller.ir', firstName: 'زهرا', lastName: 'نوروزی', role: 'seller', sellerStatus: 'approved', storeName: 'خانه مدرن', storeLogo: '🏠', businessType: 'home', isVerified: true, isActive: true, wallet: 52000000, commissionRate: 8, createdAt: '2025-08-01T10:00:00Z' },
  { id: 's4', username: 'varzesh_salamat', email: 'sport@seller.ir', firstName: 'محمد', lastName: 'قاسمی', role: 'seller', sellerStatus: 'approved', storeName: 'ورزش و سلامتی', storeLogo: '⚽', businessType: 'sports', isVerified: true, isActive: true, wallet: 15000000, commissionRate: 10, createdAt: '2025-09-10T11:00:00Z' },
  { id: 's5', username: 'honar_ceramic', email: 'art@seller.ir', firstName: 'نرگس', lastName: 'صبوری', role: 'seller', sellerStatus: 'approved', storeName: 'هنر سرامیک', storeLogo: '🎨', businessType: 'art', isVerified: true, isActive: true, wallet: 8000000, commissionRate: 5, createdAt: '2025-10-05T13:00:00Z' },
  { id: 's6', username: 'zargold', email: 'gold@seller.ir', firstName: 'بهزاد', lastName: 'زرین', role: 'seller', sellerStatus: 'pending', storeName: 'زرگلد', storeLogo: '💍', businessType: 'jewelry', isVerified: false, isActive: true, wallet: 0, commissionRate: 15, createdAt: '2026-04-10T15:00:00Z' },
  { id: 's7', username: 'techno_electric', email: 'tech@seller.ir', firstName: 'فرهاد', lastName: 'امینی', role: 'seller', sellerStatus: 'pending', storeName: 'تکنو الکتریک', storeLogo: '🔧', businessType: 'electronics', isVerified: false, isActive: true, wallet: 0, commissionRate: 10, createdAt: '2026-04-20T12:00:00Z' },
  { id: 's8', username: 'ketabsara', email: 'book@seller.ir', firstName: 'سمیرا', lastName: 'فاضلی', role: 'seller', sellerStatus: 'rejected', storeName: 'کتابسرای ایران', storeLogo: '📚', businessType: 'books', isVerified: false, isActive: false, wallet: 0, commissionRate: 10, createdAt: '2026-01-01T08:00:00Z' },
  { id: 'a1', username: 'admin', email: 'admin@bazarche.ir', firstName: 'مدیر', lastName: 'سیستم', role: 'admin', isVerified: true, isActive: true, isSuperAdmin: true, permissions: ['all'], wallet: 0, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'a2', username: 'moderator', email: 'mod@bazarche.ir', firstName: 'ناظم', lastName: 'بازارچه', role: 'admin', isVerified: true, isActive: true, permissions: ['users', 'products', 'orders'], wallet: 0, createdAt: '2025-03-01T09:00:00Z' },
];

function _user(id: string) { return MOCK_USERS.find(u => u.id === id) || MOCK_USERS[0]; }

const MOCK_ORDERS: Order[] = [
  { id: 'o1', orderNumber: 'BC-140301', status: 'pending', paymentStatus: 'pending', subtotal: 21990000, shippingCost: 50000, discountAmount: 0, total: 22040000, shippingName: 'علیرضا محمدی', shippingPhone: '09121234567', trackingCode: '', items: [{ id: 'oi1', title: 'گوشی هوشمند X1 Pro 5G', price: 21990000, quantity: 1, total: 21990000, storeId: 's1' }], user: _user('u1'), createdAt: '2026-05-30T10:30:00Z' },
  { id: 'o2', orderNumber: 'BC-140302', status: 'confirmed', paymentStatus: 'paid', subtotal: 7380000, shippingCost: 50000, discountAmount: 0, total: 7430000, shippingName: 'سارا احمدی', shippingPhone: '09131234568', trackingCode: '', commissionAmount: 738000, items: [{ id: 'oi2', title: 'هدفون بیسیم ANC Pro', price: 3690000, quantity: 2, total: 7380000, storeId: 's1' }], user: _user('u2'), createdAt: '2026-05-29T14:15:00Z' },
  { id: 'o3', orderNumber: 'BC-140303', status: 'processing', paymentStatus: 'paid', subtotal: 16500000, shippingCost: 75000, discountAmount: 500000, total: 16575000, shippingName: 'رضا جوادی', shippingPhone: '09141234569', trackingCode: 'IRP-1234567890', commissionAmount: 1650000, items: [{ id: 'oi3', title: 'مانیتور گیمینگ ۲۷ اینچ 4K', price: 16500000, quantity: 1, total: 16500000, storeId: 's3' }], user: _user('u3'), createdAt: '2026-05-28T09:00:00Z' },
  { id: 'o4', orderNumber: 'BC-140304', status: 'shipped', paymentStatus: 'paid', subtotal: 28900000, shippingCost: 120000, discountAmount: 1000000, total: 28220000, shippingName: 'مریم حسنی', shippingPhone: '09151234570', trackingCode: 'IRP-0987654321', commissionAmount: 2890000, items: [{ id: 'oi4', title: 'تبلت ۱۱ اینچی Pro M2', price: 28900000, quantity: 1, total: 28900000, storeId: 's1' }], user: _user('u4'), createdAt: '2026-05-25T11:30:00Z' },
  { id: 'o5', orderNumber: 'BC-140305', status: 'delivered', paymentStatus: 'paid', subtotal: 3690000, shippingCost: 50000, discountAmount: 100000, total: 3640000, shippingName: 'امیر رضایی', shippingPhone: '09161234571', trackingCode: 'IRP-5555555555', commissionAmount: 369000, items: [{ id: 'oi5', title: 'هدفون بیسیم ANC Pro', price: 3690000, quantity: 1, total: 3690000, storeId: 's1' }], user: _user('u5'), createdAt: '2026-05-20T16:45:00Z' },
  { id: 'o6', orderNumber: 'BC-140306', status: 'cancelled', paymentStatus: 'refunded', subtotal: 5500000, shippingCost: 50000, discountAmount: 0, total: 0, shippingName: 'علیرضا محمدی', shippingPhone: '09121234567', items: [{ id: 'oi6', title: 'کیبورد مکانیکال RGB', price: 5500000, quantity: 1, total: 5500000, storeId: 's7' }], user: _user('u1'), createdAt: '2026-05-18T08:00:00Z' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', title: 'گوشی هوشمند X1 Pro 5G', slug: 'x1-pro-5g', description: 'پرچمدار جدید با دوربین 200 مگاپیکسلی و پردازنده نسل جدید', price: 21990000, discountPrice: 19900000, quantity: 45, brand: 'XPhone', status: 'approved', isFeatured: true, viewCount: 15234, saleCount: 234, rating: 4.7, reviewCount: 156, storeId: 's1', categoryId: 'electronics', image: 'https://picsum.photos/seed/phone1/400/400', images: [], tags: ['approved', 'featured'], specs: {}, createdAt: '2026-03-01T08:00:00Z' },
  { id: 'p2', title: 'هدفون بیسیم ANC Pro', slug: 'anc-pro-wireless', description: 'هدفون بیسیم با قابلیت حذف نویز فعال و ۴۰ ساعت شارژدهی', price: 3690000, discountPrice: 3290000, quantity: 120, brand: 'SoundMax', status: 'approved', isFeatured: true, viewCount: 9856, saleCount: 312, rating: 4.6, reviewCount: 234, storeId: 's1', categoryId: 'electronics', image: 'https://picsum.photos/seed/headphone1/400/400', images: [], tags: ['approved', 'featured'], specs: {}, createdAt: '2026-02-15T10:00:00Z' },
  { id: 'p3', title: 'مانیتور گیمینگ ۲۷ اینچ 4K', slug: 'gaming-monitor-27-4k', description: 'مانیتور گیمینگ با رفرش ریت 165Hz و زمان پاسخگویی 1ms', price: 16500000, discountPrice: 14800000, quantity: 30, brand: 'VisionPro', status: 'approved', isFeatured: false, viewCount: 7562, saleCount: 89, rating: 4.8, reviewCount: 67, storeId: 's3', categoryId: 'electronics', image: 'https://picsum.photos/seed/monitor1/400/400', images: [], tags: ['approved'], specs: {}, createdAt: '2026-01-20T14:00:00Z' },
  { id: 'p4', title: 'تبلت ۱۱ اینچی Pro M2', slug: 'tablet-pro-11-m2', description: 'تبلت حرفه‌ای با صفحه نمایش Liquid Retina و پشتیبانی از قلم', price: 28900000, discountPrice: 26900000, quantity: 18, brand: 'TabPro', status: 'approved', isFeatured: true, viewCount: 11234, saleCount: 156, rating: 4.9, reviewCount: 98, storeId: 's1', categoryId: 'electronics', image: 'https://picsum.photos/seed/tablet1/400/400', images: [], tags: ['approved', 'featured'], specs: {}, createdAt: '2026-01-10T09:00:00Z' },
  { id: 'p5', title: 'کیبورد مکانیکال RGB گیمینگ', slug: 'mechanical-keyboard-rgb', description: 'کیبورد گیمینگ با سوییچ‌های Cherry MX و نورپردازی RGB', price: 5500000, discountPrice: undefined, quantity: 80, brand: 'GameGear', status: 'pending', isFeatured: false, viewCount: 3456, saleCount: 45, rating: 4.3, reviewCount: 34, storeId: 's7', categoryId: 'electronics', image: 'https://picsum.photos/seed/keyboard1/400/400', images: [], tags: ['pending'], specs: {}, createdAt: '2026-04-25T12:00:00Z' },
  { id: 'p6', title: 'اسپیکر بلوتوثی پرتابل', slug: 'portable-bluetooth-speaker', description: 'اسپیکر ضدآب با کیفیت صدای Hi-Fi و ۲۰ ساعت باتری', price: 2850000, discountPrice: 2490000, quantity: 200, brand: 'SoundMax', status: 'approved', isFeatured: false, viewCount: 6789, saleCount: 198, rating: 4.5, reviewCount: 89, storeId: 's1', categoryId: 'electronics', image: 'https://picsum.photos/seed/speaker1/400/400', images: [], tags: ['approved'], specs: {}, createdAt: '2025-12-15T09:00:00Z' },
  { id: 'p7', title: 'پیراهن مردانه کتان', slug: 'mens-cotton-shirt', description: 'پیراهن کتان با کیفیت عالی، مناسب مهمانی و مجلسی', price: 1290000, discountPrice: 990000, quantity: 300, brand: 'ModIran', status: 'approved', isFeatured: true, viewCount: 5432, saleCount: 234, rating: 4.4, reviewCount: 178, storeId: 's2', categoryId: 'clothing', image: 'https://picsum.photos/seed/shirt1/400/400', images: [], tags: ['approved', 'featured'], specs: {}, createdAt: '2026-02-01T08:00:00Z' },
  { id: 'p8', title: 'سرویس قابلمه گرانیتی ۱۲ پارچه', slug: 'granite-cookware-set', description: 'سرویس کامل قابلمه و تابه با روکش گرانیت نچسب', price: 8900000, discountPrice: 7600000, quantity: 50, brand: 'KhanehModern', status: 'approved', isFeatured: false, viewCount: 4321, saleCount: 123, rating: 4.7, reviewCount: 56, storeId: 's3', categoryId: 'home', image: 'https://picsum.photos/seed/cookware1/400/400', images: [], tags: ['approved'], specs: {}, createdAt: '2026-03-10T11:00:00Z' },
  { id: 'p9', title: 'کفش ورزشی حرفه‌ای', slug: 'professional-sports-shoes', description: 'کفش دویدن با کفی طبی و تهویه هوای عالی', price: 4500000, discountPrice: undefined, quantity: 150, brand: 'SportMax', status: 'approved', isFeatured: false, viewCount: 3456, saleCount: 98, rating: 4.6, reviewCount: 67, storeId: 's4', categoryId: 'sports', image: 'https://picsum.photos/seed/shoes1/400/400', images: [], tags: ['approved'], specs: {}, createdAt: '2026-01-25T10:00:00Z' },
  { id: 'p10', title: 'دستبند طلا ۱۸ عیار', slug: '18k-gold-bracelet', description: 'دستبند طلا ۱۸ عیار طرح جدید با سنگ‌های قیمتی', price: 56000000, discountPrice: undefined, quantity: 5, brand: 'ZarGold', status: 'pending', isFeatured: false, viewCount: 1234, saleCount: 12, rating: 4.9, reviewCount: 8, storeId: 's6', categoryId: 'jewelry', image: 'https://picsum.photos/seed/gold1/400/400', images: [], tags: ['pending'], specs: {}, createdAt: '2026-05-01T14:00:00Z' },
  { id: 'p11', title: 'پک کامل لوازم تحریر فانتزی', slug: 'fancy-stationery-set', description: 'پک ۵۰ تکه لوازم تحریر فانتزی مناسب مدرسه و دانشگاه', price: 450000, discountPrice: 350000, quantity: 500, brand: 'KetabSara', status: 'inactive', isFeatured: false, viewCount: 2345, saleCount: 45, rating: 4.2, reviewCount: 23, storeId: 's8', categoryId: 'books', image: 'https://picsum.photos/seed/stationery1/400/400', images: [], tags: ['inactive'], specs: {}, createdAt: '2026-04-01T08:00:00Z' },
];

function _userSimple(id: string): User & { orderCount?: number } { const u = _user(id); return { ...u, orderCount: Math.floor(Math.random() * 20) + 1 }; }

async function mockRequest<T = unknown>(endpoint: string, method: string): Promise<T> {
  await new Promise(r => setTimeout(r, 30));
  const path = endpoint.split('?')[0];

  // ── AUTH ──
  if (path.startsWith('/auth')) return {} as T;

  // ── SHOPS ──
  if (path === '/shops/top' || path === '/shops') {
    const shops = MOCK_USERS.filter(u => u.role === 'seller' && u.sellerStatus === 'approved').map(u => ({
      ...u, totalProducts: [156, 89, 234, 67, 45][MOCK_USERS.indexOf(u) - 5] || 50,
      avgRating: [4.8, 4.6, 4.7, 4.5, 4.9][MOCK_USERS.indexOf(u) - 5] || 4.5,
      totalSales: [12500, 8900, 15600, 4500, 2200][MOCK_USERS.indexOf(u) - 5] || 3000,
    }));
    if (path === '/shops/top') return shops as T;
    return { shops, total: shops.length } as T;
  }

  if (path.match(/^\/shops\/[^/]+$/)) {
    const shopId = path.split('/')[2];
    const seller = MOCK_USERS.find(u => u.id === shopId && u.role === 'seller');
    return {
      shop: seller ? { ...seller, totalProducts: 50, avgRating: 4.6, reviewCount: 120, totalSales: 5000 } : mockShop({ id: shopId }),
      products: MOCK_PRODUCTS.filter(p => p.storeId === shopId),
      reviews: [{ id: 'r1', rating: 5, body: 'فروشگاه عالی و محصولات باکیفیت', userId: 'u1', user: _user('u1'), productId: '', createdAt: '2026-05-01T10:00:00Z' }],
    } as T;
  }

  // ── PRODUCTS ──
  if (path === '/products' || path.startsWith('/products?')) {
    return { products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, pages: 1 } as T;
  }
  if (path.match(/^\/products\/[^/]+$/)) {
    const idOrSlug = path.split('/')[2];
    const p = MOCK_PRODUCTS.find(pr => pr.id === idOrSlug || pr.slug === idOrSlug) || mockProduct();
    return { ...p, related: MOCK_PRODUCTS.filter(r => r.id !== p.id).slice(0, 4) } as T;
  }

  // ── CATEGORIES ──
  if (path === '/categories' || path === '/categories/tree') {
    return [
      { id: 'electronics', name: 'کالای دیجیتال', slug: 'electronics', icon: '📱', _count: { products: 1560 } },
      { id: 'clothing', name: 'پوشاک و مد', slug: 'clothing', icon: '👕', _count: { products: 2340 } },
      { id: 'home', name: 'خانه و آشپزخانه', slug: 'home', icon: '🏠', _count: { products: 1890 } },
      { id: 'sports', name: 'ورزش و سفر', slug: 'sports', icon: '⚽', _count: { products: 870 } },
      { id: 'beauty', name: 'زیبایی و سلامت', slug: 'beauty', icon: '💄', _count: { products: 1230 } },
      { id: 'books', name: 'کتاب و لوازم تحریر', slug: 'books', icon: '📚', _count: { products: 3450 } },
      { id: 'toys', name: 'اسباب‌بازی و کودک', slug: 'toys', icon: '🧸', _count: { products: 650 } },
      { id: 'food', name: 'خوراکی', slug: 'food', icon: '🍫', _count: { products: 980 } },
    ] as T;
  }

  // ── CART ──
  if (path.startsWith('/cart')) {
    return (method === 'GET' ? { items: [], count: 0, total: 0 } : { message: 'ok' }) as T;
  }

  // ── ORDERS ──
  if (path.startsWith('/orders/track/')) return { order: MOCK_ORDERS[0], timeline: [] } as T;
  if (path.match(/^\/orders\/[^/]+$/)) {
    const oid = path.split('/')[2];
    return (MOCK_ORDERS.find(o => o.id === oid) || mockOrder()) as T;
  }
  if (path.startsWith('/orders')) {
    if (method === 'GET') return { orders: MOCK_ORDERS, total: MOCK_ORDERS.length } as T;
    return (method === 'DELETE' ? { message: 'ok' } : { order: mockOrder() }) as T;
  }


  // ── REVIEWS ──
  if (path.startsWith('/reviews')) {
    return (method === 'GET' ? {
      reviews: [
        { id: 'r1', rating: 5, title: 'عالی', body: 'محصول بسیار با کیفیت و ارسال سریع', userId: 'u1', user: _user('u1'), productId: 'p1', createdAt: '2026-05-01T10:00:00Z' },
        { id: 'r2', rating: 4, title: 'خوب', body: 'کیفیت خوب، بسته‌بندی مناسب', userId: 'u2', user: _user('u2'), productId: 'p1', createdAt: '2026-04-28T14:00:00Z' },
      ],
      total: 2, avgRating: 4.5,
    } : {}) as T;
  }

  // ── WALLET ──
  if (path === '/wallet') {
    return { balance: 2500000, transactions: [{ id: 'tx1', type: 'deposit', amount: 5000000, date: '2026-05-25', status: 'completed' }, { id: 'tx2', type: 'withdraw', amount: 2500000, date: '2026-05-15', status: 'completed' }] } as T;
  }

  // ── DISCOUNTS ──
  if (path.startsWith('/discounts')) {
    return (method === 'GET' ? {
      discounts: [
        { id: 'd1', code: 'BAZARCHE50', type: 'percentage' as const, value: 15, minOrderAmount: 500000, maxDiscount: 2000000, isActive: true, usageLimit: 100, usedCount: 45, startsAt: '2026-05-01', endsAt: '2026-07-01' },
        { id: 'd2', code: 'WELCOME100', type: 'fixed' as const, value: 100000, minOrderAmount: 1000000, isActive: true, usageLimit: 500, usedCount: 234, startsAt: '2026-01-01', endsAt: '2026-12-31' },
      ], total: 2
    } : { message: 'ok' }) as T;
  }

  // ── BLOG ──
  if (path.startsWith('/blog')) {
    return (method === 'GET' ? {
      posts: [
        { id: 'b1', title: 'راهنمای خرید گوشی هوشمند در ۱۴۰۵', slug: 'smartphone-guide-1405', excerpt: 'راهنمای جامع خرید بهترین گوشی‌های هوشمند', content: '...', image: 'https://picsum.photos/seed/blog1/800/400', tags: 'گوشی,راهنما', status: 'published', viewCount: 3456, publishedAt: '2026-05-20T08:00:00Z', createdAt: '2026-05-20T08:00:00Z' },
      ], total: 1
    } : {}) as T;
  }

  // ── SELLER ──
  if (path === '/seller/dashboard') {
    return {
      stats: { totalProducts: 45, totalOrders: 234, totalRevenue: 156_000_000, pendingOrders: 8, monthlyRevenue: 28_500_000, monthlyGrowth: 12 },
      revenueChart: [{ date: 'فروردین', total: 18500000, count: 30 }, { date: 'اردیبهشت', total: 22000000, count: 35 }, { date: 'خرداد', total: 19800000, count: 32 }],
      topProducts: MOCK_PRODUCTS.slice(0, 2),
      recentOrders: MOCK_ORDERS.slice(0, 4),
      inventory: { total: 450, lowStock: 12, outOfStock: 3 },
    } as T;
  }
  if (path.startsWith('/seller/products')) return { products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length } as T;
  if (path.startsWith('/seller/orders')) return { orders: MOCK_ORDERS, total: MOCK_ORDERS.length } as T;
  if (path.startsWith('/seller/analytics')) return {
    revenue: [{ month: 'فروردین', amount: 18500000, orders: 30 }, { month: 'اردیبهشت', amount: 22000000, orders: 35 }, { month: 'خرداد', amount: 19800000, orders: 32 }, { month: 'تیر', amount: 28500000, orders: 42 }, { month: 'مرداد', amount: 24200000, orders: 38 }, { month: 'شهریور', amount: 31000000, orders: 45 }],
    summary: { totalRevenue: 156_000_000, totalOrders: 234, avgOrderValue: 667_000, totalProducts: 45, totalProfit: 124_800_000, commissionPaid: 31_200_000 },
    topCategories: [{ name: 'کالای دیجیتال', count: 78, revenue: 89_000_000 }, { name: 'پوشاک', count: 45, revenue: 28_000_000 }, { name: 'خانه', count: 32, revenue: 39_000_000 }],
  } as T;
  if (path === '/seller/inventory') return {
    products: MOCK_PRODUCTS.map(p => ({ ...p, quantity: Math.floor(Math.random() * 100) })),
    summary: { total: 450, inStock: 435, lowStock: 12, outOfStock: 3, totalValue: 280_000_000 },
  } as T;

  // ── ADMIN ──
  if (path === '/admin/dashboard') {
    const buyers = MOCK_USERS.filter(u => u.role === 'buyer');
    const sellers = MOCK_USERS.filter(u => u.role === 'seller');
    const stats = {
      totalUsers: MOCK_USERS.length, totalBuyers: buyers.length, totalSellers: sellers.length,
      pendingSellers: sellers.filter(s => s.sellerStatus === 'pending').length,
      approvedSellers: sellers.filter(s => s.sellerStatus === 'approved').length,
      rejectedSellers: sellers.filter(s => s.sellerStatus === 'rejected').length,
      totalProducts: MOCK_PRODUCTS.length, activeProducts: MOCK_PRODUCTS.filter(p => p.status === 'approved').length,
      pendingProducts: MOCK_PRODUCTS.filter(p => p.status === 'pending').length,
      totalOrders: MOCK_ORDERS.length, pendingOrders: MOCK_ORDERS.filter(o => o.status === 'pending').length,
      confirmedOrders: MOCK_ORDERS.filter(o => o.status === 'confirmed').length,
      processingOrders: MOCK_ORDERS.filter(o => o.status === 'processing').length,
      shippedOrders: MOCK_ORDERS.filter(o => o.status === 'shipped').length,
      deliveredOrders: MOCK_ORDERS.filter(o => o.status === 'delivered').length,
      totalRevenue: 93680000, monthlyRevenue: 28500000, totalCommission: 6107000, walletBalance: 125000000,
      newUsersToday: 12, ordersToday: 8, revenueToday: 4800000, totalSellerReviews: 234,
    };
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      chartData.push({ date: d.toISOString().slice(0, 10), total: Math.floor(Math.random() * 5000000) + 500000, count: Math.floor(Math.random() * 15) + 1, commission: Math.floor(Math.random() * 500000) + 50000 });
    }
    return {
      stats,
      recentOrders: MOCK_ORDERS,
      recentUsers: MOCK_USERS.slice(0, 6).map(u => ({ ...u, orderCount: Math.floor(Math.random() * 20) + 1 })),
      chartData,
      topSellers: sellers.filter(s => s.sellerStatus === 'approved').map(s => ({
        id: s.id, storeName: s.storeName || s.username, storeLogo: s.storeLogo,
        totalSales: [12500, 8900, 15600, 4500, 2200][sellers.indexOf(s)] || 3000,
        productCount: [156, 89, 234, 67, 45][sellers.indexOf(s)] || 50,
        rating: [4.8, 4.6, 4.7, 4.5, 4.9][sellers.indexOf(s)] || 4.5,
        reviewCount: Math.floor(Math.random() * 200) + 50,
      })),
      pendingSellers: sellers.filter(s => s.sellerStatus === 'pending').map(s => ({
        id: s.id, username: s.username, storeName: s.storeName || s.username,
        businessType: s.businessType || 'other', createdAt: '۱۴۰۵-۰۲-۱۵',
      })),
    } as T;
  }

  if (path.startsWith('/admin/users')) {
    if (path.includes('/toggle-active') || path.includes('/verify-seller') || path.includes('/change-role')) {
      return { message: 'ok' } as T;
    }
    if (method === 'GET') {
      return { users: MOCK_USERS, total: MOCK_USERS.length } as T;
    }
    return _user('u1') as T;
  }

  if (path.startsWith('/admin/products')) {
    if (path.includes('/approve') || path.includes('/feature') || path.includes('/delete')) {
      return { message: 'ok' } as T;
    }
    return { products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length } as T;
  }

  if (path.startsWith('/admin/orders')) {
    if (path.match(/^\/admin\/orders\/[^/]+$/)) {
      return mockOrder() as T;
    }
    return { orders: MOCK_ORDERS, total: MOCK_ORDERS.length } as T;
  }

  if (path === '/admin/sellers') {
    return {
      sellers: MOCK_USERS.filter(u => u.role === 'seller').map(u => ({
        ...u, productCount: [156, 89, 234, 67, 45, 0, 0, 0][MOCK_USERS.indexOf(u) - 5] || 0,
        totalSales: [12500, 8900, 15600, 4500, 2200, 0, 0, 0][MOCK_USERS.indexOf(u) - 5] || 0,
        rating: [4.8, 4.6, 4.7, 4.5, 4.9, 0, 0, 0][MOCK_USERS.indexOf(u) - 5] || 0,
        reviewCount: [156, 89, 67, 45, 23, 0, 0, 0][MOCK_USERS.indexOf(u) - 5] || 0,
      })),
      total: MOCK_USERS.filter(u => u.role === 'seller').length,
    } as T;
  }

  if (path === '/admin/stats') {
    return { usersByDay: [], ordersByDay: [], topProducts: MOCK_PRODUCTS.slice(0, 5) } as T;
  }

  if (path === '/admin/net-profit') {
    return {
      totalCommission: 6107000, totalCosts: 1500000, netProfit: 4607000,
      allTimeCommission: 45000000, period: 'month',
      monthlyBreakdown: [
        { month: 'فروردین', commission: 5200000, costs: 1200000, profit: 4000000, orders: 85 },
        { month: 'اردیبهشت', commission: 6100000, costs: 1500000, profit: 4600000, orders: 98 },
        { month: 'خرداد', commission: 4800000, costs: 1100000, profit: 3700000, orders: 72 },
      ],
    } as T;
  }

  if (path === '/admin/trust-metrics') {
    return {
      totalSellers: 8, verifiedSellers: 5, approvedSellers: 5,
      verifiedPercent: 62.5, avgRating: 4.6, avgResponseRate: 87,
      avgOnTimeDelivery: 92, totalReviews: 452,
      ratingTiers: { fiveStar: 280, fourStar: 120, threeStar: 40, belowThree: 12 },
      topRatedSellers: [{ id: 's5', storeName: 'هنر سرامیک', rating: 4.9, reviewCount: 45 }, { id: 's1', storeName: 'دیجی کالای مرکزی', rating: 4.8, reviewCount: 156 }],
      lowRatedSellers: [],
    } as T;
  }

  if (path.startsWith('/admin/colleagues')) {
    return (method === 'GET' ? MOCK_USERS.filter(u => u.role === 'admin') : { message: 'ok' }) as T;
  }

  if (path.startsWith('/admin/seller-reviews')) {
    return {
      reviews: [
        { id: 'sr1', rating: 5, body: 'فروشگاه عالی، ارسال سریع و بسته‌بندی مناسب', userId: 'u1', user: _user('u1'), productId: '', createdAt: '2026-05-01T10:00:00Z', storeId: 's1' },
        { id: 'sr2', rating: 4, body: 'کیفیت خوب، قیمت مناسب', userId: 'u2', user: _user('u2'), productId: '', createdAt: '2026-04-28T14:00:00Z', storeId: 's1' },
      ],
      total: 2, page: 1, pages: 1,
    } as T;
  }

  if (path === '/admin/settings') {
    return { siteName: 'بازارچه', commissionRate: 10, minWithdrawal: 500000, maxWithdrawal: 50000000 } as T;
  }

  // ── ADMIN BANNERS ──
  if (path === '/admin/banners') {
    return (method === 'GET' ? {
      banners: [
        { id: 'bn1', title: 'تخفیف ویژه تابستان', subtitle: 'تا ۷۰٪ تخفیف محصولات منتخب', image: 'https://picsum.photos/seed/banner1/1200/400', link: '/products?discount=true', ctaText: 'مشاهده محصولات', position: 'hero', isActive: true },
        { id: 'bn2', title: 'گوشی‌های هوشمند', subtitle: 'جدیدترین مدل‌ها با گارانتی', image: 'https://picsum.photos/seed/banner2/1200/400', link: '/products?category=electronics', ctaText: 'همین حالا بخر', position: 'hero', isActive: true },
        { id: 'bn3', title: 'مد و پوشاک', subtitle: 'جدیدترین ترندهای بهار ۱۴۰۵', image: 'https://picsum.photos/seed/banner3/1200/400', link: '/products?category=clothing', ctaText: 'مشاهده', position: 'secondary', isActive: true },
      ]
    } : { message: 'ok' }) as T;
  }

  // ── ADMIN CATEGORIES ──
  if (path === '/admin/categories' || path.startsWith('/admin/categories?')) {
    return (method === 'GET' ? [
      { id: 'electronics', name: 'کالای دیجیتال', slug: 'electronics', icon: '📱', image: 'https://picsum.photos/seed/cat-electronics/400/400', parentId: null, _count: { products: 1560 } },
      { id: 'clothing', name: 'پوشاک و مد', slug: 'clothing', icon: '👕', image: 'https://picsum.photos/seed/cat-clothing/400/400', parentId: null, _count: { products: 2340 } },
      { id: 'home', name: 'خانه و آشپزخانه', slug: 'home', icon: '🏠', image: 'https://picsum.photos/seed/cat-home/400/400', parentId: null, _count: { products: 1890 } },
      { id: 'sports', name: 'ورزش و سفر', slug: 'sports', icon: '⚽', image: 'https://picsum.photos/seed/cat-sports/400/400', parentId: null, _count: { products: 870 } },
      { id: 'beauty', name: 'زیبایی و سلامت', slug: 'beauty', icon: '💄', image: 'https://picsum.photos/seed/cat-beauty/400/400', parentId: null, _count: { products: 1230 } },
      { id: 'books', name: 'کتاب و لوازم تحریر', slug: 'books', icon: '📚', image: 'https://picsum.photos/seed/cat-books/400/400', parentId: null, _count: { products: 3450 } },
      { id: 'toys', name: 'اسباب‌بازی و کودک', slug: 'toys', icon: '🧸', image: 'https://picsum.photos/seed/cat-toys/400/400', parentId: null, _count: { products: 650 } },
      { id: 'food', name: 'خوراکی', slug: 'food', icon: '🍫', image: 'https://picsum.photos/seed/cat-food/400/400', parentId: null, _count: { products: 980 } },
    ] : { message: 'ok' }) as T;
  }

  // ── ADMIN REPORTS ──
  if (path === '/admin/reports/sales') {
    return {
      summary: { totalRevenue: 520_000_000, totalOrders: 1240, avgOrderValue: 419_000, totalCommission: 52_000_000, netProfit: 41600000, totalCosts: 10_400_000 },
      monthlyData: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'].map((m, i) => ({ month: m, revenue: Math.floor(Math.random() * 50_000_000) + 30_000_000, orders: Math.floor(Math.random() * 100) + 80, commission: Math.floor(Math.random() * 5_000_000) + 3_000_000 })),
      topProducts: MOCK_PRODUCTS.slice(0, 5).map(p => ({ id: p.id, title: p.title, sales: Math.floor(Math.random() * 200) + 50, revenue: p.price * (Math.floor(Math.random() * 100) + 50) })),
      topCategories: [{ name: 'کالای دیجیتال', sales: 450, revenue: 189_000_000 }, { name: 'پوشاک', sales: 320, revenue: 98_000_000 }, { name: 'خانه', sales: 210, revenue: 76_000_000 }],
    } as T;
  }

  if (path === '/admin/reports/financial') {
    return {
      walletBalance: 125_000_000, totalDeposits: 350_000_000, totalWithdrawals: 280_000_000, pendingWithdrawals: 12_500_000,
      transactions: [
        { id: 'ft1', type: 'commission', amount: 5200000, status: 'completed', description: 'کمیسیون فروش اردیبهشت', date: '۱۴۰۵-۰۳-۰۱' },
        { id: 'ft2', type: 'deposit', amount: 50000000, status: 'completed', description: 'شارژ کیف پول', date: '۱۴۰۵-۰۲-۲۸' },
        { id: 'ft3', type: 'withdraw', amount: 12000000, status: 'pending', description: 'درخواست برداشت', date: '۱۴۰۵-۰۲-۲۵' },
        { id: 'ft4', type: 'withdraw', amount: 25000000, status: 'completed', description: 'برداشت موفق', date: '۱۴۰۵-۰۲-۱۵' },
        { id: 'ft5', type: 'refund', amount: 1500000, status: 'completed', description: 'بازگشت وجه سفارش BC-140306', date: '۱۴۰۵-۰۲-۱۰' },
      ],
    } as T;
  }

  // ── ADMIN TICKETS ──
  if (path.startsWith('/admin/tickets')) {
    if (path.includes('/reply')) return { message: 'ok' } as T;
    if (path.includes('/status')) return { message: 'ok' } as T;
    return {
      tickets: [
        { id: 'tk1', ticketNumber: 'TKT-001', subject: 'مشکل در ثبت سفارش', message: 'موقع پرداخت ارور میده', status: 'open', priority: 'high', userId: 'u1', user: _user('u1'), replies: [{ id: 'tr1', message: 'لطفاً دوباره امتحان کنید', userId: 'a1', isAdmin: true, createdAt: '2026-06-01T12:00:00Z' }], createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-01T12:00:00Z' },
        { id: 'tk2', ticketNumber: 'TKT-002', subject: 'سوال درباره مرجوعی', message: 'چطور کالا رو مرجوع کنم؟', status: 'in_progress', priority: 'medium', userId: 'u2', user: _user('u2'), replies: [], createdAt: '2026-05-30T14:00:00Z', updatedAt: '2026-05-30T14:00:00Z' },
        { id: 'tk3', ticketNumber: 'TKT-003', subject: 'گزارش فروشنده متخلف', message: 'فروشنده کالای تقلبی فرستاده', status: 'open', priority: 'urgent', userId: 'u3', user: _user('u3'), replies: [], createdAt: '2026-06-02T08:00:00Z', updatedAt: '2026-06-02T08:00:00Z' },
      ], total: 3
    } as T;
  }

  // ── ADMIN NOTIFICATIONS ──
  if (path.startsWith('/admin/notifications')) {
    if (path.includes('/read')) return { message: 'ok' } as T;
    return {
      notifications: [
        { id: 'n1', title: 'فروشنده جدید', body: 'زرگلد درخواست تأیید فروشندگی داده', type: 'warning', isRead: false, targetLink: '/admin/sellers', createdAt: '2026-06-02T09:00:00Z' },
        { id: 'n2', title: 'سفارش جدید', body: '۸ سفارش جدید امروز ثبت شده', type: 'info', isRead: false, targetLink: '/admin/orders', createdAt: '2026-06-02T10:00:00Z' },
        { id: 'n3', title: 'کمیسیون ماهانه', body: 'کمیسیون ۵.۲ میلیون تومانی این ماه واریز شد', type: 'success', isRead: true, targetLink: '/admin/net-profit', createdAt: '2026-06-01T08:00:00Z' },
        { id: 'n4', title: 'موجودی کم', body: '۳ محصول موجودی زیر ۱۰ عدد دارند', type: 'error', isRead: false, targetLink: '/admin/products', createdAt: '2026-06-02T07:00:00Z' },
        { id: 'n5', title: 'تیکت جدید', body: 'گزارش فروشنده متخلف - اولویت فوری', type: 'warning', isRead: false, targetLink: '/admin/tickets', createdAt: '2026-06-02T08:00:00Z' },
      ], unreadCount: 4
    } as T;
  }

  // ── ADMIN ACTIVITY LOG ──
  if (path === '/admin/activity-log') {
    return {
      logs: [
        { id: 'al1', adminId: 'a1', adminName: 'مدیر سیستم', action: 'تأیید فروشنده', target: 'زرگلد', details: 'فروشنده زرگلد (s6) تأیید شد', createdAt: '۱۴۰۵-۰۳-۱۲ ساعت ۱۰:۳۰' },
        { id: 'al2', adminId: 'a1', adminName: 'مدیر سیستم', action: 'تأیید محصول', target: 'کیبورد مکانیکال RGB', details: 'محصول p5 تأیید و فعال شد', createdAt: '۱۴۰۵-۰۳-۱۲ ساعت ۰۹:۱۵' },
        { id: 'al3', adminId: 'a2', adminName: 'ناظم بازارچه', action: 'تغییر وضعیت سفارش', target: 'BC-140301', details: 'وضعیت سفارش به processing تغییر کرد', createdAt: '۱۴۰۵-۰۳-۱۱ ساعت ۱۶:۴۵' },
        { id: 'al4', adminId: 'a1', adminName: 'مدیر سیستم', action: 'حذف تخفیف', target: 'کد تخفیف منقضی', details: 'کد تخفیف EXPIRED2025 حذف شد', createdAt: '۱۴۰۵-۰۳-۱۱ ساعت ۱۴:۲۰' },
        { id: 'al5', adminId: 'a2', adminName: 'ناظم بازارچه', action: 'ویرایش کاربر', target: 'سارا احمدی', details: 'وضعیت کاربر به غیرفعال تغییر کرد', createdAt: '۱۴۰۵-۰۳-۱۰ ساعت ۱۱:۰۰' },
        { id: 'al6', adminId: 'a1', adminName: 'مدیر سیستم', action: 'ایجاد بنر', target: 'تخفیف تابستان', details: 'بنر جدید تخفیف تابستان ایجاد شد', createdAt: '۱۴۰۵-۰۳-۱۰ ساعت ۰۸:۳۰' },
        { id: 'al7', adminId: 'a1', adminName: 'مدیر سیستم', action: 'ویرایش تنظیمات', target: 'تنظیمات سایت', details: 'نرخ کمیسیون به ۱۰٪ تغییر کرد', createdAt: '۱۴۰۵-۰۳-۰۹ ساعت ۱۵:۰۰' },
      ], total: 7
    } as T;
  }

  // ── SELLER DISCOUNTS ──
  if (path === '/seller/discounts') {
    return (method === 'GET' ? {
      discounts: [
        { id: 'sd1', code: 'SHOP20', type: 'percentage', value: 20, minOrderAmount: 500000, maxDiscount: 2000000, isActive: true, usageLimit: 50, usedCount: 23, startsAt: '2026-05-01', endsAt: '2026-07-01' },
        { id: 'sd2', code: 'FREESHIP', type: 'fixed', value: 50000, minOrderAmount: 1000000, isActive: true, usageLimit: 100, usedCount: 45, startsAt: '2026-04-01', endsAt: '2026-12-31' },
      ], total: 2
    } : { message: 'ok' }) as T;
  }

  // ── SELLER REVIEWS ──
  if (path.startsWith('/seller/reviews')) {
    if (path.includes('/reply')) return { message: 'ok' } as T;
    return {
      reviews: [
        { id: 'sr1', rating: 5, title: 'عالی', body: 'محصول با کیفیت و ارسال سریع', userId: 'u1', user: _user('u1'), productId: 'p1', createdAt: '2026-05-01T10:00:00Z' },
        { id: 'sr2', rating: 4, body: 'خوب بود، بسته‌بندی مناسب', userId: 'u2', user: _user('u2'), productId: 'p2', createdAt: '2026-04-28T14:00:00Z' },
        { id: 'sr3', rating: 3, body: 'کیفیت متوسط، قیمت بالا', userId: 'u3', user: _user('u3'), productId: 'p1', createdAt: '2026-04-20T09:00:00Z' },
      ], total: 3, avgRating: 4.0
    } as T;
  }

  // ── SELLER REPORTS ──
  if (path === '/seller/reports') {
    const daily: { date: string; total: number; count: number }[] = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); daily.push({ date: d.toISOString().slice(0, 10), total: Math.floor(Math.random() * 3_000_000) + 500_000, count: Math.floor(Math.random() * 10) + 1 }); }
    return {
      summary: { totalRevenue: 156_000_000, totalOrders: 234, avgOrderValue: 667_000, totalProducts: 45, totalProfit: 124_800_000 },
      dailySales: daily,
      topProducts: MOCK_PRODUCTS.slice(0, 3).map(p => ({ id: p.id, title: p.title, sales: Math.floor(Math.random() * 50) + 10, revenue: p.price * (Math.floor(Math.random() * 20) + 5) })),
    } as T;
  }

  // ── USER ADDRESSES ──
  if (path.startsWith('/user/addresses')) {
    if (path.includes('/default') || method !== 'GET') return { message: 'ok' } as T;
    return {
      addresses: [
        { id: 'ad1', label: '🏠 منزل', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، بالاتر از میدان ونک، کوچه ششم، پلاک ۱۲', postalCode: '1969712345', receiverName: 'علیرضا محمدی', receiverPhone: '09121234567', isDefault: true },
        { id: 'ad2', label: '🏢 محل کار', province: 'تهران', city: 'تهران', address: 'خیابان سهروردی شمالی، خیابان خرمشهر، ساختمان آسمان، طبقه ۴', postalCode: '1551712345', receiverName: 'علیرضا محمدی', receiverPhone: '09121234567', isDefault: false },
      ]
    } as T;
  }

  // ── USER WALLET ──
  if (path.startsWith('/user/wallet')) {
    if (path.includes('/deposit')) return { url: 'https://payment.mock/pay/123' } as T;
    if (path.includes('/withdraw')) return { transaction: { id: 'wtx1', type: 'withdraw', amount: 0, status: 'pending' } } as T;
    return {
      balance: 2500000, totalEarned: 12_500_000, totalSpent: 10_000_000,
      transactions: [
        { id: 'wt1', type: 'deposit', amount: 5000000, status: 'completed', description: 'شارژ کیف پول', date: '۱۴۰۵-۰۲-۲۵' },
        { id: 'wt2', type: 'purchase', amount: 2204000, status: 'completed', description: 'خرید سفارش BC-140301', date: '۱۴۰۵-۰۲-۳۰' },
        { id: 'wt3', type: 'refund', amount: 1500000, status: 'completed', description: 'بازگشت وجه سفارش BC-140306', date: '۱۴۰۵-۰۲-۱۸' },
      ]
    } as T;
  }

  // ── USER ORDERS ──
  if (path === '/user/orders') {
    return { orders: MOCK_ORDERS, total: MOCK_ORDERS.length, totalSpent: 68_000_000 } as T;
  }

  // ── COMPARE ──
  if (path.startsWith('/compare')) {
    return { products: MOCK_PRODUCTS.slice(0, 4), maxCompare: 4 } as T;
  }

  // ── HOMEPAGE ──
  if (path === '/homepage') {
    return {
      banners: [
        { id: 'bn1', title: 'تخفیف ویژه تابستان', subtitle: 'تا ۷۰٪ تخفیف محصولات منتخب', image: 'https://picsum.photos/seed/banner1/1200/400', link: '/products?discount=true', ctaText: 'مشاهده محصولات', position: 'hero', isActive: true },
        { id: 'bn2', title: 'گوشی‌های هوشمند', subtitle: 'جدیدترین مدل‌ها با گارانتی', image: 'https://picsum.photos/seed/banner2/1200/400', link: '/products?category=electronics', ctaText: 'همین حالا بخر', position: 'hero', isActive: true },
        { id: 'bn3', title: 'مد و پوشاک بهار ۱۴۰۵', subtitle: 'جدیدترین ترندها', image: 'https://picsum.photos/seed/banner3/1200/400', link: '/products?category=clothing', ctaText: 'مشاهده', position: 'hero', isActive: true },
      ],
      flashDeals: MOCK_PRODUCTS.filter(p => p.discountPrice).slice(0, 6).map(p => ({ ...p, endsAt: new Date(Date.now() + 86400000).toISOString(), soldPercent: Math.floor(Math.random() * 80) + 10 })),
      mostViewed: [...MOCK_PRODUCTS].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8),
      newestProducts: [...MOCK_PRODUCTS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
      customerReviews: [
        { id: 'cr1', userName: 'علیرضا محمدی', rating: 5, body: 'بهترین تجربه خرید آنلاین رو داشتم. ارسال سریع و بسته‌بندی عالی', date: '۱۴۰۵-۰۲-۲۸' },
        { id: 'cr2', userName: 'سارا احمدی', rating: 5, body: 'کیفیت محصولات فوق‌العاده بود. حتماً دوباره خرید میکنم', date: '۱۴۰۵-۰۲-۲۵' },
        { id: 'cr3', userName: 'رضا جوادی', rating: 4, body: 'تنوع محصولات بالاست و قیمت‌ها منصفانه', date: '۱۴۰۵-۰۲-۲۰' },
        { id: 'cr4', userName: 'مریم حسنی', rating: 5, body: 'پشتیبانی عالی و پاسخگویی سریع. ممنون از تیم بازارچه', date: '۱۴۰۵-۰۲-۱۵' },
        { id: 'cr5', userName: 'امیر رضایی', rating: 4, body: 'روند خرید خیلی راحت و روان بود', date: '۱۴۰۵-۰۲-۱۰' },
      ],
      stats: { totalProducts: 12876, totalSellers: 234, totalUsers: 15600, satisfactionRate: 96 },
    } as T;
  }

  // ── FALLBACK ──
  return {} as T;
}

/* ──────────────────────────────────────────────
 * REAL REQUEST (used only when MOCK_MODE=false)
 * ────────────────────────────────────────────── */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// 🔑 Token management — stores JWT in sessionStorage for cross-origin auth
const TOKEN_KEY = 'bazarche_auth_token';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Fallback: return empty/valid data shapes so the UI doesn't crash on network errors
function getFallbackData<T>(endpoint: string): T {
  const path = endpoint.split('?')[0];

  // Auth endpoints – return empty user shape for /me, empty for others
  if (path.startsWith('/auth/')) {
    if (path.includes('/me')) return { user: null, token: null } as unknown as T;
    return {} as T;
  }

  // Homepage
  if (path === '/' || path === '/homepage') return { featuredProducts: [], latestProducts: [], banners: [], categories: [], settings: {} } as unknown as T;

  // Admin colleagues — return empty array
  if (path === '/admin/colleagues') return [] as unknown as T;

  // Admin dashboard stats — proper shape
  if (path === '/admin/stats' || path === '/admin/dashboard')
    return {
      totalUsers: 0, activeUsers: 0, totalOrders: 0, pendingOrders: 0,
      revenue: 0, totalProducts: 0, totalSellers: 0,
      recentOrders: [], chartData: [], topProducts: [],
      trustScore: 0, avgRating: 0
    } as unknown as T;

  // Admin net profit
  if (path.includes('/net-profit'))
    return { periods: [], totalProfit: 0, growthRate: 0 } as unknown as T;

  // Trust metrics
  if (path.includes('/trust-metrics'))
    return {
      overallTrustScore: 0, avgOnTimeDelivery: 0, totalReviews: 0,
      ratingTiers: [], topRatedSellers: [], lowRatedSellers: []
    } as unknown as T;


  // Cart
  if (path === '/cart') return { items: [], totalItems: 0, totalPrice: 0 } as unknown as T;

  // Cart count
  if (path.endsWith('/count')) return { count: 0 } as unknown as T;

  // List endpoints – return empty arrays with correct shapes
  if (['/products', '/orders', '/shops', '/categories', '/categories/tree', '/admin/users',
    '/admin/products', '/admin/orders', '/seller/products', '/seller/orders', '/blog',
    '/admin/banners', '/admin/tickets', '/admin/notifications',
    '/admin/activity-log', '/admin/categories', '/admin/seller-reviews', '/seller/discounts',
    '/seller/reviews', '/compare'].includes(path) ||
    path.startsWith('/admin/') || path.startsWith('/seller/')) {
    return {
      products: [], total: 0, pages: 0, items: [], orders: [], users: [],
      posts: [], discounts: [], notifications: [], unreadCount: 0,
      logs: [], count: 0, totalSpent: 0, addresses: [], banners: [],
      tickets: [], categories: [], sellers: []
    } as unknown as T;
  }

  // Default: return empty object for safety
  return {} as unknown as T;
}

async function realRequest<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOpts } = options;
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }
  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string> || {}),
  };

  // Set Content-Type for JSON requests (not FormData)
  if (!(fetchOpts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 🔐 Attach JWT token for authenticated requests
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      ...fetchOpts,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'خطای ارتباط با سرور' }));
      console.warn(`[API] ${options.method || 'GET'} ${endpoint} → ${res.status}: ${error.message}`);

      // 🔥 Throw for auth & write endpoints — UI must know about failures
      const method = (options.method || 'GET').toUpperCase();
      if (endpoint.startsWith('/auth/') || method !== 'GET') {
        throw new ApiError(error.message || 'خطا در عملیات', res.status, error);
      }
      return getFallbackData<T>(endpoint);
    }
    return res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;

    if (err.name === 'AbortError') {
      console.warn(`[API] Timeout: ${options.method || 'GET'} ${endpoint}`);
    } else {
      console.warn(`[API] Network error: ${options.method || 'GET'} ${endpoint}`, err.message);
    }

    // 🔥 Throw for auth & write endpoints
    const method = (options.method || 'GET').toUpperCase();
    if (endpoint.startsWith('/auth/') || method !== 'GET') {
      throw new ApiError('ارتباط با سرور برقرار نشد', 0);
    }
    return getFallbackData<T>(endpoint);
  }
}

/* ──────────────────────────────────────────────
 * UNIFIED REQUEST
 * ────────────────────────────────────────────── */

async function request<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  if (MOCK_MODE) {
    return mockRequest<T>(endpoint, options.method || 'GET');
  }
  return realRequest<T>(endpoint, options);
}

const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'GET', params }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, { method: 'POST', body: formData, headers: {} }),
};

/* ============================================================
 * 🔐 AUTH API
 * ============================================================ */

export const authApi = {
  login: (login: string, password: string) =>
    api.post<{ user: User; token: string; success: boolean }>('/auth/login', { login, password }),
  register: (data: any) => api.post<{ user: User; token: string; success: boolean }>('/auth/register', data),
  sendEmailOTP: (email: string) =>
    api.post<{ message: string; expiresIn: number }>('/auth/send-email-otp', { email }),
  sendPhoneOTP: (phone: string) =>
    api.post<{ message: string; expiresIn: number }>('/auth/send-phone-otp', { phone }),
  verifyEmailOTP: (data: any) =>
    api.post<{ user: User; token: string; isNewUser: boolean; success: boolean }>('/auth/verify-email-otp', data),
  verifyPhoneOTP: (data: any) =>
    api.post<{ user: User; token: string; isNewUser: boolean; success: boolean }>('/auth/verify-phone-otp', data),
  registerSellerOTP: (data: any) =>
    api.post<{ user: User; token: string; success: boolean }>('/auth/register-seller-otp', data),
  me: () => api.get<{ user: User }>('/auth/me'),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  becomeSeller: (data: any) => api.post<{ user: User }>('/users/become-seller', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/change-password', { oldPassword, newPassword }),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
};

/* ============================================================
 * 🛍️ PRODUCTS API
 * ============================================================ */

export const productsApi = {
  list: (params?: any) => api.get<{ products: Product[]; total: number; pages: number }>('/products', params),
  getBySlug: (slug: string) => api.get<ProductEntity & { related: ProductEntity[] }>(`/products/${slug}`),
  getById: (id: string) => api.get<ProductEntity & { related: ProductEntity[] }>(`/products/${id}`),
  create: (data: FormData) => api.upload<Product>('/products', data),
  update: (id: string, data: FormData) => api.upload<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/products/${id}`),
};

/* ============================================================
 * 📂 CATEGORIES API
 * ============================================================ */

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  getTree: () => api.get<Category[]>('/categories'),
  getBySlug: (slug: string) => api.get<Category>(`/categories/${slug}`),
};

/* ============================================================
 * 📦 ORDERS API
 * ============================================================ */

export const ordersApi = {
  list: (params?: any) => api.get<{ orders: Order[]; total: number }>('/orders', params),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  track: (orderNumber: string) =>
    api.get<{ order: Order; timeline: TrackingEvent[] }>(`/orders/track/${orderNumber}`),
  create: (data: any) => api.post<{ order: Order; invoice?: { id: string; amount: number } }>('/orders', data),
  cancel: (id: string) => api.patch<{ order: Order }>(`/orders/${id}/cancel`),
};

/* ============================================================
 * ⭐ REVIEWS API
 * ============================================================ */

export const reviewsApi = {
  getByProduct: (productId: string, page = 1) =>
    api.get<{ reviews: Review[]; total: number; avgRating: number }>(`/reviews/product/${productId}`, { page }),
  create: (data: any) => api.post<Review>('/reviews', data),
};

/* ============================================================
 * 💬 MESSAGES API
 * ============================================================ */

export const messagesApi = {
  conversations: () => api.get<any[]>('/messages/conversations'),
  getMessages: (id: string, page?: number) =>
    api.get<any>(`/messages/conversations/${id}`, { page }),
  sendMessage: (id: string, text: string) =>
    api.post<{ message: any }>(`/messages/conversations/${id}`, { text }),
  startConversation: (storeId: string, productId?: string, message?: string) =>
    api.post<any>('/messages/start', { storeId, productId, message }),
  unreadCount: () => api.get<{ count: number }>('/messages/unread-count'),
};

/* ============================================================
 * 🏪 SELLER API
 * ============================================================ */

export const sellerApi = {
  dashboard: () => api.get<any>('/seller/dashboard'),
  products: (params?: any) => api.get<{ products: Product[]; total: number }>('/seller/products', params),
  orders: (params?: any) => api.get<{ orders: Order[]; total: number }>('/seller/orders', params),
  updateOrder: (orderId: string, data: any) =>
    api.patch<Order>(`/seller/orders/${orderId}`, data),
  analytics: (params?: any) => api.get<any>('/seller/analytics', params),
  inventory: () => api.get<any>('/seller/inventory'),
  updateInventory: (productId: string, quantity: number) =>
    api.patch<Product>(`/seller/inventory/${productId}`, { quantity }),
};

/* ============================================================
 * 🛡️ ADMIN API
 * ============================================================ */

export const adminApi = {
  dashboard: () => api.get<any>('/admin/dashboard'),
  users: (params?: any) => api.get<{ users: User[]; pagination: PaginationType }>('/users', params),
  getUser: (id: string) => api.get<User>(`/admin/users/${id}`),
  toggleUser: (id: string) => api.put<User>(`/users/${id}/toggle`),
  verifySeller: (id: string, data: any) => api.patch<User>(`/admin/users/${id}/verify-seller`, data),
  changeRole: (id: string, role: string) => api.put<User>(`/users/${id}/role`, { role }),
  products: (params?: any) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    return api.get<AllProduct>(`/admin/products?${queryString}`)
  },
  approveProduct: (id: string) => api.patch<Product>(`/admin/products/${id}/approve`),
  featureProduct: (id: string) => api.patch<Product>(`/admin/products/${id}/feature`),
  deleteProduct: (id: string) => api.delete<{ message: string }>(`/admin/products/${id}`),
  orders: (params?: any) => api.get<{ orders: Order[]; total: number }>('/admin/orders', params),
  updateOrder: (id: string, data: any) =>
    api.patch<Order>(`/admin/orders/${id}`, data),
  discounts: (page: number) => api.get<AllDiscount>(`/discounts?page=${page}`),
  createDiscount: (data: any) => api.post<DiscountCode>('/discounts', data),
  changeDiscount: (id: string) => api.put<DiscountCode>(`/discounts/${id}/toggle`),
  deleteDiscount: (id: string) => api.delete<{ message: string }>(`/discounts/${id}`),
  sellerList: () => api.get<{ id: string, username: string, storeName: string | null }[]>('/admin/seller-list'),
  sellers: (params?: any) => api.get<any>('/admin/sellers', params),
  stats: () => api.get<any>('/admin/stats'),
  netProfit: (period?: string) => api.get<any>('/admin/net-profit', { period }),
  trustMetrics: () => api.get<any>('/admin/trust-metrics'),
  colleagues: () => api.get<any[]>('/admin/colleagues'),
  addColleague: (data: any) => api.post<{ message: string; colleague: any }>('/admin/colleagues', data),
  updateColleaguePermissions: (id: string, permissions: string[]) =>
    api.put<{ message: string }>(`/admin/colleagues/${id}/permissions`, { permissions }),
  toggleColleagueActive: (id: string) =>
    api.patch<{ message: string; isActive: boolean }>(`/admin/colleagues/${id}/toggle-active`),
  removeColleague: (id: string) =>
    api.delete<{ message: string }>(`/admin/colleagues/${id}`),
  getCarts: (query?: SearchDefualtType) => api.get<AllCartsType>(`/admin/carts?${query}`),
  sellerReviews: (params?: any) => api.get<any>('/admin/seller-reviews', params),
  deleteSellerReview: (id: string) =>
    api.delete<{ message: string }>(`/admin/seller-reviews/${id}`),
  getSettings: () => api.get<any>('/admin/settings'),
  updateSettings: (settings: Record<string, string>) =>
    api.put<{ success: boolean; message: string }>('/admin/settings', settings),
};

/* ============================================================
 * 🏪 SHOPS API (عمومی)
 * ============================================================ */

export const shopsApi = {
  list: (params?: any) => api.get<any>('/shops', params),
  getById: (id: string) => api.get<any>(`/shops/${id}`),
  top: () => api.get<any[]>('/shops/top'),
  review: (storeId: string, data: any) =>
    api.post<{ message: string }>(`/shops/${storeId}/review`, data),
};

/* ============================================================
 * 💰 WALLET API
 * ============================================================ */

export const walletApi = {
  balance: () => api.get<any>('/wallet'),
  deposit: (amount: number) => api.post<{ url: string }>('/wallet/deposit', { amount }),
  withdraw: (amount: number, cardNumber: string) =>
    api.post<{ transaction: { id: string } }>('/wallet/withdraw', { amount, cardNumber }),
};

/* ============================================================
 * 📰 BLOG API
 * ============================================================ */

export const blogApi = {
  list: (params?: any) => api.get<{ posts: BlogPost[]; total: number }>('/blog', params),
  getBySlug: (slug: string) => api.get<BlogPost>(`/blog/${slug}`),
};

/* ============================================================
 * 🖼️ UPLOAD API
 * ============================================================ */

export const uploadApi = {
  image: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.upload<{ url: string }>('/upload/single', fd);
  },
  images: (files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return api.upload<{ urls: string[] }>('/upload/multiple', fd);
  },
};

/* ============================================================
 * 🤖 AI SEARCH API
 * ============================================================ */

export const aiApi = {
  searchByImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.upload<{ results: Product[]; query: string }>('/ai/image-search', fd);
  },
};

/* ============================================================
 * 🏪 حرفه‌های فروشنده
 * ============================================================ */

export const BUSINESS_TYPES = [
  { value: 'electronics', label: 'کالای دیجیتال و الکترونیک', icon: '📱' },
  { value: 'clothing', label: 'پوشاک و مد', icon: '👕' },
  { value: 'home', label: 'خانه و آشپزخانه', icon: '🏠' },
  { value: 'sports', label: 'ورزش و سفر', icon: '⚽' },
  { value: 'beauty', label: 'زیبایی و سلامت', icon: '💄' },
  { value: 'books', label: 'کتاب و لوازم تحریر', icon: '📚' },
  { value: 'toys', label: 'اسباب‌بازی و کودک', icon: '🧸' },
  { value: 'food', label: 'خوراکی و سوپرمارکت', icon: '🍫' },
  { value: 'cars', label: 'خودرو و لوازم یدکی', icon: '🚗' },
  { value: 'jewelry', label: 'طلا و جواهرات', icon: '💍' },
  { value: 'art', label: 'هنر و صنایع دستی', icon: '🎨' },
  { value: 'music', label: 'موسیقی و آلات موسیقی', icon: '🎵' },
  { value: 'tools', label: 'ابزار و تجهیزات صنعتی', icon: '🔧' },
  { value: 'medical', label: 'پزشکی و سلامت', icon: '🏥' },
  { value: 'other', label: 'سایر', icon: '📦' },
];

/* ============================================================
 * 🏷️ BANNERS API
 * ============================================================ */
export const bannersApi = {
  list: () => api.get<{ banners: Banner[] }>('/admin/banners'),
  create: (data: any) => api.post<Banner>('/admin/banners', data),
  update: (id: string, data: any) => api.put<Banner>(`/admin/banners/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/admin/banners/${id}`),
};

/* ============================================================
 * 🔔 NOTIFICATIONS API
 * ============================================================ */
export const notificationsApi = {
  list: () => api.get<{ notifications: AdminNotification[]; unreadCount: number }>('/admin/notifications'),
  markRead: (id: string) => api.patch<{ message: string }>(`/admin/notifications/${id}/read`),
  markAllRead: () => api.patch<{ message: string }>('/admin/notifications/read-all'),
};

/* ============================================================
 * 📋 ACTIVITY LOG API
 * ============================================================ */
export const activityLogApi = {
  list: () => api.get<{ logs: ActivityLog[]; total: number }>('/admin/activity-log'),
};

/* ============================================================
 * 📊 REPORTS API
 * ============================================================ */
export const reportsApi = {
  sales: () => api.get<any>('/admin/reports/sales'),
  financial: () => api.get<any>('/admin/reports/financial'),
};

/* ============================================================
 * 🗂️ ADMIN CATEGORIES API
 * ============================================================ */
export const adminCategoriesApi = {
  list: () => api.get<Category[]>('/admin/categories'),
  create: (data: any) => api.post<Category>('/admin/categories', data),
  update: (id: string, data: any) => api.put<Category>(`/admin/categories/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/admin/categories/${id}`),
};

/* ============================================================
 * 🏪 SELLER DISCOUNTS API
 * ============================================================ */
export const sellerDiscountsApi = {
  list: () => api.get<{ discounts: AllDiscount }>('/seller/discounts'),
  create: (data: any) => api.post<DiscountCode>('/seller/discounts', data),
  delete: (id: string) => api.delete<{ message: string }>(`/seller/discounts/${id}`),
};

/* ============================================================
 * ⭐ SELLER REVIEWS API
 * ============================================================ */
export const sellerReviewsApi = {
  list: () => api.get<any>('/seller/reviews'),
  reply: (id: string, message: string) => api.post<{ message: string }>(`/seller/reviews/${id}/reply`, { message }),
};

/* ============================================================
 * 📊 SELLER REPORTS API
 * ============================================================ */
export const sellerReportsApi = {
  get: () => api.get<any>('/seller/reports'),
};

/* ============================================================
 * 👤 USER ADDRESSES API
 * ============================================================ */
export const addressesApi = {
  list: () => api.get<{ addresses: UserAddress[] }>('/user/addresses'),
  create: (data: any) => api.post<UserAddress>('/user/addresses', data),
  update: (id: string, data: any) => api.put<UserAddress>(`/user/addresses/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/user/addresses/${id}`),
  setDefault: (id: string) => api.patch<{ message: string }>(`/user/addresses/${id}/default`),
};

/* ============================================================
 * 💰 USER WALLET API
 * ============================================================ */
export const userWalletApi = {
  get: () => api.get<any>('/user/wallet'),
  deposit: (amount: number) => api.post<{ url: string }>('/user/wallet/deposit', { amount }),
  withdraw: (amount: number, cardNumber: string) => api.post<any>('/user/wallet/withdraw', { amount, cardNumber }),
};

/* ============================================================
 * 📋 USER ORDERS API
 * ============================================================ */
export const userOrdersApi = {
  list: () => api.get<{ orders: Order[]; total: number; totalSpent: number }>('/user/orders'),
};

/* ============================================================
 * ↔️ COMPARISON API
 * ============================================================ */
export const comparisonApi = {
  get: (ids: string[]) => api.get<any>(`/compare?ids=${ids.join(',')}`),
};

/* ============================================================
 * 🏠 HOMEPAGE API
 * ============================================================ */
export const homepageApi = {
  get: () => api.get<any>('/'),
};
