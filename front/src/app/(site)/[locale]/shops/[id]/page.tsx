'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Store, Package, ShoppingBag, Calendar, Shield, Clock, MessageSquare } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import StarRating from '@/components/StarRating';
import TrustBadge from '@/components/TrustBadge';
import ShopRatingBreakdown from '@/components/ShopRatingBreakdown';
import ReviewForm from '@/components/ReviewForm';
import { shopsApi, type Product, type User } from '@/lib/api';
import toast from 'react-hot-toast';

const BUSINESS_LABELS: Record<string, string> = {
  electronics: 'کالای دیجیتال', clothing: 'پوشاک و مد', home: 'خانه و آشپزخانه',
  sports: 'ورزش و سفر', beauty: 'زیبایی و سلامت', books: 'کتاب و لوازم تحریر',
  toys: 'اسباب‌بازی و کودک', food: 'خوراکی', jewelry: 'طلا و جواهرات',
  art: 'هنر و صنایع دستی', cars: 'خودرو', tools: 'ابزار صنعتی',
  medical: 'پزشکی', music: 'موسیقی', other: 'سایر',
};

interface ShopData {
  shop: User & {
    totalProducts: number; rating?: number; avgRating?: number;
    reviewCount: number; totalSales?: number; joinedAt?: string;
    responseRate?: number; onTimeDelivery?: number;
    productQuality?: number; communication?: number;
  };
  products: Product[];
  reviews: any[];
}

export default function ShopDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'products' | 'reviews'>('products');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewPage, setReviewPage] = useState(1);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await shopsApi.getById(id);
        setShop(res);
        setReviews(res.reviews || []);
      } catch {
        toast.error('خطا در دریافت اطلاعات فروشگاه');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-24 h-24 rounded-3xl bg-accent" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-64 bg-accent rounded-lg" />
              <div className="h-16 bg-accent rounded-lg" />
              <div className="grid grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-accent rounded-xl" />)}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-black mb-2">فروشگاه یافت نشد</h2>
        <Link href="/shops" className="text-primary font-bold hover:underline">بازگشت به فروشگاه‌ها</Link>
      </div>
    );
  }

  const s = shop.shop;
  const avgRating = s.rating || s.avgRating || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Shop Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-5xl shrink-0 shadow-lg">
            {s.storeLogo || '🏪'}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-black">{s.storeName}</h1>
              <TrustBadge
                isVerified={s.isVerified}
                avgRating={avgRating}
                totalSales={s.totalSales || 0}
                reviewCount={s.reviewCount || 0}
                responseRate={s.responseRate}
                onTimeDelivery={s.onTimeDelivery}
              />
              {s.businessType && (
                <span className="bg-accent px-2.5 py-1 rounded-full text-xs font-bold text-muted-foreground">
                  {BUSINESS_LABELS[s.businessType] || s.businessType}
                </span>
              )}
            </div>

            {s.storeDescription && (
              <p className="text-muted-foreground leading-relaxed mb-6">{s.storeDescription}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <StarRating rating={avgRating} size="md" showValue={false} />
                  <div className="text-xs text-muted-foreground">{s.reviewCount || 0} نظر</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-lg font-black">{s.totalProducts || 0}</div>
                  <div className="text-xs text-muted-foreground">محصول فعال</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-lg font-black">{(s.totalSales || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">سفارش موفق</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-lg font-black">{s.joinedAt || '---'}</div>
                  <div className="text-xs text-muted-foreground">تاریخ عضویت</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-border pb-1">
        {[
          { key: 'products' as const, label: 'محصولات', icon: Package },
          { key: 'reviews' as const, label: 'نظرات', icon: Star },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {shop.products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          {shop.products.length === 0 && (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">هنوز محصولی ثبت نشده است</p>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === 'reviews' && (
        <div className="mt-8 space-y-8 max-w-3xl">
          {/* Rating Summary */}
          <ShopRatingBreakdown
            avgRating={avgRating}
            totalReviews={s.reviewCount || 0}
            responseRate={s.responseRate}
            onTimeDelivery={s.onTimeDelivery}
            productQuality={s.productQuality}
            communication={s.communication}
          />

          {/* Review List */}
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {(review.reviewer?.firstName || review.userName || '؟')[0]}
                    </div>
                    <span className="font-bold text-sm">{review.reviewer?.firstName} {review.reviewer?.lastName || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" showValue={false} />
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fa-IR') : review.date}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
              </motion.div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-10">
                <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">هنوز نظری ثبت نشده است</p>
              </div>
            )}
          </div>

          {/* Review Form */}
          <ReviewForm sellerId={id} sellerName={s.storeName || 'این فروشنده'}
            onSuccess={() => {
              // Refresh
              shopsApi.getById(id).then(res => setReviews(res.reviews || [])).catch(() => {});
            }}
          />
        </div>
      )}

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/shops" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="w-4 h-4" /> بازگشت به همه فروشگاه‌ها
        </Link>
      </div>
    </div>
  );
}
