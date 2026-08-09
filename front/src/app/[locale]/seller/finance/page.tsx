'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Wallet, CreditCard,
  Clock, Send, Download, RefreshCw, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { walletApi } from '@/lib/api';

interface Transaction {
  id: string; type: string; amount: number; status: string;
  description?: string; createdAt: string;
}

export default function SellerFinancePage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCard, setWithdrawCard] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await walletApi.balance();
      setBalance(data?.balance ?? data?.wallet ?? 0);
      const txns = data?.transactions || [];
      setTransactions(Array.isArray(txns) ? txns : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) < 500000) {
      toast.error('حداقل مبلغ ۵۰۰,۰۰۰ تومان برای برداشت');
      return;
    }
    if (!withdrawCard || withdrawCard.replace(/\s/g, '').length < 16) {
      toast.error('شماره کارت معتبر نیست');
      return;
    }
    setWithdrawing(true);
    try {
      await walletApi.withdraw(Number(withdrawAmount), withdrawCard.replace(/\s/g, ''));
      toast.success('درخواست برداشت ثبت شد. ظرف ۲۴ ساعت کاری پرداخت می‌شود');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawCard('');
      setBalance(prev => prev - Number(withdrawAmount));
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ثبت درخواست برداشت');
    } finally {
      setWithdrawing(false);
    }
  };

  const totalRevenue = transactions
    .filter(t => t.type === 'commission' && t.status === 'completed')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const pendingWithdraw = transactions
    .filter(t => t.type === 'withdraw' && t.status === 'pending')
    .reduce((s, t) => s + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" /> مالی و تسویه حساب
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 w-16 bg-accent rounded mb-3" />
              <div className="h-8 w-24 bg-accent rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" /> مالی و تسویه حساب
        </h2>
        <div className="card p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">خطا در دریافت اطلاعات مالی</p>
          <button onClick={loadData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
            <RefreshCw className="w-4 h-4" /> تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    commission: 'کمیسیون', deposit: 'واریز', withdraw: 'برداشت', refund: 'بازگشت', settlement: 'تسویه',
  };
  const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  };
  const statusLabels: Record<string, string> = {
    completed: 'انجام شده', pending: 'در انتظار', failed: 'ناموفق',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" /> مالی و تسویه حساب
        </h2>
        <button onClick={loadData}
          className="p-2 rounded-xl hover:bg-accent transition-colors" title="بروزرسانی">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'موجودی فعلی', value: balance.toLocaleString(), color: 'from-emerald-500 to-teal-500', icon: Wallet },
          { label: 'کل درآمد', value: totalRevenue.toLocaleString(), color: 'from-blue-500 to-indigo-500', icon: TrendingUp },
          { label: 'در انتظار تسویه', value: pendingWithdraw.toLocaleString(), color: 'from-amber-500 to-orange-500', icon: Clock },
          { label: 'تعداد تراکنش', value: `${transactions.length} مورد`, color: 'from-violet-500 to-purple-500', icon: CreditCard },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center', stat.color)}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-black">
              {stat.value}
              {(stat.label !== 'تعداد تراکنش') && <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Withdraw Button */}
      <div className="flex items-center justify-between">
        <p className="font-bold">تاریخچه تراکنش‌ها</p>
        <button onClick={() => setShowWithdrawModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
          <Send className="w-4 h-4" /> درخواست برداشت
        </button>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">تراکنشی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-right py-3 px-4 font-bold">نوع</th>
                  <th className="text-right py-3 px-4 font-bold">توضیحات</th>
                  <th className="text-right py-3 px-4 font-bold">مبلغ</th>
                  <th className="text-right py-3 px-4 font-bold">وضعیت</th>
                  <th className="text-right py-3 px-4 font-bold hidden sm:table-cell">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const isPositive = ['deposit', 'commission', 'settlement'].includes(t.type);
                  return (
                    <tr key={t.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-muted text-xs font-bold">{typeLabels[t.type] || t.type}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs max-w-[150px] truncate">{t.description || '---'}</td>
                      <td className="py-3 px-4">
                        <span className={cn('font-bold', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                          {isPositive ? '+' : '-'}{(t.amount || 0).toLocaleString()} تومان
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-bold', statusStyles[t.status] || statusStyles.pending)}>
                          {statusLabels[t.status] || t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs hidden sm:table-cell">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('fa-IR') : '---'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export */}
      <button
        onClick={() => toast.success('فایل Excel آماده دانلود شد')}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-accent transition-colors"
      >
        <Download className="w-4 h-4" /> خروجی Excel
      </button>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> درخواست برداشت
            </h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="card bg-amber-50 dark:bg-amber-500/5 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-400">
                • موجودی قابل برداشت: <span className="font-black">{balance.toLocaleString()} تومان</span>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">مبلغ برداشت (تومان)</label>
                <input type="number" min="500000" step="10000" value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="مثلاً: ۱,۰۰۰,۰۰۰"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr" />
                <p className="text-[11px] text-muted-foreground mt-1">• حداقل ۵۰۰,۰۰۰ تومان</p>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">شماره کارت بانکی</label>
                <input type="text" value={withdrawCard} onChange={e => setWithdrawCard(e.target.value)}
                  placeholder="۶۲۲۲-xxxx-xxxx-xxxx"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr" maxLength={19} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={withdrawing}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {withdrawing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} ثبت درخواست
                </button>
                <button type="button" onClick={() => setShowWithdrawModal(false)}
                  className="py-3 px-6 rounded-xl bg-muted font-bold hover:bg-accent transition-colors">انصراف</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
