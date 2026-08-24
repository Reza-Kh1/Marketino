'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ClipboardList, ArrowLeft, Package, Search, Truck, CheckCircle, Clock, XCircle, MapPin, Eye, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCancelOrder, useOrders, useCreatePayment } from '@/hooks/order.hook';
import PaginationBar from '@/components/admin/PaginationBar';
import DialogView from '@/components/DialogView';
import { Order } from '@/services/order.service';
import { format } from 'date-fns-jalali';
import DialogDelete from '@/components/DialogDelete';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [idOrder, setIdOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('');
  const { data: orderData, isFetching, refetch } = useOrders()
  const { mutate: cancelOrder, isPending } = useCancelOrder()
  const { mutate: createPayment, isPending: isPaying } = useCreatePayment()

  const filtered = orderData?.orders.filter(o => !statusFilter || o.status === statusFilter) || []
  console.log(orderData);
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

  const showPaymentButton = (order: Order) => {
    return order.paymentStatus === 'pending' &&
      order.status !== 'cancelled' &&
      order.status !== 'returned';
  };

  if (isFetching) {
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
          <button onClick={() => setStatusFilter('')}
            className={cn('px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
              !statusFilter ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-muted')}>
            {tCommon('all')}
          </button>
          {Object.entries(STATUS_NAMES).map(([key, name]) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={cn('px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
                statusFilter === key ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-muted')}>
              {name}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((order, i) => {
              const StatusIcon = STATUS_ICONS[order.status] || Package;
              const isPaymentPending = showPaymentButton(order);

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono font-bold">#{order.orderNumber}</span>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1', STATUS_COLORS[order.status])}>
                          <StatusIcon className="w-3 h-3" /> {STATUS_NAMES[order.status] || order.status}
                        </span>

                        {/* نشان وضعیت پرداخت */}
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

                        {order.trackingCode && (
                          <Link href={`/tracking`}
                            className="text-xs text-primary font-bold font-mono flex items-center gap-1 hover:underline">
                            <MapPin className="w-3 h-3" />
                            {order.trackingCode}
                          </Link>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        {order.items.map((it, j) => (
                          <div key={j} className="flex justify-between max-w-sm">
                            <span>{it.title} × {it.quantity}</span>
                            <span className="font-bold">{it.total.toLocaleString()} {tCommon('toman')}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>📅 {order.createdAt}</span>
                        {order.shippingName && <span>👤 {order.shippingName}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xl font-black text-primary">{order.total.toLocaleString()} {tCommon('toman')}</div>

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
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs cursor-pointer font-bold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> {tOrders('detail_order')}
                        </button>
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
      <DialogView
        open={selectedOrder?.id ? true : false}
        onOpenChange={() => setSelectedOrder(null)}
        title='مشاهده جزئیات سفارش'
        desc='اطلاعات کامل سفارش و آیتم‌های آن'
        options={[
          {
            head: 'اطلاعات اصلی سفارش',
            tags: [
              {
                name: 'شماره سفارش',
                value: selectedOrder?.orderNumber
              },
              {
                name: 'وضعیت سفارش',
                value: (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    selectedOrder?.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      selectedOrder?.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        selectedOrder?.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          selectedOrder?.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                            selectedOrder?.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                              selectedOrder?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                selectedOrder?.status === 'returned' ? 'bg-rose-100 text-rose-700' :
                                  'bg-gray-100 text-gray-700'
                  )}>
                    {selectedOrder?.status === 'pending' ? 'در انتظار' :
                      selectedOrder?.status === 'confirmed' ? 'تأیید شده' :
                        selectedOrder?.status === 'processing' ? 'در حال پردازش' :
                          selectedOrder?.status === 'shipped' ? 'ارسال شده' :
                            selectedOrder?.status === 'delivered' ? 'تحویل داده شده' :
                              selectedOrder?.status === 'cancelled' ? 'لغو شده' :
                                selectedOrder?.status === 'returned' ? 'مرجوع شده' :
                                  'نامشخص'}
                  </span>
                )
              },
              {
                name: 'وضعیت پرداخت',
                value: (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    selectedOrder?.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      selectedOrder?.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                  )}>
                    {selectedOrder?.paymentStatus === 'paid' ? '✅ پرداخت شده' :
                      selectedOrder?.paymentStatus === 'pending' ? '⏳ در انتظار پرداخت' :
                        '❌ برگشت داده شده'}
                  </span>
                )
              },
              {
                name: 'روش پرداخت',
                value: selectedOrder?.paymentMethod === 'zarinpal' ? 'زرین‌پال' :
                  selectedOrder?.paymentMethod === 'card' ? 'کارت بانکی' :
                    selectedOrder?.paymentMethod === 'wallet' ? 'کیف پول' :
                      selectedOrder?.paymentMethod === 'cod' ? 'پرداخت در محل' :
                        '-'
              }
            ],
            detail: [
              {
                name: 'شناسه سفارش',
                value: selectedOrder?.id
              },
              {
                name: 'تاریخ ثبت سفارش',
                value: selectedOrder?.createdAt &&
                  format(new Date(selectedOrder.createdAt), "dd MMMM yyyy ساعت HH:mm")
              },
              {
                name: 'آخرین بروزرسانی',
                value: selectedOrder?.updatedAt &&
                  format(new Date(selectedOrder.updatedAt), "dd MMMM yyyy ساعت HH:mm")
              },
              {
                name: 'کد رهگیری',
                value: selectedOrder?.trackingCode || 'ثبت نشده'
              },
              {
                name: 'نام گیرنده',
                value: selectedOrder?.shippingName || '-'
              },
              {
                name: 'شماره تماس گیرنده',
                value: selectedOrder?.shippingPhone || '-'
              },
              {
                name: 'آدرس ارسال',
                value: selectedOrder?.shippingAddress || '-'
              },
              {
                name: 'کد پستی',
                value: selectedOrder?.shippingPostal || '-'
              },
              {
                name: 'یادداشت مشتری',
                value: selectedOrder?.notes || 'بدون یادداشت'
              },
              {
                name: 'یادداشت فروشنده',
                value: selectedOrder?.sellerNotes || 'بدون یادداشت'
              }
            ]
          },
          {
            head: 'جزئیات مالی',
            detail: [
              {
                name: 'قیمت کالاها (جمع جزء)',
                value: `${Number(selectedOrder?.subtotal).toLocaleString()} تومان`
              },
              {
                name: 'هزینه ارسال',
                value: `${Number(selectedOrder?.shippingCost).toLocaleString()} تومان`
              },
              {
                name: 'تخفیف اعمال شده',
                value: (
                  <span className="text-emerald-600">
                    {Number(selectedOrder?.discountAmount).toLocaleString()} تومان
                  </span>
                )
              },
              {
                name: 'کارمزد پلتفرم',
                value: `${Number(selectedOrder?.commissionAmount).toLocaleString()} تومان`
              },
              {
                name: 'مبلغ قابل پرداخت',
                value: (
                  <span className="font-bold text-lg text-emerald-600">
                    {Number(selectedOrder?.total).toLocaleString()} تومان
                  </span>
                )
              }
            ]
          },
          {
            head: 'آیتم‌های سفارش',
            detail: selectedOrder && selectedOrder?.items.length > 0 ?
              selectedOrder.items.map((item: any, index: number) => ({
                name: `آیتم ${index + 1}: ${item.title}`,
                value: (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-mono">{item.sku}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">تنوع:</span>
                      <span>{item.variantName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">قیمت واحد:</span>
                      <span className="font-bold">{Number(item.price).toLocaleString()} تومان</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">تعداد:</span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">جمع کل:</span>
                      <span className="font-bold text-emerald-600">
                        {Number(item.total).toLocaleString()} تومان
                      </span>
                    </div>
                    {item.image && (
                      <div className="mt-1">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover border"
                        />
                      </div>
                    )}
                  </div>
                )
              })) :
              [{
                name: 'آیتم‌ها',
                value: 'هیچ آیتمی برای این سفارش ثبت نشده است'
              }]
          },
          {
            head: 'خلاصه سفارش',
            detail: [
              {
                name: 'تعداد کل آیتم‌ها',
                value: selectedOrder?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
              },
              {
                name: 'تعداد فروشنده‌ها',
                value: selectedOrder?.items ? new Set(selectedOrder.items.map((i: any) => i.storeId)).size : 0
              },
              {
                name: 'وضعیت نهایی',
                value: selectedOrder?.status === 'delivered' ? '✅ تکمیل شده' :
                  selectedOrder?.status === 'cancelled' ? '❌ لغو شده' :
                    selectedOrder?.status === 'returned' ? '🔄 مرجوع شده' :
                      '⏳ در حال انجام'
              }
            ]
          }
        ]}
      />
    </div>
  );
}