'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, AlertTriangle, Plus, CreditCard } from 'lucide-react';
import { userWalletApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [processing, setProcessing] = useState(false);
  const fetch = () => {
    setLoading(true); setError(false);
    userWalletApi.get().then(d => { setData(d); setLoading(false); }).catch(() => { setError(true); setLoading(false); });
  };
  useEffect(() => { fetch(); }, []);

  const handleDeposit = async () => {
    if (!amount || +amount <= 0) return;
    setProcessing(true);
    try { const r = await userWalletApi.deposit(+amount); toast.success('درگاه پرداخت باز شد'); setShowDeposit(false); setAmount(''); } catch { toast.error('خطا'); } finally { setProcessing(false); }
  };

  const handleWithdraw = async () => {
    if (!amount || !cardNum || +amount <= 0) { toast.error('اطلاعات را کامل کنید'); return; }
    setProcessing(true);
    try { await userWalletApi.withdraw(+amount, cardNum); toast.success('درخواست برداشت ثبت شد'); setShowWithdraw(false); setAmount(''); setCardNum(''); fetch(); } catch { toast.error('خطا'); } finally { setProcessing(false); }
  };

  if (loading) return <div className="space-y-6"><div className="h-32 bg-accent rounded-2xl animate-pulse" /><div className="h-48 bg-accent rounded-2xl animate-pulse" /></div>;
  if (error || !data) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8"><h2 className="text-2xl font-black mb-1">کیف پول من</h2></div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-2 mb-4 text-white/80"><Wallet className="w-5 h-5" /> موجودی کیف پول</div>
        <div className="text-4xl font-black mb-4">{data.balance.toLocaleString()} <span className="text-lg font-normal">تومان</span></div>
        <div className="flex gap-3">
          <button onClick={() => setShowDeposit(true)} className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl font-bold text-sm hover:bg-white/30 flex items-center gap-2"><Plus className="w-4 h-4" /> شارژ</button>
          <button onClick={() => setShowWithdraw(true)} className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-sm hover:bg-white/20 flex items-center gap-2"><ArrowDownRight className="w-4 h-4" /> برداشت</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-500 mb-1"><ArrowUpRight className="w-4 h-4" /> کل دریافتی</div>
          <div className="text-xl font-black">{data.totalEarned.toLocaleString()} تومان</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-500 mb-1"><ArrowDownRight className="w-4 h-4" /> کل هزینه</div>
          <div className="text-xl font-black">{data.totalSpent.toLocaleString()} تومان</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-lg mb-4">تراکنش‌های اخیر</h3>
        <div className="space-y-3">
          {data.transactions.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : tx.type === 'purchase' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600')}>
                  {tx.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : tx.type === 'purchase' ? <ArrowDownRight className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div><div className="font-bold text-sm">{tx.description}</div><div className="text-xs text-muted-foreground">{tx.date}</div></div>
              </div>
              <div className={cn('font-black', tx.type === 'deposit' || tx.type === 'refund' ? 'text-emerald-600' : 'text-red-600')}>{tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{tx.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeposit(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg mb-4">شارژ کیف پول</h3>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="مبلغ (تومان)" className="w-full h-12 rounded-xl border border-border bg-background px-4 mb-4" />
            <button onClick={handleDeposit} disabled={processing || !amount} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{processing ? '...' : 'پرداخت'}</button>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowWithdraw(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg mb-4">برداشت از کیف پول</h3>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="مبلغ (تومان)" className="w-full h-12 rounded-xl border border-border bg-background px-4 mb-4" />
            <input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="شماره کارت" className="w-full h-12 rounded-xl border border-border bg-background px-4 mb-4 font-mono" />
            <button onClick={handleWithdraw} disabled={processing || !amount || !cardNum} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{processing ? '...' : 'برداشت'}</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
