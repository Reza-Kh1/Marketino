'use client';
import { useMemo, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Wallet, Trash2, Minus, Plus, ArrowLeft, ArrowRight, Tag, Truck, ShieldCheck, DollarSign, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { useCart, useDeleteFromCart, useUpdateCart } from '@/hooks/cart.hook';
import ImgTag from '@/components/ImgTag';
import CustomButton from '@/components/CustomButton';
import { getVariantFinalPrice } from '@/lib/utils-product';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { SummarySection } from './SummarySection';
import StepperPayment from '@/components/StepperPayment';

export default function CartPage() {
  const { data: cartData, isLoading } = useCart();
  const { mutate: deleteFromCart, isPending: pendingDelete } = useDeleteFromCart();
  const { mutate: updateCart, isPending: pendingUpdate } = useUpdateCart();
  const route = useRouter()
  const cartItems = cartData?.carts || [];

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
      <StepperPayment currentStep='cart' />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" /> سبد خرید
        </h1>
        <p className="text-muted-foreground mb-8">{cartItems.length} کالا در سبد خرید شما</p>
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <MotionWrapper staggerChildren={0.2} preset='slideRTL' delay={0.3} className="lg:col-span-2 space-y-4">
              {cartItems.map((item, i) => {
                const variant = item.variant;
                const price = Number(variant?.price || 0);
                const hasDiscount = variant?.discount?.isActive;
                const finalUnitPrice = getVariantFinalPrice(item.variant)
                return (
                  <div key={item.id || i} className="bg-card border border-border rounded-2xl p-4 flex gap-4 relative" >
                    <div>
                      <ImgTag
                        src={item.product.images[0]?.url}
                        alt={item.product.title}
                        className="w-24 h-24 rounded-xl object-cover border border-border/50"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span
                          className="font-bold hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.product.title}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {variant?.color?.name && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/60 text-muted-foreground flex items-center gap-1 border border-border/40">
                              رنگ: <strong className="text-foreground">{variant.color.name}</strong>
                            </span>
                          )}

                          {/* Dynamic Attributes Map */}
                          {variant?.attributes?.map((attr, index) => (
                            <span
                              key={index++}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-accent/60 text-muted-foreground flex items-center gap-1 border border-border/40"
                            >
                              {attr.attribute.label}: <strong className="text-foreground">{attr.value}</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quantity & Price Section */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <CustomButton
                            color="icon"
                            iconStart={<Plus className="w-3.5 h-3.5" />}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                            isPending={pendingDelete || pendingUpdate}
                            onClick={() => handleQuantity(item.id, item.quantity + 1)}
                          />
                          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <CustomButton
                            iconStart={<Minus className="w-3.5 h-3.5" />}
                            color="icon"
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                            isPending={pendingDelete || pendingUpdate}
                            onClick={() => handleQuantity(item.id, item.quantity - 1)}
                          />
                        </div>

                        {/* Item Total Price */}
                        <div className="text-left">
                          {hasDiscount && (
                            <div className="text-xs text-muted-foreground line-through">
                              {(price * item.quantity).toLocaleString()} تومان
                            </div>
                          )}
                          <div className="font-black text-sm sm:text-base text-foreground">
                            {(finalUnitPrice * item.quantity).toLocaleString()} تومان
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-start">
                      <CustomButton
                        iconStart={<Trash2 className="w-4 h-4 text-destructive" />}
                        color="iconDelete"
                        isPending={pendingDelete || pendingUpdate}
                        onClick={() => handleRemove(item.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </MotionWrapper>
            <SummarySection onSubmit={() => route.push('/checkout')} />
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-20 bg-card border border-border rounded-3xl">
            <ShoppingBag className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">سبد خرید شما خالی است!</h2>
            <p className="text-muted-foreground mb-6">می‌توانید برای مشاهده محصولات به صفحه فروشگاه بروید.</p>
            <Link
              href="/products"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" /> مشاهده محصولات
            </Link>
          </div>
        )
        }
      </motion.div >
    </div >
  );
}