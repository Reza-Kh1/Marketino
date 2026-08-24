'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { provinceFormSchema, ProvinceFormSchema } from '@/schemas/province.schema';
import InputForm from '@/components/InputForm/InputForm';
import { provinceService, CreateProvinceDto } from '@/services/province.service';
import { useCreateProvince, useUpdateProvince } from '@/hooks/province.hook';
import { toast } from 'sonner';
import CustomButton from '@/components/CustomButton/CustomButton';
import { FaPlus } from 'react-icons/fa6';
import { MdClose } from 'react-icons/md';

interface ProvinceFormProps {
    provinceId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ProvinceForm({ provinceId, onSuccess, onCancel }: ProvinceFormProps) {
    const isEditing = !!provinceId;
    const { mutate: createProvince, isPending: isCreating, isSuccess: successCreate } = useCreateProvince();
    const { mutate: updateProvince, isPending: isUpdating, isSuccess: successUpdate } = useUpdateProvince();
    const loading = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProvinceFormSchema>({
        resolver: zodResolver(provinceFormSchema),
        defaultValues: {
            name: '',
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (provinceId) {
            provinceService.getById(provinceId).then((data) => {
                reset({
                    name: data.name || '',
                });
            }).catch(() => {
                toast.error('خطا در دریافت اطلاعات استان');
            });
        }
    }, [provinceId, reset]);

    useEffect(() => {
        if ((successUpdate || successCreate) && onSuccess) {
            reset()
        }
    }, [successUpdate, successCreate, onSuccess]);

    const onSubmit = (data: ProvinceFormSchema) => {
        const cleanData: CreateProvinceDto = {
            name: data.name,
        };

        if (isEditing) {
            updateProvince({ id: provinceId!, data: cleanData });
        } else {
            createProvince(cleanData);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <InputForm
                    register={register}
                    name="name"
                    label="نام استان"
                    placeholder="مثال: تهران"
                    error={errors.name}
                    required
                />
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t border-deep-purple/20">
                <CustomButton
                    type='submit'
                    name={isEditing ? 'بروزرسانی' : 'ذخیره دیتابیس'}
                    color='white'
                    iconEnd={<FaPlus />}
                    colorHover='blue'
                    isPending={loading}
                    size='md'
                />
                {onCancel && (
                    <CustomButton
                        type='button'
                        name='بستن'
                        size='md'
                        colorHover='orange-red'
                        onClick={onCancel}
                        iconEnd={<MdClose />}
                        disable={loading}
                    />
                )}
            </div>
        </form>
    );
}