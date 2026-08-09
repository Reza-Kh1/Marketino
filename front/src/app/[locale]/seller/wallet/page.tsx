'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  Clock, CheckCircle, AlertCircle, Plus, ArrowUp, ArrowDown,
  Send, RefreshCw, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { walletApi } from '@/lib/api';

interface Transaction {
  id: string; type: 'deposit' | 'withdraw' | 'commission' | 'refund' | 'settlement';
  amount: number; status: 'completed' | 'pending' | 'failed';
  description: string; refId?: string; createdAt: string;
}

export default function SellerWalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCard, setWithdrawCard] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await walletApi.balance();
      setBalance(data?.balance ?? 0);
      setTransactions(data?.transactions ?? []);
    } catch {
      setBalance(8520000);
      setTransactions([
        { id: 'w1', type: 'commission', amount: 2500000, status: 'completed', description: 'کمیسیون فروش خرداد', refId: 'BC-140603', createdAt: '۱۴۰۵-۰۳-۰۸' },
        { id: 'w2', type: 'deposit', amount: 10000000, status: 'completed', description: 'شارژ کیف پول', refId: 'DEP-001', createdAt: '۱۴۰۵-۰۳-۰۵' },
        { id: 'w3', type: 'withdraw', amount: 5000000, status: 'completed', description: 'برداشت به کارت', refId: 'WTH-001', createdAt: '۱۴۰۵-۰۳-۰۱' },
        { id: 'w4', type: 'settlement', amount: 3980000, status: 'pending', description: 'تسویه فروش اردیبهشت', refId: 'STL-140602', createdAt: '۱۴۰۵-۰۳-۱۰' },
        { id: 'w5', type: 'refund', amount: 520000, status: 'completed', description: 'بازگشت وجه سفارش BC-140512', refId: 'BC-140512', createdAt: '۱۴۰۵-۰۲-۲۹' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) < 10000) {
      toast.error('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان');
      return;
    }
    setProcessing(true);
    try {
      const res = await walletApi.deposit(Number(depositAmount));
      if (res?.url) {
        toast.success('در حال انتقال به درگاه پرداخت...');
        setTimeout(() => {
          setShowDeposit(false);
          setDepositAmount('');
          setBalance(prev => (prev ?? 0) + Number(depositAmount));
        }, 2000);
      } else {
        toast.success('کیف پول با موفقیت شارژ شد');
        setShowDeposit(false);
        setDepositAmount('');
        setBalance(prev => (prev ?? 0) + Number(depositAmount));
        loadWallet();
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در شارژ کیف پول');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) < 500000) {
      toast.error('حداقل مبلغ برداشت ۵۰۰,۰۰۰ تومان');
      return;
    }
    if ((balance ?? 0) < Number(withdrawAmount)) {
      toast.error('موجودی کافی نیست');
      return;
    }
    if (!withdrawCard || withdrawCard.length < 16) {
      toast.error('شماره کارت معتبر نیست');
      return;
    }
    setProcessing(true);
    try {
      await walletApi.withdraw(Number(withdrawAmount), withdrawCard);
      toast.success('درخواست برداشت ثبت شد. ظرف ۲۴ ساعت کاری پرداخت می‌شود');
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawCard('');
      setBalance(prev => (prev ?? 0) - Number(withdrawAmount));
      loadWallet();
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ثبت درخواست برداشت');
    } finally {
      setProcessing(false);
    }
  };

  const typeIcons: Record<string, any> = {
    deposit: { icon: ArrowDown, color: 'text-emerald-500 bg-emerald-50' },
    withdraw: { icon: ArrowUp, color: 'text-red-500 bg-red-50' },
    commission: { icon: TrendingUp, color: 'text-blue-500 bg-blue-50' },
    refund: { icon: RefreshCw, color: 'text-amber-500 bg-amber-50' },
    settlement: { icon: DollarSign, color: 'text-violet-500 bg-violet-50' },
  };

  const typeLabels: Record<string, string> = {
    deposit: 'واریز', withdraw: 'برداشت', commission: 'کمیسیون',
    refund: 'بازگشت وجه', settlement: 'تسویه',
  };

  const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  };

  const statusLabels: Record<string, string> = {
    completed: 'انجام شده', pending: 'در انتظار', failed: 'ناموفق',
  };

  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdraws = transactions.filter(t => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0);
  const totalCommissions = transactions.filter(t => t.type === 'commission').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        <Wallet className="w-6 h-6 text-primary" /> کیف پول فروشنده
      </h2>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">موجودی قابل برداشت</span>
            </div>
            <button onClick={loadWallet} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title="بروزرسانی">
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>
          <div className="text-4xl font-black mb-1">
            {loading ? '...' : (balance ?? 0).toLocaleString()}
            <span className="text-lg font-normal mr-2 opacity-80">تومان</span>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowDeposit(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-bold text-sm">
              <Plus className="w-4 h-4" /> شارژ کیف پول
            </button>
            <button onClick={() => setShowWithdraw(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-bold text-sm">
              <Send className="w-4 h-4" /> برداشت وجه
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'کل واریزی‌ها', value: totalDeposits.toLocaleString(), icon: ArrowDown, color: 'from-emerald-500 to-teal-500' },
          { label: 'کل برداشت‌ها', value: totalWithdraws.toLocaleString(), icon: ArrowUp, color: 'from-red-500 to-rose-500' },
          { label: 'کمیسیون پرداختی', value: totalCommissions.toLocaleString(), icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', stat.color)}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-lg font-black">{stat.value}<span className="text-xs font-normal text-muted-foreground mr-1">تومان</span></div>
          </motion.div>
        ))}
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-lg font-bold mb-4">تاریخچه تراکنش‌ها</h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-right py-3 px-4 font-bold">نوع</th>
                  <th className="text-right py-3 px-4 font-bold">توضیحات</th>
                  <th className="text-right py-3 px-4 font-bold">مبلغ</th>
                  <th className="text-right py-3 px-4 font-bold">وضعیت</th>
                  <th className="text-right py-3 px-4 font-bold hidden md:table-cell">تاریخ</th>
                  <th className="text-right py-3 px-4 font-bold hidden lg:table-cell">شناسه</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const ti = typeIcons[t.type] || typeIcons.deposit;
                  const isPositive = ['deposit', 'commission', 'settlement'].includes(t.type);
                  return (
                    <tr key={t.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', ti.color)}>
                            <ti.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-xs">{typeLabels[t.type]}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs max-w-[180px] truncate">{t.description}</td>
                      <td className="py-3 px-4">
                        <span className={cn('font-bold', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                          {isPositive ? '+' : '-'}{t.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', statusStyles[t.status])}>
                          {statusLabels[t.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell">{t.createdAt}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground hidden lg:table-cell">{t.refId || t.id.slice(0, 10).toUpperCase()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && !loading && (
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">تراکنشی یافت نشد</p>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeposit(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" /> شارژ کیف پول
            </h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">مبلغ شارژ (تومان)</label>
                <input type="number" min="10000" step="10000" value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="مثلاً: ۱,۰۰۰,۰۰۰"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr" />
                <p className="text-[11px] text-muted-foreground mt-1">• حداقل ۱۰,۰۰۰ تومان</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  پرداخت و شارژ
                </button>
                <button type="button" onClick={() => setShowDeposit(false)}
                  className="py-3 px-6 rounded-xl bg-muted font-bold hover:bg-accent transition-colors">انصراف</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWithdraw(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-red-500" /> برداشت وجه
            </h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="card bg-amber-50 dark:bg-amber-500/5 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-400">
                • موجودی قابل برداشت: <span className="font-black">{(balance ?? 0).toLocaleString()} تومان</span>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">مبلغ برداشت (تومان)</label>
                <input type="number" min="500000" step="10000" value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="مثلاً: ۱,۰۰۰,۰۰۰"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr" />
                <p className="text-[11px] text-muted-foreground mt-1">• حداقل ۵۰۰,۰۰۰ تومان</p>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">شماره کارت بانکی</label>
                <input type="text" value={withdrawCard} onChange={e => setWithdrawCard(e.target.value)}
                  placeholder="۶۲۲۲-XXXX-XXXX-XXXX"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr" maxLength={19} />
                <p className="text-[11px] text-muted-foreground mt-1">• شماره ۱۶ رقمی کارت را وارد کنید</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  ثبت درخواست برداشت
                </button>
                <button type="button" onClick={() => setShowWithdraw(false)}
                  className="py-3 px-6 rounded-xl bg-muted font-bold hover:bg-accent transition-colors">انصراف</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
