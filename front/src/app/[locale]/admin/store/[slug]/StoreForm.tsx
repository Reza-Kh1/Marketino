// store-edit.page.tsx
'use client';

import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storeFormSchema, StoreFormValues } from '@/schemas/store.schema';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomButton from '@/components/CustomButton';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { Link } from '@/i18n/navigation';
import PendingApi from '@/components/PendingApi';
import InputForm from '@/components/inputs/InputForm';
import UploadMedia from '@/components/upload/UploadMedia';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useCreateStore, useStore, useUpdateStore } from '@/hooks/store.hook';
import { Store } from '@/services/store.service';
import SelectCustom from '@/components/inputs/SelectCustom';
import ProvinceInput from '@/components/inputs/ProvinceInput';

export default function StorForm({ store, isStore = false }: { store?: Store, isStore?: boolean }) {
    const router = useRouter();
    const [openEn, setOpenEn] = useState(false);
    const { mutate: updateStore, isPending } = useUpdateStore();
    const { mutate: createStore, isPending: pendingCreate } = useCreateStore();

    const { register, reset, setValue, watch, getValues, handleSubmit, setValues } = useForm<StoreFormValues>({
        resolver: zodResolver(storeFormSchema),
        defaultValues: {
            name: '',
            nameEn: '',
            slug: '',
            logo: '',
            banner: '',
            description: '',
            descriptionEn: '',
            businessType: '',
            nationalId: '',
            economicCode: '',
            provinceId: '',
            cityId: '',
            address: '',
            phone: '',
            email: '',
            instagram: '',
            telegram: '',
            workingHours: '',
        }
    });

    const isVerified = watch('isVerified')
    const hasPhysicalStore = watch('hasPhysicalStore')
    const businessType = watch('businessType')
    const cityId = watch('cityId')
    const provinceId = watch('provinceId')

    useEffect(() => {
        if (store) {
            reset({
                name: store.name || '',
                nameEn: store.nameEn || '',
                slug: store.slug || '',
                logo: store.logo || '',
                banner: store.banner || '',
                description: store.description || '',
                descriptionEn: store.descriptionEn || '',
                businessType: store.businessType || 'false',
                nationalId: store.nationalId || '',
                economicCode: store.economicCode || '',
                provinceId: store.provinceId || '',
                cityId: store.cityId || '',
                address: store.address || '',
                phone: store.phone || '',
                email: store.email || '',
                instagram: store.instagram || '',
                telegram: store.telegram || '',
                workingHours: store.workingHours || '',
                commissionRate: store.commissionRate || 0,
                status: store.status || '',
                statusReason: store.statusReason || '',
                hasPhysicalStore: store.hasPhysicalStore ? 'true' : 'false',
                isVerified: store.isVerified ? 'true' : 'false',
                bale: store.bale || '',
                shippingTime: store.shippingTime || '',
                robika: store.robika || '',
                whatsApp: store.whatsApp || ''
            });
        }
    }, [store, reset]);

    const onSubmit = (data: StoreFormValues) => {
        const body = {
            ...data,
            isVerified: data.isVerified === 'true' ? true : false,
            hasPhysicalStore: data.hasPhysicalStore === 'true' ? true : false
        }
        if (store?.id) {
            updateStore({ id: store.id, data: body }, {
                onSuccess: () => {
                    router.push('/admin/store');
                }
            });
        } else {
            createStore(body, {
                onSuccess: () => {
                    router.push('/admin/store');
                }
            })
        }

    };
    const onError = (err: any) => {
        console.log(err);
    };
    const getValidArray = (value: string | undefined): string[] => {
        return value ? [value] : [];
    }
    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">{store?.id ? 'ویرایش فروشگاه' : 'ثبت فروشگاه'}</h2>
                    <p className="text-sm text-muted-foreground mt-1">اطلاعات فروشگاه را وارد کنید</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="mr-auto">
                        {store?.status === 'pending' && 'در انتظار تایید'}
                        {store?.status === 'approved' && 'تایید شده'}
                        {store?.status === 'rejected' && 'رد شده'}
                    </Badge>
                    <CustomButton
                        name={isPending || pendingCreate ? 'در حال بروزرسانی...' : 'بروزرسانی فروشگاه'}
                        disabled={isPending}
                        type="submit"
                        iconStart={isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="card p-4 space-y-4">
                        <InputForm
                            label='نام فروشگاه'
                            name='name'
                            placeholder="مثال: فروشگاه الکترونیک بازار"
                            register={register}
                            required
                        />
                        <InputForm
                            label='اسلاگ (باید به صورت یکتا باشد)'
                            name='slug'
                            placeholder="مثال: marketino-electronics"
                            register={register}
                        />
                        <InputForm
                            label='توضیحات فروشگاه'
                            name='description'
                            type='textarea'
                            rows={4}
                            placeholder="مثال: فروشگاه تخصصی محصولات الکترونیک با بهترین قیمت"
                            register={register}
                        />
                    </div>
                    <div className="card p-4 space-y-4 grid grid-cols-2 gap-2">
                        <InputForm
                            label='تلفن'
                            name='phone'
                            placeholder="02112345678"
                            register={register}
                        />
                        <InputForm
                            label='ایمیل'
                            name='email'
                            placeholder="info@marketino.com"
                            register={register}
                        />
                        <div className='w-full col-span-2'>
                            <ProvinceInput
                                changeCity={(value) => setValue('cityId', value)}
                                changeProvince={(value) => setValue('provinceId', value)}
                                valueCity={cityId} valueProvince={provinceId}
                            />
                        </div>
                        {hasPhysicalStore === 'true' && (
                            <InputForm
                                label='آدرس'
                                name='address'
                                type='textarea'
                                rows={4}
                                classDiv='col-span-2'
                                placeholder="آدرس کامل فروشگاه"
                                register={register}
                            />
                        )}
                    </div>
                    {/* Images */}
                    <div className="card p-4">
                        <UploadMedia
                            boxUploader
                            type='image'
                            limit={2}
                            valueEdit={getValidArray(getValues('logo'))}
                            setUrlMedias={(url) => {
                                const newUrl = url?.map((item: any) => item.key)
                                if (newUrl && newUrl.length > 0) {
                                    setValue('logo', newUrl[0])
                                }
                            }}
                            helperText="تصویر بنر با اندازه 512*512 باید باشد و حجم آن بیش از 200kb نباشد."
                        />
                        <div className="mt-4">
                            <UploadMedia
                                boxUploader
                                title="بنر فروشگاه"
                                type='image'
                                limit={1}
                                valueEdit={getValidArray(getValues('banner'))}
                                setUrlMedias={(url) => {
                                    const newUrl = url?.map((item: any) => item.key)
                                    if (newUrl && newUrl.length > 0) {
                                        setValue('banner', newUrl[0])
                                    }
                                }}
                                helperText="تصویر بنر با اندازه 400*1920 باید باشد و حجم آن بیش از 300kb نباشد."
                            />
                        </div>
                    </div>
                </div>
                {/* Sidebar */}
                <div className="space-y-6">
                    <MotionWrapper staggerChildren={0.1} preset='slideUpBlur' className="bg-card border border-border rounded-2xl p-6" >
                        <h3 className="font-black text-sm mb-4">راهنمای سریع</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                لوگوی باکیفیت باعث افزایش اعتماد خریداران می‌شود
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                توضیحات کامل فروشگاه به بهبود سئو کمک می‌کند
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                اطلاعات تماس دقیق، ارتباط با مشتریان را آسان‌تر می‌کند
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                بنر فروشگاه اولین چیزیست که خریداران می‌بینند
                            </li>
                        </ul>
                    </MotionWrapper>
                    <div className="card p-4 space-y-4">
                        <SelectCustom
                            children={[
                                { id: 'true', name: 'بله دارم' },
                                { id: 'false', name: 'ندارم' },
                            ]}
                            placeHolder='فروش به صورت حضوری'
                            value={hasPhysicalStore}
                            label='فروشگاه حضوری'
                            setValue={(e) => setValue('hasPhysicalStore', e)}
                        />
                        <SelectCustom
                            children={[
                                { id: 'individual', name: 'حقیقی' },
                                { id: 'company', name: 'حقوقی' },
                                { id: 'false', name: 'ثبت نشده' },
                            ]}
                            placeHolder=''
                            value={businessType}
                            label='نوع کسب‌وکار'
                            setValue={(e) => setValue('businessType', e)}
                        />
                        {businessType === 'individual' && (
                            <InputForm
                                label='کد ملی / شناسه ملی'
                                name='nationalId'
                                placeholder="1234567890"
                                register={register}
                            />
                        )}
                        {businessType === 'company' && (
                            <InputForm
                                label='کد شرکت (در صورتی که از طریق شرکت ثبت نام کرده اید)'
                                name='economicCode'
                                placeholder="1234567890"
                                register={register}
                            />
                        )}
                        {store?.slug && (
                            <InputForm
                                label='اسلاگ'
                                name='slug'
                                value={store.slug}
                                disabled
                            />
                        )}
                    </div>
                    {/* Contact */}
                    <div className="card p-4 space-y-4">
                        <InputForm
                            label='اینستاگرام'
                            name='instagram'
                            placeholder="https://instagram.com/marketino"
                            register={register}
                        />
                        <InputForm
                            label='تلگرام'
                            name='telegram'
                            placeholder="https://t.me/marketino"
                            register={register}
                        />
                        <InputForm
                            label='واتس اپ'
                            name='whatsApp'
                            placeholder="https://whats_app/marketino"
                            register={register}
                        />
                        <InputForm
                            label='بله'
                            name='bale'
                            placeholder="https://bale/marketino"
                            register={register}
                        />
                        <InputForm
                            label='روبیکا'
                            name='robika'
                            placeholder="https://robika/marketino"
                            register={register}
                        />
                        <InputForm
                            label='زمان ارسال'
                            name='shippingTime'
                            placeholder="۸:۰۰ تا ۲۲:۰۰"
                            register={register}
                        />
                        <InputForm
                            label='ساعت کاری'
                            name='workingHours'
                            placeholder="۸:۰۰ تا ۲۲:۰۰"
                            register={register}
                        />
                    </div>
                    {!isStore && (
                        <div className="card p-4 space-y-4">
                            <InputForm
                                label='توضیح وضعیت'
                                type='textarea'
                                rows={3}
                                name='statusReason'
                                placeholder="مدارک تایید شدن..."
                                register={register}
                            />
                            <InputForm
                                label='درصد کمیسیون'
                                name='commissionRate'
                                placeholder="7"
                                type='number'
                                min={0}
                                register={register}
                            />
                            <SelectCustom
                                children={[
                                    { id: 'true', name: 'تایید میشود' },
                                    { id: 'false', name: 'رد میشود' },
                                ]}
                                placeHolder=''
                                value={isVerified}
                                label='تایید فروشگاه'
                                setValue={(e) => setValue('isVerified', e)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* English form */}
            <div className='w-full'>
                <CustomButton
                    color='white'
                    className='min-w-sm'
                    onClick={() => setOpenEn(prev => !prev)}
                    name={openEn ? "بستن فرم انگلیسی" : "نمایش فرم انگلیسی"}
                    iconEnd={openEn ? <ChevronUp /> : <ChevronDown />}
                />
                {openEn &&
                    <div className='card p-4 space-y-4 mt-6'>
                        <MotionWrapper preset='fadeUp' duration={2}>
                            <div className='w-full grid grid-cols-1 gap-4'>
                                <InputForm
                                    label='نام فروشگاه (انگلیسی)'
                                    name='nameEn'
                                    placeholder="Marketino Electronics Store"
                                    register={register}
                                />
                                <InputForm
                                    label='توضیحات فروشگاه (انگلیسی)'
                                    name='descriptionEn'
                                    type='textarea'
                                    max={6}
                                    min={6}
                                    placeholder="Specialized electronics store with best prices"
                                    register={register}
                                />
                            </div>
                        </MotionWrapper>
                    </div>
                }
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
                <CustomButton
                    color='white'
                    type='submit'
                    name={isPending || pendingCreate ? 'در حال بروزرسانی...' : 'بروزرسانی فروشگاه'}
                    iconStart={isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    disabled={isPending}
                />
                <CustomButton
                    type='button'
                    color='gray'
                    name='انصراف'
                    iconEnd={<ArrowLeft className="w-5 h-5" />}
                    onClick={() => router.push('/admin/stores')}
                />
            </div>
        </form >
    );
}