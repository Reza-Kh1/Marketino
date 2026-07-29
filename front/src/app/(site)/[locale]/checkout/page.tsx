'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Truck, MapPin, ArrowRight, Check, Plus, Pencil, X } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDefaultAddress, useCreateAddress } from '@/hooks/address.hook';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema, FormAddressSchema } from '@/schemas/address.schema';
import InputForm from '@/components/inputs/InputForm';
import CustomButton from '@/components/CustomButton';
import { useValidateDiscount } from '@/hooks/discount.hook';
import PendingApi from '@/components/PendingApi';
import { DiscountType } from '@/services/discount.service';
import { discountChange, useCart } from '@/hooks/cart.hook';
import { CartType } from '@/services/cart.service';
import ImgTag from '@/components/ImgTag';
import { useCreateOrder } from '@/hooks/order.hook';
const SHIPPING_METHODS = [
    { id: 'standard', name: 'پست پیشتاز', cost: 49_000, days: '۳-۵ روز کاری' },
    { id: 'express', name: 'پیک موتوری', cost: 89_000, days: 'همان روز (تهران)' },
    { id: 'free', name: 'ارسال رایگان', cost: 0, days: '۵-۷ روز کاری (سفارشات بالای ۵۰۰ هزار تومان)' },
];

const PAYMENT_METHODS = [
    { id: 'zarinpal', name: 'پرداخت آنلاین (زرین‌پال)', icon: CreditCard },
];

const computeTotals = (
    subtotal: number,
    shippingCost: number,
    discountData: DiscountType | null
) => {
    let discountAmount = 0;
    if (discountData) {
        discountAmount = discountData.type === 'percentage'
            ? Math.min((subtotal * discountData.value) / 100, discountData.maxDiscount || Infinity)
            : Math.min(discountData.value, subtotal);
    }
    const total = subtotal + shippingCost - discountAmount;
    return { subtotal, shippingCost, discount: discountAmount, total };
};
const getItemTotal = (item: CartType) => discountChange(item.variant.price, item.variant.discount).total * item.quantity;

