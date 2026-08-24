"use client";

import React, { useState, useMemo } from "react";
import {
    DollarSign,
    Truck,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    CreditCard,
    CheckCircle2,
    Receipt,
    Hash,
    Calendar,
    Clock,
    ArrowRightLeft,
    Banknote,
    Wallet,
    Tag,
    X,
    Plus,
} from "lucide-react";
import CustomButton from "@/components/CustomButton";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { useCart, useDeleteFromCart, useUpdateCart } from "@/hooks/cart.hook";
import { useValidateDiscount } from "@/hooks/discount.hook";
import { useShippingMethods } from "@/hooks/setting.hook";
import LoadingPage from "../../shops/[id]/loading";

const PAYMENT_METHODS = [
    {
        id: 'online',
        name: 'پرداخت آنلاین اینترنتی',
        description: 'اتصال مستقیم به درگاه‌های عضو شتاب',
        icon: CreditCard,
        badge: 'پیشنهادی',
    },
    {
        id: 'wallet',
        name: 'پرداخت از کیف پول',
        description: 'کسر مستقیم از موجودی کیف پول حساب کاربری',
        icon: Wallet,
        badge: 'سریع‌ترین',
    },
    {
        id: 'card_to_card',
        name: 'کارت به کارت',
        description: 'واریز به شماره حساب و ثبت فیش واریزی',
        icon: ArrowRightLeft,
        badge: null,
    },
    {
        id: 'cod',
        name: 'پرداخت در محل (COD)',
        description: 'پرداخت با کارتخوان هنگام تحویل مرسوله',
        icon: Banknote,
        badge: 'ویژه تهران',
    },
];

interface SummarySectionProps {
    shippingMethodId?: string;
    paymentId?: string
    onSubmit?: () => void
    btnName?: string
    showShipping?: boolean
    showPayment?: boolean
    btnIcon?: React.ReactNode
    pendingOrder?: boolean
    showDiscountForm?: boolean
    setDiscount?: (value: string) => void
}

