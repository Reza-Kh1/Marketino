'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ClipboardList, ArrowLeft, Package, Search, Truck, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ordersApi, type Order } from '@/lib/api';
import { useTranslation } from '@/lib/i18n-context';
import toast from 'react-hot-toast';

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
  const { t } = useTranslation();
  const isRTL = t.direction === 'rtl';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersApi.list();
      setOrders(data.orders);
    } catch {
      // Fallback mock
      setOrders([
        { id: 'o1', orderNumber: '1403-0897', status: 'shipped', paymentStatus: 'paid', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 25680000, trackingCode: 'IR-12345678', shippingName: 'حسین محمدی', createdAt: '۱۴۰۳-۰۳-۲۶', items: [{ id: 'i1', title: 'گوشی X1 Pro', price: 21990000, quantity: 1, total: 21990000, sellerId: 's1' }, { id: 'i2', title: 'هدفون ANC Pro', price: 3690000, quantity: 1, total: 3690000, sellerId: 's1' }] } as Order,
        { id: 'o2', orderNumber: '1403-0850', status: 'delivered', paymentStatus: 'paid', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 1788000, shippingName: 'سارا احمدی', createdAt: '۱۴۰۳-۰۳-۱۵', items: [{ id: 'i3', title: 'تیشرت مردانه', price: 399000, quantity: 2, total: 798000, sellerId: 's2' }, { id: 'i4', title: 'مانتو بهاره', price: 990000, quantity: 1, total: 990000, sellerId: 's2' }] } as Order,
        { id: 'o3', orderNumber: '1403-0812', status: 'pending', paymentStatus: 'paid', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 7800000, shippingName: 'رضا جوادی', createdAt: '۱۴۰۳-۰۳-۲۵', items: [{ id: 'i5', title: 'میز تحریر چوبی', price: 7800000, quantity: 1, total: 7800000, sellerId: 's3' }] } as Order,
        { id: 'o4', orderNumber: '1403-0780', status: 'cancelled', paymentStatus: 'cancelled', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 16500000, shippingName: 'مریم حسنی', createdAt: '۱۴۰۳-۰۳-۰۱', items: [{ id: 'i6', title: 'مانیتور ۲۷ اینچ', price: 16500000, quantity: 1, total: 16500000, sellerId: 's1' }] } as Order,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => !statusFilter || o.status === statusFilter);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(isRTL ? 'آیا از لغو این سفارش اطمینان دارید؟' : 'Are you sure you want to cancel this order?')) return;
    try {
      await ordersApi.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success(isRTL ? 'سفارش لغو شد' : 'Order cancelled');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isRTL ? 'خطا در لغو سفارش' : 'Cancel error'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
    <div className="max-w-4xl mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8" /> {t.orders.title}
        </h1>
        <p className="text-muted-foreground mb-8">{t.orders.subtitle}</p>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button onClick={() => setStatusFilter('')}
            className={cn('px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
              !statusFilter ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-muted')}>
            {t.common.all}
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
                            <span className="font-bold">{it.total.toLocaleString()} {t.common.toman}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>📅 {order.createdAt}</span>
                        {order.shippingName && <span>👤 {order.shippingName}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xl font-black text-primary">{order.total.toLocaleString()} {t.common.toman}</div>

                      <div className="flex gap-1.5">

                        {/* Track button */}
                        {order.trackingCode && (
                          <Link href={`/tracking`}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                            <Truck className="w-3 h-3" /> {t.orders.track || 'Track'}
                          </Link>
                        )}

                        {/* Cancel button */}
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button onClick={() => handleCancelOrder(order.id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> {t.orders.cancel_order}
                          </button>
                        )}

                        <Link href={`/tracking`}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1">
                          <Search className="w-3 h-3" /> {t.orders.order_detail}
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
            <h2 className="text-2xl font-black mb-2">{t.orders.empty}</h2>
            <p className="text-muted-foreground mb-6">{t.orders.empty_desc}</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
              <ArrowLeft className="w-4 h-4" /> {t.cart.start_shopping}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
