'use client';

import { Link } from '@/i18n/navigation';
import { Star, Heart, ShoppingCart, Eye, GitCompare, Check, X, DoorOpen, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { addToRecentlyViewed } from '@/components/RecentlyViewedBar';
import { toggleCompare, isInCompare } from '@/components/CompareFloat';
import { showQuickView } from '@/components/QuickViewModal';
import { useCart, useAddToCart, useDeleteFromCart } from '@/hooks/cart.hook';
import { useWishlist } from '@/lib/use-wishlist';
import { ProductType } from '@/lib/api';
import ImgTag from './ImgTag';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import CustomButton from './CustomButton';
import { useLocale } from 'next-intl';

interface ProductCardProps {
  product: ProductType;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const dir = useLocale()
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: cartData } = useCart();
  const cartItems = cartData?.carts || [];

  const { mutate: mutateAddToCart, isPending: isAddingToCart } = useAddToCart();
  const { mutate: mutateDeleteFromCart } = useDeleteFromCart();
  const { itemIds, toggleWishlist } = useWishlist();

  const liked = itemIds.includes(product.id);
  const variant = product.variants?.[0];

  const price = variant?.price || 0;
  const discountPrice = variant?.discount?.value;
  const hasDiscount = !!discountPrice && discountPrice < price;

  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  useEffect(() => {
    setInCompare(isInCompare(product.id));
  }, [product.id]);

  useEffect(() => {
    const inCart = cartItems.some((item) => item.productId === product.id);
    setAddedToCart(inCart);
  }, [cartItems, product.id]);

  const imageUrl = product.images?.[0]?.url || '/placeholder.png';
  const imageAlt = product.images?.[0]?.alt || product.title;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      return setOpenDialog(true);
    }
    mutateAddToCart({
      productId: product.id,
      quantity: 1,
      variantId: variant?.id,
    });
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, {
      id: product.id,
      title: product.title,
      price: price,
      discountPrice: discountPrice,
      image: imageUrl,
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isNew: product.condition === 'new',
    } as any);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleCompare({ id: product.id, title: product.title, image: imageUrl });
    setInCompare(added);
    toast.success(added ? 'به لیست مقایسه اضافه شد' : 'از لیست مقایسه حذف شد');
  };

  const handleClick = () => {
    addToRecentlyViewed({ id: product.id, title: product.title, image: imageUrl, price: price });
  };

  const formatNum = (n: number) => n.toLocaleString('fa-IR');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.map((img) => img.url) || [imageUrl],
    description: product.description || product.title,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: (discountPrice || price) * 10,
      availability: variant?.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1,
      },
    }),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
        className="h-full"
      >
        <Link
          href={dir === 'en' ? `/products/${product.slugEn}` : `/products/${product.slug}`}
          onClick={handleClick}
          itemScope
          itemType="https://schema.org/Product"
          className="group relative flex flex-col h-full bg-white dark:bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:-translate-y-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* بخش تصویر محصول */}
          <div className="relative aspect-square overflow-hidden bg-linear-to-br from-cyan-500/10 via-indigo-500/10 to-purple-600/20 dark:from-cyan-950/40 dark:via-slate-950 dark:to-purple-950/40 flex items-center justify-center p-2">            <ImgTag
            alt={imageAlt}
            src={imageUrl}
            itemProp="image"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out rounded-xl"
          />

            {/* لایه هاور اکشن (ترکیب فیروزه‌ای، آبی و بنفش) */}
            <div
              className={cn(
                'absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-all duration-300 flex flex-col items-center justify-center gap-2.5 p-3',
                'opacity-0 group-hover:opacity-100'
              )}
            >
              <motion.button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                initial={{ y: 8, opacity: 0 }}
                animate={isHovered ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95',
                  addedToCart
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:brightness-110'
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>در سبد خرید شما</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>افزودن به سبد</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showQuickView({
                    id: product.id,
                    title: product.title,
                    image: imageUrl,
                    images: product.images,
                    price: price,
                    discountPrice: discountPrice,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    isNew: product.condition === 'new',
                    description: product.description || 'محصول با کیفیت بالا و گارانتی اصالت کالا',
                  });
                }}
                initial={{ y: 8, opacity: 0 }}
                animate={isHovered ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-100 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>مشاهده سریع</span>
              </motion.button>
            </div>

            {/* نشان‌های تخفیف و جدید */}
            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
              {hasDiscount && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-pink-500 via-rose-600 to-purple-600 text-white text-[10px] font-black shadow-md shadow-pink-500/30 flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{discountPercent}٪</span>
                </motion.span>
              )}
              {product.condition === 'new' && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black shadow-md shadow-emerald-500/20">
                  جدید
                </span>
              )}
            </div>

            {/* دکمه‌های پسندیدن و مقایسه */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              <motion.button
                onClick={toggleLike}
                whileTap={{ scale: 0.85 }}
                title="افزودن به علاقه‌مندی‌ها"
                className={cn(
                  'p-2 rounded-xl backdrop-blur-md shadow-md transition-all duration-200',
                  liked
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800'
                )}
              >
                <Heart className={cn('w-3.5 h-3.5 transition-all', liked && 'fill-white')} />
              </motion.button>

              <motion.button
                onClick={handleCompare}
                whileTap={{ scale: 0.85 }}
                title="مقایسه محصول"
                className={cn(
                  'p-2 rounded-xl backdrop-blur-md shadow-md transition-all duration-200',
                  inCompare
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800'
                )}
              >
                <GitCompare className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* محتوای کارت متنی */}
          <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between space-y-3">
            <div className="space-y-1.5">
              <h3
                itemProp="name"
                className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors leading-relaxed"
              >
                {product.title}
              </h3>

              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {product.rating || '۵.۰'}
                  </span>
                </div>
                {product.reviewCount && (
                  <span className="text-[10px] text-slate-400">
                    ({formatNum(product.reviewCount)})
                  </span>
                )}
              </div>
            </div>

            {/* قیمت محصول */}
            <div
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
              className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-end justify-between"
            >
              <meta itemProp="priceCurrency" content="IRR" />
              <meta itemProp="price" content={String((discountPrice || price) * 10)} />

              <div className="flex flex-col">
                {hasDiscount && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through decoration-rose-500/60">
                    {formatNum(price)}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-sm sm:text-base bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-400 bg-clip-text text-transparent dark:from-cyan-400 dark:to-indigo-300 tracking-tight">
                    {formatNum(discountPrice || price)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-cyan-400/80">
                    تومان
                  </span>
                </div>
              </div>

              {/* دکمه خرید سریع موبایل با ترکیب فیروزه‌ای و بنفش */}
              <button
                onClick={handleAddToCart}
                className="md:hidden p-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-500 dark:text-cyan-400 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 hover:text-white transition-all shadow-sm"
                title="خرید سریع"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* دیالوگ ورود کاربر با ترکیب نیلی و فیروزه‌ای */}
      <Dialog onOpenChange={() => setOpenDialog(false)} open={openDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              ورود به حساب کاربری
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 my-2 text-sm text-slate-600 dark:text-slate-300">
            <p>برای افزودن این محصول به سبد خرید ابتدا وارد حساب کاربری خود شوید.</p>
            <p className="text-xs text-slate-400">چنانچه حساب کاربری ندارید می‌توانید به راحتی ثبت‌نام کنید.</p>
          </div>
          <DialogFooter className="pt-2">
            <div className="flex items-center justify-between gap-3 w-full">
              <Link
                href={'/login'}
                className="inline-flex cursor-pointer items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <span>ورود به حساب</span>
                <DoorOpen className="w-4 h-4" />
              </Link>
              <CustomButton
                onClick={() => setOpenDialog(false)}
                name="انصراف"
                iconEnd={<X className="w-4 h-4" />}
                color="gray"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}