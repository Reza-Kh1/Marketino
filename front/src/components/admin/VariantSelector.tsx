'use client';

import React, { useEffect, useState } from 'react';
import InputForm from '../inputs/InputForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProductVariantSchema, ProductVariantType } from '@/schemas/product.schema';
import SelectCustom from '../inputs/SelectCustom';
import { useDiscounts } from '@/hooks/discount.hook';
import { DiscountCode } from '@/lib/api';
import { useCreateVariant, useUpdateVariant, useDeleteVariant } from '@/hooks/product.hook';
import { toast } from 'sonner';
import CustomButton from '../CustomButton';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MotionWrapper from '../motion/MotionWrapper';

export interface AttributeItem {
    key: string;
    value: string;
}

export interface VariantType {
    id: string;
    name: string;
    nameEn: string | null;
    sku: string;
    price: number;
    quantity: number;
    attributes: AttributeItem[] | Record<string, any> | null;
    attributesEn: AttributeItem[] | Record<string, any> | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    discountId: string | null;
    productId: string;
}

interface AttributeManagerProps {
    productId?: string;
    variantData?: VariantType[];
}

function normalizeAttributes(input: unknown): AttributeItem[] {
    if (!input) return [];

    if (Array.isArray(input)) {
        return input
            .map((item) => {
                if (item && typeof item === 'object' && 'key' in item) {
                    return {
                        key: String((item as any).key ?? ''),
                        value: (item as any).value === null || (item as any).value === undefined
                            ? ''
                            : String((item as any).value),
                    };
                }
                return { key: '', value: String(item) };
            })
            .filter((a) => a.key || a.value);
    }

    if (typeof input === 'object') {
        return Object.entries(input as Record<string, any>).map(([key, value]) => ({
            key,
            value: value === null || value === undefined ? '' : String(value),
        }));
    }

    return [];
}

const emptyFormValues = {
    name: '',
    nameEn: '',
    price: 0,
    quantity: 0,
    image: '',
    attributes: [] as AttributeItem[],
    attributesEn: [] as AttributeItem[],
    discountId: undefined as string | undefined,
};

const EMPTY_VARIANTS: VariantType[] = [];

