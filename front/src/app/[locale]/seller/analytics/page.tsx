'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, Download, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sellerApi } from '@/lib/api';

const f = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n.toLocaleString();

export default function SellerAnalyticsPage() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = () => {
    setLoading(true); setError(false);
    sellerApi.analytics({ period })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };
  useEffect(() => { fetch(); }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> آمار و تحلیل</h2>
        <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 card animate-pulse" />)}</div>
        <div className="h-64 card animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> آمار و تحلیل</h2>
        <div className="card p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <button onClick={fetch} className="text-primary font-bold inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const summary = data.summary || data;
  const revenueData = data.revenue || data.monthlyRevenue || [];
  const topProducts = data.topProducts || [];
  const topCategories = data.topCategories || [];

  const maxRevenue = Math.max(...revenueData.map((r: any) => r.amount || 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> آمار و تحلیل
        </h2>
        <div className="flex items-center gap-2">
          {[
            { value: 'week', label: 'هفته' },
            { value: 'month', label: 'ماه' },
            { value: 'year', label: 'سال' },
          ].map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                period === p.value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent')}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'درآمد کل', value: summary.totalRevenue || 0, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
          { label: 'تعداد سفارش', value: summary.totalOrders || 0, icon: ShoppingBag, color: 'from-blue-500 to-indigo-500' },
          { label: 'میانگین سفارش', value: summary.avgOrderValue || 0, icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
          { label: 'محصولات', value: summary.totalProducts || 0, icon: BarChart3, color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center', stat.color)}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-black">
              {(stat.label === 'تعداد سفارش' || stat.label === 'محصولات')
                ? (stat.value as number).toLocaleString()
                : (stat.value as number).toLocaleString() + ' تومان'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold mb-4">نمودار درآمد</h3>
          <div className="space-y-3">
            {revenueData.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 text-right">{item.month || item.label || `دوره ${i + 1}`}</span>
                <div className="flex-1 h-8 bg-accent rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.amount / maxRevenue) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="h-full rounded-lg bg-gradient-to-r from-primary to-primary/60"
                  />
                </div>
                <span className="text-xs font-bold w-24">{f(item.amount)} تومان</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topCategories.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold mb-4">دسته‌بندی‌های پرفروش</h3>
            <div className="space-y-3">
              {topCategories.map((cat: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-sm text-muted-foreground">{cat.count || 0} سفارش</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topProducts.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold mb-4">محصولات پرفروش</h3>
            <div className="space-y-3">
              {topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate max-w-[180px]">{p.title}</span>
                  <span className="text-sm text-muted-foreground">{p.sold || p.saleCount || 0} فروش</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export */}
      <button onClick={() => {}} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-accent transition-colors">
        <Download className="w-4 h-4" /> خروجی گزارش
      </button>
    </div>
  );
}
