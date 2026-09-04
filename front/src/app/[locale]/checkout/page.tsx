'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Truck,
    MapPin,
    Check,
    Plus,
    Pencil,
    ShieldCheck,
    Wallet,
    ArrowRightLeft,
    Banknote,
    Clock,
    ShoppingBag,
    Store,
    Package,
} from 'lucide-react';
import { useDefaultAddress } from '@/hooks/address.hook';
import CustomButton from '@/components/CustomButton';
import { useCart } from '@/hooks/cart.hook';
import { useCreateOrder } from '@/hooks/order.hook';
import StepperPayment from '@/components/StepperPayment';
import { toast } from 'sonner';
import { useShippingOrder } from '@/hooks/shipping.hook';
import AddressModal from './AddressModal';
import { StoreShippingSelection, SummarySection } from './SummarySection';

/**
 * ============================================================================
 * نکات و فرض‌های مهم (لطفاً قبل از استفاده بررسی کنید)
 * ============================================================================
 * 1) useCart از قبل خروجی را بر اساس فروشگاه گروه‌بندی می‌کند:
 *    data: { stores: { storeId, storeName, storeNameEn, storeSlug, carts: [...] }[], totalItems, totalPrice }
 *    پس دیگر نیازی به حدس زدن storeId از روی هر آیتم نبود؛ مستقیم از data.stores استفاده شده.
 * 2) useShippingOrder فرض شده آرایه‌ای از { id: storeId, storeShippingMethods }
 *    برمی‌گرداند (دقیقا همان چیزی که فرستادید). چون storeId اینجا و storeId
 *    داخل data.stores باید یکی باشند تا اتصال شیوه ارسال به فروشگاه درست کار کند.
 * 3) محاسبه قیمت/زمان هر شیوه ارسال طبق توضیح شما: اول rates[0] چک می‌شود،
 *    اگر نبود از defaultPrice/maxDays استفاده می‌شود (تابع getEffectiveShipping).
 * ============================================================================
 */

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

// گرادیان‌های رنگی برای هدر هر فروشگاه (به ترتیب چرخشی استفاده می‌شوند)
const storeGradients = [
    'from-cyan-500/15 via-blue-500/10 to-transparent border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    'from-violet-500/15 via-purple-500/10 to-transparent border-violet-500/30 text-violet-600 dark:text-violet-400',
    'from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    'from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/30 text-amber-600 dark:text-amber-400',
    'from-rose-500/15 via-pink-500/10 to-transparent border-rose-500/30 text-rose-600 dark:text-rose-400',
];

// ---------------------------------------------------------------------------
// تایپ‌های مربوط به شیوه ارسال (طبق دیتایی که فرستادید)
// ---------------------------------------------------------------------------
type ShippingRate = {
    deliveryMaxDays?: number;
    price?: string | number;
};

type StoreShippingMethod = {
    id: string;
    description?: string;
    descriptionEn?: string;
    phrase?: string;
    minDays?: number;
    maxDays?: number;
    defaultPrice?: string | number;
    rates?: ShippingRate[];
    shippingMethod: {
        isFreeMethod?: boolean;
        name: string;
        nameEn?: string;
    };
};

type StoreShippingGroup = {
    id: string; // شناسه فروشگاه
    storeShippingMethods: StoreShippingMethod[];
};

// قیمت و حداکثر زمان تحویل واقعی یک شیوه ارسال را حساب می‌کند
function getEffectiveShipping(method?: StoreShippingMethod | null) {
    if (!method) return { price: 0, maxDays: undefined as number | undefined };
    const firstRate = method.rates && method.rates.length > 0 ? method.rates[0] : null;
    const isFree = !!method.shippingMethod?.isFreeMethod;
    const price = isFree ? 0 : Number(firstRate?.price ?? method.defaultPrice ?? 0);
    const maxDays = firstRate?.deliveryMaxDays ?? method.maxDays;
    return { price, maxDays };
}

