'use client';

import { useState, useRef } from 'react';
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
    Pen,
    X,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import InputForm from '../inputs/InputForm';
import {
    useCreateShippingMethod,
    useDeleteShippingMethod,
    useShippingMethods,
    useUpdateShippingMethod
} from '@/hooks/shipping.hook';
import { CreateShippingMethodDto, ShippingMethodType } from '@/services/shipping.service';
import { CreateShippingMethodFormSchema, createShippingMethodFormSchema } from '@/schemas/shipping.schema';
import DialogDelete from '../DialogDelete';

const CustomAccordion = ({
    children,
    title,
    icon,
    isOpen,
    onToggle,
    ref
}: {
    children: React.ReactNode;
    title: string;
    icon?: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    ref?: React.RefObject<HTMLDivElement | null>;
}) => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="border border-border rounded-xl bg-accent/30 overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
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
                    isOpen ? "max-h-250 opacity-100" : "max-h-0 opacity-0"
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
    const { mutate: createMutate, isPending: pendingCreate } = useCreateShippingMethod();
    const { mutate: updateMutate, isPending: pendingUpdate } = useUpdateShippingMethod();
    const { mutate: deleteMutate, isPending: pendingDelete } = useDeleteShippingMethod();
    const { data: shippingData, isLoading: loadingData } = useShippingMethods(showShipping);
    const [openDelete, setOpenDelete] = useState<boolean>(false)
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [idShipping, setIdShipping] = useState<null | ShippingMethodType>(null);
    const accordionRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateShippingMethodFormSchema>({
        resolver: zodResolver(createShippingMethodFormSchema),
        defaultValues: {
            name: '',
            nameEn: '',
            isActive: true,
            isFreeMethod: false,
        },
    });

    const isActive = watch('isActive');
    const isFreeMethod = watch('isFreeMethod');

    const scrollToForm = () => {
        setTimeout(() => {
            if (formRef.current) {
                const y = formRef.current.getBoundingClientRect().top + window.scrollY - 50;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleEditClick = (method: ShippingMethodType) => {
        setIdShipping(method);
        reset({
            name: method.name,
            nameEn: method.nameEn ?? '',
            isActive: method.isActive ?? true,
            isFreeMethod: method.isFreeMethod ?? false,
        });

        // اگر اکاردئون بسته است آن را باز می‌کنیم و اسکرول می‌کنیم
        if (!isAccordionOpen) {
            setIsAccordionOpen(true);
            setTimeout(scrollToForm, 150);
        } else {
            // اگر از قبل باز است فقط اسکرول انجام می‌شود
            scrollToForm();
        }
    };

    const resetForm = () => {
        reset({
            name: '',
            nameEn: '',
            isActive: true,
            isFreeMethod: false,
        });
        setIdShipping(null);
    };

    const onSubmit = (data: CreateShippingMethodDto) => {
        if (idShipping?.id) {
            updateMutate(
                { id: idShipping.id, data },
                { onSuccess: () => resetForm() }
            );
        } else {
            createMutate(
                data,
                { onSuccess: () => resetForm() }
            );
        }
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
                            مدیریت و افزودن روش‌های ارسال فروشگاه
                        </p>
                    </div>
                </div>
                <div className="px-6 pb-8 pt-4 space-y-6">
                    <CustomAccordion
                        title={idShipping ? "ویرایش روش ارسال" : "افزودن روش ارسال جدید"}
                        icon={<Plus className="w-4 h-4" />}
                        isOpen={isAccordionOpen}
                        onToggle={() => setIsAccordionOpen((prev) => !prev)}
                        ref={accordionRef}
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                                    {/* کاربر فعال / غیرفعال */}
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background">
                                        <div>
                                            <span className="text-sm font-medium">وضعیت فعال بودن</span>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                نمایش یا عدم نمایش برای فروشنده
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

                                    {/* ارسال رایگان */}
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background">
                                        <div>
                                            <span className="text-sm font-medium">روش ارسال رایگان</span>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                آیا این روش بدون هزینه ارسال محاسبه شود؟
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setValue('isFreeMethod', !isFreeMethod)}
                                            className={cn(
                                                'relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 cursor-pointer',
                                                isFreeMethod ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200',
                                                    isFreeMethod ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                                                )}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 gap-3">
                                    {idShipping && (
                                        <button
                                            onClick={resetForm}
                                            type="button"
                                            disabled={pendingCreate || pendingUpdate}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-accent transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                            انصراف و پاک کردن
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={pendingCreate || pendingUpdate}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md shadow-primary/20 cursor-pointer mr-auto"
                                    >
                                        {pendingCreate || pendingUpdate ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        {pendingCreate || pendingUpdate ? 'در حال ثبت...' : idShipping ? 'ثبت ویرایش' : 'افزودن روش'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </CustomAccordion>

                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => setShowShipping((prev) => !prev)}
                            className="text-sm cursor-pointer font-semibold text-muted-foreground flex items-center gap-2"
                        >
                            <Settings2 className="w-4 h-4" />
                            <span>نمایش روش‌های ارسال تعریف شده</span>
                            <span className="text-xs bg-accent px-2 py-0.5 rounded-full">
                                {shippingData?.length ?? "!"}
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
                            </div>
                        ) : (
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
                                                            {method.isFreeMethod && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 flex items-center gap-1 shrink-0">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    ارسال رایگان
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditClick(method)}
                                                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                                        title="ویرایش"
                                                    >
                                                        <Pen className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOpenDelete(true)
                                                            setIdShipping(method)
                                                        }}
                                                        disabled={pendingDelete}
                                                        className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
            <DialogDelete
                closeModal={() => setOpenDelete(false)}
                onDelete={() => {
                    idShipping?.id && deleteMutate(idShipping?.id, {
                        onSuccess: () => {
                            setOpenDelete(false)
                            setIdShipping(null)
                        }
                    })
                }}
                open={openDelete}
                helpText={'از حذف این شیوه ارسال اطمینان دارید ؟ میتونین غیر فعالش کنید.'}
                isPending={pendingDelete}
            />
        </div>
    );
}