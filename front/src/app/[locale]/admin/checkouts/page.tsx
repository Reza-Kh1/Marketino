'use client';

import { useMemo, useState } from 'react';
import { Eye, AlertTriangle, CheckCircle, XCircle, Clock, CreditCard, Truck, Edit, FileSearchIcon, Trash2, X, Save, RotateCcw, CheckCircle2, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Link, useRouter } from '@/i18n/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import DialogView from '@/components/DialogView';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import TooltipCustom from '@/components/TooltipCustom';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns-jalali';
import { updateCheckoutAdmin, useAdminCheckouts, useConfirmPayment, useDeleteCheckout } from '@/hooks/order.hook';
import DialogDelete from '@/components/DialogDelete';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputForm from '@/components/inputs/InputForm';
import SelectCustom from '@/components/inputs/SelectCustom';
import CustomButton from '@/components/CustomButton';
import { checkoutSchema } from '@/schemas/order.schema';
import { CheckoutsType, UpdateCheckout } from '@/services/order.service';
export default function AdminCheckoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalMode, setModalMode] = useState<'view' | 'delete' | 'edit' | 'pay' | null>(null);
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutsType | null>(null);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
    }
  });

  const paymentStatus = watch('paymentStatus')
  const status = watch('status')

  const filters = useMemo(() => {
    const limit = searchParams.get('limit') || undefined;
    const page = searchParams.get('page') || undefined;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;

    return {
      limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined,
      page: page && !isNaN(Number(page)) ? Number(page) : undefined,
      ...(search && { search }),
      ...(status && status !== 'ALL' && { status }),
      ...(paymentStatus && paymentStatus !== 'ALL' && { paymentStatus }),
    };
  }, [searchParams]);
  const { data, isError, isFetching, isLoading } = useAdminCheckouts(filters);
  const { mutate: deleteMutate, isPending: deletePending } = useDeleteCheckout();
  const { mutate: updateMutate, isPending: updatePending } = updateCheckoutAdmin();
  const { mutate: payMutate, isPending: payPending } = useConfirmPayment();

  const onSubmitForm = (data: UpdateCheckout) => {
    selectedCheckout?.id && updateMutate({ id: selectedCheckout?.id, body: data }, {
      onSuccess: () => {
        setModalMode(null)
        setSelectedCheckout(null)
      }
    })
  };

  const onError = (err: any) => {
    console.log(err);
  }
  // --- ستون‌های جدول (فقط اطلاعات مهم) ---
  const columns: ColumnDef<CheckoutsType>[] = useMemo(() => [
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
      accessorKey: 'checkoutNumber',
      header: 'شماره سفارش',
      cell: ({ row }) => {
        const formatted = String(row.original.checkoutNumber)
          .replace(/\D/g, '')
          .replace(/(\d{4})(?=\d)/g, '$1-');
        return (
          <span className="font-mono text-sm font-bold text-primary">
            {formatted}
          </span>
        );
      }
    },
    {
      accessorKey: 'shippingName',
      header: 'مشتری',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{row.original.shippingName}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {row.original.shippingPhone}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'مبلغ کل',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold">
            {Number(row.original.totalAmount).toLocaleString('fa')} تومان
          </span>
          {Number(row.original.taxAmount) > 0 && (
            <span className="text-[10px] text-muted-foreground">
              مالیات: {Number(row.original.taxAmount).toLocaleString('fa')}
            </span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'وضعیت سفارش',
      cell: ({ row }) => {
        const statusMap: Record<string, { label: string; className: string; icon: any }> = {
          pending: {
            label: 'در انتظار پردازش', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock,
          },
          confirmed: {
            label: 'تأیید شده', className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', icon: CheckCircle2,
          },
          processing: {
            label: 'در حال آماده‌سازی', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Package,
          },
          shipped: {
            label: 'ارسال شده', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: Truck,
          },
          delivered: {
            label: 'تحویل داده شده', className: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2,
          },
          cancelled: {
            label: 'لغو شده', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle,
          },
          returned: {
            label: 'مرجوع شده', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: RotateCcw,
          },
        };

        const info = statusMap[row.original.status] || statusMap.pending;
        const Icon = info.icon;
        return (
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1",
            info.className
          )}>
            <Icon className="w-3 h-3" />
            {info.label}
          </span>
        );
      }
    },
    {
      accessorKey: 'paymentStatus',
      header: 'وضعیت پرداخت',
      cell: ({ row }) => {
        const isPaid = row.original.paymentStatus === 'paid';
        return (
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1",
            isPaid
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-red-500/10 text-red-600 border-red-500/20"
          )}>
            <CreditCard className="w-3 h-3" />
            {isPaid ? 'پرداخت شده' : 'پرداخت نشده'}
          </span>
        );
      }
    },
    {
      accessorKey: 'shippingCity',
      header: 'شهر',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.shippingCity?.replace('seed-city-', '') || '-'}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'تاریخ ثبت',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.createdAt
            ? new Intl.DateTimeFormat('fa-IR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(row.original.createdAt))
            : '-'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <TooltipCustom placeHolder="ویرایش اطلاعات">
            <Button
              onClick={() => {
                reset({
                  paymentStatus: row.original.paymentStatus,
                  shippingAddress: row.original.shippingAddress,
                  shippingCity: row.original.shippingCity,
                  shippingName: row.original.shippingName,
                  shippingPhone: row.original.shippingPhone,
                  shippingPostal: row.original.shippingPostal,
                  shippingProvince: row.original.shippingProvince,
                  status: row.original.status
                })
                setSelectedCheckout(row.original);
                setModalMode('edit');
              }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-500/20"
            >
              <Edit className="w-4 h-4 text-blue-500" />
            </Button>
          </TooltipCustom>
          <TooltipCustom placeHolder="مشاهده جزئیات">
            <Button
              onClick={() => {
                setSelectedCheckout(row.original);
                setModalMode('view');
              }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0  cursor-pointer hover:bg-red-500/20"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </TooltipCustom>
          <TooltipCustom placeHolder="نمایش تمام جزئیات">
            <Link
              href={`/admin/checkouts/${row.original.id}`}
              className="h-8 w-8 p-0 text-yellow-500 cursor-pointer hover:bg-red-500/20"
            >
              <FileSearchIcon className="w-4 h-4 " />
            </Link>
          </TooltipCustom>
          <TooltipCustom placeHolder="تایید پرداخت سفارش">
            <Button
              onClick={() => {
                setSelectedCheckout(row.original);
                setModalMode('pay');
              }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-500 cursor-pointer hover:bg-red-500/20"
            >
              <DollarSign className="w-4 h-4" />
            </Button>
          </TooltipCustom>
          <TooltipCustom placeHolder="حذف سفارش">
            <Button
              onClick={() => {
                setSelectedCheckout(row.original);
                setModalMode('delete');
              }}
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
  ], []);

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
          <h2 className="text-2xl font-black mb-1">مدیریت سفارشات</h2>
          <p className="text-muted-foreground text-sm">
            {data?.pagination?.total || 0} سفارش
          </p>
        </div>
      </div>

      {/* SearchBox */}
      <SearchBox
        selects={[
          {
            label: 'وضعیت سفارش',
            placeHolder: 'همه',
            setValue: 'status',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'pending', name: 'در انتظار' },
              { id: 'paid', name: 'پرداخت شده' },
              { id: 'shipped', name: 'ارسال شده' },
              { id: 'cancelled', name: 'لغو شده' },
            ]
          },
          {
            label: 'وضعیت پرداخت',
            placeHolder: 'همه',
            setValue: 'paymentStatus',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'pending', name: 'پرداخت نشده' },
              { id: 'paid', name: 'پرداخت شده' },
            ]
          }
        ]}
        inputs={[
          { label: 'شماره سفارش', name: 'search', placeholder: 'جستجو بر اساس شماره...' },
        ]}
      />

      {/* Table */}
      <DynamicTable
        data={data?.checkouts || []}
        columns={columns}
        totalRows={data?.pagination?.total || 0}
        isLoading={isFetching}
        onBulkDelete={() => { }}
      />

      <Dialog open={modalMode === 'edit'} onOpenChange={() => { setSelectedCheckout(null), setModalMode(null) }}>
        <DialogContent dir="rtl" className="max-w-4xl! max-h-[90vh] overflow-y-auto bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
          <DialogHeader>
            <DialogTitle className="text-admin-text-primary text-xl font-bold">
              ویرایش سفارش
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm, onError)} className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm
                label="نام گیرنده"
                placeholder="مثال: علی رضایی"
                register={register}
                name="shippingName"
                error={errors.shippingName}
              />
              <InputForm
                label="شماره تماس"
                placeholder="مثال: 09123456789"
                register={register}
                name="shippingPhone"
                error={errors.shippingPhone}
                className="text-left font-mono"
              />
              <InputForm
                label="استان"
                placeholder='انتخاب استان'
                register={register}
                name="shippingProvince"
                error={errors.shippingProvince}
              />
              <InputForm
                label="شهر"
                placeholder='انتخاب شهر'
                register={register}
                name="shippingCity"
                error={errors.shippingCity}
              />
              <InputForm
                label="آدرس کامل"
                placeholder="مثال: تهران، خیابان ولیعصر، پلاک ۱۲، واحد ۳"
                type="textarea"
                rows={3}
                register={register}
                name="shippingAddress"
                error={errors.shippingAddress}
              />
              <InputForm
                label="کد پستی"
                placeholder="مثال: 1981735345"
                register={register}
                name="shippingPostal"
                error={errors.shippingPostal}
                className="text-left font-mono"
              />
              <SelectCustom
                value={paymentStatus}
                disable={selectedCheckout?.status === 'cancelled'}
                placeHolder='انتخاب کنید'
                label='وضعیت پرداخت'
                setValue={(e) => setValue('paymentStatus', e)}
                children={[
                  { name: 'در انتظار', id: 'pending' },
                  { name: 'پرداخت شده', id: 'paid' },
                  { name: 'باز پرداخت شده', id: 'refunded' },
                ]}
                error={errors.paymentStatus}
              />

              <SelectCustom
                disable={selectedCheckout?.status === 'cancelled'}
                value={status}
                placeHolder='انتخاب کنید'
                label='وضعیت سفارش'
                setValue={(e) => setValue('status', e)}
                children={[
                  { name: 'در انتظار', id: 'pending' },
                  { name: 'تایید شده', id: 'confirmed' },
                  { name: 'در حال آماده سازی', id: 'processing' },
                  { name: 'ارسال شده', id: 'shipped' },
                  { name: 'تحویل داده شده', id: 'delivered' },
                  { name: 'کنسل شده', id: 'cancelled' },
                  { name: 'مرجوع شده', id: 'returned' },
                ]}
                error={errors.status}
              />
            </div>
            <DialogFooter className="flex justify-between! items-center w-full pt-4 border-t border-border/30">
              <CustomButton
                type="submit"
                isPending={updatePending}
                name={'ذخیره تغییرات'}
                color="white"
                iconStart={<Save className="w-4 h-4" />}
              />
              <CustomButton
                onClick={() => { setModalMode(null), setSelectedCheckout(null) }}
                isPending={false}
                name="انصراف"
                color="gray"
                iconStart={<X className="w-4 h-4" />}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DialogDelete
        closeModal={() => setModalMode(null)}
        onDelete={() => {
          selectedCheckout?.id && payMutate(selectedCheckout.id, {
            onSuccess: () => {
              setModalMode(null)
              setSelectedCheckout(null)
            },
          });
        }}
        btnName='پرداخت'
        title='آیا از تأیید این پرداخت اطمینان دارید؟ '
        open={modalMode === 'pay'}
        helpText={<>با تأیید پرداخت، وضعیت آن به «پرداخت‌شده» تغییر می‌کند و عملیات مالی مربوط به سفارش، از جمله ثبت تراکنش‌ها و محاسبه سهم فروشندگان، انجام خواهد شد. <br /> <strong> توجه: این عملیات قابل بازگشت مستقیم نیست. لطفاً پیش از ادامه، از دریافت و صحت مبلغ پرداخت اطمینان حاصل کنید. </strong> </>}
        isPending={payPending}
      />
      <DialogDelete
        closeModal={() => setModalMode(null)}
        onDelete={() => {
          selectedCheckout?.id && deleteMutate(selectedCheckout.id, {
            onSuccess: () => {
              setModalMode(null)
              setSelectedCheckout(null)
            },
          });
        }}
        open={modalMode === 'delete'}
        helpText="آیا از حذف این سفارش اطمینان دارید"
        isPending={deletePending}
      />
      <DialogView
        open={modalMode === 'view'}
        title="جزئیات سفارش"
        setOpen={() => setModalMode(null)}
        options={[
          {
            head: 'اطلاعات سفارش',
            detail: [
              { name: 'شناسه', value: selectedCheckout?.id || '-' },
              { name: 'شماره سفارش', value: <span className="font-mono font-bold text-primary">{selectedCheckout?.checkoutNumber}</span> },
              { name: 'وضعیت سفارش', value: selectedCheckout?.status === 'pending' ? 'در انتظار' : selectedCheckout?.status === 'confirmed' ? 'پرداخت شده' : selectedCheckout?.status === 'shipped' ? 'ارسال شده' : 'لغو شده' },
              { name: 'وضعیت پرداخت', value: selectedCheckout?.paymentStatus === 'paid' ? 'پرداخت شده' : 'پرداخت نشده' },
              { name: 'روش پرداخت', value: selectedCheckout?.paymentMethod || '-' },
              { name: 'کد پیگیری پرداخت', value: selectedCheckout?.paymentRef || '-' },
            ]
          },
          {
            head: 'اطلاعات مالی',
            detail: [
              { name: 'مبلغ کل', value: `${Number(selectedCheckout?.totalAmount || 0).toLocaleString()} تومان` },
              { name: 'مبلغ تخفیف', value: `${Number(selectedCheckout?.discountAmount || 0).toLocaleString()} تومان` },
              { name: 'مبلغ مالیات', value: `${Number(selectedCheckout?.taxAmount || 0).toLocaleString()} تومان` },
              { name: 'کمیسیون', value: `${Number(selectedCheckout?.commissionAmount || 0).toLocaleString()} تومان` },
              { name: 'سود فروش', value: `${Number(selectedCheckout?.salesProfit || 0).toLocaleString()} تومان` },
              { name: 'کد تخفیف استفاده شده', value: selectedCheckout?.discountId ? <span className="font-mono text-xs">{selectedCheckout.discountId}</span> : 'استفاده نشده' },
              { name: 'وضعیت تخفیف', value: selectedCheckout?.discountStatus || '-' },
            ]
          },
          {
            head: 'اطلاعات گیرنده',
            detail: [
              { name: 'نام گیرنده', value: selectedCheckout?.shippingName || '-' },
              { name: 'شماره تماس', value: <span className="font-mono">{selectedCheckout?.shippingPhone || '-'}</span> },
              { name: 'استان', value: selectedCheckout?.shippingProvince?.replace('seed-province-', '') || '-' },
              { name: 'شهر', value: selectedCheckout?.shippingCity?.replace('seed-city-', '') || '-' },
              { name: 'کد پستی', value: <span className="font-mono">{selectedCheckout?.shippingPostal || '-'}</span> },
              { name: 'آدرس کامل', value: <span className="text-xs leading-relaxed whitespace-pre-line">{selectedCheckout?.shippingAddress || '-'}</span> },
            ]
          },
          {
            head: 'اطلاعات کاربر',
            detail: [
              { name: 'شناسه کاربر', value: <span className="font-mono text-xs">{selectedCheckout?.userId || '-'}</span> },
              { name: 'شناسه آدرس', value: <span className="font-mono text-xs">{selectedCheckout?.addressId || '-'}</span> },
            ]
          },
          {
            head: 'تاریخ‌ها',
            detail: [
              { name: 'تاریخ ثبت سفارش', value: selectedCheckout?.createdAt ? format(new Date(selectedCheckout.createdAt), "yyyy/MM/dd - HH:mm") : '-' },
            ]
          }
        ]}
      />
    </div>
  );
}