export default function AttributeManager({ productId, variantData }: AttributeManagerProps) {
    const variants = variantData ?? EMPTY_VARIANTS;

    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const activeVariant = variants.find((v) => v.id === selectedVariantId) || null;
    const [open, setOpen] = useState(false)
    const {
        register,
        setValue,
        watch,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ProductVariantSchema),
        defaultValues: emptyFormValues,
    });

    const [attributesList, setAttributesList] = useState<AttributeItem[]>([]);
    const [attributesEnList, setAttributesEnList] = useState<AttributeItem[]>([]);

    const [keyInput, setKeyInput] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [keyEnInput, setKeyEnInput] = useState('');
    const [valueEnInput, setValueEnInput] = useState('');

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const { data: discountData } = useDiscounts(1);
    const { mutate: updateVariant, isPending: updatePending } = useUpdateVariant();
    const { mutate: createVariant, isPending: createPending } = useCreateVariant();
    const { mutate: deleteVariant, isPending: deletePending } = useDeleteVariant();
    const discountId = watch('discountId');
    useEffect(() => {
        if (activeVariant) {
            const attrs = normalizeAttributes(activeVariant.attributes);
            const attrsEn = normalizeAttributes(activeVariant.attributesEn);

            setAttributesList(attrs);
            setAttributesEnList(attrsEn);

            reset({
                name: activeVariant.name || '',
                nameEn: activeVariant.nameEn || '',
                price: activeVariant.price || 0,
                quantity: activeVariant.quantity || 0,
                image: activeVariant.image || '',
                attributes: attrs,
                attributesEn: attrsEn,
                discountId: activeVariant.discountId || undefined,
            });
        } else {
            setAttributesList([]);
            setAttributesEnList([]);
            reset(emptyFormValues);
        }

        setKeyInput('');
        setValueInput('');
        setKeyEnInput('');
        setValueEnInput('');
        setEditingIndex(null);
    }, [
        selectedVariantId,
        activeVariant?.id,
        activeVariant?.updatedAt,
    ]);

    const handleSaveAttribute = () => {
        const trimmedKey = keyInput.trim();
        const trimmedValue = valueInput.trim();
        const trimmedKeyEn = keyEnInput.trim();
        const trimmedValueEn = valueEnInput.trim();

        if (!trimmedKey || !trimmedValue) {
            toast.error('لطفاً نام و مقدار ویژگی فارسی را وارد کنید');
            return;
        }

        const updatedList = [...attributesList];
        const updatedEnList = [...attributesEnList];

        if (editingIndex !== null) {
            updatedList[editingIndex] = { key: trimmedKey, value: trimmedValue };
            updatedEnList[editingIndex] = {
                key: trimmedKeyEn || trimmedKey,
                value: trimmedValueEn || trimmedValue,
            };
        } else {
            updatedList.push({ key: trimmedKey, value: trimmedValue });
            updatedEnList.push({ key: trimmedKeyEn || trimmedKey, value: trimmedValueEn || trimmedValue });
        }

        setAttributesList(updatedList);
        setAttributesEnList(updatedEnList);

        setValue('attributes', updatedList, { shouldValidate: true });
        setValue('attributesEn', updatedEnList, { shouldValidate: true });

        setKeyInput('');
        setValueInput('');
        setKeyEnInput('');
        setValueEnInput('');
        setEditingIndex(null);
    };

    const handleEditAttribute = (index: number) => {
        const item = attributesList[index];
        const itemEn = attributesEnList[index];
        if (!item) return;

        setKeyInput(item.key);
        setValueInput(item.value);
        setKeyEnInput(itemEn?.key || '');
        setValueEnInput(itemEn?.value || '');
        setEditingIndex(index);
    };

    const handleRemoveAttribute = (index: number) => {
        const updatedList = attributesList.filter((_, i) => i !== index);
        const updatedEnList = attributesEnList.filter((_, i) => i !== index);
        setAttributesList(updatedList);
        setAttributesEnList(updatedEnList);
        setValue('attributes', updatedList, { shouldValidate: true });
        setValue('attributesEn', updatedEnList, { shouldValidate: true });
        if (editingIndex === index) handleCancelEdit();
    };

    const handleCancelEdit = () => {
        setKeyInput('');
        setValueInput('');
        setKeyEnInput('');
        setValueEnInput('');
        setEditingIndex(null);
    };
    const onSubmit = (data: ProductVariantType) => {
        if (!productId) return toast.error('لطفا صفحه را رفرش کنید');

        const body = {
            price: String(data.price),
            attributes: attributesList,
            attributesEn: attributesEnList,
            productId: productId,
            name: data.name,
            nameEn: data.nameEn || null,
            image: data.image || null,
            discountId: data.discountId || null,
            quantity: String(data.quantity),
        } as any

        if (activeVariant?.id) {
            updateVariant(
                { id: activeVariant.id, data: body },
                {
                    onSuccess: () => {
                        setSelectedVariantId(null);
                    },
                    onError: () => toast.error('خطا در ویرایش ویژگی'),
                }
            );
        } else {
            createVariant(body, {
                onSuccess: () => {
                    setSelectedVariantId(null);
                    setAttributesList([]);
                    setAttributesEnList([]);
                    reset(emptyFormValues);
                },
                onError: () => toast.error('خطا در ثبت ویژگی'),
            });
        }
    };

    const onError = (err: unknown) => {
        console.log(err);
    };

    const handleDeleteVariant = (id: string) => {
        if (!confirm('آیا از حذف این ویژگی مطمئن هستید؟ این عملیات قابل بازگشت نیست.')) return;

        deleteVariant(id, {
            onSuccess: () => {
                toast.success('ویژگی با موفقیت حذف شد');
                if (selectedVariantId === id) setSelectedVariantId(null);
            },
            onError: () => toast.error('خطا در حذف ویژگی'),
        });
    };

    function formatDiscounts(discounts: DiscountCode[] | []): { id: string; name: string }[] {
        if (!discounts.length) return [];
        return discounts.map((cat) => ({ id: cat.id, name: cat.code }));
    }
    if (!productId) return <p className=" text-gray-400 py-2 text-center border border-dashed rounded-lg bg-white">
        لطفا اول محصول خود را بسازید سپس ویژگی های محصول را ثبت کنید
    </p>
    return (
        <>
            <CustomButton
                color='white'
                className='min-w-sm'
                onClick={() => setOpen(prev => !prev)}
                name={open ? "بستن" : "نمایش فرم ویژگی های محصول"}
                iconEnd={open ? <ChevronUp /> : <ChevronDown />}
            />
            {open &&

                <MotionWrapper preset='fadeUp' staggerChildren={0.2} className='w-full max-w-2xl p-5 bg-white border border-gray-200 rounded-2xl shadow-sm dir-rtl space-y-6'>
                    <h4 className="text-base font-bold text-gray-800 border-b pb-3">
                        ویژگی‌های محصول (Variants)
                    </h4>

                    {/* -------------------- لیست Variantهای موجود -------------------- */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                                ویژگی‌های ثبت‌شده ({variants.length})
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedVariantId(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                            >
                                + افزودن ویژگی جدید
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <p className="text-xs text-gray-400 py-3 text-center border border-dashed rounded-lg">
                                هنوز هیچ ویژگیی برای این محصول ثبت نشده است.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {variants.map((v) => (
                                    <div
                                        key={v.id}
                                        className={`flex items-center justify-between p-3 border rounded-lg transition ${selectedVariantId === v.id
                                            ? 'border-blue-500 bg-blue-50/60'
                                            : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        <div className="text-xs">
                                            <div className="font-bold text-gray-800">
                                                {v.name}
                                                {v.nameEn && (
                                                    <span className="text-gray-400 font-normal dir-ltr inline-block mr-2">
                                                        ({v.nameEn})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-gray-500 mt-0.5">
                                                قیمت: {v.price?.toLocaleString('fa-IR')} | موجودی: {v.quantity}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedVariantId(v.id)}
                                                className="px-2.5 py-1.5 font-medium text-amber-700 bg-amber-50 rounded hover:bg-amber-100 transition text-xs"
                                            >
                                                ویرایش
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletePending}
                                                onClick={() => handleDeleteVariant(v.id)}
                                                className="px-2.5 py-1.5 font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition text-xs disabled:opacity-50"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* -------------------- فرم افزودن/ویرایش یک Variant -------------------- */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-4">
                        <span className="text-xs font-semibold text-gray-600 block">
                            {activeVariant ? `در حال ویرایش: ${activeVariant.name}` : 'افزودن ویژگی جدید'}
                        </span>

                        <InputForm label="نام ویژگی (فارسی)" register={register} name="name" error={errors.name} />
                        <InputForm
                            label="نام ویژگی (انگلیسی)"
                            name="nameEn"
                            placeholder="مثال: Smartphone X1 Pro"
                            register={register}
                            error={errors.nameEn}
                        />
                        <InputForm
                            label="آدرس تصویر"
                            name="image"
                            placeholder="https://example.com/image.jpg"
                            register={register}
                            error={errors.image}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InputForm
                                label="تعداد"
                                name="quantity"
                                type="number"
                                placeholder="مثال: 10"
                                register={register}
                                error={errors.quantity}
                            />
                            <InputForm
                                label="قیمت"
                                name="price"
                                type="number"
                                placeholder="مثال: 1500000"
                                register={register}
                                error={errors.price}
                            />
                        </div>

                        <SelectCustom
                            children={discountData?.discounts ? formatDiscounts(discountData.discounts) : []}
                            placeHolder="انتخاب کنید"
                            setValue={(e) => setValue('discountId', e)}
                            value={discountId}
                            label="انتخاب تخفیف"
                        />

                        {/* بخش افزودن و ویرایش Attributes (فارسی و انگلیسی) */}
                        <div className="pt-3 border-t border-gray-200 space-y-4">
                            <span className="text-xs font-semibold text-gray-600 block">
                                {editingIndex !== null ? 'ویرایش ویژگی انتخاب‌شده' : 'افزودن ویژگی جدید (Attributes)'}
                            </span>

                            <div className="space-y-1">
                                <span className="text-[11px] font-medium text-gray-500">ویژگی به فارسی:</span>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="کلید (مثلاً: رنگ)"
                                        value={keyInput}
                                        onChange={(e) => setKeyInput(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
                                    />
                                    <input
                                        type="text"
                                        placeholder="مقدار (مثلاً: قرمز)"
                                        value={valueInput}
                                        onChange={(e) => setValueInput(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] font-medium text-gray-500">ویژگی به انگلیسی (اختیاری):</span>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Key (e.g. Color)"
                                        value={keyEnInput}
                                        onChange={(e) => setKeyEnInput(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition dir-ltr"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (e.g. Red)"
                                        value={valueEnInput}
                                        onChange={(e) => setValueEnInput(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition dir-ltr"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleSaveAttribute}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                >
                                    {editingIndex !== null ? 'به‌روزرسانی' : 'افزودن'}
                                </button>

                                {editingIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        انصراف
                                    </button>
                                )}
                            </div>

                            {/* لیست ویژگی‌های ثبت‌شده روی همین Variant */}
                            <div className="space-y-2 pt-2">
                                <span className="text-xs font-medium text-gray-500 block">ویژگی‌های ثبت‌شده:</span>

                                {attributesList.length === 0 ? (
                                    <p className="text-xs text-gray-400 py-2 text-center border border-dashed rounded-lg bg-white">
                                        هنوز هیچ ویژگی ثبت نشده است.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {attributesList.map((attr, index) => {
                                            const attrEn = attributesEnList[index];
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-xs"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-700">{attr.key}:</span>
                                                            <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-medium">
                                                                {attr.value}
                                                            </span>
                                                        </div>
                                                        {attrEn && (attrEn.key || attrEn.value) && (
                                                            <div className="flex items-center gap-2 text-gray-400 dir-ltr text-[11px]">
                                                                <span>{attrEn.key}:</span>
                                                                <span>{attrEn.value}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditAttribute(index)}
                                                            className="px-2 py-1 font-medium text-amber-700 bg-amber-50 rounded hover:bg-amber-100 transition"
                                                        >
                                                            ویرایش
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAttribute(index)}
                                                            className="px-2 py-1 font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition"
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <CustomButton
                            color='white'
                                name={activeVariant?.id ? 'ذخیره ویرایش ویژگی' : 'ذخیره ویژگی'}
                                isPending={createPending || updatePending}
                                type="button"
                                onClick={handleSubmit(onSubmit, onError)}
                            />
                            {activeVariant && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedVariantId(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                >
                                    انصراف از ویرایش
                                </button>
                            )}
                        </div>
                    </div>
                </MotionWrapper>
            }
        </>
    );
}