export default function CheckoutPage() {
    const { data: defaultAddress, isLoading: isLoadingDefault, refetch: refetchDefault } = useDefaultAddress();
    const { data, isFetching, refetch } = useCart();
    const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
    const { mutate: validateDiscount, isPending: isPendingValidate } = useValidateDiscount();
    const { mutate: orderCreate, isPending: pendingOrder } = useCreateOrder();
    const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('shipping');
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('zarinpal');
    const [discountCode, setDiscountCode] = useState({ message: '', type: 'value', txt: '' });
    const [idAddress, setIdAdress] = useState<string | null>(null)
    const [discount, setDiscount] = useState<DiscountType | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [price, setPrice] = useState({
        total: 0,
        discount: 0,
        subtotal: 0,
        shippingCost: 0
    });
    const [shipping, setShipping] = useState({
        name: '',
        phone: '',
        email: '',
        province: '',
        city: '',
        address: '',
        postal: '',
        description: '',
    });
    const cartItems: CartType[] = data?.carts || [];

    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + getItemTotal(item), 0);
        const shippingCost = subtotal > 500_000 ? 0 : SHIPPING_METHODS.find(sm => sm.id === shippingMethod)?.cost || 0;
        setPrice(computeTotals(subtotal, shippingCost, discount));
    }, [data?.carts]);

    const { handleSubmit, register, reset, formState: { errors } } = useForm({
        resolver: zodResolver(AddressSchema),
        defaultValues: {
            title: "",
            fullName: "",
            phone: "",
            province: "",
            city: "",
            address: "",
            postalCode: "",
            isDefault: true,
            description: '',
        }
    });

    useEffect(() => {
        if (defaultAddress) {
            setShipping({
                name: defaultAddress.fullName || '',
                phone: defaultAddress.phone || '',
                email: '',
                province: defaultAddress.province || '',
                city: defaultAddress.city || '',
                address: defaultAddress.address || '',
                postal: defaultAddress.postalCode || '',
                description: '',
            });
            setIdAdress(defaultAddress.id)
        }
    }, [defaultAddress]);

    const onSubmitAddress = (data: FormAddressSchema) => {
        const body = {
            ...data,
            isDefault: true
        };
        createAddress(body, {
            onSuccess: ({ data }) => {
                toast.success('آدرس جدید با موفقیت ثبت شد');
                setShowAddressForm(false);
                reset();
                refetchDefault();
                setShipping({
                    name: data.fullName || '',
                    phone: data.phone || '',
                    email: '',
                    province: data.province || '',
                    city: data.city || '',
                    address: data.address || '',
                    postal: data.postalCode || '',
                    description: '',
                });
                setIdAdress(data.id)
            },
            onError: (error: any) => {
                const message = error?.response?.data?.message || 'خطا در ثبت آدرس';
                toast.error(message);
            }
        });
    };

    const handlePlaceOrder = async () => {
        if (!shipping.name || !shipping.phone || !shipping.city || !shipping.address) {
            toast.error('لطفاً اطلاعات ارسال را کامل کنید');
            return;
        }
        if (cartItems.length === 0) {
            toast.error('سبد خرید خالی است');
            return;
        }
        try {
            const orderData = {
                items: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    price: Number(discountChange(item.variant.price, item.variant.discount).total),
                })),
                shippingAddress: `${shipping.province}، ${shipping.city}، ${shipping.address}`,
                shippingName: shipping.name,
                shippingPhone: shipping.phone,
                shippingPostal: shipping.postal,
                shippingCity: shipping.city,
                shippingProvince: shipping.province,
                notes: shipping.description,
                shippingMethod: shippingMethod,
                addressId: idAddress,
                paymentMethod: paymentMethod,
                discountCode: discount ? discountCode.txt : null,
            };
            orderCreate(orderData, {
                onSuccess: ({ data }) => {
                    setOrderNumber(data.orderNumber || 'ثبت شد');
                    setStep('success');
                    refetch()
                }
            })
        } catch (err: any) {
            toast.error(err?.message || 'خطا در ثبت سفارش');
        }
    };

    const checkDiscount = () => {
        if (!discountCode.txt) {
            return setDiscountCode({ type: 'value', message: 'کد تخفیف خود را وارد کنید', txt: '' });
        }
        const body = {
            code: discountCode.txt,
            orderAmount: price.subtotal
        };
        validateDiscount(body, {
            onSuccess: ({ data }: { data: any }) => {
                setPrice(computeTotals(price.subtotal, price.shippingCost, data));
                setDiscount(data);
            }
        });
    };

    const removeDiscount = () => {
        setDiscount(null);
        setDiscountCode({ message: '', type: 'value', txt: '' });
        setPrice(computeTotals(price.subtotal, price.shippingCost, null));
    };

    const changeShipping = (id: string) => {
        setShippingMethod(id);
        const shippingCost = SHIPPING_METHODS.find(sm => sm.id === id)?.cost || 0;
        setPrice(computeTotals(price.subtotal, shippingCost, discount));
    };

    if (isFetching) return <PendingApi />;
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[
                        { key: 'cart', label: 'سبد خرید', num: 1 },
                        { key: 'shipping', label: 'ارسال', num: 2 },
                        { key: 'payment', label: 'پرداخت', num: 3 },
                    ].map((s, i) => (
                        <div key={s.key} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step === s.key || (step === 'success' && i <= 2) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {step === 'success' && i <= 2 ? '✓' : s.num}
                            </div>
                            <span className="text-sm font-bold hidden sm:block">{s.label}</span>
                            {i < 2 && <div className="w-8 h-0.5 bg-border hidden sm:block" />}
                        </div>
                    ))}
                </div>

                {step === 'success' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-3xl p-10 text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black mb-2">سفارش با موفقیت ثبت شد! 🎉</h1>
                        <p className="text-muted-foreground mb-2">شماره سفارش: <span className="font-mono font-bold">{orderNumber}</span></p>
                        <p className="text-sm text-muted-foreground mb-8">مبلغ قابل پرداخت: <span className="font-black text-primary">{price.total.toLocaleString()} تومان</span></p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link replace href="/profile/orders" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">پیگیری سفارش</Link>
                            <Link replace href="/" className="px-6 py-3 rounded-xl border border-border font-bold hover:bg-accent transition-colors">بازگشت به خانه</Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-black flex items-center gap-2">
                                        <MapPin className="w-5 h-5" /> اطلاعات ارسال
                                    </h2>
                                    {!showAddressForm && (
                                        <button
                                            onClick={() => setShowAddressForm(true)}
                                            className="text-sm text-primary font-bold flex items-center gap-1 hover:underline"
                                        >
                                            <Plus className="w-4 h-4" /> افزودن آدرس جدید
                                        </button>
                                    )}
                                </div>

                                {!showAddressForm && (
                                    <>
                                        {isLoadingDefault ? (
                                            <div className="h-32 bg-accent animate-pulse rounded-xl" />
                                        ) : defaultAddress ? (
                                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">{defaultAddress.fullName}</span>
                                                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{defaultAddress.title} (پیش‌فرض)</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{defaultAddress.phone}</p>
                                                        <p className="text-sm">{defaultAddress.address}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {defaultAddress.province}، {defaultAddress.city}
                                                            {defaultAddress.postalCode && ` - کد پستی: ${defaultAddress.postalCode}`}
                                                        </p>
                                                    </div>
                                                    <Link href={'/addresses'}>
                                                        <button
                                                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                                            title="ویرایش آدرس"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-center dark:bg-yellow-200/10 border dark:border-yellow-500/10">
                                                {/* ✅ اصلاح شد: متن قبلی به‌خاطر یک تایپوی احتمالی encoding به‌صورت
                                                    "آpresi پیش‌فرضی ثبت نشده است" نمایش داده می‌شد */}
                                                <p className="text-sm  dark:text-slate-300">آدرس پیش‌فرضی ثبت نشده است</p>
                                                <button
                                                    onClick={() => setShowAddressForm(true)}
                                                    className="mt-2 dark:text-yellow-700 text-yellow-700 text-sm font-bold hover:underline"
                                                >
                                                    ثبت آدرس جدید
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {showAddressForm && (
                                    <div className="border border-border rounded-xl p-4 mb-4 bg-background">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold">ثبت آدرس جدید</h3>
                                            <button
                                                onClick={() => {
                                                    setShowAddressForm(false);
                                                    reset();
                                                }}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                type="button"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleSubmit(onSubmitAddress)} className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <InputForm
                                                    name="title"
                                                    register={register}
                                                    label="عنوان (اختیاری)"
                                                    placeholder="مثال: خانه، محل کار"
                                                    error={errors.title}
                                                />
                                                <InputForm
                                                    name="fullName"
                                                    register={register}
                                                    label="نام کامل *"
                                                    placeholder="نام و نام خانوادگی"
                                                    error={errors.fullName}
                                                    required
                                                />
                                                <InputForm
                                                    name="phone"
                                                    register={register}
                                                    label="شماره تلفن *"
                                                    placeholder="09123456789"
                                                    error={errors.phone}
                                                    required
                                                />
                                                <InputForm
                                                    name="province"
                                                    register={register}
                                                    label="استان *"
                                                    placeholder="استان"
                                                    error={errors.province}
                                                    required
                                                />
                                                <InputForm
                                                    name="city"
                                                    register={register}
                                                    label="شهر *"
                                                    placeholder="شهر"
                                                    error={errors.city}
                                                    required
                                                />
                                                <InputForm
                                                    name="postalCode"
                                                    register={register}
                                                    label="کد پستی"
                                                    placeholder="کد پستی ۱۰ رقمی"
                                                    error={errors.postalCode}
                                                />
                                            </div>
                                            <InputForm
                                                name="address"
                                                register={register}
                                                label="آدرس کامل *"
                                                placeholder="خیابان، پلاک، واحد"
                                                error={errors.address}
                                                required
                                                type='textarea'
                                                rows={2}
                                            />
                                            <div className="flex gap-3 pt-2">
                                                <CustomButton
                                                    type="submit"
                                                    name={isCreating ? "در حال ثبت..." : "ذخیره آدرس"}
                                                    color="white"
                                                    isPending={isCreating}
                                                    disabled={isCreating}
                                                    className="flex-1"
                                                />
                                                <CustomButton
                                                    type="button"
                                                    name="انصراف"
                                                    color="gray"
                                                    onClick={() => {
                                                        setShowAddressForm(false);
                                                        reset();
                                                    }}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                )}
                                {defaultAddress && !showAddressForm && (
                                    <div>
                                        <InputForm
                                            name="description"
                                            label="توضیحات سفارش"
                                            value={shipping.description}
                                            onChange={(e) => setShipping({ ...shipping, description: e.target.value })}
                                            type='textarea'
                                            rows={2}
                                            placeholder="توضیحات اضافی برای سفارش..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> روش ارسال</h2>
                                <div className="space-y-3">
                                    {SHIPPING_METHODS.map(sm => (
                                        <label key={sm.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === sm.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="shipping" checked={shippingMethod === sm.id} onChange={() => changeShipping(sm.id)} className="w-4 h-4" />
                                                <div>
                                                    <div className="font-bold text-sm">{sm.name}</div>
                                                    <div className="text-xs text-muted-foreground">{sm.days}</div>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm">{sm.cost > 0 ? sm.cost.toLocaleString() + ' تومان' : 'رایگان'}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h2 className="text-lg font-black mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> روش پرداخت</h2>
                                <div className="space-y-3">
                                    {PAYMENT_METHODS.map(pm => (
                                        <label key={pm.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="w-4 h-4" />
                                                <pm.icon className="w-5 h-5 text-muted-foreground" />
                                                <span className="font-bold text-sm">{pm.name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                                <h2 className="text-lg font-black mb-4">خلاصه سفارش</h2>
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.product?.id || item.id} className="flex items-center gap-3">
                                            {item.product?.images?.length ? (
                                                <ImgTag src={item.product.images[0].url} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                                                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold truncate">{item.product.title}</div>
                                                <div className="text-xs text-muted-foreground">{item.quantity} عدد</div>
                                            </div>
                                            <span className="text-sm font-bold">{getItemTotal(item).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {cartItems.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">سبد خرید خالی است</p>
                                    )}
                                </div>
                                {discount ? (
                                    <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                                        <div className="text-sm">
                                            <span className="font-bold">{discountCode.txt}</span>
                                            <span className="text-emerald-600 mr-2">اعمال شد</span>
                                        </div>
                                        <button
                                            onClick={removeDiscount}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                            type="button"
                                            title="حذف کد تخفیف"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 mb-4">
                                        <InputForm
                                            name='discountCode'
                                            value={discountCode.txt}
                                            placeholder="کد تخفیف"
                                            className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm"
                                            error={discountCode}
                                            onChange={e => setDiscountCode({ type: 'value', message: '', txt: e.target.value })}
                                        />
                                        <CustomButton
                                            name='اعمال'
                                            className="h-10 px-4 rounded-xl bg-accent font-bold text-sm hover:bg-muted transition-colors"
                                            onClick={checkDiscount}
                                            isPending={isPendingValidate}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 text-sm border-t border-border pt-4">
                                    <div className="flex justify-between"><span className="text-muted-foreground">جمع سبد خرید</span><span>{price.subtotal.toLocaleString()} تومان</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">هزینه ارسال</span><span>{price.shippingCost > 0 ? price.shippingCost.toLocaleString() + ' تومان' : 'رایگان'}</span></div>
                                    {price.discount > 0 && <div className="flex justify-between text-emerald-600"><span>تخفیف</span><span>{price.discount.toLocaleString()} تومان</span></div>}
                                    <div className="flex justify-between text-lg font-black border-t border-border pt-3">
                                        <span>مبلغ قابل پرداخت</span>
                                        <span className="text-primary">{price.total.toLocaleString()} تومان</span>
                                    </div>
                                </div>

                                <button onClick={handlePlaceOrder} disabled={pendingOrder || cartItems.length === 0}
                                    className="w-full mt-6 h-12 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-black text-base hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {pendingOrder ? 'در حال پردازش...' : 'ثبت سفارش'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                <div className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                                    <ShieldIcon className="w-4 h-4" /> پرداخت امن
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}