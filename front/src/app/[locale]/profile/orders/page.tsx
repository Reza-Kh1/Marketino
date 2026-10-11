'use client';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ClipboardList, ArrowLeft, Package, Search, Truck, CheckCircle, Clock, XCircle, MapPin, Eye, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCancelOrder, useOrders, useCreatePayment } from '@/hooks/order.hook';
import PaginationBar from '@/components/admin/PaginationBar';
import DialogView from '@/components/DialogView';
import { CheckoutsType } from '@/services/order.service';
import { format } from 'date-fns-jalali';
import DialogDelete from '@/components/DialogDelete';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

const STATUS_NAMES: Record<string, string> = {
  pending: 'در انتظار', confirmed: 'تأیید شده', processing: 'در حال ارسال',
  shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  shipped: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock, confirmed: CheckCircle, processing: Package,
  shipped: Truck, delivered: CheckCircle, cancelled: XCircle,
};

export default function OrdersPage() {
  const tCommon = useTranslations('common');
  const tOrders = useTranslations('orders');
  const tCart = useTranslations('cart');
  const [idOrder, setIdOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('');
  const { mutate: cancelOrder, isPending } = useCancelOrder()
  const { mutate: createPayment, isPending: isPaying } = useCreatePayment()

  const searchParams = useSearchParams();
  const filters = useMemo(() => {
    const limit = searchParams.get('limit') || undefined;
    const page = searchParams.get('page') || undefined;
    const status = searchParams.get('status') || undefined;

    return {
      limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined,
      page: page && !isNaN(Number(page)) ? Number(page) : undefined,
      ...(status && { status })
    };
  }, [searchParams]);
  const { data: orderData, isLoading, refetch } = useOrders(filters)
  // const filtered = orderData?.checkouts.filter(o => !statusFilter || o.status === statusFilter) || []

  const handlePayment = (orderId: string) => {
    createPayment({
      id: orderId,
      data: { method: 'zarinpal' }
    }, {
      onSuccess: (response) => {
        // toast.success('در حال انتقال به درگاه پرداخت...');
        // if (response.redirectUrl) {
        //   window.location.href = response.redirectUrl;
        // }
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'خطا در ایجاد پرداخت');
      }
    });
  };

  const showPaymentButton = (order: CheckoutsType) => {
    return order.paymentStatus === 'pending' &&
      order.status !== 'cancelled' &&
      order.status !== 'returned';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-3" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8" /> {tOrders('title')}
        </h1>
        <p className="text-muted-foreground mb-8">{tOrders('subtitle')}</p>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Link href={`?status=All`} onClick={() => setStatusFilter('')}
            className={cn('px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
              !statusFilter ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-muted')}>
            {tCommon('all')}
          </Link>
          {Object.entries(STATUS_NAMES).map(([key, name]) => (
            <Link href={`?status=${key}`} key={key} onClick={() => setStatusFilter(key)}
              className={cn('px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
                statusFilter === key ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-muted')}>
              {name}
            </Link>
          ))}
        </div>
        {orderData?.checkouts.length ? (
          <div className="space-y-4">
            {orderData?.checkouts.map((order, i) => {
              const StatusIcon = STATUS_ICONS[order.status] || Package;
              const isPaymentPending = showPaymentButton(order);
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono font-bold">#{order.checkoutNumber}</span>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1', STATUS_COLORS[order.status])}>
                          <StatusIcon className="w-3 h-3" /> {STATUS_NAMES[order.status] || order.status}
                        </span>
                        <span className={cn(
                          'px-2.5 py-0.5 rounded-full text-xs font-bold',
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                        )}>
                          {order.paymentStatus === 'paid' ? '✓ پرداخت شده' :
                            order.paymentStatus === 'pending' ? '⏳ در انتظار پرداخت' :
                              '✗ برگشت داده شده'}
                        </span>
                      </div>
                      {/* <div className="text-sm space-y-1">
                        {order.items.map((it, j) => (
                          <div key={j} className="flex justify-between max-w-sm">
                            <span>{it.title} × {it.quantity}</span>
                            <span className="font-bold">{it.total.toLocaleString()} {tCommon('toman')}</span>
                          </div>
                        ))}
                      </div> */}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>📅 {new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xl font-black text-primary">{Number(order.totalAmount).toLocaleString('fa')} {tCommon('toman')}</div>

                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {/* دکمه پرداخت - فقط در صورت pending بودن پرداخت و لغو نشده بودن سفارش */}
                        {isPaymentPending && (
                          <button
                            onClick={() => handlePayment(order.id)}
                            disabled={isPaying}
                            className="text-xs font-bold cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            {isPaying ? 'در حال پرداخت...' : 'پرداخت'}
                          </button>
                        )}

                        {/* دکمه لغو سفارش - فقط برای سفارش‌های در انتظار و تأیید شده */}
                        {['pending', 'confirmed'].includes(order.status) && order.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => setIdOrder(order.id)}
                            className="text-xs font-bold cursor-pointer px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> {tOrders('cancel_order')}
                          </button>
                        )}

                        {/* دکمه جزئیات سفارش */}
                        <Link
                          href={`/profile/orders/${order.id}`}
                          // onClick={() => setSelectedOrder(order)}
                          className="text-xs cursor-pointer font-bold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> {tOrders('detail_order')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-3xl">
            <ClipboardList className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">{tOrders('empty')}</h2>
            <p className="text-muted-foreground mb-6">{tOrders('empty_desc')}</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
              <ArrowLeft className="w-4 h-4" /> {tCart('start_shopping')}
            </Link>
          </div>
        )}
      </motion.div>

      <PaginationBar pagination={orderData?.pagination} />

      <DialogDelete
        open={!!idOrder}
        onDelete={() => {
          if (idOrder) {
            cancelOrder(idOrder, {
              onSuccess: () => {
                setIdOrder(null)
              }
            })
          }
        }}
        closeModal={() => setIdOrder(null)}
        isPending={isPending}
        helpText="آیا از لغو این سفارش اطمینان دارین؟"
      />
    </div>
  );
}