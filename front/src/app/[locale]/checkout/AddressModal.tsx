'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Plus } from 'lucide-react';
import { AddressSchema, FormAddressSchema } from '@/schemas/address.schema';
import InputForm from '@/components/inputs/InputForm';
import CustomButton from '@/components/CustomButton';
import { useCreateAddress, useDefaultAddress } from '@/hooks/address.hook';
import { toast } from 'sonner';
import ProvinceInput from '@/components/inputs/ProvinceInput';
import { useShippingOrder } from '@/hooks/shipping.hook';

interface AddressModalProps {
    /** آیا مودال باز است */
    open: boolean;
    /** بستن مودال (هم با کلیک روی بک‌دراپ و هم دکمه ضربدر) */
    onClose: () => void;
    /** بعد از ثبت موفق آدرس صدا زده می‌شود (مثلا برای refetchDefault) */
    onSuccess?: () => void;
}

/**
 * مودال ثبت آدرس تحویل.
 * وقتی کاربر آدرس پیش‌فرض ندارد، این مودال باز می‌شود تا آدرس را وارد کند؛
 * بعد از ثبت موفق، بسته می‌شود و onSuccess صدا زده می‌شود تا صفحه آدرس تازه را نمایش دهد.
 */
export default function AddressModal({ open, onClose, onSuccess }: AddressModalProps) {
    const { mutate: createAddress, isPending } = useCreateAddress();
    const form = useForm({
        resolver: zodResolver(AddressSchema),
        defaultValues: {
            title: '',
            fullName: '',
            phone: '',
            provinceId: '',
            cityId: '',
            address: '',
            postalCode: '',
            isDefault: true,
            description: '',
        },
    });


    const cityId = form.watch('cityId')
    const provinceId = form.watch('provinceId')
    useEffect(() => {
        if (open) form.reset();
    }, [open]);

    const handleSubmit = (formData: FormAddressSchema) => {
        createAddress(
            { ...formData, isDefault: true },
            {
                onSuccess: () => {
                    onSuccess?.();
                    onClose();
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'خطا در ثبت آدرس');
                },
            }
        );
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card border border-border rounded-2xl p-5 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-3 border-b border-border/60 pb-3">
                            <h2 className="text-xs font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                ثبت آدرس تحویل
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                            برای ادامه‌ی ثبت سفارش لازم است یک آدرس تحویل ثبت کنید. این آدرس به عنوان آدرس پیش‌فرض شما ذخیره می‌شود.
                        </p>

                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <InputForm autoComplete name="title" register={form.register} label="عنوان" placeholder="مثلا: خانه" error={form.formState.errors.title} />
                                <InputForm autoComplete name="fullName" register={form.register} label="نام تحویل‌گیرنده" placeholder="نام کامل" error={form.formState.errors.fullName} />
                                <InputForm autoComplete name="phone" register={form.register} label="شماره تماس" placeholder="0912..." error={form.formState.errors.phone} />
                                <InputForm autoComplete name="postalCode" register={form.register} label="کد پستی" placeholder="۱۰ رقمی" error={form.formState.errors.postalCode} />
                                <ProvinceInput
                                    classDiv='col-span-2'
                                    changeCity={(value) => form.setValue('cityId', value)}
                                    changeProvince={(value) => form.setValue('provinceId', value)}
                                    valueCity={cityId}
                                    valueProvince={provinceId}
                                    errorCity={form.formState.errors.cityId}
                                    errorProvince={form.formState.errors.provinceId}
                                />
                            </div>
                            <InputForm
                                name="address"
                                register={form.register}
                                className="resize-none!"
                                label="آدرس دقیق"
                                placeholder="خیابان، کوچه، پلاک، واحد"
                                error={form.formState.errors.address}
                                type="textarea"
                                rows={2}
                            />
                            <div className="flex gap-2 pt-1">
                                <CustomButton
                                    type="submit"
                                    color="white"
                                    iconEnd={<Plus />}
                                    name={isPending ? 'در حال ثبت...' : 'ثبت آدرس'}
                                    isPending={isPending}
                                    className="text-xs py-2"
                                />
                                <CustomButton type="button" onClick={onClose} color="gray" name="انصراف" />
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
