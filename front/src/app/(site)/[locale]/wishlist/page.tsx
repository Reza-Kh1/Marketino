'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, ShoppingCart, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useWishlist } from '@/lib/use-wishlist';
import { useCart } from '@/lib/use-cart';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items: wishlistItems, toggleWishlist, removeFromWishlist, refresh, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = (id: string) => {
    if (isAuthenticated) {
      removeFromWishlist(id);
    } else {
      removeFromWishlist(id);
    }
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
  };

  // Safe accessor for item properties
  const imgSrc = (item: any) => item.image || '/placeholder-product.png';
  const itemTitle = (item: any) => item.title || 'محصول بدون نام';
  const formatPrice = (price: number | undefined | null) => 
    (price ?? 0).toLocaleString('fa-IR');

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
              <button onClick={refresh} disabled={loading}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
                title="بروزرسانی">
                <RefreshCw className={cn("w-5 h-5 text-muted-foreground", loading && "animate-spin")} />
              </button>
            )}
          </div>
        </div>
        
        <p className="text-muted-foreground mb-8">{wishlistItems.length} محصول در لیست علاقه‌مندی‌ها</p>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlistItems.map((item, i) => (
              <motion.div key={item.id as string} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-lg transition-all">
                <Link href={`/products/${item.id}`} className="block relative">
                  <img src={imgSrc(item)} alt={itemTitle(item)} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 bg-muted" />
                  <button onClick={(e) => { e.preventDefault(); handleRemove(item.id as string); }}
                    className="absolute top-3 left-3 p-2 rounded-xl bg-white/90 dark:bg-black/60 text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-bold text-sm truncate hover:text-primary transition-colors">{itemTitle(item)}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {(item.discountPrice as number) ? (
                        <div>
                          <span className="font-black">{formatPrice(item.discountPrice)}</span>
                          <span className="text-xs text-muted-foreground line-through mr-2">{formatPrice(item.price)}</span>
                        </div>
                      ) : (
                        <span className="font-black">{formatPrice(item.price)} تومان</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleAddToCart(item.id as string)}
                    className="w-full mt-3 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                    <ShoppingCart className="w-4 h-4" /> افزودن به سبد
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={cn(
            "text-center py-20 bg-card border border-border rounded-3xl",
            loading && "opacity-60"
          )}>
            <Heart className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">لیست علاقه‌مندی‌ها خالی است!</h2>
            <p className="text-muted-foreground mb-6">محصولات مورد علاقه خود را به این لیست اضافه کنید</p>
            <Link href="/products" className="btn-primary px-8 py-3 rounded-2xl font-bold inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> مرور محصولات
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
