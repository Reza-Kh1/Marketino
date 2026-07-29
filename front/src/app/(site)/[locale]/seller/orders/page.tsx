'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, XCircle, MapPin, Send, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sellerApi, type Order } from '@/lib/api';
import { useTranslation } from '@/lib/i18n-context';
import toast from 'react-hot-toast';

const STATUS_NAMES: Record<string, string> = {
  pending: 'در انتظار', confirmed: 'تأیید شده', processing: 'در حال پردازش',
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

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'delivered',
};

export default function SellerOrdersPage() {
  const { t } = useTranslation();
  const isRTL = t.direction === 'rtl';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await sellerApi.orders();
      setOrders(data.orders);
    } catch {
      // Fallback mock
      setOrders([
        { id: 'o1', orderNumber: '1403-0001', status: 'pending', paymentStatus: 'pending', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 21990000, shippingName: 'حسین محمدی', createdAt: '۱۴۰۳-۰۳-۲۶', items: [{ id: 'i1', title: 'گوشی X1 Pro', price: 21990000, quantity: 1, total: 21990000, sellerId: '' }] } as Order,
        { id: 'o2', orderNumber: '1403-0002', status: 'confirmed', paymentStatus: 'paid', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 7380000, shippingName: 'سارا احمدی', createdAt: '۱۴۰۳-۰۳-۲۵', items: [{ id: 'i2', title: 'هدفون ANC Pro', price: 3690000, quantity: 2, total: 7380000, sellerId: '' }] } as Order,
        { id: 'o3', orderNumber: '1403-0003', status: 'processing', paymentStatus: 'paid', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 16500000, trackingCode: 'IR-12345678', shippingName: 'رضا جوادی', createdAt: '۱۴۰۳-۰۳-۲۴', items: [{ id: 'i3', title: 'مانیتور ۲۷ اینچ', price: 16500000, quantity: 1, total: 16500000, sellerId: '' }] } as Order,
        { id: 'o4', orderNumber: '1403-0004', status: 'shipped', paymentStatus: 'paid', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 28900000, trackingCode: 'IR-98765432', shippingName: 'مریم حسنی', createdAt: '۱۴۰۳-۰۳-۲۰', items: [{ id: 'i4', title: 'تبلت Pro', price: 28900000, quantity: 1, total: 28900000, sellerId: '' }] } as Order,
        { id: 'o5', orderNumber: '1403-0005', status: 'delivered', paymentStatus: 'paid', subtotal: 0, shippingCost: 0, discountAmount: 0, total: 25680000, trackingCode: 'IR-55555555', shippingName: 'امیر رضایی', createdAt: '۱۴۰۳-۰۳-۱۸', items: [{ id: 'i5', title: 'هدفون ANC Pro', price: 3690000, quantity: 1, total: 3690000, sellerId: '' }, { id: 'i6', title: 'گوشی X1 Pro', price: 21990000, quantity: 1, total: 21990000, sellerId: '' }] } as Order,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    if (search && !o.orderNumber.includes(search) && !(o.shippingName || '').includes(search)) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const trackingCode = trackingInputs[orderId] || '';
      await sellerApi.updateOrder(orderId, { status: newStatus, trackingCode: trackingCode || undefined });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, trackingCode: trackingCode || o.trackingCode } : o));
      toast.success(`${isRTL ? 'وضعیت به' : 'Status changed to'} "${STATUS_NAMES[newStatus]}" ${isRTL ? 'تغییر کرد' : ''}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isRTL ? 'خطا در بروزرسانی' : 'Update error'));
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    const code = trackingInputs[orderId];
    if (!code?.trim()) {
      toast.error(isRTL ? 'کد رهگیری را وارد کنید' : 'Enter tracking code');
      return;
    }
    setUpdatingOrder(orderId);
    try {
      await sellerApi.updateOrder(orderId, { trackingCode: code.trim() });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingCode: code.trim() } : o));
      toast.success(isRTL ? 'کد رهگیری ثبت شد' : 'Tracking code saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isRTL ? 'خطا در ذخیره' : 'Save error'));
    } finally {
      setUpdatingOrder(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-3" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h2 className="text-2xl font-black">{t.seller.orders_received || (isRTL ? 'سفارشات دریافتی' : 'Received Orders')}</h2>
        <p className="text-muted-foreground text-sm">{t.seller.orders_desc || (isRTL ? 'مدیریت سفارشات مشتریان فروشگاه شما' : 'Manage customer orders')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? 'جستجوی شماره سفارش یا مشتری...' : 'Search order number or customer...'}
            className={`w-full h-10 ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm`} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm">
          <option value="">{isRTL ? 'همه وضعیت‌ها' : 'All Statuses'}</option>
          {Object.entries(STATUS_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order, i) => {
          const nextStatus = NEXT_STATUS[order.status];
          const isExpanded = expandedOrder === order.id;

          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-sm font-bold">#{order.orderNumber}</span>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', STATUS_COLORS[order.status])}>
                        {STATUS_NAMES[order.status]}
                      </span>
                      {order.trackingCode && (
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {order.trackingCode}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, j) => (
                        <div key={j} className="text-sm flex justify-between max-w-md">
                          <span>{item.title} × {item.quantity}</span>
                          <span className="font-bold">{item.total.toLocaleString()} {isRTL ? 'تومان' : 'Toman'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>👤 {order.shippingName || '---'}</span>
                      <span>📅 {order.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xl font-black text-primary">
                      {order.total.toLocaleString()} {isRTL ? 'تومان' : 'Toman'}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusChange(order.id, nextStatus)}
                          disabled={updatingOrder === order.id}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {updatingOrder === order.id ? '...' : (
                            <>
                              {nextStatus === 'shipped' ? <Truck className="w-3.5 h-3.5" /> :
                               nextStatus === 'delivered' ? <CheckCircle className="w-3.5 h-3.5" /> :
                               <CheckCircle className="w-3.5 h-3.5" />}
                              {STATUS_NAMES[nextStatus]}
                            </>
                          )}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          disabled={updatingOrder === order.id}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> {isRTL ? 'لغو' : 'Cancel'}
                        </button>
                      )}
                      <button onClick={() => toggleExpand(order.id)}
                        className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-bold transition-colors">
                        {isExpanded ? (isRTL ? 'بستن' : 'Close') : (isRTL ? 'رهگیری' : 'Tracking')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded: Tracking Code Section */}
              {isExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border bg-muted/30 px-5 py-4 space-y-3">
                  <h4 className="font-bold text-sm">{isRTL ? 'مدیریت کد رهگیری' : 'Tracking Code Management'}</h4>

                  {/* Tracking Code Input */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                      <input
                        type="text"
                        value={trackingInputs[order.id] ?? order.trackingCode ?? ''}
                        onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                        placeholder={isRTL ? 'مثلاً: IR-123456789' : 'e.g. IR-123456789'}
                        className={`w-full h-10 ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm`}
                      />
                    </div>
                    <button
                      onClick={() => handleSaveTracking(order.id)}
                      disabled={updatingOrder === order.id}
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {updatingOrder === order.id ? (isRTL ? 'ذخیره...' : 'Saving...') : (isRTL ? 'ثبت' : 'Save')}
                    </button>
                  </div>

                  {/* Shipping Info */}
                  {order.shippingAddress && (
                    <div className="p-3 bg-background rounded-xl border border-border">
                      <h5 className="text-xs font-bold mb-1">{t.orders.shipping_info || (isRTL ? 'اطلاعات ارسال' : 'Shipping Info')}</h5>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingName} - {order.shippingPhone}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.shippingAddress}</p>
                    </div>
                  )}

                  {/* Tracking Timeline */}
                  {order.trackingHistory && order.trackingHistory.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold mb-2">{isRTL ? 'تاریخچه رهگیری' : 'Tracking History'}</h5>
                      <div className="space-y-2">
                        {order.trackingHistory.map((evt, idx) => (
                          <div key={idx} className="flex gap-2 text-xs">
                            <div className={cn(
                              'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                              idx === 0 ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                            )} />
                            <div>
                              <span className="font-bold">{evt.description}</span>
                              {evt.location && <span className="text-muted-foreground"> — {evt.location}</span>}
                              <span className="text-muted-foreground block">{evt.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Status Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground self-center">{isRTL ? 'تغییر وضعیت سریع:' : 'Quick status:'}</span>
                    {Object.entries(STATUS_NAMES)
                      .filter(([k]) => k !== order.status && k !== 'cancelled')
                      .map(([k, v]) => (
                        <button
                          key={k}
                          onClick={() => handleStatusChange(order.id, k)}
                          disabled={updatingOrder === order.id}
                          className="px-2.5 py-1 rounded-lg bg-background hover:bg-muted border border-border text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {v}
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{isRTL ? 'سفارشی یافت نشد' : 'No orders found'}</p>
        </div>
      )}
    </div>
  );
}
