'use client';

import { useMemo, useState } from 'react';
import {
  Truck,
  Check,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  Clock,
  DollarSign,
  Settings2,
  Layers,
  Sparkles,
  X,
  Eye,
  Pen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PendingApi from '@/components/PendingApi';
import { Button } from '@/components/ui/button';
import CustomButton from '@/components/CustomButton';
import DialogDelete from '@/components/DialogDelete';
import { useShippingMethods, useStoreShippings, useCreateStoreShipping, useUpdateStoreShipping, useDeleteStoreShipping, useStoreShippingDetail, useDeleteShippingRate, useUpdateShippingRate, useCreateShippingRate } from '@/hooks/shipping.hook';
import { ShippingMethodType, ShippingStoreMethodType, ShippingStoreRateType } from '@/services/shipping.service';
import InputForm from '@/components/inputs/InputForm';
import TooltipCustom from '@/components/TooltipCustom';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import DynamicTable from '@/components/DynamicTable';
import AutocompleteCustom from '@/components/inputs/AutoCompleteCustom';
import { useProvinces } from '@/hooks/province.hook';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MotionWrapper from '@/components/motion/MotionWrapper';

const numberFormik = ({ target, value }: { target?: { value: string }, value?: number }): number | string => {
  if (value) {
    return Number(value).toLocaleString('en-US')
  }
  if (target) {
    let values = target.value.replace(/[^0-9]/g, '');
    if (values !== '') {
      const num = Number(values);
      return num === 0 ? 0 : num
    } else {
      return 0
    }
  }
  return 0
}

export default function StoreShippingPage() {
  const [activeRateMethod, setActiveRateMethod] = useState<{ id: string; name: string } | null>(null);
  const [selectedSystemMethod, setSelectedSystemMethod] = useState<ShippingMethodType | null>(null);
  const [editingStoreShipping, setEditingStoreShipping] = useState<ShippingStoreMethodType | null>(null);
  const [idTableRate, setIdTableRate] = useState<string>('')
  const [idRate, setIdRate] = useState({
    id: '', open: false,
    provinceId: '', price: 0, deliveryMaxDays: 0
  })
  const [openModal, setOpenModal] = useState<'rate' | 'store' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: provincesData } = useProvinces();
  const [formRate, setFormRate] = useState({
    provinceId: '',
    price: 0,
    deliveryMaxDays: 0
  })
  const [formData, setFormData] = useState({
    description: '',
    descriptionEn: '',
    isActive: true,
    phrase: '',
    minDays: 1,
    maxDays: 3,
    defaultPrice: 0,
  });
  const { data: systemMethods, isLoading: isSystemLoading, isError, refetch } = useShippingMethods();
  const { data: storeMethods, isLoading: isStoreLoading } = useStoreShippings();

  const { mutate: createStoreShipping, isPending: isCreating } = useCreateStoreShipping();
  const { mutate: updateStoreShipping, isPending: isUpdating } = useUpdateStoreShipping();
  const { mutate: deleteStoreShipping, isPending: isDeleting } = useDeleteStoreShipping();
  const { mutate: deleteRateShipping, isPending: isDeletingRate } = useDeleteShippingRate();
  const { mutate: updateRateShipping, isPending: isUpdate } = useUpdateShippingRate();
  const { mutate: createRateShipping, isPending: isCreate } = useCreateShippingRate();
  const { data: storeDetailData, isLoading: loadingStore } = useStoreShippingDetail(idTableRate);
  const isLoading = isSystemLoading || isStoreLoading;
  // باز کردن فرم برای تنظیم شیوه جدید از روی لیست سیستم
  const handleOpenAddForm = (method: ShippingMethodType) => {
    setSelectedSystemMethod(method);
    setEditingStoreShipping(null);
    setFormData({
      description: '',
      descriptionEn: '',
      isActive: true,
      phrase: '',
      minDays: 1,
      maxDays: 3,
      defaultPrice: 0,
    });
  };

  // باز کردن فرم برای ویرایش شیوه موجود در فروشگاه
  const handleOpenEditForm = (item: ShippingStoreMethodType) => {
    const parentSystemMethod = systemMethods?.find((sm: ShippingMethodType) => sm.id === item.shippingMethodId);
    setSelectedSystemMethod(parentSystemMethod || null);
    setEditingStoreShipping(item);
    setFormData({
      description: item.description || '',
      descriptionEn: item.descriptionEn || '',
      isActive: item.isActive ?? true,
      phrase: item.phrase || '',
      minDays: item.minDays ?? 1,
      maxDays: item.maxDays ?? 3,
      defaultPrice: item.defaultPrice ? Number(item.defaultPrice) : 0,
    });
  };

  const handleSubmit = () => {
    if (!selectedSystemMethod && !editingStoreShipping) return;
    if (editingStoreShipping) {
      updateStoreShipping(
        {
          id: editingStoreShipping.id,
          data: formData,
        },
        {
          onSuccess: () => {
            setEditingStoreShipping(null);
            setSelectedSystemMethod(null);
          },
        }
      );
    } else if (selectedSystemMethod) {
      createStoreShipping(
        {
          ...formData,
          shippingMethodId: selectedSystemMethod.id,
        } as any,
        {
          onSuccess: () => {
            setSelectedSystemMethod(null);
          },
        }
      );
    }
  };

  const handleRate = () => {    
    if (idRate.id) {
      const newData = {
        price: Number(idRate.price),
        deliveryMaxDays: Number(idRate.deliveryMaxDays),
        storeShippingMethodId: idTableRate,
        provinceId: idRate.provinceId,
      }
      updateRateShipping({ id: idRate.id, data: newData }, {
        onSuccess: () => {
          setIdRate({
            id: '',
            open: false,
            provinceId: '',
            price: 0,
            deliveryMaxDays: 0
          })
        }
      })
      return
    } else {
      const body = {
        price: formRate.price,
        deliveryMaxDays: formRate.deliveryMaxDays,
        storeShippingMethodId: idTableRate,
        provinceId: formRate.provinceId,
      }
      createRateShipping(body, {
        onSuccess: () => {
          setFormRate({
            provinceId: '',
            price: 0,
            deliveryMaxDays: 0
          })
        }
      })
    }
  }

  const getNameShipping = () => {
    const id = storeMethods?.find((i) => i.id === idTableRate)?.shippingMethodId
    return systemMethods?.find((item) => item.id === id)?.name
  }

  const columns: ColumnDef<ShippingStoreRateType>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          className="border-admin-border"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          className="border-admin-border"
        />
      )
    },
    {
      accessorKey: 'province',
      id: 'province',
      header: 'استان',
      cell: ({ row }) => (
        <span className="text-xs line-clamp-2 max-w-xs">
          {row.original?.province.name || '-'}
        </span>
      )
    },
    {
      accessorKey: 'price',
      id: 'price',
      header: 'قیمت',
      cell: ({ row }) => (
        <span className="text-xs line-clamp-2 max-w-xs">
          {Number(row.original?.price).toLocaleString('en-US') || '-'} تومان
        </span>
      )
    },
    {
      accessorKey: 'deliveryMaxDays',
      id: 'deliveryMaxDays',
      header: 'حدکثر زمان ارسال',
      cell: ({ row }) => (
        <span className="text-xs line-clamp-2 max-w-xs">
          {row.original?.deliveryMaxDays || '-'}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      header: 'تاریخ',
      cell: ({ row }) => (
        <span className="text-xs">
          {new Date(row.original.createdAt).toLocaleDateString('fa-IR') || '-'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <TooltipCustom placeHolder="ویرایش">
            <Button
              onClick={() => {
                setIdRate({
                  id: row.original.id, open: true,
                  deliveryMaxDays: row.original.deliveryMaxDays,
                  price: row.original.price,
                  provinceId: row.original.province.id
                });
              }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-500 cursor-pointer hover:bg-blue-500/20"
            >
              <Pen className="w-4 h-4" />
            </Button>
          </TooltipCustom>
          <TooltipCustom placeHolder="حذف">
            <Button
              onClick={() => { setDeleteId(row.original.id); setOpenModal("rate"); }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 cursor-pointer hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipCustom>
        </div>
      )
    },
  ], [storeDetailData]);

  if (isError) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="mb-2 text-sm text-muted-foreground">خطا در دریافت اطلاعات شیوه‌های ارسال</p>
        <button onClick={() => refetch()} className="text-primary font-bold text-sm">
          تلاش مجدد
        </button>
      </div>
    );
  }
  if (isLoading) return <PendingApi />;
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h2 className="text-2xl font-black mb-1">مدیریت شیوه‌های ارسال فروشگاه</h2>
          <p className="text-muted-foreground text-sm">
            از لیست بالا شیوه مورد نظر را انتخاب و پیکربندی کنید، سپس شیوه‌های فعال خود را در بخش پایین مدیریت نمایید.
          </p>
          <div className="bg-amber-500/10 border mt-3 border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-400 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              💡 راهنمای قیمت‌گذاری
            </p>
            <p className="leading-relaxed">
              سیستم ارسال اولویت را به قیمت اختصاصی استان‌ها می‌دهد. اگر استانی قیمت اختصاصی داشته باشد، همان محاسبه می‌شود؛ در غیر این صورت هزینه بر اساس قیمت پیش‌فرض محاسبه خواهد شد. اگر قیمت پیش‌فرض را خالی بگذارید، این روش فقط برای استان‌های دارای قیمت اختصاصی نمایش داده می‌شود.            </p>
          </div>
        </div>
      </div>
      {/* ۱. لیست شیوه‌های ارسال عمومی سیستم */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">شیوه‌های ارسال در دسترس سیستم</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemMethods?.map((method: ShippingMethodType) => {
            const isConfigured = storeMethods?.some(
              (sm: ShippingStoreMethodType) => sm.shippingMethodId === method.id
            );
            return (
              <div
                key={method.id}
                className={cn(
                  'border rounded-xl p-4 flex flex-col justify-between gap-4 bg-card transition-all',
                  isConfigured ? 'border-green-500/40 bg-green-500/5' : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {method.name} {method.nameEn && <span className="text-xs text-muted-foreground">({method.nameEn})</span>}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        {method.isFreeMethod ? 'امکان ارسال رایگان' : 'ارسال عادی'}
                      </span>
                    </div>
                  </div>
                  {isConfigured && (
                    <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> فعال
                    </span>
                  )}
                </div>
                {!isConfigured && (
                  <Button
                    size="sm"
                    variant={isConfigured ? 'outline' : 'default'}
                    className="w-full text-xs gap-1.5 mt-2 cursor-pointer"
                    onClick={() => handleOpenAddForm(method)}
                  >
                    <Plus className="w-4 h-4" />
                    افزودن به فروشگاه
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* ۲. فرم پیکربندی / ویرایش شیوه ارسال */}
      {(selectedSystemMethod || editingStoreShipping) && (
        <div className="bg-card border border-primary/40 rounded-xl p-6 space-y-4 shadow-md animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" />
              {editingStoreShipping ? 'ویرایش کانفیگ شیوه ارسال' : 'پیکربندی جدید برای:'}{' '}
              <span className="text-primary">
                {selectedSystemMethod?.name || 'شیوه انتخاب‌شده'}
              </span>
            </h3>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium">
              {editingStoreShipping ? 'حالت ویرایش' : 'حالت ایجاد'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputForm
              name='description'
              label='توضیحات (فارسی)'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات روش ارسال را وارد کنید..."
              rows={3}
              type='textarea'
            />
            <InputForm
              name='descriptionEn'
              label='توضیحات (انگلیسی)'
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Description in English..."
              rows={3}
              type='textarea'
            />
            <InputForm
              name='phrase'
              label='عبارت اختصاصی (Phrase)'
              value={formData.phrase}
              onChange={(e) => setFormData({ ...formData, phrase: e.target.value })}
              placeholder="مثلا: تحویل اکسپرس"
            />
            <InputForm
              name="defaultPrice"
              label="هزینه ارسال پیش‌فرض (تومان)"
              helpText="این مبلغ به‌عنوان هزینه ارسال استاندارد برای تمامی استان‌ها اعمال می‌شود؛ مگر آنکه برای استانی قیمت اختصاصی تعیین کنید."
              value={numberFormik({ value: formData.defaultPrice })}
              onChange={({ target }) =>
                setFormData({
                  ...formData,
                  defaultPrice: numberFormik({ target }) as number,
                })
              }
              placeholder="مثلاً: ۵۰,۰۰۰"
              type="text"
            />
            <InputForm
              name='minDays'
              type='text'
              label='حداقل روز تحویل'
              value={Number(formData.minDays)}
              onChange={({ target }) => setFormData({ ...formData, minDays: numberFormik({ target }) as number })}
            />
            <InputForm
              name='maxDays'
              type='text'
              label='حداکثر روز تحویل'
              value={Number(formData.maxDays)}
              onChange={({ target }) => setFormData({ ...formData, maxDays: numberFormik({ target }) as number })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background">
            <div>
              <span className="text-sm font-medium">وضعیت فعال بودن</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                این شیوه ارسال در فروشگاه فعال باشد
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => setFormData({ ...formData, isActive: formData.isActive ? false : true })}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 cursor-pointer',
                formData.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200',
                  formData.isActive ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                )}
              />
            </button>
          </div>
          <div className="flex justify-between gap-2 pt-3 border-t border-border/60">
            <CustomButton
              isPending={isCreating || isUpdating}
              onClick={handleSubmit}
              color='blueRadinat'
              className="px-6 text-xs"
              iconStart={<Plus />}
            >
              {editingStoreShipping ? 'بروزرسانی تغییرات' : 'ذخیره و ثبت شیوه ارسال'}
            </CustomButton>
            <CustomButton
              onClick={() => {
                setSelectedSystemMethod(null);
                setEditingStoreShipping(null);
              }}
              color='gray'
              className="px-6 text-xs"
              iconStart={<X />}
            >
              انصراف
            </CustomButton>
          </div>
        </div>
      )}
      {/* ۳. شیوه‌های ارسال فعال فروشگاه شما */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">شیوه‌های ارسال فعال فروشگاه شما</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
            تعداد: {storeMethods?.length || 0}
          </span>
        </div>
        {storeMethods && storeMethods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeMethods.map((item: ShippingStoreMethodType) => {
              const matchedSystem = systemMethods?.find(
                (sm: ShippingMethodType) => sm.id === item.shippingMethodId
              );
              return (
                <div
                  key={item.id}
                  className="bg-card border border-border/80 rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-sm">
                          {matchedSystem?.name || 'شیوه ارسال ثبت‌شده'}
                        </h4>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border font-semibold',
                          item.isActive
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                        )}
                      >
                        {item.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>
                    {item.phrase && (
                      <p className="text-xs text-primary font-medium">عبارت: {item.phrase}</p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description || 'بدون توضیحات ثبت‌شده'}
                    </p>
                    <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.minDays} الی {item.maxDays} روز</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <DollarSign className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {item.defaultPrice && Number(item.defaultPrice) > 0
                            ? `${Number(item.defaultPrice).toLocaleString('fa-IR')} تومان`
                            : 'رایگان / پیش‌فرض'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* دکمه‌های عملیاتی شیوه فروشگاه */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1 cursor-pointer"
                        onClick={() => handleOpenEditForm(item)}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                        onClick={() => { setDeleteId(item.id), setOpenModal('store') }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {/* دکمه اختصاصی سفارشی */}
                    <Button
                      size="sm"
                      variant="secondary"
                      className={cn("h-8 text-xs cursor-pointer gap-1 text-primary hover:bg-primary/20 border border-primary/20",
                        idTableRate === item.id ? 'bg-blue-300' : 'bg-primary/10'
                      )}
                      onClick={() => setIdTableRate(item.id)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      نمایش قیمت استان ها
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-xl bg-card/50">
            <p className="text-sm text-muted-foreground">
              هنوز هیچ شیوه ارسالی برای فروشگاه شما ثبت نشده است. از باکس‌های بالا یک شیوه انتخاب کنید.
            </p>
          </div>
        )}
      </div>
      {idTableRate && storeMethods?.length && (
        <>
          <div className='mt-3'>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">شیوه‌های ارسال {getNameShipping()}</h3>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                تعداد: {storeMethods?.length || 0}
              </span>
            </div>
          </div>
          <div className="bg-card grid grid-cols-3 border border-border/80 rounded-xl p-4 shadow-sm gap-3 items-center justify-between"  >
            <AutocompleteCustom
              emptyText='هیچ استانی یافت نشد !'
              label='استان'
              onChange={(value) => setFormRate({ ...formRate, provinceId: value })}
              options={provincesData || []}
              placeholder='استان خود را انتخاب کنید'
              value={formRate.provinceId}
            />
            <InputForm
              name="priceRate"
              label="هزینه ارسال (تومان)"
              value={numberFormik({ value: formRate.price })}
              onChange={({ target }) =>
                setFormRate({
                  ...formRate,
                  price: numberFormik({ target }) as number,
                })
              }
              placeholder="مثلاً: ۵۰,۰۰۰"
              type="text"
            />
            <InputForm
              name="deliveryMaxDays"
              label="حداکثر زمان تحویل مرسوله"
              value={numberFormik({ value: formRate.deliveryMaxDays })}
              onChange={({ target }) =>
                setFormRate({
                  ...formRate,
                  deliveryMaxDays: numberFormik({ target }) as number,
                })
              }
              type="text"
            />
            <div className='col-span-3'>
              <CustomButton
                iconStart={<Plus />}
                name='افزودن'
                onClick={handleRate}
                isPending={isUpdate || isCreate}
                color='blueRadinat'
              />
            </div>
          </div>
          <DynamicTable
            data={storeDetailData || []}
            columns={columns}
            limitPage={200}
            totalRows={storeDetailData?.length || 0}
            isLoading={loadingStore}
            onBulkDelete={() => { }}
          />
        </>
      )}
      <Dialog open={idRate?.open} onOpenChange={() => setIdRate({ ...idRate, open: false })}>
        <DialogContent className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
          <DialogHeader>
            <DialogTitle className="text-admin-text-primary text-xl font-bold">
              <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                ویرایش شیوه ارسال
              </MotionWrapper>
            </DialogTitle>
            <div className="grid grid-cols-3 gap-3 items-center justify-between"  >
              <AutocompleteCustom
                emptyText='هیچ استانی یافت نشد !'
                label='استان'
                onChange={(value) => setIdRate({ ...idRate, provinceId: value })}
                options={provincesData || []}
                placeholder='استان خود را انتخاب کنید'
                value={idRate.provinceId}
              />
              <InputForm
                name="priceRate"
                label="هزینه ارسال (تومان)"
                value={numberFormik({ value: idRate.price })}
                onChange={({ target }) =>
                  setIdRate({
                    ...idRate,
                    price: numberFormik({ target }) as number,
                  })
                }
                placeholder="مثلاً: ۵۰,۰۰۰"
                type="text"
              />
              <InputForm
                name="deliveryMaxDays"
                label="حداکثر زمان تحویل مرسوله"
                value={numberFormik({ value: idRate.deliveryMaxDays })}
                onChange={({ target }) =>
                  setIdRate({
                    ...idRate,
                    deliveryMaxDays: numberFormik({ target }) as number,
                  })
                }
                type="text"
              />

            </div>
          </DialogHeader>
          <DialogFooter>
            <div className="pt-4 border-t border-admin-border flex justify-between items-center w-full">
              <MotionWrapper delay={0.5} preset='slideUpBlur' className=''>
                <CustomButton
                  iconStart={<Plus />}
                  name='ویرایش اطلاعات'
                  onClick={handleRate}
                  isPending={isUpdate || isCreate}
                  color='blueRadinat'
                />
              </MotionWrapper>
              <MotionWrapper delay={0.5} preset='slideUpBlur' className=''>
                <CustomButton
                  iconEnd={<X className='w-4 h-4' />}
                  name='بستن پنجره'
                  onClick={() => setIdRate({ ...idRate, open: false })}
                />
              </MotionWrapper>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* مدال حذف شیوه ارسال فروشگاه */}
      <DialogDelete
        open={openModal === 'rate' || openModal === 'store'}
        closeModal={() => setOpenModal(null)}
        isPending={isDeleting || isDeletingRate}
        onDelete={() => {
          if (deleteId) {
            if (openModal === 'rate') {
              deleteRateShipping(deleteId, {
                onSuccess: () => {
                  setDeleteId(null);
                  setOpenModal(null)
                  if (activeRateMethod?.id === deleteId) {
                    setActiveRateMethod(null);
                  }
                },
              });
            } else {
              deleteStoreShipping(deleteId, {
                onSuccess: () => {
                  setDeleteId(null);
                  setOpenModal(null)
                  if (activeRateMethod?.id === deleteId) {
                    setActiveRateMethod(null);
                  }
                },
              });
            }
          }
        }}
      />
    </div>
  );
}