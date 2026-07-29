'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Package, Star, DollarSign, Users, Clock,
  AlertCircle, ChevronLeft, BarChart3, Plus, Eye, Zap, Target,
  ArrowUp, ArrowDown, RefreshCw, Gift, CheckCircle, XCircle, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

/* ========================================================================
 * 🏪 فروشنده — داشبورد حرفه‌ای
 * ======================================================================== */

const MOCK = {
  stats: {
    totalRevenue: 158_900_000,
    totalOrders: 234,
    totalProducts: 45,
    pendingOrders: 12,
    avgRating: 4.7,
    totalReviews: 89,
    monthGrowth: 23,
    todayRevenue: 4_200_000,
    todayOrders: 7,
    viewsToday: 342,
  },
  monthlySales: [
    { month: 'فروردین', revenue: 22_000_000 },
    { month: 'اردیبهشت', revenue: 18_500_000 },
    { month: 'خرداد', revenue: 25_300_000 },
    { month: 'تیر', revenue: 28_100_000 },
    { month: 'مرداد', revenue: 31_500_000 },
    { month: 'شهریور', revenue: 33_500_000 },
  ],
  recentOrders: [
    { id: '1', orderNumber: 'BZ-14050203', buyerName: 'علیرضا محمدی', total: 12_500_000, status: 'pending', createdAt: '۱۴۰۵-۰۲-۰۳' },
    { id: '2', orderNumber: 'BZ-14050202', buyerName: 'سارا احمدی', total: 8_900_000, status: 'confirmed', createdAt: '۱۴۰۵-۰۲-۰۲' },
    { id: '3', orderNumber: 'BZ-14050201', buyerName: 'رضا جوادی', total: 4_200_000, status: 'shipped', createdAt: '۱۴۰۵-۰۲-۰۱' },
    { id: '4', orderNumber: 'BZ-14050130', buyerName: 'مریم حسنی', total: 15_000_000, status: 'delivered', createdAt: '۱۴۰۵-۰۱-۳۰' },
    { id: '5', orderNumber: 'BZ-14050128', buyerName: 'امیر رضایی', total: 3_400_000, status: 'delivered', createdAt: '۱۴۰۵-۰۱-۲۸' },
  ],
  topProducts: [
    { id: '1', title: 'هدفون بی‌سیم حرفه‌ای', image: 'https://picsum.photos/seed/headphone/200/200', price: 2_500_000, sold: 89, rating: 4.8, reviews: 32, stock: 15 },
    { id: '2', title: 'اسپیکر بلوتوثی قابل حمل', image: 'https://picsum.photos/seed/speaker/200/200', price: 1_800_000, sold: 67, rating: 4.5, reviews: 21, stock: 8 },
    { id: '3', title: 'پاوربانک ۲۰۰۰۰ میلی‌آمپر', image: 'https://picsum.photos/seed/powerbank/200/200', price: 950_000, sold: 54, rating: 4.6, reviews: 18, stock: 45 },
    { id: '4', title: 'کیبورد مکانیکال RGB', image: 'https://picsum.photos/seed/keyboard/200/200', price: 3_200_000, sold: 32, rating: 4.4, reviews: 9, stock: 3 },
  ],
  performance: {
    conversionRate: 4.2,
    avgOrderValue: 678_000,
    returnRate: 1.8,
    responseTime: '۲.۵ ساعت',
  },
};

