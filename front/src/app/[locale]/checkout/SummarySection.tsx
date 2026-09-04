"use client";

import React, { useMemo, useState } from "react";
import {
    DollarSign,
    Truck,
    ShieldCheck,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    CreditCard,
    CheckCircle2,
    Receipt,
    Hash,
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
import { toast } from "sonner";

// شناسه‌های این لیست باید دقیقا با enum سمت بک‌اند (paymentMethod در CreateOrderDto) یکی باشد
const PAYMENT_METHODS = [
    {
        id: 'zarinpal',
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
        id: 'card',
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

// خلاصه‌ی شیوه ارسال انتخاب‌شده برای یک فروشگاه (محاسبه‌شده در صفحه checkout و به این کامپوننت پاس داده می‌شود)
export interface StoreShippingSelection {
    storeId: string;
    storeName: string;
    methodName?: string;
    cost: number | null;
    estimatedDays?: number | string;
}

// ---------------------------------------------------------------------------
// شکل واقعی پاسخ useValidateDiscount (طبق نمونه‌ای که فرستادید):
// {
//   eligible: boolean,            // اگر false باشد یعنی کد قابل استفاده نیست (مثلا مبلغ خرید کمتر از minOrderAmount)
//   discountId, code, type,       // type: 'fixed' | 'percentage'
//   status,                       // 'STORE' یعنی تخفیف به‌صورت جداگانه روی هر فروشگاه محاسبه شده
//   subtotal, discountAmount, totalAfterDiscount,   // اعداد کل سفارش (به‌صورت رشته می‌آیند)
//   minOrderAmount, maxDiscount,
//   stores: [{ storeId, storeName, subtotal, discountAmount, totalAfterDiscount, carts: [...] }]
// }
// یعنی هر فروشگاه هم discountAmount مخصوص خودش را دارد؛ بعضی فروشگاه‌ها ممکن است
// اصلاً در محاسبه تخفیف سهمی نداشته باشند (discountAmount صفر یا فروشگاه اصلاً در آرایه نباشد).
// ---------------------------------------------------------------------------

interface DiscountStoreBreakdown {
    storeId: string;
    storeName: string;
    subtotal?: string | number;
    discountAmount?: string | number;
    totalAfterDiscount?: string | number;
    carts: any[];
}

interface DiscountedCartResponse {
    eligible: boolean;
    discountId?: string;
    id?: string;
    code: string;
    type?: string;
    status?: string; // 'STORE' | ...
    subtotal?: string | number;
    discountAmount: string | number; // سود کل کد تخفیف روی کل سفارش
    totalAfterDiscount: string | number; // مبلغ نهایی سبد بعد از اعمال کد (قبل از هزینه ارسال)
    minOrderAmount?: string | number;
    maxDiscount?: string | number;
    stores: DiscountStoreBreakdown[];
}

interface SummarySectionProps {
    storeShippingSelections?: StoreShippingSelection[];
    paymentId?: string;
    onSubmit?: () => void;
    btnName?: string;
    showShipping?: boolean;
    showPayment?: boolean;
    btnIcon?: React.ReactNode;
    pendingOrder?: boolean;
    showDiscountForm?: boolean;
    setDiscount?: (discountId: string | null) => void;
}

export function SummarySection({
    storeShippingSelections = [],
    onSubmit,
    showPayment = false,
    showShipping = false,
    showDiscountForm = false,
    btnName,
    paymentId,
    btnIcon,
    pendingOrder,
    setDiscount,
}: SummarySectionProps) {
    const { data: cartData } = useCart();
    const { isPending: pendingDelete } = useDeleteFromCart();
    const { isPending: pendingUpdate } = useUpdateCart();
    const [showAllItems, setShowAllItems] = useState(false);
    const { mutate: discountMutate, isPending: pendingValidate } = useValidateDiscount();

    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountedCartResponse | null>(null);
    const [couponError, setCouponError] = useState("");

    // useCart سبد را بر اساس فروشگاه گروه‌بندی برمی‌گرداند: { stores: [{ storeId, storeName, carts }], totalItems, totalPrice }
    // برای نمایش در این کامپوننت، کالاهای همه فروشگاه‌ها را در یک لیست صاف می‌کنیم
    const baseCartItems = useMemo(() => (cartData?.stores || []).flatMap((s: any) => s.carts || []), [cartData]);
    const baseTotalPrice = cartData?.totalPrice || 0;
    const baseTotalItems = cartData?.totalItems || 0;

    // اگر کد تخفیف اعمال شده باشد، دیتای جدید (شامل قیمت‌های تخفیف‌خورده) جایگزین دیتای پایه سبد می‌شود
    const cartItems = useMemo(
        () => (appliedDiscount ? appliedDiscount.stores.flatMap((s) => s.carts || []) : baseCartItems),
        [appliedDiscount, baseCartItems]
    );
    // تخفیف تعداد کالاها را تغییر نمی‌دهد، پس همیشه از تعداد پایه سبد استفاده می‌کنیم
    const totalItems = baseTotalItems;
    // مبلغ نهایی سبد (بدون هزینه ارسال): در صورت اعمال کد از totalAfterDiscount بک‌اند می‌آید
    // const totalPrice = appliedDiscount ? Number(appliedDiscount.totalAfterDiscount) : baseTotalPrice;
    const totalPrice = appliedDiscount ? Number(appliedDiscount.totalAfterDiscount) : baseTotalPrice;

    const currentPayment = PAYMENT_METHODS.find((i) => i.id === paymentId) || PAYMENT_METHODS[0];

    // جمع هزینه ارسال همه فروشگاه‌ها (اگر شیوه‌ای برای فروشگاهی انتخاب نشده باشد، فعلا صفر در نظر گرفته می‌شود)
    const totalShippingCost = useMemo(
        () => storeShippingSelections.reduce((sum, s) => sum + (s.cost || 0), 0),
        [storeShippingSelections]
    );
    const hasIncompleteShipping = showShipping && storeShippingSelections.some((s) => s.cost === null);

    // محاسبه قیمت اولیه و تخفیف کالاها (تخفیف‌های خود محصول، جدا از کد تخفیف)
    // نکته: هر آیتم سبد از بک‌اند خودش totalPrice و totalDiscount (تخفیف‌خورده و برای کل quantity) را دارد،
    // پس دیگر لازم نیست type/isActive/endsAt تخفیف را خودمان دوباره حساب کنیم؛ همان مقادیر آماده را جمع می‌زنیم.
    const { originalPrice, productsDiscount } = useMemo(() => {
        return cartItems.reduce(
            (acc: { originalPrice: number; productsDiscount: number }, item: any) => {
                const itemTotalPrice = Number(item.totalPrice || 0);
                const itemTotalDiscount = Number(item.totalDiscount || 0);
                acc.originalPrice += itemTotalPrice + itemTotalDiscount;
                acc.productsDiscount += itemTotalDiscount;
                return acc;
            },
            { originalPrice: 0, productsDiscount: 0 }
        );
    }, [cartItems]);

    // سودی که کد تخفیف ایجاد کرده؛ مستقیم از discountAmount بک‌اند خوانده می‌شود (دقیق‌تر از تفریق دستی)
    const couponSavings = appliedDiscount ? Number(appliedDiscount.discountAmount || 0) : 0;

    // مبلغ نهایی قابل پرداخت: قیمت سبد (که در صورت وجود کد تخفیف از قبل تخفیف‌خورده است) + هزینه ارسال
    const payableAmount = Math.max(0, totalPrice) + totalShippingCost;

    const visibleItems = showAllItems ? cartItems : cartItems.slice(0, 6);

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        setCouponError("");
        if (!couponCode.trim()) return;
        const body = {
            code: couponCode.trim(),
            stores: cartData?.stores
        };
        discountMutate(body, {
            onSuccess: (res: any) => {
                const data: DiscountedCartResponse | undefined = res?.data ?? res;
                console.log(res);

                // کد اصلاً پیدا نشده یا پاسخ خالی است
                if (!data) {
                    const message = "کد تخفیف وارد شده معتبر نیست.";
                    setCouponError(message);
                    toast.error(message);
                    return;
                }

                // کد پیدا شده ولی شرایط استفاده از آن فراهم نیست (مثلا مبلغ خرید به حد نصاب نرسیده)
                if (!data.eligible) {
                    let message = "این کد تخفیف در حال حاضر برای شما قابل استفاده نیست.";
                    if (data.minOrderAmount) {
                        message = `این کد فقط برای خریدهای بالای ${Number(data.minOrderAmount).toLocaleString()} تومان معتبر است.`;
                    }
                    setCouponError(message);
                    toast.error(message);
                    return;
                }

                setAppliedDiscount(data);
                setCouponCode("");
                setDiscount?.(data.discountId || data.id || data.code || couponCode.toUpperCase());
            },
            onError: (err: any) => {
                const message = err?.response?.data?.message || "کد تخفیف وارد شده معتبر نیست.";
                setCouponError(message);
                toast.error(message);
            },
        });
    };

    const handleRemoveCoupon = () => {
        setAppliedDiscount(null);
        setCouponError("");
        setDiscount?.(null);
    };

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

                {/* کارت نمایشی روش پرداخت انتخابی */}
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
                                <strong className="text-foreground font-semibold">{currentPayment.description}</strong>
                            </div>
                        </div>
                    </div>
                )}
                {/* نمایش شیوه ارسال هر فروشگاه */}
                {showShipping && storeShippingSelections.length > 0 && (
                    <div className="bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-xl p-3.5 mb-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            روش ارسال فروشگاه‌ها
                        </div>
                        <div className="divide-y divide-amber-500/10">
                            {storeShippingSelections.map((s) => (
                                <div key={s.storeId} className="flex items-center justify-between gap-2 py-1.5 first:pt-0.5 text-[11px]">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">{s.storeName}</p>
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            {s.methodName || 'هنوز انتخاب نشده'}
                                            {s.estimatedDays && (
                                                <span className="flex items-center gap-0.5">
                                                    {s.estimatedDays} روز کاری
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="font-black text-amber-600 dark:text-amber-400 shrink-0">
                                        {s.cost === null ? '—' : s.cost === 0 ? 'رایگان' : `${s.cost.toLocaleString()} تومان`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* لیست ریز کالاهای سبد خرید */}
                <div className="space-y-2.5 divide-y divide-border/40 text-xs mb-3">
                    {visibleItems.map((item: any) => (
                        <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{item.product.title}</p>
                                <span className="text-[10px] text-muted-foreground">
                                    {item.quantity} عدد {item.variant?.name ? `(${item.variant.name})` : ""}
                                </span>
                            </div>
                            <div className="font-bold text-foreground shrink-0">
                                {Number(item.totalPrice || 0).toLocaleString()} تومان
                            </div>
                        </div>
                    ))}
                </div>

                {/* دکمه مشاهده بیشتر برای بیش از ۶ کالا */}
                {cartItems.length > 6 && (
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
                                <span>مشاهده {cartItems.length - 6} کالای دیگر</span>
                                <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>
                )}

                {/* فرم ثبت کد تخفیف */}
                {showDiscountForm && (
                    <div className="border-t border-border pt-3 mb-3">
                        {!appliedDiscount ? (
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
                                    کد {appliedDiscount.code} اعمال شد
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
                        {couponError && <p className="text-[11px] text-rose-500 mt-1.5 font-medium">{couponError}</p>}
                    </div>
                )}
                {appliedDiscount && (cartData?.stores?.length ?? 0) > 0 && (
                    <div className="mt-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-1.5">
                        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" /> سهم هر فروشگاه از این کد تخفیف
                        </p>
                        <div className="divide-y divide-indigo-500/10">
                            {(cartData?.stores || []).map((store: any) => {
                                const match = appliedDiscount.stores.find((s) => s.storeId === store.storeId);
                                const storeDiscount = Number(match?.discountAmount || 0);
                                return (
                                    <div key={store.storeId} className="flex items-center justify-between gap-2 py-1 text-[11px]">
                                        <span className="text-muted-foreground truncate">{store.storeName}</span>
                                        {storeDiscount > 0 ? (
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                                                {storeDiscount.toLocaleString()} تومان تخفیف
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/70 shrink-0">بدون تخفیف</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* آمار قیمت، تفکیک سود تخفیف‌ها و مبلغ نهایی */}
                <div className="space-y-2.5 text-sm border-t border-border pt-4">
                    <div className="flex justify-between text-muted-foreground text-xs">
                        <span>مجموع قیمت کالاها ({totalItems})</span>
                        <span className="text-foreground font-semibold">{originalPrice.toLocaleString()} تومان</span>
                    </div>

                    {/* سود روی کالاها (تخفیف خود محصول) */}
                    {productsDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/15 p-2 rounded-xl text-xs font-bold items-center">
                            <span className="flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> سود شما روی کالاها
                            </span>
                            <span>{productsDiscount.toLocaleString()} تومان</span>
                        </div>
                    )}

                    {/* سود کد تخفیف (بر اساس دیتای جدیدی که بک‌اند برگردانده) */}
                    {appliedDiscount && couponSavings > 0 && (
                        <div className="flex justify-between text-indigo-600 bg-indigo-500/10 dark:bg-indigo-500/15 p-2 rounded-xl text-xs font-bold items-center">
                            <span className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> سود با کد {appliedDiscount.code}
                            </span>
                            <span>{couponSavings.toLocaleString()} تومان</span>
                        </div>
                    )}

                    {showShipping && (
                        <div className="flex justify-between text-muted-foreground text-xs">
                            <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> هزینه ارسال
                            </span>
                            <span className="text-foreground font-bold">
                                {hasIncompleteShipping
                                    ? 'در انتظار انتخاب'
                                    : totalShippingCost === 0
                                        ? "رایگان"
                                        : `${totalShippingCost.toLocaleString()} تومان`}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between text-base font-black border-t border-border pt-3 mt-3">
                        <span>مبلغ پرداختی شما</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{payableAmount.toLocaleString()} تومان</span>
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
