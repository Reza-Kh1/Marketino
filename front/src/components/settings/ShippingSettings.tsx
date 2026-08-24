'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    Settings2,
    ChevronDown,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

import InputForm from '../inputs/InputForm';
import { useCreateShippingMethod, useDeleteShippingMethod, useShippingMethods } from '@/hooks/setting.hook';
import DialogDelete from '../DialogDelete';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { CreateShippingMethodDto, ShippingMethodType } from '@/services/setting.service';
import CustomButton from '../CustomButton';
import DialogView from '../DialogView';
const shippingMethodSchema = z.object({
    name: z.string()
        .min(2, 'نام روش ارسال حداقل ۲ کاراکتر باید باشد')
        .max(50, 'نام روش ارسال حداکثر ۵۰ کاراکتر باید باشد')
        .nonempty('نام روش ارسال الزامی است'),

    nameEn: z.string()
        .max(50, 'نام انگلیسی حداکثر ۵۰ کاراکتر باید باشد')
        .nullable(),

    description: z.string()
        .max(500, 'توضیحات حداکثر ۵۰۰ کاراکتر باید باشد')
        .nullable(),

    descriptionEn: z.string()
        .max(500, 'توضیحات انگلیسی حداکثر ۵۰۰ کاراکتر باید باشد')
        .nullable(),

    cost: z.number()
        .min(0, 'هزینه ارسال نمیتواند منفی باشد')
        .max(999999999, 'هزینه ارسال بسیار زیاد است')
        .nullable(),

    phrase: z.string()
        .max(200, 'عبارت تبلیغاتی حداکثر ۲۰۰ کاراکتر باید باشد')
        .nullable(),

    freeThreshold: z.number()
        .min(0, 'حداقل خرید نمیتواند منفی باشد')
        .max(999999999, 'حداقل خرید بسیار زیاد است'),

    estimatedDays: z.string()
        .max(100, 'تخمین زمان تحویل حداکثر ۱۰۰ کاراکتر باید باشد'),

    estimatedDaysEn: z.string()
        .max(100, 'تخمین زمان تحویل انگلیسی حداکثر ۱۰۰ کاراکتر باید باشد')
        .nullable(),

    isActive: z.boolean(),

    sortOrder: z.number()
        .min(1, 'اولویت باید حداقل ۱ باشد')
        .max(999, 'اولویت حداکثر ۹۹۹ میتواند باشد')
        .nullable(),
});
// کامپوننت آکاردئون ساده و سفارشی
const CustomAccordion = ({
    children,
    title,
    icon,
    defaultOpen = false
}: {
    children: React.ReactNode;
    title: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentRef = useRef<HTMLDivElement>(null);

    const toggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="border border-border rounded-xl bg-accent/30 overflow-hidden">
            <button
                onClick={toggle}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-primary">
                    {icon}
                    <span className="text-sm font-semibold">{title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 transition-transform duration-300 text-muted-foreground",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <div
                ref={contentRef}
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-4 pb-6 pt-2 border-t border-border/50 bg-background/50">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function ShippingSettings() {
    const [showShipping, setShowShipping] = useState<boolean>(false);
    const { mutate: createMutate, isPending: pendingCreate } = useCreateShippingMethod()
    const { mutate: deleteMutate, isPending: PendingDelete } = useDeleteShippingMethod()
    const { data: shippingData, isLoading: loadingData } = useShippingMethods(showShipping)
    const [idShipping, setIdShipping] = useState<null | ShippingMethodType>(null)
    const [open, setOpen] = useState<'view' | 'delete' | null>(null)
    const formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateShippingMethodDto>({
        resolver: zodResolver(shippingMethodSchema),
        defaultValues: {
            name: '',
            nameEn: null,
            description: null,
            descriptionEn: null,
            cost: null,
            phrase: null,
            freeThreshold: 0,
            estimatedDays: '3',
            estimatedDaysEn: null,
            isActive: true,
            sortOrder: null,
        },
    });

    const isActive = watch('isActive');
    const freeThreshold = watch('freeThreshold');
    const cost = watch('cost');
    const onSubmit = (data: CreateShippingMethodDto) => {
        console.log(data);
        createMutate(data, {
            onSuccess: () => {
                reset()
            }
        })
    };
    return (
        <div className="space-y-6 pb-24 my-6">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3 border-b border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">تنظیمات روش‌های ارسال</h2>
                        <p className="text-muted-foreground text-xs mt-1">
                            مدیریت و پیکربندی شیوه‌ها و هزینه‌های ارسال فروشگاه
                        </p>
                    </div>
                </div>
                <div className="px-6 pb-8 pt-4 space-y-6">
                    <CustomAccordion
                        title="افزودن روش ارسال جدید"
                        icon={<Plus className="w-4 h-4" />}
                        defaultOpen={false}
                    >
                        <div ref={formRef}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputForm
                                        name="name"
                                        register={register}
                                        placeholder="مثلاً: پست پیشتاز"
                                        label="نام روش (فارسی) *"
                                        required
                                        error={errors.name}
                                    />
                                    <InputForm
                                        name="nameEn"
                                        register={register}
                                        placeholder="مثلاً: Express Post"
                                        label="نام روش (انگلیسی)"
                                        error={errors.nameEn}
                                    />
                                    <InputForm
                                        name="cost"
                                        value={Number(cost).toLocaleString('en-US')}
                                        onChange={({ target }) => {
                                            let value = target.value.replace(/[^0-9]/g, '');
                                            if (value !== '') {
                                                const num = Number(value);
                                                setValue('cost', num === 0 ? 0 : num);
                                            } else {
                                                setValue('cost', 0);
                                            }
                                        }}
                                        placeholder="مثلاً: ۴۵۰۰۰"
                                        label="هزینه ارسال (تومان)"
                                        error={errors.cost}
                                    />
                                    <InputForm
                                        name="freeThreshold"
                                        value={Number(freeThreshold).toLocaleString('en-US')}
                                        onChange={({ target }) => {
                                            let value = target.value.replace(/[^0-9]/g, '');
                                            if (value !== '') {
                                                const num = Number(value);
                                                setValue('freeThreshold', num === 0 ? 0 : num);
                                            } else {
                                                setValue('freeThreshold', 0);
                                            }
                                        }}
                                        placeholder="مثلاً: ۵۰۰۰۰۰ (۰ = بدون ارسال رایگان)"
                                        label="حداقل خرید برای ارسال رایگان (تومان)"
                                        error={errors.freeThreshold}
                                    />
                                    <InputForm
                                        name="estimatedDays"
                                        register={register}
                                        placeholder="مثلاً: ۲ تا ۴ روز کاری"
                                        label="تخمین زمان تحویل"
                                        error={errors.estimatedDays}
                                    />
                                    <InputForm
                                        name="estimatedDaysEn"
                                        register={register}
                                        placeholder="like: 2 or 3 days"
                                        label="تخمین زمان تحویل (انگلیسی)"
                                        error={errors.estimatedDaysEn}
                                    />
                                    <InputForm
                                        name="description"
                                        type="textarea"
                                        rows={3}
                                        className='resize-none'
                                        register={register}
                                        placeholder=""
                                        label="توضیحات (انگلیسی)"
                                        error={errors.description}
                                    />
                                    <InputForm
                                        name="descriptionEn"
                                        type="textarea"
                                        rows={3}
                                        className='resize-none'
                                        register={register}
                                        placeholder=""
                                        label="توضیحات"
                                        error={errors.descriptionEn}
                                    />
                                    <InputForm
                                        name="sortOrder"
                                        type="number"
                                        register={register}
                                        placeholder="مثلاً: ۱"
                                        label="ترتیب نمایش (اولویت)"
                                        error={errors.sortOrder}
                                    />
                                    <InputForm
                                        name="phrase"
                                        register={register}
                                        placeholder="مثل : اقتصادی"
                                        label="شعار"
                                        error={errors.phrase}
                                    />
                                </div>

                                {/* سوییچ وضعیت فعال بودن */}
                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div>
                                        <span className="text-sm font-medium">وضعیت فعال بودن</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            در صورت فعال بودن، این روش در سبد خرید به مشتریان نمایش داده می‌شود.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setValue('isActive', !isActive)}
                                        className={cn(
                                            'relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 cursor-pointer',
                                            isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200',
                                                isActive ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                                            )}
                                        />
                                    </button>
                                </div>

                                {/* دکمه ثبت */}
                                <div className="flex justify-end pt-3">
                                    <button
                                        type="submit"
                                        disabled={pendingCreate}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md shadow-primary/20 cursor-pointer"
                                    >
                                        {pendingCreate ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        {pendingCreate ? 'در حال ثبت...' : 'افزودن روش ارسال'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </CustomAccordion>
                    <div className="space-y-3 pt-4">
                        <button onClick={() => setShowShipping(prev => !prev)} className="text-sm cursor-pointer font-semibold text-muted-foreground flex items-center gap-2">
                            <Settings2 className="w-4 h-4" />
                            <span>نمایش روش‌های ارسال تعریف شده</span>
                            <span className="text-xs bg-accent px-2 py-0.5 rounded-full">
                                {shippingData?.length}
                            </span>
                        </button>

                        {loadingData ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                            </div>
                        ) : showShipping && !shippingData?.length ? (
                            <div className="bg-background border border-border/60 rounded-xl p-8 text-center text-muted-foreground">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">هنوز هیچ روش ارسالی تعریف نشده است.</p>
                                <p className="text-xs mt-1">برای افزودن، روی دکمه "افزودن روش ارسال جدید" کلیک کنید.</p>
                            </div>
                        ) :
                            showShipping && (
                                <div className="grid grid-cols-1 gap-3">
                                    <AnimatePresence>
                                        {shippingData?.map((method, index) => (
                                            <motion.div
                                                key={method.id || index}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: index * 0.04 }}
                                                className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-primary/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                                                        <Truck className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-bold text-sm">{method.name}</span>
                                                            {method.nameEn && (
                                                                <span className="text-xs text-muted-foreground dir-ltr">
                                                                    ({method.nameEn})
                                                                </span>
                                                            )}
                                                            <span
                                                                className={cn(
                                                                    'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0',
                                                                    method.isActive
                                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
                                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                                                                )}
                                                            >
                                                                {method.isActive ? 'فعال' : 'غیرفعال'}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                            <span>
                                                                هزینه:{' '}
                                                                <strong className="text-foreground">
                                                                    {method.cost
                                                                        ? `${Number(method.cost).toLocaleString('fa-IR')} تومان`
                                                                        : 'رایگان'}
                                                                </strong>
                                                            </span>
                                                            {Number(method.freeThreshold) > 0 && (
                                                                <span>
                                                                    ارسال رایگان از:{' '}
                                                                    <strong className="text-foreground">
                                                                        {Number(method.freeThreshold).toLocaleString('fa-IR')} تومان
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            {method.estimatedDays && (
                                                                <span>
                                                                    زمان تحویل:{' '}
                                                                    <strong className="text-foreground">
                                                                        {method.estimatedDays}
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            <span>
                                                                اولویت:{' '}
                                                                <strong className="text-foreground">
                                                                    {method.sortOrder}
                                                                </strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <CustomButton
                                                    onClick={() => { setOpen('view'), setIdShipping(method) }}
                                                    iconStart={<Eye />}
                                                    color='icon'
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpen('delete'), setIdShipping(method)
                                                    }}
                                                    disabled={PendingDelete}
                                                    title="حذف روش ارسال"
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors text-xs font-semibold shrink-0 disabled:opacity-50 cursor-pointer self-start sm:self-center"
                                                >
                                                    {PendingDelete ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    )}
                                                    حذف
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )
                        }
                        <DialogDelete
                            closeModal={() => {
                                setOpen(null)
                                setIdShipping(null)
                            }}
                            onDelete={() => {
                                idShipping && deleteMutate(idShipping.id, {
                                    onSuccess: () => {
                                        setOpen(null)
                                        setIdShipping(null)
                                    }
                                })
                            }}
                            open={open === 'delete'}
                            helpText="از حذف روش ارسال اطمینان دارید ؟"
                            isPending={PendingDelete}
                        />
                        <DialogView
                            open={open === "view"}
                            onOpenChange={() => {
                                setOpen(null)
                                setIdShipping(null)
                            }}
                            title='اطلاعات روش ارسال'
                            options={[
                                {
                                    head: 'اطلاعات اصلی',
                                    tags: [
                                        { name: 'شناسه', value: idShipping?.id || '-' },
                                        { name: 'نام (فارسی)', value: idShipping?.name || '-' },
                                        { name: 'نام (انگلیسی)', value: idShipping?.nameEn || '-' },
                                        { name: 'توضیحات (فارسی)', value: idShipping?.description || '-' },
                                        { name: 'توضیحات (انگلیسی)', value: idShipping?.descriptionEn || '-' },
                                        { name: 'هزینه ارسال', value: idShipping?.cost ? `${Number(idShipping.cost).toLocaleString('fa-IR')} تومان` : '-' },
                                        { name: 'عبارت تبلیغاتی', value: idShipping?.phrase || '-' },
                                        { name: 'حداقل خرید برای ارسال رایگان', value: idShipping?.freeThreshold ? `${Number(idShipping.freeThreshold).toLocaleString('fa-IR')} تومان` : 'ندارد' },
                                        { name: 'زمان تحویل (فارسی)', value: idShipping?.estimatedDays || '-' },
                                        { name: 'زمان تحویل (انگلیسی)', value: idShipping?.estimatedDaysEn || '-' },
                                        { name: 'وضعیت', value: idShipping?.isActive ? 'فعال' : 'غیرفعال' },
                                        { name: 'اولویت نمایش', value: idShipping?.sortOrder?.toString() || '-' },
                                    ]
                                },
                                {
                                    head: 'اطلاعات زمانی',
                                    detail: [
                                        { name: 'تاریخ ایجاد', value: idShipping?.createdAt ? new Date(idShipping.createdAt).toLocaleDateString('fa-IR') : '-' },
                                        { name: 'زمان ایجاد', value: idShipping?.createdAt ? new Date(idShipping.createdAt).toLocaleTimeString('fa-IR') : '-' },
                                        { name: 'آخرین ویرایش', value: idShipping?.updatedAt ? new Date(idShipping.updatedAt).toLocaleDateString('fa-IR') : '-' },
                                        { name: 'زمان آخرین ویرایش', value: idShipping?.updatedAt ? new Date(idShipping.updatedAt).toLocaleTimeString('fa-IR') : '-' },
                                    ]
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}