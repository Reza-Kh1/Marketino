'use client';
import { Link } from '@/i18n/navigation';
import { Star, Heart, ShoppingCart, Eye, GitCompare, Check, X, DoorOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { addToRecentlyViewed } from '@/components/RecentlyViewedBar';
import { toggleCompare, isInCompare } from '@/components/CompareFloat';
import { showQuickView } from '@/components/QuickViewModal';
import { useCart } from '@/hooks/cart.hook'; // Use the proper hook from cart.hook.ts
import { useWishlist } from '@/lib/use-wishlist';
import { ProductType } from '@/lib/api';
import ImgTag from './ImgTag';
import { useAddToCart } from '@/hooks/cart.hook';
import { useDeleteFromCart } from '@/hooks/cart.hook';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from './ui/dialog';
import CustomButton from './CustomButton';

interface ProductCardProps {
  product: ProductType
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [imgError, setImgError] = useState(false);
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { data: cartData } = useCart();
  const cartItems = cartData?.carts || [];

  const { mutate: mutateAddToCart } = useAddToCart();
  const { mutate: mutateDeleteFromCart } = useDeleteFromCart();
  const { itemIds, toggleWishlist } = useWishlist();
  const liked = itemIds.includes(product.id);
  const variant = product.variants[0];
  const hasDiscount = !!variant?.discount?.value;
  const disc = 45;

  useEffect(() => { setInCompare(isInCompare(product.id)); }, [product.id]);

  // Reset image error when product changes
  useEffect(() => { setImgError(false); }, [product.id]);

  useEffect(() => {
    // Check if product is in cart from API
    const inCart = cartItems.some(item => item.productId === product.id);
    setAddedToCart(inCart);
  }, [cartItems, product.id]);

  const imageUrl = product.images.length ? product.images[0]?.url : '';

  // Handle adding product to cart - uses the mutation hook to send to backend
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      return setOpenDialog(true)
    }
    mutateAddToCart({
      productId: product.id,
      quantity: 1,
      variantId: variant?.id,
    });
  };

  // Handle removal of product from cart (used in cart page but could be triggered from card if needed)
  const handleDeleteFromCart = () => {
    const cartItem = cartItems.find(item => item.productId === product.id);
    if (cartItem) {
      mutateDeleteFromCart(cartItem.id);
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, {
      id: product.id, title: product.title, price: variant.price,
      discountPrice: variant.discount?.value, image: imageUrl, images: product.images,
      rating: product.rating, reviewCount: product.reviewCount, isNew: product.condition === 'new',
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
    addToRecentlyViewed({ id: product.id, title: product.title, image: imageUrl, price: variant.price });
  };

  const formatNum = (n: number) => n.toLocaleString('fa-IR');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Link
          href={`/products/${product.id}`}
          onClick={handleClick}
          className="group block bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1.5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 via-muted/30 to-muted/10">
            <ImgTag alt={product.images[0]?.alt || ''} src={imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
            {/* Hover / Tap Overlay */}
            <div className={cn(
              'absolute inset-0 transition-all duration-300 flex flex-col items-center justify-center gap-2 sm:gap-3',
              'bg-black/40 opacity-0 group-hover:opacity-100 active:opacity-100 md:active:opacity-0'
            )}>
              <motion.button
                onClick={handleAddToCart}
                initial={{ y: 10, opacity: 0 }}
                animate={isHovered ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-2xl flex items-center gap-1.5 sm:gap-2 active:scale-95',
                  addedToCart
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-900 hover:bg-primary hover:text-white'
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    اضافه شد
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    افزودن به سبد
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showQuickView({
                    id: product.id, title: product.title, image: imageUrl, images: product.images,
                    price: variant.price, discountPrice: variant.discount?.value,
                    rating: product.rating, reviewCount: product.reviewCount,
                    isNew: product.condition === 'new', description: 'محصول با کیفیت بالا و گارانتی اصالت کالا',
                  });
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={isHovered ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-white/30 transition-all"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                مشاهده سریع
              </motion.button>
            </div>

            {/* Badges - RTL:right / LTR:left */}
            <div className="absolute top-2 sm:top-3 rtl:right-2 sm:rtl:right-3 ltr:left-2 sm:ltr:left-3 flex flex-col gap-1 sm:gap-1.5">
              {hasDiscount && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                  className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-red-500 text-white text-[10px] sm:text-[11px] font-black shadow-lg shadow-red-500/30">
                  {disc}٪
                </motion.span>
              )}
              {product.condition === 'new' && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-emerald-500 text-white text-[10px] sm:text-[11px] font-black shadow-lg shadow-emerald-500/30">
                  جدید
                </span>
              )}
            </div>

            {/* Like & Compare buttons - RTL:left / LTR:right */}
            <div className="absolute top-2 sm:top-3 rtl:left-2 sm:rtl:left-3 ltr:right-2 sm:ltr:right-3 flex flex-col gap-1">
              <motion.button
                onClick={toggleLike}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  'p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-md shadow-md transition-all duration-300',
                  liked
                    ? 'bg-red-500/90 text-white'
                    : 'bg-white/80 dark:bg-gray-900/70 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800'
                )}
              >
                <Heart className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all', liked && 'fill-white')} />
              </motion.button>

              <motion.button
                onClick={handleCompare}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  'p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-md shadow-md transition-all duration-300',
                  inCompare
                    ? 'bg-primary/90 text-white'
                    : 'bg-white/80 dark:bg-gray-900/70 text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-800'
                )}
              >
                <GitCompare className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all', inCompare && 'text-white')} />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5">
            <h3 className="font-bold text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors leading-relaxed">
              {product.title}
            </h3>

            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs sm:text-sm font-bold">{product.rating}</span>
              </div>
              {product.reviewCount && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">({formatNum(product.reviewCount)} نظر)</span>
              )}
            </div>

            <div className="flex items-baseline gap-1 sm:gap-1.5 pt-0.5">
              <span className="font-black text-sm sm:text-lg text-foreground">
                {formatNum(variant.discount?.value ?? variant.price)}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">تومان</span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through ms-auto">{formatNum(variant.price)}</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
      <Dialog onOpenChange={() => setOpenDialog(false)} open={openDialog}>
        <DialogContent>
          <DialogHeader>
            افزودن به سبد خرید
          </DialogHeader>
          <span>
            برای خرید تبندا وارد حساب کاربر خود شوید
          </span>
          <p>چنانچه حساب کاربری ندارید میتوانید ثبت نام کنید</p>
          <DialogFooter>
            <div className='flex justify-between w-full'>
              <Link href={'/login'} className='inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50'>وارد شوید
                <DoorOpen />
              </Link>
              <CustomButton
                onClick={() => setOpenDialog(false)}
                name='انصراف'
                iconEnd={<X />}
                color='gray'
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}