const statusLabels: Record<string, string> = {
  pending: 'در انتظار', confirmed: 'تایید شده', processing: 'در حال پردازش',
  shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده',
};
const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  confirmed: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  processing: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
  shipped: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  delivered: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const { stats, monthlySales, recentOrders, topProducts, performance } = MOCK;
  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-muted rounded-2xl" />
          <div className="h-72 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">🎉 {user?.firstName || 'فروشنده'}، خوش آمدید!</h1>
          <p className="text-sm text-muted-foreground mt-1">امروز {stats.todayOrders} سفارش جدید دارید</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/seller/products/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-500/25">
            <Plus className="w-4 h-4" /> محصول جدید
          </Link>
          <Link href="/seller/orders"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border hover:border-indigo-300 font-bold text-sm transition-colors">
            سفارشات <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: DollarSign, label: 'درآمد کل', value: `${(stats.totalRevenue / 1_000_000).toFixed(1)}M`, sub: 'تومان', change: `+${stats.monthGrowth}٪`, up: true, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { icon: ShoppingBag, label: 'کل سفارشات', value: stats.totalOrders.toLocaleString('fa-IR'), sub: `${stats.todayOrders} امروز`, up: true, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { icon: Package, label: 'محصولات', value: stats.totalProducts.toString(), sub: `${topProducts.filter(p => p.stock < 10).length} کم موجود`, up: false, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
          { icon: Star, label: 'میانگین امتیاز', value: stats.avgRating.toString(), sub: `${stats.totalReviews} نظر`, up: true, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { icon: Eye, label: 'بازدید امروز', value: stats.viewsToday.toLocaleString('fa-IR'), sub: 'نفر', up: true, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-card border border-border/40 rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bg)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              {item.change && (
                <span className={cn('text-xs font-bold flex items-center gap-0.5', item.up ? 'text-emerald-600' : 'text-rose-600')}>
                  {item.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {item.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-black tracking-tight">{item.value}</div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-[10px] text-muted-foreground/60">{item.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart — Monthly Sales (2/3) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-lg">فروش ماهانه</h3>
              <p className="text-xs text-muted-foreground mt-0.5">۶ ماه اخیر (تومان)</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">رشد نسبت به ماه قبل</div>
              <div className="text-sm font-black text-emerald-600 flex items-center justify-end gap-1">
                <ArrowUp className="w-3.5 h-3.5" /> +{stats.monthGrowth}٪
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 px-2">
            {monthlySales.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.revenue / maxRevenue) * 80}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.7, ease: 'easeOut' }}
                  className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 transition-colors cursor-pointer relative group min-h-[4px]"
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(item.revenue / 1_000_000).toFixed(1)}M
                  </span>
                </motion.div>
                <span className="text-[10px] text-muted-foreground font-medium">{item.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Cards (1/3) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border/40 rounded-2xl p-6">
          <h3 className="font-black text-lg mb-4">عملکرد</h3>
          <div className="space-y-4">
            {[
              { icon: Target, label: 'نرخ تبدیل', value: `${performance.conversionRate}٪`, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { icon: DollarSign, label: 'میانگین ارزش سفارش', value: `${(performance.avgOrderValue / 1000).toFixed(0)} هزار تومان`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { icon: RefreshCw, label: 'نرخ بازگشت', value: `${performance.returnRate}٪`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { icon: Clock, label: 'زمان پاسخگویی', value: performance.responseTime, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', item.bg)}>
                  <item.icon className={cn('w-5 h-5', item.color)} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="font-black text-sm">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-black">سفارشات اخیر</h3>
              {stats.pendingOrders > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                  {stats.pendingOrders} در انتظار
                </span>
              )}
            </div>
            <Link href="/seller/orders" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
              همه <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground text-xs">
                  <th className="text-right pb-3 font-medium">سفارش</th>
                  <th className="text-right pb-3 font-medium">مشتری</th>
                  <th className="text-right pb-3 font-medium">مبلغ</th>
                  <th className="text-right pb-3 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => router.push('/seller/orders')}>
                    <td className="py-3 font-mono text-xs font-bold">{order.orderNumber}</td>
                    <td className="py-3 text-muted-foreground">{order.buyerName}</td>
                    <td className="py-3 font-bold">{order.total.toLocaleString('fa-IR')}</td>
                    <td className="py-3">
                      <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-bold', statusColors[order.status])}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black">محصولات پرفروش</h3>
            <Link href="/seller/products" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
              همه <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => router.push(`/seller/products`)}>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{product.title}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {product.rating}
                    </span>
                    <span>{product.sold.toLocaleString('fa-IR')} فروش</span>
                    <span className={cn(product.stock < 10 ? 'text-rose-500 font-bold' : 'text-emerald-600')}>
                      {product.stock} عدد
                    </span>
                  </div>
                </div>
                <div className="text-sm font-black text-right">
                  {product.price.toLocaleString('fa-IR')}
                  <div className="text-[10px] text-muted-foreground font-normal">تومان</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Plus, label: 'محصول جدید', href: '/seller/products/new', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' },
          { icon: Package, label: 'مدیریت محصولات', href: '/seller/products', color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600' },
          { icon: TrendingUp, label: 'گزارش فروش', href: '/seller/reports', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' },
          { icon: Gift, label: 'کد تخفیف', href: '/seller/discounts', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' },
        ].map((action, i) => (
          <Link key={action.label} href={action.href}
            className={cn('flex items-center gap-3 p-4 rounded-2xl border border-border/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300', action.color)}>
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm">
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">{action.label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