export function SummarySection({
    shippingMethodId,
    onSubmit,
    showPayment = false,
    showShipping = false,
    showDiscountForm = false,
    btnName,
    paymentId,
    btnIcon,
    pendingOrder,
    setDiscount
}: SummarySectionProps) {
    const { data: cartData } = useCart();
    const { isPending: pendingDelete } = useDeleteFromCart();
    const { isPending: pendingUpdate } = useUpdateCart();
    const [showAllItems, setShowAllItems] = useState(false);
    const { mutate: discountMutate, isPending: pendingValidate } = useValidateDiscount()
    const { data: shippingData, isLoading: loadingShipping } = useShippingMethods()
    // استیت‌های تستی کد تخفیف
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: "percentage" | "fixed" | string; value: number; } | null>(null);
    const [couponError, setCouponError] = useState("");

    const cartItems = cartData?.carts || [];
    const totalPrice = cartData?.totalPrice || 0;
    const totalItems = cartData?.totalItems || 0;
    const currentShipping = shippingData?.length ? shippingData?.filter((item) => item.id === shippingMethodId)[0] || shippingData[0] : { cost: 0, name: 'Error', estimatedDays: 'Error', freeThreshold: 0 };
    const currentPayment = PAYMENT_METHODS.find((i) => i.id === paymentId) || PAYMENT_METHODS[0];
    const finalShippingCost = currentShipping?.cost || 0;
    // محاسبه قیمت اولیه و تخفیف کالاها
    const { originalPrice, productsDiscount } = useMemo(() => {
        return cartItems.reduce(
            (acc, item) => {
                const rawPrice = Number(item.variant?.price || 0);
                const discount = item.variant?.discount;
                let unitDiscount = 0;

                const isDiscountValid =
                    discount &&
                    discount.isActive &&
                    (!discount.endsAt || new Date(discount.endsAt) > new Date());

                if (isDiscountValid) {
                    if (discount.type === "percentage") {
                        unitDiscount = rawPrice * (discount.value / 100);
                    } else if (discount.type === "fixed" || discount.type === "amount") {
                        unitDiscount = Math.min(rawPrice, discount.value);
                    }
                }

                acc.originalPrice += rawPrice * item.quantity;
                acc.productsDiscount += unitDiscount * item.quantity;
                return acc;
            },
            { originalPrice: 0, productsDiscount: 0 }
        );
    }, [cartItems]);

    // اعمال کد تخفیف تستی روی قیمت پس از تخفیف کالاها (totalPrice)
    const couponDiscountAmount = useMemo(() => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === "percentage") {
            return (totalPrice * appliedCoupon.value) / 100;
        } else {
            return Math.min(totalPrice, appliedCoupon.value);
        }
    }, [totalPrice, appliedCoupon]);

    const checkShippingPayment = () => {
        if (Number(currentShipping.freeThreshold) === 0) return Number(currentShipping.cost)
        if (originalPrice >= Number(currentShipping.freeThreshold)) return 0;
        return Number(currentShipping.cost);
    }

    // کسر کد تخفیف و اضافه کردن هزینه ارسال به مبلغ نهایی
    const payableAmount = Math.max(0, totalPrice - couponDiscountAmount) + checkShippingPayment();
    const visibleItems = showAllItems ? cartItems : cartItems.slice(0, 5);

    // هندلر اعمال کد تخفیف تستی
    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        setCouponError("");
        if (!couponCode.trim()) return;
        const body = {
            code: couponCode.trim(),
            orderAmount: totalPrice,
        };
        discountMutate(body, {
            onSuccess: (res: any) => {
                const data = res?.data || res;
                if (data) {
                    setAppliedCoupon({
                        code: couponCode.toUpperCase(),
                        type: data.type,
                        value: Number(data.value),
                    });
                    setCouponCode("");
                    setDiscount && setDiscount(data.code)
                }
            },
            onError: (err: any) => {
                setCouponError(err?.response?.data?.message || "کد تخفیف وارد شده معتبر نیست.");
            },
        });
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
        setDiscount && setDiscount('')
    };
    if (loadingShipping) <LoadingPage />
    return (
        <MotionWrapper delay={0.5} preset="slideLTR" className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24 shadow-xs">
                {/* هدر خلاصه سفارش */}
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h3 className="font-black text-lg flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-indigo-500" />
                        خلاصه پرداخت و سفارش
                    </h3>
                    <span className="text-xs bg-accent text-muted-foreground px-2.5 py-1 rounded-full font-bold">
                        {totalItems} کالا
                    </span>
                </div>

                {/* کارت نمایشی رسید پرداخت کاربر */}
                {showPayment && (
                    <div className="bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-xl p-3.5 mb-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <currentPayment.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                {currentPayment.name}
                            </span>
                            {currentPayment.badge && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    {currentPayment.badge}
                                </span>
                            )}
                        </div>
                        <div className="pt-1 border-t border-indigo-500/10 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3 text-indigo-500 shrink-0" />
                                <strong className="text-foreground font-semibold">
                                    {currentPayment.description}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* نمایش روش ارسال */}
                {showShipping && (
                    <div className="bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-xl p-3.5 mb-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                {currentShipping?.name}
                            </span>
                            <span className="inline-flex items-center text-xs font-black text-amber-600 dark:text-amber-400">
                                {checkShippingPayment() === 0
                                    ? "رایگان"
                                    : `${checkShippingPayment().toLocaleString()} تومان`}
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-amber-500/10 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>زمان تحویل تقریبی:</span>
                            </div>
                            <span className="font-semibold text-foreground">{currentShipping?.estimatedDays}</span>
                        </div>
                    </div>
                )}

                {/* لیست ریز کالاهای سبد خرید */}
                <div className="space-y-2.5 divide-y divide-border/40 text-xs mb-3">
                    {visibleItems.map((item) => {
                        const rawPrice = Number(item.variant?.price || 0);
                        const discount = item.variant?.discount;
                        let finalUnitPrice = rawPrice;

                        const isDiscountValid =
                            discount &&
                            discount.isActive &&
                            (!discount.endsAt || new Date(discount.endsAt) > new Date());

                        if (isDiscountValid) {
                            if (discount.type === "percentage") {
                                finalUnitPrice = rawPrice - rawPrice * (discount.value / 100);
                            } else if (
                                discount.type === "fixed" ||
                                discount.type === "amount"
                            ) {
                                finalUnitPrice = Math.max(0, rawPrice - discount.value);
                            }
                        }

                        return (
                            <div
                                key={item.id}
                                className="pt-2.5 first:pt-0 flex items-center justify-between gap-2"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                        {item.product.title}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground">
                                        {item.quantity} عدد{" "}
                                        {item.variant?.name ? `(${item.variant.name})` : ""}
                                    </span>
                                </div>
                                <div className="font-bold text-foreground shrink-0">
                                    {(finalUnitPrice * item.quantity).toLocaleString()} تومان
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* دکمه مشاهده بیشتر برای بیش از ۵ کالا */}
                {cartItems.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setShowAllItems(!showAllItems)}
                        className="w-full flex items-center justify-center gap-1 text-xs text-primary font-bold py-1.5 mb-3 hover:bg-accent/50 rounded-xl transition-colors cursor-pointer"
                    >
                        {showAllItems ? (
                            <>
                                <span>بستن لیست کالاها</span>
                                <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                <span>مشاهده {cartItems.length - 5} کالای دیگر</span>
                                <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>
                )}

                {/* فرم ثبت کد تخفیف */}
                {showDiscountForm && (
                    <div className="border-t border-border pt-3 mb-3">
                        {!appliedCoupon ? (
                            <div className="relative flex items-center bg-muted/40 hover:bg-muted/60 focus-within:bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl p-1.5 transition-all duration-200 shadow-xs">
                                <div className="flex items-center justify-center pl-2 pr-2.5 text-muted-foreground transition-colors group-focus-within:text-primary">
                                    <Tag className="w-4 h-4 shrink-0" />
                                </div>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="کد تخفیف را وارد کنید..."
                                    className="w-full bg-transparent text-xs font-semibold text-foreground placeholder:text-muted-foreground/70 focus:outline-none pr-1 pl-2 uppercase tracking-wider"
                                />
                                {couponCode && (
                                    <button
                                        type="button"
                                        onClick={() => setCouponCode("")}
                                        className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors ml-1 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode.trim()}
                                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150 shrink-0 cursor-pointer shadow-xs"
                                >
                                    {pendingValidate ? <div className="spinner" /> : 'اعمال کد'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs">
                                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                                    <Tag className="w-3.5 h-3.5" />
                                    کد {appliedCoupon.code} (
                                    {appliedCoupon.type === "percentage"
                                        ? `${appliedCoupon.value}٪`
                                        : `${appliedCoupon.value.toLocaleString()} تومان`}
                                    ) اعمال شد
                                </span>
                                <button
                                    type="button"
                                    onClick={handleRemoveCoupon}
                                    className="text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {couponError && (
                            <p className="text-[11px] text-rose-500 mt-1.5 font-medium">{couponError}</p>
                        )}
                    </div>
                )}
                {/* آمار قیمت، تفکیک سود تخفیف‌ها و مبلغ نهایی */}
                <div className="space-y-2.5 text-sm border-t border-border pt-4">
                    <div className="flex justify-between text-muted-foreground text-xs">
                        <span>مجموع قیمت کالاها ({totalItems})</span>
                        <span className="text-foreground font-semibold">
                            {originalPrice.toLocaleString()} تومان
                        </span>
                    </div>

                    {/* نمایش تفکیکی سود تخفیف محصولات */}
                    {productsDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/15 p-2 rounded-xl text-xs font-bold items-center">
                            <span className="flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> سود شما روی کالاها
                            </span>
                            <span>{productsDiscount.toLocaleString()} تومان</span>
                        </div>
                    )}

                    {/* نمایش تفکیکی سود کد تخفیف */}
                    {appliedCoupon && couponDiscountAmount > 0 && (
                        <div className="flex justify-between text-indigo-600 bg-indigo-500/10 dark:bg-indigo-500/15 p-2 rounded-xl text-xs font-bold items-center">
                            <span className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> سود با کد {appliedCoupon.code}
                                <span>{appliedCoupon.type === 'percentage' && appliedCoupon.value}%</span>
                            </span>
                            <span>{couponDiscountAmount.toLocaleString()} تومان</span>
                        </div>
                    )}

                    {showShipping && (
                        <div className="flex justify-between text-muted-foreground text-xs">
                            <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> هزینه ارسال
                            </span>
                            <span className="text-foreground font-bold">
                                {checkShippingPayment() === 0
                                    ? "رایگان"
                                    : `${checkShippingPayment().toLocaleString()} تومان`}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between text-base font-black border-t border-border pt-3 mt-3">
                        <span>مبلغ پرداختی شما</span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                            {payableAmount.toLocaleString()} تومان
                        </span>
                    </div>
                </div>

                {/* دکمه‌های عملیاتی */}
                <div className="gap-2 flex flex-col mt-6">
                    <CustomButton
                        classDiv="w-full"
                        className="w-full"
                        onClick={onSubmit}
                        iconStart={btnIcon ? btnIcon : <Plus className="w-4 h-4" />}
                        name={btnName ? btnName : "ادامه سفارش"}
                        color="white"
                        isPending={pendingDelete || pendingUpdate || pendingValidate || pendingOrder}
                    />
                    <CustomButton
                        classDiv="w-full"
                        className="w-full"
                        iconEnd={<ArrowLeft className="w-4 h-4" />}
                        name="بازگشت به فروشگاه"
                        link="/products"
                        color="gray"
                        isPending={pendingDelete || pendingUpdate || pendingValidate || pendingOrder}
                    />
                </div>

                {/* بنر اطمینان خرید */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ضمانت اصالت کالا و بازگشت وجه</span>
                </div>
            </div>
        </MotionWrapper>
    );
}