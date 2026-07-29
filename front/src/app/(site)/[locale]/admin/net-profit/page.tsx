'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NetProfitData {
  totalCommission: number;
  totalCosts: number;
  netProfit: number;
  allTimeCommission: number;
  period: string;
  monthlyBreakdown: { month: string; revenue: number; commission: number; orders: number }[];
}

export default function AdminNetProfitPage() {
  const [data, setData] = useState<NetProfitData | null>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await adminApi.netProfit(period);
        setData(res);
      } catch {
        toast.error('خطا در دریافت اطلاعات سود خالص');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  const formatToman = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000_000)
      return (amount / 1_000_000_000).toFixed(1) + ' میلیارد تومان';
    if (Math.abs(amount) >= 1_000_000)
      return (amount / 1_000_000).toFixed(1) + ' میلیون تومان';
    return amount.toLocaleString() + ' تومان';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-accent rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-accent rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-accent rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">سود خالص</h2>
        <p className="text-muted-foreground text-sm">کمیسیون کل منهای هزینه‌های پلتفرم</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'week', label: 'هفته' },
          { key: 'month', label: 'ماه' },
          { key: 'year', label: 'سال' },
        ].map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
              period === p.key ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-muted',
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'کمیسیون کل', value: data.totalCommission, icon: TrendingUp, color: 'from-blue-500 to-cyan-500', prefix: '+' },
          { label: 'هزینه‌های پلتفرم', value: data.totalCosts, icon: TrendingDown, color: 'from-red-500 to-rose-500', prefix: '-' },
          { label: 'سود خالص', value: data.netProfit, icon: DollarSign, color: 'from-emerald-500 to-teal-500', prefix: data.netProfit >= 0 ? '+' : '' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', card.color)}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-muted-foreground mb-1">{card.label}</div>
            <div className={cn('text-2xl font-black', card.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {card.prefix}{formatToman(Math.abs(card.value))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* All-time */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">کمیسیون کل (از ابتدا):</span>
          <span className="text-lg font-black text-emerald-600">{formatToman(data.allTimeCommission)}</span>
        </div>
      </motion.div>

      {/* Monthly Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-lg mb-6">تقسیم‌بندی ماهانه</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/50">
              <tr>
                <th className="text-right py-3 px-4 font-bold">ماه</th>
                <th className="text-right py-3 px-4 font-bold">سفارشات</th>
                <th className="text-right py-3 px-4 font-bold">درآمد</th>
                <th className="text-right py-3 px-4 font-bold">کمیسیون</th>
                <th className="text-right py-3 px-4 font-bold">سود خالص</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyBreakdown.map((m, i) => (
                <motion.tr key={m.month} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 font-bold">{m.month}</td>
                  <td className="py-3 px-4 font-mono">{m.orders.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono">{(m.revenue / 1_000_000).toFixed(1)}M</td>
                  <td className="py-3 px-4 font-mono text-blue-600">{(m.commission / 1_000_000).toFixed(1)}M</td>
                  <td className={cn('py-3 px-4 font-mono font-bold', m.commission >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {(m.commission / 1_000_000).toFixed(1)}M
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
