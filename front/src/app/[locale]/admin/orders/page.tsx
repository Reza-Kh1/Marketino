'use client';

import { useMemo, useState } from 'react';
import {
  Eye, Clock, CheckCircle2, Package, Truck, RefreshCw,
  XCircle, RotateCcw, CircleDot, AlertTriangle, Store,
  Hash, ShoppingBag,
  X,
  Save,
  Edit,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import DynamicTable from '@/components/DynamicTable';
import DialogView from '@/components/DialogView';
import SearchBox from '@/components/admin/SearchBox';
import TooltipCustom from '@/components/TooltipCustom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminOrders, useStoreOrders, useUpdateOrder } from '@/hooks/order.hook';
import { OrderType } from '@/services/order.service';
import { useSearchParams } from 'next/navigation';
import CustomButton from '@/components/CustomButton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SelectCustom from '@/components/inputs/SelectCustom';
import { useForm } from 'react-hook-form';
import LoadingPage from '@/components/LoadingPage';

type Props = {
  isAdmin?: boolean;
  storeId?: string
};

// ============ Helpers ============
const formatPrice = (v: string | number) => Number(v || 0).toLocaleString('fa-IR');
const formatDate = (d?: string | null) =>
  d ? format(new Date(d), 'yyyy/MM/dd - HH:mm', { locale: faIR }) : '-';
const formatOrderNumber = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-');

const STATUS_MAP: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: 'در انتظار پردازش', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
  confirmed: { label: 'تأیید شده', className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', icon: CheckCircle2 },
  processing: { label: 'در حال آماده‌سازی', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Package },
  shipped: { label: 'ارسال شده', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: Truck },
  delivered: { label: 'تحویل داده شده', className: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
  cancelled: { label: 'لغو شده', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
  returned: { label: 'مرجوع شده', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: RotateCcw },
};

const getStatus = (s: string) =>
  STATUS_MAP[s] ?? { label: 'نامشخص', className: 'bg-muted text-muted-foreground border-border', icon: CircleDot };

// ============ Component ============
export default function AdminOrdersPage({ isAdmin = true, storeId }: Props) {
  const router = useRouter();
  const [viewOrder, setViewOrder] = useState<OrderType | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'view' | null>(null)
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    return {
      limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
      page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
      order: searchParams.get('order') || undefined,

    };
  }, [searchParams]);

  // انتخاب هوک بر اساس نقش
  const adminQuery = useAdminOrders();
  const sellerQuery = useStoreOrders({ filters, storeId, enabled: !isAdmin });
  const { data, isError, isFetching, isLoading } = isAdmin ? adminQuery : sellerQuery;
  const { mutate: updateMutate, isPending: updatePending } = useUpdateOrder();
  const orders = data?.orders ?? [];
  const columns: ColumnDef<OrderType>[] = useMemo(
    () => [
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
        ),
      },
      {
        accessorKey: 'orderNumber',
        header: 'شماره سفارش',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-primary">
            {formatOrderNumber(row.original.orderNumber)}
          </span>
        ),
      },
      {
        accessorKey: 'storeName',
        header: 'فروشگاه',
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{row.original.storeName}</span>
            <span className="text-[10px] text-muted-foreground">{row.original.storeNameEn}</span>
          </div>
        ),
      },
      {
        accessorKey: 'totalPrice',
        header: 'مبلغ کل',
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold">{formatPrice(row.original.totalPrice)} تومان</span>
            {Number(row.original.discountAmount) > 0 && (
              <span className="text-[10px] text-green-500">
                تخفیف: {formatPrice(row.original.discountAmount)}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'وضعیت',
        cell: ({ row }) => {
          const s = getStatus(row.original.status);
          const Icon = s.icon;
          return (
            <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs', s.className)}>
              <Icon className="w-3 h-3" />
              {s.label}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'تاریخ ثبت',
        cell: ({ row }) => <span className="text-xs">{formatDate(row.original.createdAt)}</span>,
      },
      {
        id: 'actions',
        header: 'عملیات',
        cell: ({ row }) => (
          <div className='w-full flex items-center gap-1'>
            {isAdmin ?
              <TooltipCustom placeHolder="ویرایش وضعیت">
                <Button
                  onClick={() => { setViewOrder(row.original), setModalMode('edit'), reset({ status: row.original.status }) }}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-500/20 cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-blue-500 " />
                </Button>
              </TooltipCustom>
              :
              <>
                {row.original.status !== 'shipped' &&
                  <TooltipCustom placeHolder="ارسال محصول">
                    <Button
                      onClick={() => onChangeState('shipped', row.original.storeId, row.original.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-500/20 cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-green-500" />
                    </Button>
                  </TooltipCustom>
                }
                {row.original.status !== 'processing' &&
                  <TooltipCustom placeHolder="در حال آماده سازی">
                    <Button
                      onClick={() => onChangeState('processing', row.original.storeId, row.original.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-500/20 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-yellow-500 " />
                    </Button>
                  </TooltipCustom>
                }
              </>
            }
            <TooltipCustom placeHolder="مشاهده جزئیات">
              <Button
                onClick={() => { setViewOrder(row.original), setModalMode('view') }}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-500/20 cursor-pointer"
              >
                <Eye className="w-4 h-4 " />
              </Button>
            </TooltipCustom>
          </div>
        ),
      },
    ],
    [],
  );
  const { handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { status: '' }
  });

  const status = watch('status')

  const onChangeState = (status: string, storeId: string, id: string) => {
    if (status && storeId && id) {
      const body = {
        storeId: storeId,
        status: status
      }
      updateMutate({ id, body }, {
        onSuccess: () => {
          setModalMode(null)
          setViewOrder(null)
        }
      })
    }
  };

  const onSubmitForm = (data: { status: string }) => {
    if (!viewOrder) return
    const body = {
      storeId: viewOrder.storeId,
      status: data.status
    }
    viewOrder?.id && updateMutate({ id: viewOrder?.id, body }, {
      onSuccess: () => {
        setModalMode(null)
        setViewOrder(null)
      }
    })
  };

  const onError = (err: any) => {
    console.log(err);
  }

  if (isLoading) return <LoadingPage />;

  if (isError)
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <button onClick={() => router.refresh()} className="text-primary font-bold">
          تلاش مجدد
        </button>
      </div>
    );

  // ============ Render ============
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black mb-1">
            {isAdmin ? 'مدیریت سفارشات فروشگاه‌ها' : 'سفارشات فروشگاه من'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {data?.pagination?.total || 0} سفارش
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchBox
        inputs={[{ label: 'شماره سفارش', name: 'search', placeholder: 'جستجو...' }]}
      />
      <Dialog open={modalMode === 'edit' && !storeId} onOpenChange={() => { setModalMode(null), setViewOrder(null) }}>
        <DialogContent dir="rtl" className="max-w-4xl! max-h-[90vh] overflow-y-auto bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
          <DialogHeader>
            <DialogTitle className="text-admin-text-primary text-xl font-bold">
              ویرایش سفارش
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm, onError)} className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectCustom
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
                onClick={() => { setModalMode(null), setViewOrder(null) }}
                isPending={false}
                name="انصراف"
                color="gray"
                iconStart={<X className="w-4 h-4" />}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Table */}
      <DynamicTable
        data={orders}
        columns={columns}
        totalRows={data?.pagination?.total || 0}
        isLoading={isFetching}
        onBulkDelete={() => { }}
      />

      {/* View Dialog */}
      <DialogView
        open={modalMode === 'view'}
        title="جزئیات سفارش"
        setOpen={() => setModalMode(null)}
        options={
          viewOrder
            ? [
              {
                head: 'اطلاعات اصلی',
                detail: [
                  { name: 'شناسه', value: <span className="font-mono text-[10px]">{viewOrder.id}</span> },
                  { name: 'شماره سفارش', value: <span className="font-mono font-bold text-primary">{formatOrderNumber(viewOrder.orderNumber)}</span> },
                  { name: 'وضعیت', value: getStatus(viewOrder.status).label },
                  { name: 'فروشگاه', value: viewOrder.storeName },
                  { name: 'نام انگلیسی', value: viewOrder.storeNameEn },
                ],
              },
              {
                head: 'اطلاعات مالی',
                detail: [
                  { name: 'مجموع محصولات', value: `${formatPrice(viewOrder.subtotal)} تومان` },
                  { name: 'هزینه ارسال', value: Number(viewOrder.shippingCost) === 0 ? 'رایگان' : `${formatPrice(viewOrder.shippingCost)} تومان` },
                  { name: 'تخفیف', value: Number(viewOrder.discountAmount) > 0 ? `${formatPrice(viewOrder.discountAmount)}- تومان` : 'بدون تخفیف' },
                  { name: 'مبلغ کل', value: `${formatPrice(viewOrder.totalPrice)} تومان` },
                  { name: 'مالیات', value: `${formatPrice(viewOrder.taxAmount)} تومان` },
                  ...(isAdmin
                    ? [
                      { name: 'کمیسیون', value: `${formatPrice(viewOrder.commissionAmount)} تومان` },
                      { name: 'درصد کمیسیون', value: viewOrder.commission ? `${viewOrder.commission}%` : '-' },
                      { name: 'مبلغ واریزی', value: formatPrice(Number(viewOrder.totalPrice) - Number(viewOrder.taxAmount) - Number(viewOrder.commissionAmount)) },
                    ]
                    : []),
                ],
              },
              {
                head: 'اطلاعات ارسال',
                detail: [
                  { name: 'روش ارسال', value: viewOrder.shippingName || '-' },
                  { name: 'کد رهگیری', value: viewOrder.trackingCode || 'ندارد' },
                ],
              },
              {
                head: 'یادداشت',
                detail: [{ name: 'یادداشت', value: viewOrder.note || 'بدون یادداشت' }],
              },
              ...(isAdmin
                ? [
                  {
                    head: 'شناسه‌ها (ادمین)',
                    detail: [
                      { name: 'شناسه Checkout', value: <span className="font-mono text-[10px]">{viewOrder.checkoutId}</span> },
                      { name: 'شناسه فروشگاه', value: <span className="font-mono text-[10px]">{viewOrder.storeId}</span> },
                      { name: 'شناسه کاربر', value: <span className="font-mono text-[10px]">{viewOrder.userId}</span> },
                      { name: 'شناسه روش ارسال', value: <span className="font-mono text-[10px]">{viewOrder.storeShippingMethodId || '-'}</span> },
                      { name: 'شناسه کد تخفیف', value: <span className="font-mono text-[10px]">{viewOrder.discountCodeId || '-'}</span> },
                    ],
                  },
                ]
                : []),
              {
                head: 'تاریخ‌ها',
                detail: [
                  { name: 'تاریخ ایجاد', value: formatDate(viewOrder.createdAt) },
                  { name: 'آخرین بروزرسانی', value: formatDate(viewOrder.updatedAt) },
                  { name: 'تاریخ تحویل', value: formatDate(viewOrder.deliveredAt) },
                  { name: 'تاریخ لغو', value: formatDate(viewOrder.cancelledAt) },
                  { name: 'مهلت مرجوعی', value: formatDate(viewOrder.returnDeadline) },
                ],
              },
            ]
            : []
        }
      />
    </div>
  );
}