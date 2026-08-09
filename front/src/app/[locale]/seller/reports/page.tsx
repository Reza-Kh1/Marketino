'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, ShoppingBag, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';
import { sellerReportsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const f = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n.toLocaleString();

export default function SellerReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = () => {
    setLoading(true); setError(false);
    sellerReportsApi.get().then(d => { setData(d); setLoading(false); }).catch(() => { setError(true); setLoading(false); });
  };
  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="space-y-6"><div className="h-8 w-48 bg-accent rounded animate-pulse" /><div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-accent rounded-2xl animate-pulse" />)}</div><div className="h-64 bg-accent rounded-2xl animate-pulse" /></div>;
  if (error || !data) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div>
      <div className="mb-8"><h2 className="text-2xl font-black mb-1">گزارشات فروش</h2><p className="text-muted-foreground text-sm">عملکرد فروش فروشگاه شما</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'کل فروش', value: f(data.summary.totalRevenue), icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
          { label: 'سفارشات', value: data.summary.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'from-blue-500 to-cyan-500' },
          { label: 'میانگین سفارش', value: f(data.summary.avgOrderValue), icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
          { label: 'سود', value: f(data.summary.totalProfit), icon: CreditCard, color: 'from-green-500 to-emerald-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-5">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', s.color)}><s.icon className="w-5 h-5 text-white" /></div>
            <div className="text-xl font-black">{s.value}</div><div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <h3 className="font-black text-lg mb-6">فروش روزانه (۳۰ روز)</h3>
        <div className="flex items-end gap-0.5 h-48">
          {(data.dailySales || []).slice(-30).map((d: any, i: number) => {
            const max = Math.max(...(data.dailySales || []).map((x: any) => x.total), 1);
            return <div key={d.date} className="flex-1 flex flex-col items-center gap-1"><motion.div initial={{ height: 0 }} animate={{ height: Math.max(2, (d.total / max) * 180) }} transition={{ duration: 0.3, delay: i * 0.01 }} className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-sm" /></div>;
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-lg mb-4">محصولات برتر</h3>
        <div className="space-y-2">{(data.topProducts || []).map((p: any) => <div key={p.id} className="flex justify-between p-3 hover:bg-accent rounded-xl"><span>{p.title}</span><span className="font-bold">{p.sales} فروش • {f(p.revenue)}</span></div>)}</div>
      </div>
    </div>
  );
}
