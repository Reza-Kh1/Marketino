'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, MapPin, Check, Plus, Pencil, X, ShieldCheck, Wallet, ArrowRightLeft, Banknote, Clock, ShoppingBag, Store } from 'lucide-react';
import { useDefaultAddress, useCreateAddress } from '@/hooks/address.hook';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema, FormAddressSchema } from '@/schemas/address.schema';
import InputForm from '@/components/inputs/InputForm';
import CustomButton from '@/components/CustomButton';
import { useCart } from '@/hooks/cart.hook';
import { useCreateOrder } from '@/hooks/order.hook';
import { CartType } from '@/types/types';
import StepperPayment from '@/components/StepperPayment';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { SummarySection } from '../profile/cart/SummarySection';
import { toast } from 'sonner';
import { useShippingMethods } from '@/hooks/setting.hook';

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

export default function CheckoutPage() {
    const { data: defaultAddress, isLoading: isLoadingDefault, refetch: refetchDefault } = useDefaultAddress();
    const { refetch: refetchCart } = useCart();
    const { mutate: createAddress, isPending: isCreatingAddress } = useCreateAddress();
    const { mutate: orderCreate, isPending: isPendingOrder } = useCreateOrder();
    const { data: shippingData } = useShippingMethods()
    const [step, setStep] = useState<'checkout' | 'success'>('checkout');
    const [shippingMethod, setShippingMethod] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('zarinpal');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [discont, setDiscount] = useState('')
    const addressForm = useForm({
        resolver: zodResolver(AddressSchema),
        defaultValues: {
            title: '',
            fullName: '',
            phone: '',
            province: '',
            city: '',
            address: '',
            postalCode: '',
            isDefault: true,
            description: '',
        },
    });

    useEffect(() => {
        if (defaultAddress) {
            addressForm.reset({
                title: defaultAddress.title || '',
                fullName: defaultAddress.fullName || '',
                phone: defaultAddress.phone || '',
                province: defaultAddress.province || '',
                city: defaultAddress.city || '',
                address: defaultAddress.address || '',
                postalCode: defaultAddress.postalCode || '',
                isDefault: true,
                description: '',
            });
        }
    }, [defaultAddress, addressForm]);

    const handleAddAddress = (formData: FormAddressSchema) => {
        createAddress(
            { ...formData, isDefault: true },
            {
                onSuccess: () => {
                    toast.success('آدرس با موفقیت اضافه شد');
                    setShowAddressForm(false);
                    refetchDefault();
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'خطا در ثبت آدرس');
                },
            }
        );
    };

    const handleSubmitOrder = () => {
        if (!defaultAddress && !showAddressForm) {
            toast.error('لطفاً آدرس تحویل را تعیین کنید');
            return;
        }
        const addressData = defaultAddress;
        if (!addressData) return;

        const orderPayload = {
            shippingAddress: `${addressData.province}، ${addressData.city}، ${addressData.address}`,
            shippingName: addressData.fullName,
            shippingPhone: addressData.phone,
            shippingPostal: addressData.postalCode || '',
            shippingCity: addressData.city,
            shippingProvince: addressData.province,
            notes: addressForm.getValues('description') || '',
            shippingMethod,
            addressId: addressData.id,
            paymentMethod,
            discountCode: discont,
        };        
        orderCreate(orderPayload, {
            onSuccess: ({ data }) => {
                setOrderNumber(data?.orderNumber || 'ORD-' + Math.floor(100000 + Math.random() * 900000));
                setStep('success');
                refetchCart();
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || 'خطا در ثبت سفارش');
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
                        {/* باکس اطلاع‌رسانی‌های جدید به کاربر */}
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
                            <CustomButton
                                link="/profile/orders"
                                color='white'
                                name='پیگیری سفارش'
                                iconEnd={<ShoppingBag className="w-4 h-4" />}
                            />
                            <CustomButton
                                link='/'
                                color='gray'
                                name='بازگشت به فروشگاه'
                                iconEnd={<Store className="w-4 h-4" />}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        <div className="lg:col-span-7 space-y-5">
                            <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-3.5 border-b border-border/60 pb-3">
                                    <h2 className="text-xs font-bold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        محل تحویل مرسوله
                                    </h2>
                                    {!showAddressForm && (
                                        <button
                                            onClick={() => { setShowAddressForm(true), addressForm.reset({}) }}
                                            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> تغییر / افزودن آدرس
                                        </button>
                                    )}
                                </div>
                                {!showAddressForm ? (
                                    <>
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
                                                            {defaultAddress.province}، {defaultAddress.city} | همراه: {defaultAddress.phone}
                                                        </p>
                                                    </div>
                                                    <Link href="/profile/addresses" className="text-muted-foreground hover:text-foreground p-1">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-muted/40 border border-dashed border-border rounded-xl p-4 text-center">
                                                <p className="text-xs text-muted-foreground mb-2">آدرسی انتخاب نشده است</p>
                                                <CustomButton
                                                    onClick={() => setShowAddressForm(true)}
                                                    color='white'
                                                    name='افزودن آدرس جدید'
                                                    iconEnd={<Plus />}
                                                />
                                            </div>
                                        )}
                                        <div className="mt-3">
                                            <InputForm
                                                name='description'
                                                register={addressForm.register}
                                                placeholder="یادداشت برای سفیر ارسال (مثلا: زنگ دوم، تحویل به نگهبانی)..."
                                                rows={3}
                                                className='resize-none!'
                                                type='textarea'
                                            />
                                        </div>
                                    </>
                                ) : (
                                    /* فرم افزودن آدرس */
                                    <MotionWrapper preset='slideUpBlur' className="bg-background border border-border rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold">ثبت آدرس جدید</span>
                                            <button onClick={() => setShowAddressForm(false)} className="text-muted-foreground hover:text-foreground">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <form onSubmit={addressForm.handleSubmit(handleAddAddress)} className="space-y-3">
                                            <MotionWrapper preset='fadeUp' staggerChildren={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                <InputForm autoComplete name="title" register={addressForm.register} label="عنوان" placeholder="مثلا: خانه" error={addressForm.formState.errors.title} />
                                                <InputForm autoComplete name="fullName" register={addressForm.register} label="نام تحویل‌گیرنده" placeholder="نام کامل" error={addressForm.formState.errors.fullName} />
                                                <InputForm autoComplete name="phone" register={addressForm.register} label="شماره تماس" placeholder="0912..." error={addressForm.formState.errors.phone} />
                                                <InputForm autoComplete name="postalCode" register={addressForm.register} label="کد پستی" placeholder="۱۰ رقمی" error={addressForm.formState.errors.postalCode} />
                                                <InputForm autoComplete name="province" register={addressForm.register} label="استان" placeholder="مثال: تهران" error={addressForm.formState.errors.province} />
                                                <InputForm autoComplete name="city" register={addressForm.register} label="شهر" placeholder="مثال: تهران" error={addressForm.formState.errors.city} />
                                            </MotionWrapper>
                                            <MotionWrapper preset='fadeUp' delay={0.7}>
                                                <InputForm name="address" register={addressForm.register} className='resize-none!' label="آدرس دقیق" placeholder="خیابان، کوچه، پلاک، واحد" error={addressForm.formState.errors.address} type="textarea" rows={2} />
                                            </MotionWrapper>
                                            <MotionWrapper preset='fadeUp' delay={0.8} className="flex gap-2 pt-1">
                                                <CustomButton type="submit" color='white' iconEnd={<Plus />} name={isCreatingAddress ? 'در حال ثبت...' : 'ثبت آدرس'} isPending={isCreatingAddress} className="text-xs py-2" />
                                                <CustomButton
                                                    type='button'
                                                    onClick={() => setShowAddressForm(false)}
                                                    color='gray'
                                                    name='انصراف'
                                                />
                                            </MotionWrapper>
                                        </form>
                                    </MotionWrapper>
                                )}
                            </section>
                            {shippingData?.length ?
                                <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                    <h2 className="text-xs font-bold mb-3 flex items-center gap-2 border-b border-border/60 pb-3">
                                        <Truck className="w-4 h-4 text-primary" />
                                        شیوه ارسال
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {shippingData?.map((sm) => {
                                            const isSelected = shippingMethod === sm.id;
                                            return (
                                                <label
                                                    key={sm.id}
                                                    onClick={() => setShippingMethod(sm.id)}
                                                    className={`relative flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                                        ? 'bg-primary/5 border-primary shadow-sm'
                                                        : 'bg-background border-border hover:border-muted-foreground/40'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-bold">{sm.name}</span>
                                                            {sm.phrase && (
                                                                <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium">
                                                                    {sm.phrase}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                            <Clock className="w-3 h-3 text-muted-foreground/70" />
                                                            {sm.estimatedDays}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                            {sm.description}
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-primary">
                                                            {sm.cost === 0 ? 'رایگان' : `${sm.cost.toLocaleString()} تومان`}
                                                        </span>
                                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                                                            {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground stroke-3" />}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </section>
                                : null
                            }
                            {/* ۳. شیوه پرداخت */}
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
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                                        {pm.description}
                                                    </p>
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
                                <SummarySection setDiscount={setDiscount} showDiscountForm pendingOrder={isPendingOrder} btnIcon={<ShoppingBag className="w-4 h-4" />} onSubmit={handleSubmitOrder} btnName='ثبت سفارش' showPayment showShipping paymentId={paymentMethod}
                                    shippingMethodId={shippingMethod} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}