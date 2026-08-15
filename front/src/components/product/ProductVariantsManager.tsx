'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit3, X, Image as ImageIcon, Tag, Layers, DollarSign, PackageCheck, Pen, Sparkles, Percent } from 'lucide-react';
import InputForm from '../inputs/InputForm';
import { useFieldArray, useForm } from 'react-hook-form';
import AutocompleteCustom from '../inputs/AutoCompleteCustom';
import { useColors } from '@/hooks/color.hook';
import { z } from 'zod';
import CustomButton from '../CustomButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAttributeDefinitions, useCreateVariant, useProductVariants, useDeleteVariant, useUpdateVariant } from '@/hooks/variant.hook';
import { useDiscountsList } from '@/hooks/discount.hook';
import { ListDiscountType } from '@/services/discount.service';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import ImgTag from '../ImgTag';
import DialogDelete from '../DialogDelete';
import { cn } from '@/lib/utils';
import PendingApi from '../PendingApi';
import { toast } from 'sonner';
import { format } from 'date-fns-jalali';

export const VariantFormSchema = z.object({
  name: z.string().min(1, 'نام تنوع الزامی است'),
  nameEn: z.string().optional(),
  price: z.number('قیمت باید عدد باشد').min(0, 'قیمت نمی‌تواند منفی باشد'),
  quantity: z.number('موجودی باید عدد باشد').min(0, 'موجودی نمی‌تواند منفی باشد'),
  colorId: z.string().optional(),
  image: z.string().optional().or(z.literal('')),
  discountId: z.string().optional(),
  attributes: z.array(
    z.object({
      attributeId: z.string(),
      value: z.string().optional(),
    })
  ),
});
export type VariantFormData = z.infer<typeof VariantFormSchema>;


interface ProductVariantsManagerProps {
  productId?: string;
  categoryId?: string
}

