'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, ShoppingCart, Heart, GitCompare, ChevronRight, ChevronLeft,
  Truck, Shield, RefreshCw, Minus, Plus, Share2, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { addToRecentlyViewed } from '@/components/RecentlyViewedBar';
import { toggleCompare, isInCompare } from '@/components/CompareFloat';
import { useCart } from '@/lib/use-cart';
import { useTranslation } from '@/lib/i18n-context';
import { Link } from '@/i18n/navigation';
interface QuickViewProduct {
  id: string;
  title: string;
  image?: string;
  images?: ({ url: string } | string)[];
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount?: number;
  isNew?: boolean;
  tags?: string[];
  description?: string;
  stock?: number;
}

let openQuickView: ((product: QuickViewProduct) => void) | null = null;

export function showQuickView(product: QuickViewProduct) {
  if (openQuickView) openQuickView(product);
}

export default function QuickViewModal() {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [closing, setClosing] = useState(false);
  const { addToCart: addToCartHook } = useCart();
  const { locale } = useTranslation();
  const isFa = locale === 'fa';

  const getImageUrl = (img: { url: string } | string) => (typeof img === 'string' ? img : img.url);

  const open = useCallback((p: QuickViewProduct) => {
    setProduct(p);
    setActiveImageIdx(0);
    setQuantity(1);
    setLiked(false);
    setIsOpen(true);
    setClosing(false);
    setInCompare(isInCompare(p.id));
    addToRecentlyViewed({ id: p.id, title: p.title, image: p.image || '', price: p.price });
    document.body.style.overflow = 'hidden';
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setProduct(null);
      setClosing(false);
      document.body.style.overflow = '';
    }, 200);
  }, []);

  useEffect(() => {
    openQuickView = open;
    return () => { openQuickView = null; };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  if (!isOpen || !product) return null;

  const imageUrl = product.image || (product.images?.[0] ? getImageUrl(product.images[0]) : '');
  const uniqueImages = [...new Set([imageUrl, ...(product.images || []).map(i => getImageUrl(i))].filter(Boolean))] as string[];
  const hasDiscount = !!product.discountPrice;
  const disc = Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={close}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: closing ? 0 : 1, scale: closing ? 0.92 : 1, y: closing ? 40 : 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 40 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-2xl shadow-black/25 border border-border/50"
        >
          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-4 rtl:left-4 ltr:right-4 z-10 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Images */}
            <div className="relative bg-gradient-to-br from-muted/40 via-muted/20 to-muted/5 p-6 md:p-8">
              <div className="relative rounded-2xl overflow-hidden bg-muted/30 aspect-square">
                <motion.img
                  key={activeImageIdx}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={uniqueImages[activeImageIdx] || `https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />

                {/* Badges */}
                <div className="absolute top-3 rtl:left-3 ltr:right-3 flex flex-col gap-1.5">
                  {hasDiscount && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-black shadow-lg shadow-red-500/30">
                      {disc}٪
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/30">
                      جدید
                    </span>
                  )}
                </div>

                {/* Image Navigation */}
                {uniqueImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx(prev => prev > 0 ? prev - 1 : uniqueImages.length - 1)}
                      className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all"
                    >
                      {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setActiveImageIdx(prev => prev < uniqueImages.length - 1 ? prev + 1 : 0)}
                      className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all"
                    >
                      {isFa ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {uniqueImages.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  {uniqueImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={cn(
                        'w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200',
                        i === activeImageIdx ? 'border-primary shadow-md shadow-primary/20' : 'border-border/50 hover:border-border opacity-60 hover:opacity-100'
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-6 md:p-8 flex flex-col">
              {/* Title & Rating */}
              <h2 className="text-xl md:text-2xl font-black leading-relaxed">{product.title}</h2>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold">{product.rating}</span>
                </div>
                {product.reviewCount && (
                  <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString('fa-IR')} نظر)</span>
                )}
                {product.stock !== undefined && product.stock > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {product.stock} عدد موجود
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">
                  {(product.discountPrice ?? product.price).toLocaleString('fa-IR')}
                </span>
                <span className="text-sm text-muted-foreground font-medium">تومان</span>
                {hasDiscount && (
                  <span className="text-base text-muted-foreground line-through mr-2">{product.price.toLocaleString('fa-IR')}</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-4">
                  {product.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">تعداد:</span>
                <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(99, q + 1))}
                    className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!product) return;
                    addToCartHook(product.id, quantity, {
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      discountPrice: product.discountPrice,
                      image: product.image,
                      images: product.images,
                      rating: product.rating,
                      reviewCount: product.reviewCount,
                      isNew: product.isNew,
                      tags: product.tags,
                    });
                  }}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/35 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> افزودن به سبد خرید
                </button>

                <button
                  onClick={() => setLiked(!liked)}
                  className={cn(
                    'w-12 h-12 rounded-xl border flex items-center justify-center transition-all',
                    liked ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500' : 'border-border hover:bg-muted'
                  )}
                >
                  <Heart className={cn('w-5 h-5', liked && 'fill-red-500')} />
                </button>

                <button
                  onClick={() => {
                    const added = toggleCompare({ id: product.id, title: product.title, image: imageUrl });
                    setInCompare(added);
                    toast.success(added ? 'به لیست مقایسه اضافه شد' : 'از لیست مقایسه حذف شد');
                  }}
                  className={cn(
                    'w-12 h-12 rounded-xl border flex items-center justify-center transition-all',
                    inCompare ? 'bg-primary/10 border-primary/20 text-primary' : 'border-border hover:bg-muted'
                  )}
                >
                  <GitCompare className="w-5 h-5" />
                </button>
              </div>

              {/* Full Page Link */}
              <Link
                href={`/products/${product.id}`}
                onClick={close}
                className="mt-3 text-center text-sm font-medium text-primary hover:underline inline-flex items-center justify-center gap-1"
              >
                مشاهده صفحه کامل محصول <Eye className="w-3.5 h-3.5" />
              </Link>

              {/* Trust Badges */}
              <div className="mt-auto pt-6 border-t border-border/50">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: Truck, label: 'ارسال سریع' },
                    { icon: Shield, label: 'ضمانت اصالت' },
                    { icon: RefreshCw, label: '۷ روز بازگشت' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
