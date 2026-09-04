'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCities, useCreateCity, useProvinces, useUpdateCity } from '@/hooks/province.hook';
import { cityFormSchema, CityFormSchema } from '@/schemas/province.schema';
import { CreateCityDto } from '@/services/province.service';
import AutocompleteCustom from '@/components/inputs/AutoCompleteCustom';
import InputForm from '@/components/inputs/InputForm';
import CustomButton from '@/components/CustomButton';
import { Plus, X } from 'lucide-react';

interface CityFormProps {
    cityId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CityForm({ cityId, onSuccess, onCancel }: CityFormProps) {
    const isEditing = !!cityId;
    const { mutate: createCity, isPending: isCreating, isSuccess: successCreate } = useCreateCity();
    const { mutate: updateCity, isPending: isUpdating, isSuccess: successUpdate } = useUpdateCity();
    const { data: provinces } = useProvinces();
    const loading = isCreating || isUpdating;
    const { data: citiesData } = useCities();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<CityFormSchema>({
        resolver: zodResolver(cityFormSchema),
        defaultValues: {
            name: '',
            nameEn: '',
            provinceId: '',
        },
        mode: 'onChange',
    });

    const provinceIdWatch = watch('provinceId');
    useEffect(() => {
        if (cityId && citiesData) {
            const citySelect = citiesData.find(s => s.id === cityId);
            if (citySelect) {
                reset({
                    name: citySelect.name,
                    nameEn: citySelect.nameEn,
                    provinceId: citySelect.provinceId ? citySelect.provinceId : undefined
                });
            }
        }
    }, [cityId, citiesData, reset]);

    useEffect(() => {
        if ((successUpdate || successCreate) && onSuccess) {
            reset({ name: '', provinceId: undefined, nameEn: '' });
        }
    }, [successUpdate, successCreate, onSuccess, reset]);

    const onSubmit = (data: CityFormSchema) => {
        const cleanData: CreateCityDto = {
            name: data.name,
            nameEn: data.nameEn || '',
            provinceId: data.provinceId,
        };
        if (isEditing) {
            updateCity({ id: cityId!, data: cleanData });
        } else {
            createCity(cleanData);
        }
    };
    const provinceOptions = provinces?.map(p => ({
        name: p.name,
        id: String(p.id)
    })) || [];
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AutocompleteCustom
                        options={provinceOptions}
                        label='استان ها'
                        value={provinceIdWatch ? String(provinceIdWatch) : undefined}
                        onChange={(val) => {
                            setValue('provinceId', val)
                            console.log(val);

                        }}
                        placeholder="استان مورد نظر را سرچ کنید..."
                        emptyText="هیچ استانی با این نام پیدا نشد 📝"
                    />
                    <InputForm
                        register={register}
                        name="name"
                        label="نام شهر"
                        placeholder="مثال: تهران"
                        error={errors.name}
                        required
                    />
                    <InputForm
                        register={register}
                        name="nameEn"
                        label="نام شهر انگلیسی"
                        placeholder="مثال: تهران"
                        error={errors.nameEn}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t border-deep-purple/20">
                <CustomButton
                    type='submit'
                    name={isEditing ? 'بروزرسانی' : 'ذخیره دیتابیس'}
                    color='white'
                    iconEnd={<Plus />}
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
                        iconEnd={<X />}
                        disabled={loading}
                    />
                )}
            </div>
        </form>
    );
}