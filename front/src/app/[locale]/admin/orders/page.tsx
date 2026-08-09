'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi, Order } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_NAMES: Record<string, string> = {
  pending: 'در انتظار',
  confirmed: 'تأیید شده',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  shipped: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.orders({ page, status: statusFilter || undefined });
      console.log(res);
      
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err: any) {
      toast.error('خطا در بارگذاری سفارشات');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingIds(prev => new Set(prev).add(orderId));
    try {
      await adminApi.updateOrder(orderId, { status: newStatus });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      toast.success(`وضعیت به "${STATUS_NAMES[newStatus]}" تغییر کرد`);
    } catch (err: any) {
      toast.error(err.message || 'خطا در بروزرسانی وضعیت');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const filtered = search
    ? orders.filter(o =>
        o.orderNumber?.includes(search) ||
        o.user?.username?.includes(search) ||
        o.shippingName?.includes(search) ||
        o.items?.some(item => item.title?.includes(search)),
      )
    : orders;

  const stats = {
    total,
    revenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + (o.total || 0), 0),
    pendingCount: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">مدیریت سفارشات</h2>
        <p className="text-muted-foreground text-sm">مشاهده و مدیریت تمام سفارشات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'کل سفارشات', value: stats.total.toLocaleString(), color: 'from-blue-500 to-cyan-500' },
          { label: 'درآمد کل', value: stats.revenue.toLocaleString() + ' ت', color: 'from-green-500 to-emerald-500' },
          { label: 'در انتظار', value: stats.pendingCount + ' سفارش', color: 'from-violet-500 to-purple-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn('bg-card border border-border rounded-2xl p-4 text-center')}
          >
            <div className="text-xl font-black">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی شماره سفارش، مشتری یا نام محصول..."
            className="w-full h-10 pr-9 pl-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm"
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS_NAMES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={fetchOrders}
          className="h-10 px-3 rounded-xl border border-border bg-background hover:bg-accent transition-colors"
          title="بروزرسانی"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-sm font-bold">#{order.orderNumber}</span>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700')}>
                        {STATUS_NAMES[order.status] || order.status}
                      </span>
                      {order.paymentStatus === 'paid' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          پرداخت شده
                        </span>
                      )}
                      {order.paymentStatus === 'refunded' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          مسترد شده
                        </span>
                      )}
                      {order.paymentStatus === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          در انتظار پرداخت
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {order.shippingName && <span>👤 {order.shippingName}</span>}
                      {order.user?.username && <span>@{order.user.username}</span>}
                      {order.trackingCode && <span>📦 {order.trackingCode}</span>}
                      <span>📅 {new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {order.items.map(item => `${item.title} × ${item.quantity}`).join('، ')}
                      </div>
                    )}

                    {order.commissionAmount != null && (
                      <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                        کمیسیون: {order.commissionAmount.toLocaleString()} تومان
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xl font-black text-primary">
                      {(order.total || 0).toLocaleString()} تومان
                    </div>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingIds.has(order.id)}
                      className={cn(
                        'h-9 px-3 rounded-xl border border-border bg-background text-xs min-w-[130px]',
                        updatingIds.has(order.id) && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      {Object.entries(STATUS_NAMES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    {updatingIds.has(order.id) && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-accent disabled:opacity-40 transition-colors"
              >
                قبلی
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                صفحه {page} از {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-accent disabled:opacity-40 transition-colors"
              >
                بعدی
              </button>
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <ClipboardList className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">سفارشی یافت نشد</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
