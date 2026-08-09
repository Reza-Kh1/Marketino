'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Save, X, Calendar, Percent, Loader2, Trash2, CirclePower } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi, PaginationType, type DiscountCode } from '@/lib/api';
import FormDatePicker from '@/components/inputs/FormDatePicker';
import { useForm } from 'react-hook-form';
import PaginationBar from '@/components/admin/PaginationBar';
import { useSearchParams } from 'next/navigation';
import InputForm from '@/components/inputs/InputForm';
import SelectCustom from '@/components/inputs/SelectCustom';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import CustomButton from '@/components/CustomButton';
import { toast } from 'sonner';

export const discountSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "کد تخفیف باید حداقل ۳ کاراکتر باشد")
      .max(50, "کد تخفیف بیش از حد طولانی است"),
    type: z.enum(["percentage", "fixed"], {
      error: "نوع تخفیف را انتخاب کنید",
    }),
    value: z
      .number({
        error: "مقدار تخفیف الزامی است",
      })
      .positive("مقدار تخفیف باید بیشتر از صفر باشد"),
    minOrderAmount: z
      .number()
      .min(0, "حداقل مبلغ سفارش نمی‌تواند منفی باشد")
      .default(0),
    maxDiscount: z
      .number()
      .min(0, "سقف تخفیف نمی‌تواند منفی باشد")
      .optional(),
    usageLimit: z
      .number()
      .int("باید عدد صحیح باشد")
      .min(0)
      .default(0),
    perUserLimit: z
      .number()
      .int("باید عدد صحیح باشد")
      .min(0)
      .default(0),
    startsAt: z.coerce.date({
      error: "تاریخ شروع الزامی است",
    }),
    endsAt: z.coerce.date({
      error: "تاریخ پایان الزامی است",
    }),
    isActive: z.string().default('true'),
    description: z
      .string()
      .max(500, "توضیحات بیش از حد طولانی است")
      .optional(),
  })
  .refine(
    (data) => data.endsAt > data.startsAt,
    {
      message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) =>
      data.type !== "percentage" ||
      (data.value > 0 && data.value <= 100),
    {
      message: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد",
      path: ["value"],
    }
  );
type DiscountFormType = z.infer<typeof discountSchema>;

