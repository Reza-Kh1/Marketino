'use client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import PaginationBar from '@/components/admin/PaginationBar';
import { useFetchWishlistIds, useWishlist } from '@/hooks/wishList.hook';
import { useSearchParams } from 'next/navigation';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const pages = useSearchParams().get('page')
  const { data: wishListData, isLoading } = useWishlist(Number(pages || 1))
  const { refetch, data } = useFetchWishlistIds()
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" /> علاقه‌مندی‌ها
            </h1>
            {isAuthenticated && (
              <button onClick={() => refetch()} disabled={isLoading}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
                title="بروزرسانی">
                <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isLoading && "animate-spin")} />
              </button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-8">{wishListData?.pagination.total} محصول در لیست علاقه‌مندی‌ها</p>
        {wishListData?.items.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishListData?.items?.map((item, i) => (
              <ProductCard
                key={i++}
                product={item.product}
              />
            ))}
          </div>
        ) : (
          <div className={cn(
            "text-center py-20 bg-card border border-border rounded-3xl",
            isLoading && "opacity-60"
          )}>
            <Heart className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">لیست علاقه‌مندی‌ها خالی است!</h2>
            <p className="text-muted-foreground mb-6">محصولات مورد علاقه خود را به این لیست اضافه کنید</p>
            <Link href="/products" className="btn-primary px-8 py-3 rounded-2xl font-bold inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> مرور محصولات
            </Link>
          </div>
        )}
        <PaginationBar pagination={wishListData?.pagination} />
      </motion.div>
    </div>
  );
}