export default function CheckoutPage() {
    const { data: defaultAddress, isLoading: isLoadingDefault, refetch: refetchDefault } = useDefaultAddress();
    const { refetch: refetchCart, data } = useCart();
    const { mutate: orderCreate, isPending: isPendingOrder } = useCreateOrder();
    const { data: shippingData } = useShippingOrder(defaultAddress?.provinceId) as { data: StoreShippingGroup[] | undefined };
    const [step, setStep] = useState<'checkout' | 'success'>('checkout');
    const [paymentMethod, setPaymentMethod] = useState('zarinpal');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [discountId, setDiscountId] = useState<string | null>(null);
    // انتخاب شیوه ارسال هر فروشگاه: { [storeId]: shippingMethodId }
    const [shippingSelections, setShippingSelections] = useState<Record<string, string>>({});
    // یادداشت هر فروشگاه: { [storeId]: note }
    const [storeNotes, setStoreNotes] = useState<Record<string, string>>({});

    // اگر آدرس پیش‌فرض وجود نداشت، به محض مشخص شدن این موضوع مودال ثبت آدرس را باز کن
    useEffect(() => {
        if (!isLoadingDefault && !defaultAddress) {
            setShowAddressModal(true);
        }
    }, [isLoadingDefault, defaultAddress]);

    // گروه‌بندی سبد خرید بر اساس فروشگاه — useCart همین‌طوری گروه‌بندی‌شده برمی‌گرداند (data.stores)
    const storeGroups = useMemo(() => {
        return (data?.stores || []).map((store: any) => ({
            storeId: store.storeId,
            storeName: store.storeName,
            items: store.carts || [],
        }));
    }, [data]);

    // اتصال هر گروه فروشگاهی به شیوه‌های ارسال مخصوص همان فروشگاه
    const storesWithShipping = useMemo(() => {
        return storeGroups.map((group) => {
            const match = shippingData?.find((s) => s.id === group.storeId);
            return { ...group, shippingMethods: match?.storeShippingMethods || [] };
        });
    }, [storeGroups, shippingData]);

    // خلاصه شیوه ارسال انتخاب‌شده هر فروشگاه، برای ارسال به SummarySection
    const shippingSummary: StoreShippingSelection[] = useMemo(() => {
        return storesWithShipping.map((store) => {
            const methodId = shippingSelections[store.storeId];
            const method = store.shippingMethods.find((m) => m.id === methodId) || null;
            const { price, maxDays } = getEffectiveShipping(method);
            return {
                storeId: store.storeId,
                storeName: store.storeName,
                methodName: method?.shippingMethod?.name,
                cost: method ? price : null,
                estimatedDays: maxDays,
            };
        });
    }, [storesWithShipping, shippingSelections]);

    const handleSubmitOrder = () => {
        if (!defaultAddress) {
            toast.error('لطفاً آدرس تحویل را ثبت کنید');
            setShowAddressModal(true);
            return;
        }

        // بررسی این‌که برای همه فروشگاه‌ها شیوه ارسال انتخاب شده باشد
        const storeWithoutShipping = storesWithShipping.find((s) => !shippingSelections[s.storeId]);
        if (storeWithoutShipping) {
            toast.error(`لطفاً شیوه ارسال «${storeWithoutShipping.storeName}» را انتخاب کنید`);
            return;
        }

        const orders = storesWithShipping.map((store) => {
            const methodId = shippingSelections[store.storeId];
            const method = store.shippingMethods.find((m) => m.id === methodId);
            const { price, maxDays } = getEffectiveShipping(method);
            return {
                storeId: store.storeId,
                shippingId: methodId,
                shippingName: method?.shippingMethod?.name || '',
                shippingCost: String(price),
                note: storeNotes[store.storeId] || '',
                shippingTime: maxDays || ''
            };
        });
        const orderPayload = {
            addressId: defaultAddress.id,
            orders,
            discountId: discountId || null,
            paymentMethod,

        };        
        orderCreate(orderPayload, {
            onSuccess: ({ data }: any) => {
                console.log(data);
                
                // setOrderNumber(data?.orderNumber || 'ORD-' + Math.floor(100000 + Math.random() * 900000));
                // setStep('success');
                // refetchCart();
            },
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <StepperPayment currentStep={step === 'success' ? 'payment' : 'shipping'} />
            <AnimatePresence mode="wait">
                {step === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-3xl p-6 sm:p-8 text-center max-w-lg mx-auto shadow-xl"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-500">
                            <Check className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl font-bold mb-2">سفارش شما با موفقیت ثبت شد!</h1>
                        <p className="text-xs text-muted-foreground mb-6">
                            کد پیگیری سفارش: <span className="font-mono font-bold text-foreground select-all">{orderNumber}</span>
                        </p>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-right mb-6 space-y-2.5">
                            <p className="text-[11px] text-foreground font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                ایمیل تأیید به همراه جزئیات فاکتور برای شما ارسال شد.
                            </p>
                            <p className="text-[11px] text-foreground font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                پیامک وضعیت سفارش و کد رهگیری پستی به‌محض تحویل به پست ارسال می‌شود.
                            </p>
                            <p className="text-[11px] text-foreground font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                می‌توانید مراحل پردازش را از بخش «پیگیری سفارش» در حساب کاربری دنبال کنید.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <CustomButton link="/profile/orders" color="white" name="پیگیری سفارش" iconEnd={<ShoppingBag className="w-4 h-4" />} />
                            <CustomButton link="/" color="gray" name="بازگشت به فروشگاه" iconEnd={<Store className="w-4 h-4" />} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        <div className="lg:col-span-7 space-y-5">
                            {/* ۱. آدرس تحویل */}
                            <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-3.5 border-b border-border/60 pb-3">
                                    <h2 className="text-xs font-bold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        محل تحویل مرسوله
                                    </h2>
                                    {defaultAddress && (
                                        <button
                                            onClick={() => setShowAddressModal(true)}
                                            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> افزودن آدرس
                                        </button>
                                    )}
                                </div>

                                {isLoadingDefault ? (
                                    <div className="h-20 bg-muted animate-pulse rounded-xl" />
                                ) : defaultAddress ? (
                                    <div className="bg-accent/30 border border-border rounded-xl p-3.5">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs">{defaultAddress.fullName}</span>
                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                                                        {defaultAddress.title || 'آدرس اصلی'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">{defaultAddress.address}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {defaultAddress.province.name}، {defaultAddress.city.name} | همراه: {defaultAddress.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-muted/40 border border-dashed border-border rounded-xl p-4 text-center">
                                        <p className="text-xs text-muted-foreground mb-2">آدرسی انتخاب نشده است</p>
                                        <CustomButton onClick={() => setShowAddressModal(true)} color="white" name="افزودن آدرس جدید" iconEnd={<Plus />} />
                                    </div>
                                )}
                            </section>

                            {/* ۲. یک کارت مجزا برای هر فروشگاه: محصولات + شیوه ارسال مخصوص همان فروشگاه */}
                            {storesWithShipping.map((store, idx) => {
                                const gradient = storeGradients[idx % storeGradients.length];
                                const selectedMethodId = shippingSelections[store.storeId];

                                return (
                                    <section key={store.storeId} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                        {/* هدر گرادیانی فروشگاه */}
                                        <div className={`bg-linear-to-br ${gradient} border-b px-4 py-3 flex items-center justify-between`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-background/70 flex items-center justify-center shrink-0">
                                                    <Store className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold">{store.storeName}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-background/60 border border-border/40 backdrop-blur-sm">
                                                <Package className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                                <span>{store.items.length} کالا</span>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* لیست فشرده محصولات همین فروشگاه */}
                                            <div className="space-y-1.5">
                                                {store.items.map((item: any) => (
                                                    <div key={item.id} className="flex items-center justify-between gap-2 text-[11px]">
                                                        <span className="text-foreground/90 truncate flex-1">{item.product?.title}</span>
                                                        <span className="text-muted-foreground shrink-0">
                                                            {item.quantity} عدد{item.variant?.name ? ` (${item.variant.name})` : ''}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* شیوه ارسال مخصوص این فروشگاه */}
                                            <div className="pt-3 border-t border-border/60">
                                                <h4 className="text-[11px] font-bold mb-2.5 flex items-center gap-1.5">
                                                    <Truck className="w-3.5 h-3.5 text-primary" />
                                                    شیوه ارسال {store.storeName}
                                                </h4>
                                                {store.shippingMethods.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {store.shippingMethods.map((method) => {
                                                            const { price, maxDays } = getEffectiveShipping(method);
                                                            const isSelected = selectedMethodId === method.id;
                                                            return (
                                                                <label
                                                                    key={method.id}
                                                                    onClick={() =>
                                                                        setShippingSelections((prev) => ({ ...prev, [store.storeId]: method.id }))
                                                                    }
                                                                    className={`relative flex flex-col justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                                        ? 'bg-primary/5 border-primary shadow-sm'
                                                                        : 'bg-background border-border hover:border-muted-foreground/40'
                                                                        }`}
                                                                >
                                                                    <div>
                                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                                            <span className="text-[11px] font-bold">{method.shippingMethod?.name}</span>
                                                                            {method.phrase && (
                                                                                <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium shrink-0">
                                                                                    {method.phrase}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {method.description && (
                                                                            <p className="text-[10px] text-muted-foreground mb-1">{method.description}</p>
                                                                        )}
                                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                            <Clock className="w-3 h-3 text-muted-foreground/70" />
                                                                            {maxDays ? `تحویل ${method.minDays || 1} تا ${maxDays} روز کاری` : 'زمان تحویل نامشخص'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
                                                                        <span className="text-[11px] font-bold text-primary">
                                                                            {price === 0 ? 'رایگان' : `${price.toLocaleString()} تومان`}
                                                                        </span>
                                                                        <div
                                                                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                                                                                }`}
                                                                        >
                                                                            {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground stroke-3" />}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] text-rose-500">شیوه ارسالی برای این فروشگاه یافت نشد.</p>
                                                )}
                                            </div>

                                            {/* یادداشت مخصوص این فروشگاه */}
                                            <div>
                                                <textarea
                                                    rows={2}
                                                    value={storeNotes[store.storeId] || ''}
                                                    onChange={(e) => setStoreNotes((prev) => ({ ...prev, [store.storeId]: e.target.value }))}
                                                    placeholder={`یادداشت برای سفارش ${store.storeName} (مثلا: زنگ دوم، تحویل به نگهبانی)...`}
                                                    className="w-full bg-muted/40 border border-border rounded-xl p-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                );
                            })}

                            {/* ۳. شیوه پرداخت (یکسان برای کل سفارش) */}
                            <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                <h2 className="text-xs font-bold mb-3 flex items-center gap-2 border-b border-border/60 pb-3">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    شیوه پرداخت
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {PAYMENT_METHODS.map((pm) => {
                                        const isSelected = paymentMethod === pm.id;
                                        const IconComponent = pm.icon;
                                        return (
                                            <label
                                                key={pm.id}
                                                onClick={() => setPaymentMethod(pm.id)}
                                                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-primary/5 border-primary shadow-sm'
                                                    : 'bg-background border-border hover:border-muted-foreground/40'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold">{pm.name}</span>
                                                        {pm.badge && (
                                                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                                                {pm.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{pm.description}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>

                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>اطلاعات شما به صورت امن و رمزنگاری شده پردازش می‌شوند.</span>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="sticky top-6">
                                <SummarySection
                                    setDiscount={setDiscountId}
                                    showDiscountForm
                                    pendingOrder={isPendingOrder}
                                    btnIcon={<ShoppingBag className="w-4 h-4" />}
                                    onSubmit={handleSubmitOrder}
                                    btnName="ثبت سفارش"
                                    showPayment
                                    showShipping
                                    paymentId={paymentMethod}
                                    storeShippingSelections={shippingSummary}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AddressModal open={showAddressModal} onClose={() => setShowAddressModal(false)} onSuccess={refetchDefault} />
        </div>
    );
}
