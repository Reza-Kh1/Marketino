'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Plus, X, Eye, Trash2, CheckCircle, XCircle, AlertTriangle,
  Edit, Power, PowerOff, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount, useToggleDiscount } from '@/hooks/discount.hook';
import { useStores } from '@/hooks/store.hook';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import DialogView from '@/components/DialogView';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import TooltipCustom from '@/components/TooltipCustom';
import DialogDelete from '@/components/DialogDelete';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomButton from '@/components/CustomButton';
import InputForm from '@/components/inputs/InputForm';
import { Label } from '@/components/ui/label';
import { DiscountType } from '@/services/discount.service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AutocompleteCustom from '@/components/inputs/AutoCompleteCustom';
import { Switch } from '@/components/ui/switch';
import FormDatePicker from '@/components/inputs/FormDatePicker';
import { format } from 'date-fns-jalali';
import { discountSchema } from '@/schemas/discount.schema';
import SelectCustom from '@/components/inputs/SelectCustom';

type DiscountFormData = z.infer<typeof discountSchema>;

export default function AdminDiscountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalMode, setModalMode] = useState<'view' | 'delete' | 'create' | 'edit' | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountType | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  // --- فیلترها از URL ---
  const filters = useMemo(() => {
    const limit = searchParams.get('limit') || undefined;
    const page = searchParams.get('page') || undefined;
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive') || undefined;
    const storeId = searchParams.get('storeId') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    return {
      limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined,
      page: page && !isNaN(Number(page)) ? Number(page) : undefined,
      ...(search && { search }),
      ...(isActive && isActive !== 'ALL' && { isActive: isActive === 'true' }),
      ...(storeId && { storeId }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };
  }, [searchParams]);

  const { data: discountsData, isError, isFetching, isLoading } = useDiscounts(filters);
  const { data: storeData, isLoading: loadingStore } = useStores({ forSelect: true });
  const { mutate: createMutate, isPending: isCreating } = useCreateDiscount();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateDiscount();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteDiscount();
  const { mutate: toggleMutate, isPending: isToggling } = useToggleDiscount();
  // --- فرم با register مستقیم ---
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: '',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 1,
      startsAt: undefined,
      endsAt: undefined,
      description: '',
      isActive: true,
      status: 'PRODUCT',
      storeId: [],
    }
  });
  const storeId = watch('storeId')
  const status = watch('status')
  const value = watch('value')
  const type = watch('type')
  const minOrderAmount = watch('minOrderAmount')
  const maxDiscount = watch('maxDiscount')  
  // برای ویرایش، مقداردهی اولیه فرم
  useEffect(() => {
    if (modalMode === 'edit' && selectedDiscount) {
      const storeIds = selectedDiscount.discountCodeStores?.length ? selectedDiscount.discountCodeStores.map(item => item.storeId) : []
      reset({
        perUserLimit: selectedDiscount.perUserLimit,
        type: selectedDiscount.type,
        code: selectedDiscount.code,
        value: selectedDiscount.value,
        minOrderAmount: selectedDiscount.minOrderAmount,
        maxDiscount: selectedDiscount.maxDiscount || 0,
        usageLimit: selectedDiscount.usageLimit,
        startsAt: selectedDiscount.startsAt ? new Date(selectedDiscount.startsAt) : undefined,
        endsAt: selectedDiscount.endsAt ? new Date(selectedDiscount.endsAt) : undefined,
        description: selectedDiscount.description || '',
        isActive: selectedDiscount.isActive,
        status: selectedDiscount.status,
        storeId: storeIds
      });
      setEditId(selectedDiscount.id);
    } else if (modalMode === 'create') {
      reset({
        code: '',
        value: 0,
        minOrderAmount: 0,
        maxDiscount: 0,
        usageLimit: 1,
        startsAt: undefined,
        endsAt: undefined,
        description: '',
        perUserLimit: 0,
        isActive: true,
        status: 'PRODUCT',
        storeId: [],
        type: 'fixed'
      });
      setEditId(null);
    }
  }, [modalMode, selectedDiscount, reset]);

  // --- تابع ارسال فرم ---
  const onSubmitForm = (data: DiscountFormData) => {
    function isValidStartDate(startsAt: Date): boolean {
      const now = new Date();
      return startsAt.getTime() > now.getTime();
    }
    const payload = {
      ...data,
      startsAt: data.startsAt.toISOString(),
      endsAt: data.endsAt.toISOString(),
      isActive: !isValidStartDate(data.startsAt),
      storeId: data.storeId || [],
    };
    if (selectedDiscount?.id) {
      updateMutate({ data: payload, id: selectedDiscount.id }, {
        onSuccess: () => {
          setModalMode(null);
          reset();
        }
      });
    } else {
      createMutate(payload, {
        onSuccess: () => {
          setModalMode(null);
          reset();
        }
      });
    }
  };

  const onError = (err: any) => {
    console.log(err);
  }

  const columns: ColumnDef<DiscountType>[] = useMemo(() => [
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
      accessorKey: 'code',
      header: 'کد تخفیف',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold text-primary">{row.original.code}</span>
      )
    },
    {
      accessorKey: 'value',
      header: 'مقدار تخفیف',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-sm">{row.original.value.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">{row.original.type === 'fixed' ? 'تومان' : '%'}</span>
        </div>
      )
    },
    {
      accessorKey: 'usageLimit',
      header: 'تعداد استفاده',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-xs">{row.original.usedCount || 0}</span>
          <span className="text-[10px] text-muted-foreground">/ {row.original.usageLimit}</span>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'نوع تخفیف',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.status === 'COMMISSION' ? 'کمیسیون' : row.original.status === 'PLATFORM' ? 'کل فروشگاه' : row.original.status === 'PRODUCT' ? 'محصولات' : 'فروشگاه'}
        </span>
      )
    },
    {
      accessorKey: 'startsAt',
      header: 'تاریخ شروع',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.startsAt ? format(new Date(row.original.startsAt), "yyyy/MM/dd - HH:mm") : '-'}
        </span>
      )
    },
    {
      accessorKey: 'endsAt',
      header: 'تاریخ پایان',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.endsAt ? format(new Date(row.original.endsAt), "yyyy/MM/dd - HH:mm") : '-'}
        </span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'وضعیت',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1",
            isActive
              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
          )}>
            {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isActive ? 'فعال' : 'غیرفعال'}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <TooltipCustom placeHolder="تغییر وضعیت">
            <Button
              onClick={() => toggleMutate(row.original.id)}
              disabled={isToggling}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer hover:bg-amber-500/20"
            >
              {row.original.isActive ? (
                <PowerOff className="w-4 h-4 text-red-500" />
              ) : (
                <Power className="w-4 h-4 text-green-500" />
              )}
            </Button>
          </TooltipCustom>
          <TooltipCustom placeHolder="ویرایش">
            <Button
              onClick={() => {
                setSelectedDiscount(row.original);
                setModalMode('edit');
              }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer hover:bg-blue-500/20"
            >
              <Edit className="w-4 h-4 text-blue-500" />
            </Button>
          </TooltipCustom>
          <TooltipCustom placeHolder="مشاهده">
            <Button
              onClick={() => { setSelectedDiscount(row.original); setModalMode('view'); }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </TooltipCustom>
          <TooltipCustom placeHolder="حذف">
            <Button
              onClick={() => { setSelectedDiscount(row.original); setModalMode('delete'); }}
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
  ], [storeData, isToggling, toggleMutate]);

  // --- نمایش خطا و بارگذاری ---
  if (isError) return (
    <div className="text-center py-20">
      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
      <button onClick={() => router.refresh()} className="text-primary font-bold">تلاش مجدد</button>
    </div>
  );

  if (isLoading) return <PendingApi />;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black mb-1">مدیریت کدهای تخفیف</h2>
          <p className="text-muted-foreground text-sm">
            {discountsData?.pagination?.total || 0} کد تخفیف
          </p>
        </div>
        <Button
          onClick={() => setModalMode('create')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          ایجاد تخفیف جدید
        </Button>
      </div>

      {/* SearchBox */}
      <SearchBox
        selects={[
          {
            label: 'وضعیت',
            placeHolder: 'همه',
            setValue: 'isActive',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'true', name: 'فعال' },
              { id: 'false', name: 'غیرفعال' },
            ]
          }
        ]}
        inputs={[
          { label: 'کد تخفیف', name: 'search', placeholder: 'جستجو بر اساس کد...' },
          { label: 'آیدی فروشگاه', name: 'storeId', placeholder: 'فیلتر بر اساس فروشگاه' },
        ]}
      />

      {/* Table */}
      <DynamicTable
        data={discountsData?.discounts || []}
        columns={columns}
        totalRows={discountsData?.pagination?.total || 0}
        isLoading={isFetching}
        onBulkDelete={() => { }}
        nextPage={discountsData?.pagination?.nextPage}
        prevPage={discountsData?.pagination?.prevPage}
      />

      {/* Dialog Create/Edit */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={() => { setModalMode(null), setEditId(null) }}>
        <DialogContent dir="rtl" className="max-w-4xl! max-h-[90vh] overflow-y-auto bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
          <DialogHeader>
            <DialogTitle className="text-admin-text-primary text-xl font-bold">
              {modalMode === 'create' ? 'ایجاد کد تخفیف جدید' : 'ویرایش کد تخفیف'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm, onError)} className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm
                label="کد تخفیف"
                placeholder="مثال: SUMMER1404"
                register={register}
                name="code"
                error={errors.code}
                className="text-left font-mono"
              />
              <SelectCustom
                value={type}
                placeHolder='انتخاب کنید'
                label='نوع'
                setValue={(e) => setValue('type', e)}
                children={[
                  { name: 'درصدی (%)', id: 'percentage' },
                  { name: 'مبلغ ثابت (تومان)', id: 'fixed' },
                ]}
                error={errors.type}
              />
              <InputForm
                label={type === 'fixed' ? "مقدار تخفیف (تومان)" : 'مقدار تخفیف بر حسب درصد'}
                placeholder="مثال: 50000"
                type={type === "fixed" ? "price" : "number"}
                name="value"
                onChange={({ target }) => {
                  let value = target.value.replace(/[^0-9]/g, '');
                  if (type !== "fixed" && value >= 100) {
                    return
                  }
                  if (value !== '') {
                    const num = Number(value);
                    setValue('value', num === 0 ? 0 : num);
                  } else {
                    setValue('value', 0);
                  }
                }}
                value={Number(value).toLocaleString('en-US')}
                error={errors.value}
              />
              <InputForm
                onChange={({ target }) => {
                  let value = target.value.replace(/[^0-9]/g, '');
                  if (value !== '') {
                    const num = Number(value);
                    setValue('minOrderAmount', num === 0 ? 0 : num);
                  } else {
                    setValue('minOrderAmount', 0);
                  }
                }}
                value={Number(minOrderAmount).toLocaleString('en-US')}
                label="حداقل مبلغ سفارش (تومان)"
                placeholder="مثال: 200000"
                type="price"
                name="minOrderAmount"
                error={errors.minOrderAmount}
              />
              <InputForm
                onChange={({ target }) => {
                  let value = target.value.replace(/[^0-9]/g, '');
                  if (value !== '') {
                    const num = Number(value);
                    setValue('maxDiscount', num === 0 ? 0 : num);
                  } else {
                    setValue('maxDiscount', 0);
                  }
                }}
                value={Number(maxDiscount).toLocaleString('en-US')}
                label="حداکثر تخفیف (تومان) - اختیاری"
                placeholder="مثال: 500000"
                type="price"
                name="maxDiscount"
                error={errors.maxDiscount}
              />
              <InputForm
                label="تعداد دفعات قابل استفاده کاربران"
                placeholder="مثال: 100"
                type="number"
                register={register}
                name="usageLimit"
                error={errors.usageLimit}
              />
              <FormDatePicker
                name="startsAt"
                control={control}
                includeTime
                placeholder="تاریخ و زمان شروع"
                label="تاریخ شروع"
              />
              <FormDatePicker
                name="endsAt"
                control={control}
                includeTime
                placeholder="تاریخ و زمان پایان"
                label="تاریخ پایان"
              />
              <InputForm
                label="تعداد دفعات مجاز استفاده یک کاربر"
                placeholder="مثال: 1"
                type="number"
                register={register}
                name="perUserLimit"
                error={errors.perUserLimit}
              />
              <SelectCustom
                value={status}
                placeHolder='انتخاب کنید'
                label='نوع'
                setValue={(e) => setValue('status', e)}
                children={[
                  { name: 'تمام فروشگاه ها', id: 'PLATFORM' },
                  { name: 'فروشگاه', id: 'STORE' },
                  { name: 'کمیسیون', id: 'COMMISSION' },
                  { name: 'محصول', id: 'PRODUCT' },
                ]}
                disable={!!editId}
                error={errors.status}
              />
              {status === 'STORE' && (
                <div className="col-span-2">
                  <AutocompleteCustom
                    multiple
                    onChange={(value) => setValue('storeId', value)}
                    value={storeId || []}
                    label="فروشگاه (اختیاری)"
                    options={storeData || [] as any}
                    placeholder={loadingStore ? 'صبر کنید ...' : 'انتخاب فروشگاه (اختیاری)'}
                    emptyText="فروشگاهی یافت نشد!"
                  />
                </div>
              )}
            </div>

            {/* توضیحات */}
            <InputForm
              label="توضیحات (اختیاری)"
              placeholder="توضیحات مربوط به کد تخفیف..."
              type="textarea"
              rows={3}
              register={register}
              name="description"
              error={errors.description}
            />

            {/* دکمه‌ها */}
            <DialogFooter className="flex justify-between! items-center w-full pt-4 border-t border-border/30">
              <CustomButton
                type="submit"
                isPending={isCreating || isUpdating}
                name={modalMode === 'create' ? 'ایجاد تخفیف' : 'ذخیره تغییرات'}
                color="white"
                iconStart={modalMode === 'create' ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              />
              <CustomButton
                onClick={() => { setModalMode(null), setEditId(null) }}
                isPending={false}
                name="انصراف"
                color="gray"
                iconStart={<X className="w-4 h-4" />}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Dialog Delete */}

      {/* Dialog View */}
      <DialogView
        open={modalMode === 'view'}
        title="جزئیات کد تخفیف"
        setOpen={() => setModalMode(null)}
        options={[
          {
            head: 'اطلاعات اصلی',
            detail: [
              { name: 'شناسه', value: selectedDiscount?.id || '-' },
              { name: 'کد تخفیف', value: selectedDiscount?.code || '-' },
              { name: 'مقدار تخفیف', value: selectedDiscount?.value ? `${selectedDiscount.value.toLocaleString()} تومان` : '-' },
              { name: 'حداقل مبلغ سفارش', value: selectedDiscount?.minOrderAmount ? `${selectedDiscount.minOrderAmount.toLocaleString()} تومان` : '-' },
              { name: 'حداکثر تخفیف', value: selectedDiscount?.maxDiscount ? `${selectedDiscount.maxDiscount.toLocaleString()} تومان` : 'ندارد' },
              { name: 'تعداد استفاده', value: `${selectedDiscount?.usedCount || 0} از ${selectedDiscount?.usageLimit || 0}` },
              { name: 'وضعیت', value: selectedDiscount?.isActive ? 'فعال' : 'غیرفعال' },
              { name: 'فروشگاه', value: storeData?.stores?.find(s => s.id === selectedDiscount?.storeId)?.name || 'عمومی' },
              { name: 'نوع تخفیف', value: selectedDiscount?.status === 'COMMISSION' ? 'کمیسیون' : selectedDiscount?.status === 'PLATFORM' ? 'کل فروشگاه' : selectedDiscount?.status === 'PRODUCT' ? 'محصولات' : 'فروشگاه' },
            ]

          },
          {
            head: 'تاریخ‌ها',
            detail: [
              { name: 'تاریخ شروع', value: selectedDiscount?.startsAt ? format(new Date(selectedDiscount.startsAt), "yyyy/MM/dd - HH:mm") : '-' },
              { name: 'تاریخ پایان', value: selectedDiscount?.endsAt ? format(new Date(selectedDiscount.endsAt), "yyyy/MM/dd - HH:mm") : '-' },
              { name: 'تاریخ ایجاد', value: selectedDiscount?.createdAt ? format(new Date(selectedDiscount.createdAt), "yyyy/MM/dd - HH:mm") : '-' },
            ]
          },
          {
            head: 'توضیحات',
            detail: [
              { name: 'توضیحات', value: selectedDiscount?.description || 'بدون توضیحات' },
            ]
          }
        ]}
      />
      <DialogDelete
        closeModal={() => setModalMode(null)}
        onDelete={() => {
          if (selectedDiscount?.id) {
            deleteMutate(selectedDiscount.id, {
              onSuccess: () => setModalMode(null)
            });
          }
        }}
        isPending={isDeleting}
        open={modalMode === 'delete'}
        helpText={<p>آیا از حذف کد تخفیف <span className="font-bold">{selectedDiscount?.code}</span> مطمئن هستید؟</p>}
      />
    </div>
  );
}