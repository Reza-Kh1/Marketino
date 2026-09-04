'use client';
import { Link, useRouter } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, Store, Sparkles, Package } from 'lucide-react';
import { useCart, useDeleteFromCart, useUpdateCart } from '@/hooks/cart.hook';
import ImgTag from '@/components/ImgTag';
import CustomButton from '@/components/CustomButton';
import { getVariantFinalPrice } from '@/lib/utils-product';
import MotionWrapper from '@/components/motion/MotionWrapper';
// import { SummarySection } from './SummarySection';
import StepperPayment from '@/components/StepperPayment';
import { SummarySection } from '../../checkout/SummarySection';

// پالت‌های گرادیان جذاب برای هدر فروشگاه‌ها
const storeGradients = [
  'from-cyan-500/15 via-blue-500/10 to-transparent border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  'from-violet-500/15 via-purple-500/10 to-transparent border-violet-500/30 text-violet-600 dark:text-violet-400',
  'from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  'from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/30 text-amber-600 dark:text-amber-400',
  'from-rose-500/15 via-pink-500/10 to-transparent border-rose-500/30 text-rose-600 dark:text-rose-400',
];

export default function CartPage() {
  const { data: cartData, isLoading } = useCart();
  const { mutate: deleteFromCart, isPending: pendingDelete } = useDeleteFromCart();
  const { mutate: updateCart, isPending: pendingUpdate } = useUpdateCart();
  const route = useRouter();

  // استخراج اطلاعات ساختار جدید
  const stores = cartData?.stores || [];
  const totalItems = cartData?.totalItems || 0;

  const handleRemove = (id: string) => {
    deleteFromCart(id);
  };

  const handleQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    updateCart({ data: { quantity: qty }, id });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-muted-foreground">
        در حال بارگذاری سبد خرید...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <StepperPayment currentStep="cart" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" /> سبد خرید
        </h1>
        <p className="text-muted-foreground mb-8">{totalItems} کالا در سبد خرید شما</p>

        {stores.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* لیست فروشگاه‌ها و محصولات */}
            <MotionWrapper
              staggerChildren={0.2}
              preset="slideRTL"
              delay={0.3}
              className="lg:col-span-2 space-y-6"
            >
              {stores.map((storeGroup, storeIndex) => {
                const gradientStyle = storeGradients[storeIndex % storeGradients.length];
                return (
                  <div
                    key={storeGroup.storeId}
                    className="bg-card border border-border/70 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* هدر مدرن و گرادیانی فروشگاه */}
                    <div
                      className={`px-5 py-3.5 bg-linear-to-r ${gradientStyle} border-b flex items-center justify-between backdrop-blur-md`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-background/80 shadow-xs border border-border/50">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block font-medium">
                            فروشنده:
                          </span>
                          <span className="font-extrabold text-sm text-foreground">
                            {storeGroup.storeName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-background/60 border border-border/40 backdrop-blur-sm">
                        <Package className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>{storeGroup.carts.length} کالا</span>
                      </div>
                    </div>
                    <div className="p-4 divide-y divide-border/40">
                      {storeGroup.carts.map((item) => {
                        const variant = item.variant;
                        const price = Number(variant?.price || 0);
                        const hasDiscount = variant?.discount?.isActive;
                        const finalUnitPrice = getVariantFinalPrice(item.variant as any);
                        return (
                          <div
                            key={item.id}
                            className="py-4 first:pt-0 flex flex-col sm:flex-row gap-3 sm:gap-4 relative group border-b border-border/40 last:border-0"
                          >
                            <div className="flex items-start justify-between sm:justify-start shrink-0">
                              <ImgTag
                                src={item.product.images[0]?.url}
                                alt={item.product.title}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-border/50 bg-accent/20 group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="sm:hidden">
                                <CustomButton
                                  iconStart={<Trash2 className="w-4 h-4 text-destructive" />}
                                  color="iconDelete"
                                  isPending={pendingDelete || pendingUpdate}
                                  onClick={() => handleRemove(item.id)}
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3 gap-1 sm:space-y-0">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <Link
                                    href={'/products/' + item.product.slug}
                                    className="font-bold hover:text-blue-500 transition-colors line-clamp-2 sm:line-clamp-1 text-sm sm:text-base leading-snug"
                                  >
                                    {item.product.title}
                                  </Link>
                                  <div className="hidden sm:block shrink-0">
                                    <CustomButton
                                      iconStart={<Trash2 className="w-4 h-4 text-destructive" />}
                                      color="iconDelete"
                                      isPending={pendingDelete || pendingUpdate}
                                      onClick={() => handleRemove(item.id)}
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {variant?.color?.name && (
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-accent/50 text-muted-foreground flex items-center gap-1 border border-border/30">
                                      رنگ: <strong className="text-foreground">{variant.color.name}</strong>
                                    </span>
                                  )}
                                  {variant?.attributes?.map((attr) => (
                                    <span
                                      key={attr.id}
                                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-accent/50 text-muted-foreground flex items-center gap-1 border border-border/30"
                                    >
                                      {attr.attribute.label}:{' '}
                                      <strong className="text-foreground">{attr.value}</strong>
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 sm:pt-0 border-t border-border/20 sm:border-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-accent/30 p-1 rounded-xl border border-border/50">
                                  <CustomButton
                                    color="icon"
                                    iconStart={<Plus className="w-3.5 h-3.5" />}
                                    className="w-7 h-7 rounded-lg bg-background shadow-xs hover:bg-accent transition-colors"
                                    isPending={pendingDelete || pendingUpdate}
                                    onClick={() => handleQuantity(item.id, item.quantity + 1)}
                                  />
                                  <span className="w-6 sm:w-7 text-center font-bold text-xs sm:text-sm">
                                    {item.quantity}
                                  </span>
                                  <CustomButton
                                    iconStart={<Minus className="w-3.5 h-3.5" />}
                                    color="icon"
                                    disabled={item.quantity <= 1}
                                    className="w-7 h-7 rounded-lg bg-background shadow-xs hover:bg-accent transition-colors disabled:opacity-30"
                                    isPending={pendingDelete || pendingUpdate}
                                    onClick={() => handleQuantity(item.id, item.quantity - 1)}
                                  />
                                </div>

                                {/* قیمت کل آیتم */}
                                <div className="text-left">
                                  {hasDiscount && (
                                    <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
                                      {(price * item.quantity).toLocaleString()} تومان
                                    </div>
                                  )}
                                  <div className="font-black text-sm sm:text-base text-foreground">
                                    {(finalUnitPrice * item.quantity).toLocaleString()} تومان
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </MotionWrapper>
            <SummarySection onSubmit={() => route.push('/checkout')} />
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border/60 rounded-3xl shadow-xs">
            <ShoppingBag className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">سبد خرید شما خالی است!</h2>
            <p className="text-muted-foreground mb-6">
              می‌توانید برای مشاهده محصولات به صفحه فروشگاه بروید.
            </p>
            <Link
              href="/products"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" /> مشاهده محصولات
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}