export default function AdminDiscountsPage() {
  const { control, getValues, reset, register, formState: { errors }, setValue, watch, handleSubmit } = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: '',
      type: 'percentage' as 'percentage' | 'fixed',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 100,
      startsAt: null,
      endsAt: null,
      isActive: 'true'
    }
  })
  const type = watch('type')
  const isActiveWatch = watch('isActive')
  const page = useSearchParams()
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [pagination, setPagination] = useState<PaginationType>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.discounts(Number(page.get('page') || 1));
      setDiscounts(res.discounts);
      setPagination(res?.pagination);
    } catch (err: any) {
      toast.error('خطا در بارگذاری کدهای تخفیف');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleCreate = async () => {
    try {
      const body = {
        code: getValues('code'),
        type: getValues('type'),
        value: getValues('value'),
        minOrderAmount: getValues('minOrderAmount'),
        maxDiscount: getValues('maxDiscount'),
        usageLimit: getValues('usageLimit'),
        startsAt: getValues('startsAt'),
        endsAt: getValues('endsAt'),
        isActive: getValues('isActive'),
      }
      setSaving(true);
      await adminApi.createDiscount(body);
      toast.success('کد تخفیف با موفقیت ایجاد شد');
      reset()
      setShowForm(false);
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err.message || 'خطا در ایجاد کد تخفیف');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کد تخفیف اطمینان دارید؟')) return;
    try {
      await adminApi.deleteDiscount(id);
      toast.success('کد تخفیف حذف شد');
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err.message || 'خطا در حذف کد تخفیف');
    }
  };

  const changeDiscount = async (id: string) => {
    await adminApi.changeDiscount(id);
    toast.success('کد تخفیف با موفقیت ویرایش شد');
    fetchDiscounts();
  }

  const formatDate = (d: string | Date) => {
    try { return new Date(d).toLocaleDateString('fa-IR'); } catch { return String(d); }
  };

  const isActive = (d: DiscountCode) => {
    try {
      const now = Date.now();
      const start = new Date(d.startsAt).getTime();
      const end = new Date(d.endsAt).getTime();
      return d.isActive && now >= start && now <= end;
    } catch { return d.isActive; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black">کدهای تخفیف</h2>
          <p className="text-muted-foreground text-sm">مدیریت کدهای تخفیف و پیشنهادات ویژه</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4" /> کد تخفیف جدید
        </button>
      </div>

      {/* New Discount Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <h3 className="font-black text-lg mb-4">ایجاد کد تخفیف جدید</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputForm
              name='code'
              type='text'
              register={register}
              label='کد تخفیف'
              error={errors.code}
              placeholder='مثلاً: SALE50'
            />
            <div>
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
            </div>
            <InputForm
              name='value'
              type={'number'}
              register={register}
              label={type === 'percentage' ? 'درصد تخفیف' : 'مبلغ (تومان)'}
              error={errors.value}
            />
            <InputForm
              name='minOrderAmount'
              type='number'
              register={register}
              label='حداقل سفارش'
              error={errors.minOrderAmount}
            />
            <InputForm
              name='maxDiscount'
              type='number'
              register={register}
              label='سقف تخفیف'
              error={errors.maxDiscount}
            />
            <InputForm
              name='usageLimit'
              type='number'
              register={register}
              label='محدودیت استفاده'
              error={errors.usageLimit}
            />
            <FormDatePicker
              name='startsAt'
              control={control}
              includeTime
              placeholder=''
              label='تاریخ شروع'
            />
            <FormDatePicker
              name='endsAt'
              control={control}
              includeTime
              placeholder=''
              label='تاریخ پایان'
            />
            <div>
              <SelectCustom
                value={isActiveWatch}
                placeHolder='انتخاب کنید'
                label='وضعیت تخفیف'
                setValue={(e) => setValue('isActive', e)}
                children={[
                  { name: 'فعال', id: 'true' },
                  { name: 'غیر فعال', id: 'false' },
                ]}
                error={errors.isActive}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit(handleCreate)}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-sm hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" /> انصراف
            </button>
          </div>
        </motion.div>
      )}
      {/* Discounts List */}
      {discounts?.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Tag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">کد تخفیفی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discounts.map((d, i) => {
            const active = isActive(d);
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', active ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800')}>
                      <Tag className={cn('w-6 h-6', active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400')} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-black text-lg text-primary">{d.code}</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-bold',
                          active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                        )}>
                          {active ? 'قابل استفاده' : 'غیر قابل استفاده'}
                        </span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-bold',
                          d.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                        )}>
                          {d.isActive ? 'فعال' : 'غیر فعال'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="font-bold">
                          {d.type === 'percentage'
                            ? `${d.value}٪ تخفیف`
                            : `${d.value.toLocaleString()} تومان`}
                        </span>
                        {d.maxDiscount && d.maxDiscount > 0 && (
                          <span className="text-muted-foreground">| سقف: {d.maxDiscount.toLocaleString()} تومان</span>
                        )}
                        {d.minOrderAmount && d.minOrderAmount > 0 && (
                          <span className="text-muted-foreground">| حداقل سفارش: {d.minOrderAmount.toLocaleString()} تومان</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(d.startsAt)} تا {formatDate(d.endsAt)}
                        </span>
                        <span>{d.usedCount} / {d.usageLimit} استفاده</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${d.usageLimit > 0 ? (d.usedCount / d.usageLimit) * 100 : 0}%` }}
                      />
                    </div>
                    <CustomButton
                      tooltip={d.isActive ? "غیر فعال کردن" : "فعال کردن"}
                      onClick={() => changeDiscount(d.id)}
                      iconStart={<CirclePower className="w-4 h-4" />}
                      color='icon'
                      className={d.isActive ? 'text-blue-500' : 'text-red-500'}
                    />
                    <CustomButton
                      tooltip={"حذف کد تخفیف"}
                      onClick={() => handleDelete(d.id)}
                      iconStart={<Trash2 className="w-4 h-4" />}
                      color='iconDelete'
                      className={d.isActive ? 'text-blue-500' : 'text-red-500'}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <PaginationBar pagination={pagination} />
    </div>
  );
}