export default function ProductVariantsManager({ productId, categoryId }: ProductVariantsManagerProps) {
  if (!productId) return
  const { data: colorData, isLoading: loadingColor } = useColors()
  const { data: discountData, isLoading: loadingDiscount } = useDiscountsList()
  const { data: attributeData } = useAttributeDefinitions({ categoryId: categoryId, noDetail: 'true' })
  const { data: variantsData, isLoading: loadingVariant } = useProductVariants(productId)
  const { mutate: createMutate, isPending: pendingCreate } = useCreateVariant()
  const { mutate: updateMutate, isPending: pendingUpdate } = useUpdateVariant()
  const { mutate: deleteMutate, isPending: pendingDelete } = useDeleteVariant()
  const [idVariant, setIdVariant] = useState<string | null>(null);
  const [open, setOpen] = useState(false)
  const { register, reset, setValue, watch, getValues, handleSubmit, trigger, formState: { errors }, control } = useForm({
    resolver: zodResolver(VariantFormSchema),
    defaultValues: {
      name: '',
      nameEn: '',
      price: 0,
      quantity: 0,
      colorId: '',
      image: '',
      discountId: '',
      attributes: [],
    }
  });
  const resetValue = () => {
    const currentAttributes = getValues('attributes') || [];
    const clearedAttributes = currentAttributes.map((attr: any) => ({ ...attr, value: '', }));
    reset({
      attributes: clearedAttributes,
      colorId: '',
      discountId: '',
      image: '',
      name: '',
      nameEn: '',
      price: 0,
      quantity: 0
    })
    setIdVariant(null)
    setOpen(false)
  }

  const price = watch('price')
  const colorId = watch('colorId')
  const discountId = watch('discountId')

  const editVariant = (id: string) => {
    setIdVariant(id)
    const value = variantsData?.find((item) => item.id === id)
    if (!value) return
    const mergedAttributes = attributeData?.data?.map((att: any) => {
      const existingAttr = value.attributes?.find(
        (a: any) => a.attributeId === att.id
      );
      return {
        attributeId: att.id,
        value: existingAttr ? existingAttr.value : '',
      };
    }) || [];
    reset({
      attributes: mergedAttributes,
      colorId: value.colorId,
      discountId: value.discountId || '',
      image: value.image || '',
      name: value.name,
      nameEn: value.nameEn || '',
      price: Number(value.price),
      quantity: value.quantity
    })
  }

  const onSubmit = async () => {
    const isValid = await trigger()
    const ok = getValues('colorId')
    console.log(ok);

    if (!getValues('colorId')) {
      toast.error('رنگ محصول حتما انتخاب شود')
    }
    if (!isValid) {
      return;
    }
    const rawAttributes = getValues('attributes') || [];
    const body = {
      name: getValues('name'),
      nameEn: getValues('nameEn'),
      price: getValues('price'),
      quantity: getValues('quantity'),
      colorId: getValues('colorId'),
      image: getValues('image'),
      discountId: getValues('discountId'),
      attributes: rawAttributes.filter((attr) => attr.value && attr.value.trim() !== ''),
      productId: productId
    } as any
    if (idVariant) {
      updateMutate({ data: body, id: idVariant }, {
        onSuccess: () => {
          resetValue()
        }
      })
    } else {
      createMutate(body, {
        onSuccess: () => {
          resetValue()
        }
      })
    }
  }

  const formattedColorOptions = useMemo(() => {
    const rawList = colorData?.length ? colorData : []
    return rawList.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      label: (
        <span
          className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0 inline-block"
          style={{
            backgroundColor: item.hexCode?.startsWith('#')
              ? item.hexCode
              : `#${item.hexCode}`
          }}
        />
      ),
    }));
  }, [colorData]);

  const formattedDiscountOptions = useMemo(() => {
    return discountData?.map((item) => ({
      id: item.id,
      name: item.code,
    })) || [];
  }, [discountData]);

  const { fields } = useFieldArray({
    control,
    name: 'attributes',
  });

  useEffect(() => {
    if (attributeData?.data) {
      const defaultAttrs = attributeData.data.map((att) => ({
        attributeId: att.id,
        value: '', // یا مقداری که از قبل وجود داشته
      }));
      setValue('attributes', defaultAttrs);
    }
  }, [attributeData, setValue]);
  if (!productId) return
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 card text-slate-800 dark:text-slate-100 space-y-8">
      {loadingVariant && <PendingApi />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            مدیریت تنوع‌های محصول (Variants)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ویژگی‌ها، رنگ، قیمت و موجودی انبار را برای هر تنوع تعریف کنید.
          </p>
        </div>
        <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full font-bold border border-blue-200 dark:border-blue-500/20">
          تعداد تنوع‌ها: {variantsData?.length || 0}
        </span>
      </div>

      {/* Form (Create / Edit) */}
      <div className="bg-slate-50/80 dark:bg-accent/20 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
          {idVariant ? <Edit3 className="w-4 h-4 text-amber-500 dark:text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-600 dark:text-green-400" />}
          {idVariant ? 'ویرایش تنوع انتخاب شده' : 'افزودن تنوع جدید'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputForm
            name='name'
            label='نام تنوع (فارسی)'
            register={register}
            error={errors.name}
            placeholder="مثال: قرمز - سایز XL"
          />
          <InputForm
            name='nameEn'
            label='نام تنوع (انگلیسی)'
            register={register}
            error={errors.nameEn}
            placeholder="e.g. Red - XL"
          />
          <InputForm
            name='price'
            label='قیمت (تومان)'
            onChange={({ target }) => {
              let value = target.value.replace(/[^0-9]/g, '');
              if (value !== '') {
                const num = Number(value);
                setValue('price', num === 0 ? 0 : num);
              } else {
                setValue('price', 0);
              }
            }}
            value={Number(price).toLocaleString('en-US')}
            type='price'
            error={errors.price}
            placeholder="350,000"
            iconEnd={<DollarSign />}
          />
          <InputForm
            name='quantity'
            label='موجودی انبار'
            register={register}
            error={errors.quantity}
            placeholder="0"
            min={0}
            type='number'
            iconEnd={<PackageCheck />}
          />
          <AutocompleteCustom
            label='انتخاب رنگ'
            onChange={(val) => setValue('colorId', val)}
            options={formattedColorOptions}
            value={colorId}
            placeholder={loadingColor ? 'صبر کنید ...' : 'انتخاب کنید'}
            emptyText='هیچ رنگی یافت نشد'
          />
          <AutocompleteCustom
            label='انتخاب تخفیف'
            onChange={(val) => setValue('discountId', val)}
            options={formattedDiscountOptions || []}
            value={discountId}
            placeholder={loadingDiscount ? 'صبر کنید ...' : 'انتخاب کنید'}
            emptyText='هیچ تخفیفی یافت نشد'
          />
          <InputForm
            name='image'
            label='آدرس عکس'
            register={register}
            error={errors.image}
            placeholder="cloudfale...."
          />
        </div>

        {attributeData?.data?.length ? (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              مقادیر ویژگی‌ها (Attribute Values)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field, index) => {
                const attInfo = attributeData.data.find(
                  (a) => a.id === field.attributeId
                );
                return (
                  <div key={field.id} className="space-y-1">
                    <input
                      type="hidden"
                      autoComplete={'off'}
                      {...register(`attributes.${index}.attributeId` as const)}
                    />

                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {attInfo?.label}
                    </label>

                    <input
                      type="text"
                      autoComplete={'off'}
                      placeholder={`مقدار ${attInfo?.label}`}
                      {...register(`attributes.${index}.value` as const)}
                      className={cn("w-full px-4 py-3 rounded-xl border border-border bg-background",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed")}
                    />
                    {errors.attributes?.[index]?.value && (
                      <span className="text-rose-500 text-xs block">
                        {errors.attributes[index]?.value?.message}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          {idVariant && (
            <button
              type="button"
              onClick={resetValue}
              className="flex cursor-pointer items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              انصراف
            </button>
          )}
          <CustomButton
            type='button'
            color='neon'
            isPending={pendingCreate || pendingUpdate}
            name={idVariant ? 'بروزرسانی تنوع' : 'افزودن تنوع'}
            onClick={handleSubmit(onSubmit)}
            iconEnd={idVariant ? <Pen className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* List of Created Variants */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">لیست تنوع‌های ایجاد شده</h3>

        {!variantsData?.length ? (
          <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <p className="text-slate-500 text-sm">هیچ تنوعی اضافه نشده است.</p>
          </div>
        ) : (
          <div className="space-y-4 dir-rtl">
            <div className="grid grid-cols-1 gap-4">
              {variantsData.map((v: any) => {
                const colorHex = v.color?.hexCode
                  ? v.color.hexCode.startsWith('#')
                    ? v.color.hexCode
                    : `#${v.color.hexCode}`
                  : null;
                const numericPrice = Number(v.price) || 0;
                const discountObj = v.discount;
                const hasDiscount = Boolean(discountObj);
                const now = new Date();
                const startsAt = discountObj?.startsAt ? new Date(discountObj.startsAt) : null;
                const endsAt = discountObj?.endsAt ? new Date(discountObj.endsAt) : null;
                const isNotStarted = startsAt ? startsAt > now : false;
                const isExpired = endsAt ? endsAt < now : false;
                const isActiveState = discountObj?.isActive !== false;
                const isDiscountValid = hasDiscount && isActiveState && !isNotStarted && !isExpired;
                let finalPrice = numericPrice;
                if (isDiscountValid && discountObj) {
                  const dValue = Number(discountObj.value) || 0;
                  if (discountObj.type === 'percentage') {
                    finalPrice = Math.max(0, numericPrice - (numericPrice * dValue) / 100);
                  } else if (discountObj.type === 'fixed') {
                    finalPrice = Math.max(0, numericPrice - dValue);
                  }
                }
                const getDiscountStatusBadge = () => {
                  if (!isActiveState) return { text: 'غیرفعال', color: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20' };
                  if (isNotStarted) return { text: 'شروع نشده', color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' };
                  if (isExpired) return { text: 'منقضی شده', color: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' };
                  return { text: 'فعال و اعمال‌شده', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' };
                };

                const statusBadge = hasDiscount ? getDiscountStatusBadge() : null;

                return (
                  <div
                    key={v.id}
                    className={`relative overflow-hidden p-3 rounded-2xl border transition-all duration-200 ${idVariant === v.id
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800/90 bg-white dark:bg-indigo-400/5 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm dark:shadow-md'
                      }`}
                  >
                    {hasDiscount && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={`absolute top-1 right-2 sm:top-1 sm:right-1 font-black text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-0.5 sm:gap-1 cursor-pointer transition-transform z-10 ${isDiscountValid
                              ? 'bg-linear-to-r from-pink-500 to-rose-600 text-white shadow-pink-500/30 animate-pulse'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                              }`}
                          >
                            <Sparkles className="w-2 h-2 sm:w-3 sm:h-3" />
                            <span>
                              {discountObj.type === 'percentage'
                                ? `${discountObj.value}٪ تخفیف`
                                : `${Number(discountObj.value).toLocaleString()} تومان تخفیف`}
                              {!isDiscountValid && ` (${statusBadge?.text})`}
                            </span>
                          </button>
                        </PopoverTrigger>

                        {/* پاپ‌آپ کامل اطلاعات تخفیف */}
                        <PopoverContent
                          className="w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl z-50 dir-rtl"
                          align="start"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-sm">
                                <Percent className="w-4 h-4" />
                                <span>جزئیات کامل کد تخفیف</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusBadge?.color}`}>
                                {statusBadge?.text}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              {discountObj.code && (
                                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                  <span className="text-slate-500 dark:text-slate-400">کد تخفیف:</span>
                                  <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                                    {discountObj.code}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-center p-1">
                                <span className="text-slate-500 dark:text-slate-400">نوع تخفیف:</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {discountObj.type === 'percentage' ? 'درصدی' : 'مبلغ ثابت'}
                                </span>
                              </div>

                              <div className="flex justify-between items-center p-1">
                                <span className="text-slate-500 dark:text-slate-400">مقدار تخفیف:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                  {discountObj.type === 'percentage'
                                    ? `%${discountObj.value}`
                                    : `${Number(discountObj.value).toLocaleString()} تومان`}
                                </span>
                              </div>

                              {startsAt && (
                                <div className="flex justify-between items-center p-1">
                                  <span className="text-slate-500 dark:text-slate-400">تاریخ شروع:</span>
                                  <span className={`text-slate-700 dark:text-slate-300 ${isNotStarted ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}>
                                    {format(new Date(startsAt), "yyyy/MM/dd - HH:mm:ss")}
                                  </span>
                                </div>
                              )}

                              {endsAt && (
                                <div className="flex justify-between items-center p-1">
                                  <span className="text-slate-500 dark:text-slate-400">تاریخ انقضا:</span>
                                  <span className={`text-slate-700 dark:text-slate-300 ${isExpired ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                                    {format(new Date(endsAt), "yyyy/MM/dd - HH:mm:ss")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* ۲. محتوای اصلی کارت */}
                    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${hasDiscount ? 'pt-8 sm:pt-6' : ''}`}>
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        {v.image && v.image !== 'adad' ? (
                          <div>
                            <ImgTag
                              src={v.image}
                              alt={v.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-inner"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                          </div>
                        )}
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-slate-900 dark:text-white truncate">{v.name}</span>
                            {v.nameEn && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 dir-ltr truncate">({v.nameEn})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                            {v.color && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                {colorHex && (
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 shrink-0"
                                    style={{ backgroundColor: colorHex }}
                                  />
                                )}
                                <span>{v.color.name}</span>
                              </span>
                            )}

                            {v.sku && (
                              <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dir-ltr text-slate-600 dark:text-slate-400">
                                SKU: {v.sku}
                              </span>
                            )}
                          </div>

                          {/* ویژگی‌ها (Attributes) */}
                          {v.attributes && v.attributes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {v.attributes.map((att: any) => (
                                <span
                                  key={att.id}
                                  className="text-[11px] bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 flex items-center gap-1"
                                >
                                  <span className="text-slate-500 dark:text-slate-500">{att.attribute?.label || att.attribute?.key}:</span>
                                  <strong className="text-slate-800 dark:text-slate-200">{att.value}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* بخش قیمت، موجودی و دکمه‌ها */}
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800/80 shrink-0">
                        <div className="flex flex-col gap-1 justify-between items-start">
                          <div className="relative inline-flex flex-col gap-0.5 dir-rtl pt-2 pr-3">
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">قیمت</div>
                            <div className="flex gap-2 items-center justify-start">
                              {isDiscountValid && (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through font-medium">
                                  {numericPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className={`text-base font-black ${isDiscountValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-cyan-600 dark:text-cyan-500'}`}>
                                {finalPrice.toLocaleString()}{' '}
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">تومان</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">موجودی</div>
                            <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                              {v.quantity} عدد
                            </div>
                          </div>
                        </div>

                        {/* دکمه‌های ویرایش و حذف */}
                        <div className="flex flex-col items-center gap-1">
                          {idVariant === v.id ? (
                            <CustomButton
                              color="iconDelete"
                              iconStart={<X className="w-4 h-4" />}
                              onClick={resetValue}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => editVariant(v.id)}
                              className="p-2.5 rounded-xl cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              title="ویرایش"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIdVariant(v.id);
                              setOpen(true);
                            }}
                            className="p-2.5 rounded-xl cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <DialogDelete
        closeModal={() => { setOpen(false); setIdVariant(null); }}
        onDelete={() => {
          if (idVariant) {
            deleteMutate(idVariant, {
              onSuccess: () => {
                setOpen(false);
              }
            });
          }
        }}
        open={open}
        helpText='حذف نوع محصول'
        isPending={pendingDelete}
      />
    </div>
  );
}