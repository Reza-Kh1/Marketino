'use client';
import { useRouter } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import {
  Users, Store, Package, ShoppingBag, TrendingUp, DollarSign,
  Clock, CheckCircle, AlertCircle, Eye, ChevronLeft, Star,
  BarChart3, Activity, ArrowUp, ArrowDown, UserPlus, Target,
  ShieldAlert, BadgeCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useAdminDashboard } from '@/lib/react-query-hooks';

/* ========================================================================
 * 🛡️ ادمین — داشبورد حرفه‌ای
 * ======================================================================== */

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading: loading, isError, error } = useAdminDashboard();

  const dashboardData = data as any;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-muted rounded-2xl" />
          <div className="h-80 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">{isError ? 'خطا در دریافت اطلاعات داشبورد' : 'داده‌ای یافت نشد'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary font-bold hover:underline">تلاش مجدد</button>
      </div>
    );
  }

  // Safe extraction with full fallbacks for real API responses
  const stats = dashboardData?.stats || {};
  const todayStats = dashboardData?.todayStats || { orders: 0, revenue: 0, newUsers: 0 };
  const recentOrders: any[] = dashboardData?.recentOrders || [];
  const recentUsers: any[] = dashboardData?.recentUsers || [];
  const chartData: any[] = dashboardData?.chartData || [];
  const topSellers: any[] = dashboardData?.topSellers || [];
  const pendingSellers: any[] = dashboardData?.pendingSellers || [];
  const orderStatuses: Record<string, number> = dashboardData?.orderStatuses || {};

  const maxChartVal = Math.max(...chartData.map((c: any) => c?.revenue || 0), 1);
  const totalSales = chartData.reduce((s: number, c: any) => s + (c?.revenue || 0), 0);
  const prevTotal = totalSales * 0.85;
  const growthPercent = prevTotal > 0 ? Math.round(((totalSales - prevTotal) / prevTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">داشبورد مدیریت</h1>
          <p className="text-sm text-muted-foreground mt-1">
            خوش آمدید، {user?.firstName || user?.username || 'ادمین'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">درآمد امروز</div>
            <div className="font-black text-emerald-600">{todayStats.revenue.toLocaleString('fa-IR')} تومان</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </motion.div>

      {/* ── Quick Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: Users, label: 'کاربران', value: (stats?.totalUsers || 0).toLocaleString('fa-IR'), change: `+${todayStats?.newUsers || 0}`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', up: true },
          { icon: Store, label: 'فروشندگان', value: (stats?.totalSellers || 0).toLocaleString('fa-IR'), change: pendingSellers?.length ? `${pendingSellers.length} در انتظار` : 'فعال', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10', up: true },
          { icon: Package, label: 'محصولات', value: (stats?.totalProducts || 0).toLocaleString('fa-IR'), change: 'فعال', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', up: true },
          { icon: ShoppingBag, label: 'سفارشات', value: (stats?.totalOrders || 0).toLocaleString('fa-IR'), change: `+${todayStats?.orders || 0}`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', up: true },
          { icon: DollarSign, label: 'درآمد کل', value: ((stats?.totalRevenue || 0) / 1_000_000).toFixed(1) + 'M', change: `${growthPercent}٪`, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10', up: growthPercent > 0 },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/40 rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bg)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <div className={cn('flex items-center gap-0.5 text-xs font-bold', item.up ? 'text-emerald-600' : 'text-rose-600')}>
                {item.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {item.change}
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight">{item.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart — Revenue (2/3) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-lg">درآمد ماهانه</h3>
              <p className="text-xs text-muted-foreground mt-0.5">۶ ماه اخیر</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> درآمد</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> کمیسیون</span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2">
            {chartData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col items-center gap-1" style={{ height: '220px', justifyContent: 'flex-end' }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(item.revenue / maxChartVal) * 55}%` }} transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity relative">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {(item.revenue / 1_000_000).toFixed(1)}M
                    </span>
                  </motion.div>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(item.commission / maxChartVal) * 55}%` }} transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{item.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Statuses (1/3) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border/40 rounded-2xl p-6">
          <h3 className="font-black text-lg mb-4">وضعیت سفارشات</h3>
          <div className="space-y-3">
            {[
              { label: 'در انتظار', count: orderStatuses?.pending || 0, color: 'bg-amber-500', percent: 35 },
              { label: 'تایید شده', count: orderStatuses?.confirmed || 0, color: 'bg-blue-500', percent: 25 },
              { label: 'در حال پردازش', count: orderStatuses?.processing || 0, color: 'bg-violet-500', percent: 20 },
              { label: 'ارسال شده', count: orderStatuses?.shipped || 0, color: 'bg-indigo-500', percent: 12 },
              { label: 'تحویل شده', count: orderStatuses?.delivered || 0, color: 'bg-emerald-500', percent: 8 },
            ].map((item, i) => (
              <div key={item.label} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', item.color)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.count.toLocaleString('fa-IR')}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.percent}%` }} transition={{ delay: 0.4 + i * 0.05, duration: 0.8 }}
                    className={cn('h-full rounded-full', item.color)} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">تکمیل امروز</span>
              <span className="font-black text-emerald-600">{todayStats?.orders || 0} سفارش</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black">سفارشات اخیر</h3>
            <button onClick={() => router.push('/admin/orders')} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
              همه سفارشات <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground text-xs">
                  <th className="text-right pb-3 font-medium">شماره</th>
                  <th className="text-right pb-3 font-medium">مشتری</th>
                  <th className="text-right pb-3 font-medium">مبلغ</th>
                  <th className="text-right pb-3 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders || []).slice(0, 5).map((order: any) => {
                  const statusStyles: Record<string, string> = {
                    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
                    confirmed: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
                    shipped: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
                    delivered: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                    cancelled: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',
                  };
                  const statusLabels: Record<string, string> = {
                    pending: 'در انتظار', confirmed: 'تایید', shipped: 'ارسال شده',
                    delivered: 'تحویل', cancelled: 'لغو',
                  };
                  return (
                    <tr key={order.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => router.push(`/admin/orders`)}>
                      <td className="py-3 font-mono text-xs font-bold">{order.orderNumber || order.id?.slice(0, 8)}</td>
                      <td className="py-3 text-muted-foreground">{order.buyerName || 'کاربر'}</td>
                      <td className="py-3 font-bold">{(order.total || 0).toLocaleString('fa-IR')}</td>
                      <td className="py-3">
                        <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-bold', statusStyles[order.status] || '')}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Sellers + Pending */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black">فروشندگان برتر</h3>
            <button onClick={() => router.push('/admin/users')} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
              همه <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {(topSellers || []).slice(0, 4).map((seller: any, i: number) => (
              <div key={seller.id || i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white',
                  i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-muted-foreground/30')}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{seller.storeName || 'فروشنده'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {seller.avgRating || 0}
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600">
                  {(seller.totalSales || 0).toLocaleString('fa-IR')} فروش
                </div>
              </div>
            ))}
          </div>

          {/* Pending Sellers */}
          {pendingSellers && pendingSellers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold">{pendingSellers.length} فروشنده در انتظار تایید</span>
              </div>
              <div className="space-y-2">
                {pendingSellers.slice(0, 2).map((seller: any) => (
                  <div key={seller.id} className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-500/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-500/20 dark:to-amber-400/20 flex items-center justify-center text-sm">
                        {seller.storeLogo || '🏪'}
                      </div>
                      <span className="text-sm font-bold">{seller.storeName || seller.username}</span>
                    </div>
                    <button onClick={() => router.push('/admin/users')}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                      بررسی <BadgeCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
