'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Wallet, Truck, MapPin, ArrowRight, Check, Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { discountChange, useCart, useClearCart, useDeleteFromCart, useUpdateCart } from '@/hooks/cart.hook'; // Use proper hook from cart.hook.ts
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import ImgTag from '@/components/ImgTag';
import CustomButton from '@/components/CustomButton';

/** Cart page using cart hooks for backend integration */
export default function CartPage() {

  const { data: cartData, isLoading } = useCart();
  const { mutate: deleteFromCart, isPending: pendingDelete } = useDeleteFromCart();
  const { mutate: updateCart, isPending: pendingUpdate } = useUpdateCart();
  const cartItems = cartData?.carts || [];
  const totalPrice = cartData?.totalPrice || 0;
  const handleRemove = (id: string) => {
    deleteFromCart(id);
  };
  const handleQuantity = (productId: string, qty: number) => {
    const body = {
      quantity: qty
    }
    updateCart({ data: body, id: productId })
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-center text-muted-foreground">در حال بارگذاری سبد خرید...</p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" /> سبد خرید
        </h1>
        <p className="text-muted-foreground mb-8">{cartItems.length} کالا در سبد خرید شما</p>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, i) => (
                <motion.div key={item.id || i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-4 flex gap-4">
                  <Link href={`/products/${item.product.id}`}>
                    <ImgTag src={item.product.images[0]?.url} alt={item.product.title} className="w-24 h-24 rounded-xl object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.id}`} className="font-bold hover:text-primary transition-colors">{item.product.title}</Link>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> {item.product.seller?.storeName || 'فروشنده'}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <CustomButton
                          color='icon'
                          iconStart={<Plus className="w-3 h-3" />}
                          className='w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors'
                          isPending={pendingDelete || pendingUpdate}
                          onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                        />
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <CustomButton
                          iconStart={<Minus className="w-3 h-3" />}
                          color='icon'
                          className='w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors'
                          isPending={pendingDelete || pendingUpdate}
                          onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                        />
                      </div>
                      <div className="text-right">
                        <div className="font-black">

                          {item.variant.discountId ? (
                            <>
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                {discountChange(item.variant.price, item.variant.discount).total.toLocaleString()}
                              </span>
                              {
                                discountChange(item.variant.price, item.variant.discount).discount.toLocaleString()
                              } تومان
                            </>
                          ) : `${item.variant.price.toLocaleString()} تومان`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CustomButton
                    iconStart={<Trash2 className="w-4 h-4" />}
                    color='iconDelete'
                    isPending={pendingDelete || pendingUpdate}
                    onClick={() => handleRemove(item.productId)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h3 className="font-black text-lg mb-4">خلاصه سفارش</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>جمع سبد خرید</span><span>{totalPrice.toLocaleString()} تومان</span></div>
                  <div className="flex justify-between"><span>هزینه ارسال</span><span className="text-emerald-600">{totalPrice > 500_000 ? 'رایگان' : 'محاسبه در checkout'}</span></div>
                  <div className="flex justify-between text-lg font-black border-t border-border pt-3">
                    <span>مبلغ قابل پرداخت</span>
                    <span className="text-primary">{totalPrice.toLocaleString()} تومان</span>
                  </div>
                </div>
                <CustomButton
                  classDiv='w-full'
                  iconStart={<ArrowRight className="w-4 h-4" />}
                  name='ادامه ثبت سفارش'
                  link='/checkout'
                  className='w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black text-base flex items-center justify-center gap-2 hover:shadow-xl transition-all'
                  isPending={pendingDelete || pendingUpdate}
                />
                <CustomButton
                  classDiv='w-full'
                  iconStart={<ArrowLeft className="w-4 h-4" />}
                  name='ادامه خرید'
                  link='/products'
                  className='w-full mt-3 h-10 rounded-xl border border-border font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent transition-colors'
                  isPending={pendingDelete || pendingUpdate}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-20 bg-card border border-border rounded-3xl">
            <ShoppingBag className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">سبد خرید خالی است!</h2>
            <p className="text-muted-foreground mb-6">هنوز محصولی به سبد خرید اضافه نکرده‌اید</p>
            <Link href="/products" className="btn-primary px-8 py-3 rounded-2xl font-bold inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> شروع خرید
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}