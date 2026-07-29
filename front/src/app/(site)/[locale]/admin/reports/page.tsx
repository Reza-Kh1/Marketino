'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, TrendingUp, ShoppingBag, AlertTriangle, CreditCard } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const formatNum = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n.toLocaleString();

export default function AdminReportsPage() {
  const [tab, setTab] = useState<'sales' | 'financial'>('sales');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    const fetcher = tab === 'sales' ? reportsApi.sales : reportsApi.financial;
    fetcher().then(d => { setData(d); setLoading(false); }).catch(() => { setError(true); setLoading(false); });
  };
  useEffect(() => { load(); }, [tab]); // eslint-disable-line

  if (loading) return <div className="space-y-6"><div className="h-8 w-48 bg-accent animate-pulse rounded" /><div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-accent rounded-2xl animate-pulse" />)}</div><div className="h-64 bg-accent rounded-2xl animate-pulse" /></div>;
  if (error || !data) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={load} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black mb-1">گزارشات پیشرفته</h2></div>
        <div className="flex bg-muted rounded-xl p-1">
          <button onClick={() => setTab('sales')} className={cn('px-4 py-2 rounded-lg text-sm font-bold', tab === 'sales' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>فروش</button>
          <button onClick={() => setTab('financial')} className={cn('px-4 py-2 rounded-lg text-sm font-bold', tab === 'financial' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>مالی</button>
        </div>
      </div>

      {tab === 'sales' && data.summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'کل فروش', value: formatNum(data.summary.totalRevenue), icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
              { label: 'سفارشات', value: data.summary.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'from-blue-500 to-cyan-500' },
              { label: 'میانگین سفارش', value: formatNum(data.summary.avgOrderValue), icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
              { label: 'سود خالص', value: formatNum(data.summary.netProfit), icon: CreditCard, color: 'from-green-500 to-emerald-500' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-5">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', s.color)}><s.icon className="w-5 h-5 text-white" /></div>
                <div className="text-xl font-black">{s.value}</div><div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h3 className="font-black text-lg mb-6">درآمد ماهانه</h3>
            <div className="flex items-end gap-2 h-48">
              {data.monthlyData.map((d: any, i: number) => {
                const max = Math.max(...data.monthlyData.map((x: any) => x.revenue), 1);
                return <div key={d.month} className="flex-1 flex flex-col items-center gap-1"><motion.div initial={{ height: 0 }} animate={{ height: Math.max(4, (d.revenue / max) * 180) }} transition={{ duration: 0.5, delay: i * 0.05 }} className="w-full bg-gradient-to-t from-violet-500 to-blue-400 rounded-t-md" /><span className="text-[10px] text-muted-foreground">{d.month}</span></div>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-6"><h3 className="font-black text-lg mb-4">محصولات برتر</h3>{data.topProducts.map((p: any) => <div key={p.id} className="flex justify-between p-3 hover:bg-accent rounded-xl"><span>{p.title}</span><span className="font-bold">{p.sales} فروش</span></div>)}</div>
            <div className="bg-card border border-border rounded-2xl p-6"><h3 className="font-black text-lg mb-4">دسته‌بندی‌های برتر</h3>{data.topCategories.map((c: any) => <div key={c.name} className="flex justify-between p-3 hover:bg-accent rounded-xl"><span>{c.name}</span><span className="font-bold">{c.sales} فروش</span></div>)}</div>
          </div>
        </>
      )}

      {tab === 'financial' && data.transactions && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'موجودی', value: formatNum(data.walletBalance), icon: CreditCard, color: 'from-emerald-500 to-teal-500' },
              { label: 'واریزی‌ها', value: formatNum(data.totalDeposits), icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
              { label: 'برداشت‌ها', value: formatNum(data.totalWithdrawals), icon: DollarSign, color: 'from-amber-500 to-orange-500' },
              { label: 'در انتظار', value: formatNum(data.pendingWithdrawals), icon: AlertTriangle, color: 'from-yellow-500 to-yellow-600' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-5">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', s.color)}><s.icon className="w-5 h-5 text-white" /></div>
                <div className="text-xl font-black">{s.value}</div><div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-black text-lg mb-4">تراکنش‌های اخیر</h3>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="py-3 px-4 text-right font-bold">شرح</th><th className="py-3 px-4 text-right font-bold">نوع</th><th className="py-3 px-4 text-right font-bold">مبلغ</th><th className="py-3 px-4 text-right font-bold">وضعیت</th><th className="py-3 px-4 text-right font-bold">تاریخ</th></tr></thead><tbody>{data.transactions.map((tx: any) => <tr key={tx.id} className="border-b border-border/50 hover:bg-accent"><td className="py-3 px-4">{tx.description}</td><td className="py-3 px-4"><span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : tx.type === 'withdraw' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>{tx.type === 'deposit' ? 'واریز' : tx.type === 'withdraw' ? 'برداشت' : 'بازگشت'}</span></td><td className="py-3 px-4 font-bold">{tx.amount.toLocaleString()}</td><td className="py-3 px-4"><span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{tx.status === 'completed' ? 'موفق' : 'در انتظار'}</span></td><td className="py-3 px-4 text-muted-foreground">{tx.date}</td></tr>)}</tbody></table></div>
          </div>
        </>
      )}
    </div>
  );
}
