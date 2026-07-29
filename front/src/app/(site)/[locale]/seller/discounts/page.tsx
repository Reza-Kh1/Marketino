'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Percent, Plus, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import { sellerDiscountsApi, type DiscountCode } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SellerDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage' as const, value: 0, minOrderAmount: 0, maxDiscount: 0, usageLimit: 100, startsAt: '', endsAt: '' });

  const fetch = async () => {
    setLoading(true); setError(false);
    try { const r = await sellerDiscountsApi.list(); setDiscounts(r.discounts); } catch { setError(true); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim() || form.value <= 0) { toast.error('کد و مقدار الزامی است'); return; }
    setSaving(true);
    try { await sellerDiscountsApi.create(form); toast.success('کد تخفیف ایجاد شد'); setShowForm(false); fetch(); } catch { toast.error('خطا'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => { if (!confirm('حذف؟')) return; try { await sellerDiscountsApi.delete(id); fetch(); } catch { toast.error('خطا'); } };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-accent rounded-2xl animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black mb-1">کدهای تخفیف</h2><p className="text-muted-foreground text-sm">{discounts.length} کد تخفیف</p></div>
        <button onClick={() => { setForm({ code: '', type: 'percentage', value: 0, minOrderAmount: 0, maxDiscount: 0, usageLimit: 100, startsAt: '', endsAt: '' }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm"><Plus className="w-4 h-4" /> کد تخفیف جدید</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg mb-6">کد تخفیف جدید</h3>
            <div className="space-y-4">
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="کد تخفیف" className="w-full h-11 rounded-xl border border-border bg-background px-4 font-mono" />
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))} className="w-full h-11 rounded-xl border border-border bg-background px-4"><option value="percentage">درصدی</option><option value="fixed">مبلغ ثابت</option></select>
              <input type="number" value={form.value || ''} onChange={e => setForm(p => ({ ...p, value: +e.target.value }))} placeholder={form.type === 'percentage' ? 'درصد تخفیف' : 'مبلغ (تومان)'} className="w-full h-11 rounded-xl border border-border bg-background px-4" />
              <input type="number" value={form.minOrderAmount || ''} onChange={e => setForm(p => ({ ...p, minOrderAmount: +e.target.value }))} placeholder="حداقل سفارش" className="w-full h-11 rounded-xl border border-border bg-background px-4" />
              {form.type === 'percentage' && <input type="number" value={form.maxDiscount || ''} onChange={e => setForm(p => ({ ...p, maxDiscount: +e.target.value }))} placeholder="حداکثر تخفیف" className="w-full h-11 rounded-xl border border-border bg-background px-4" />}
              <input type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: +e.target.value }))} placeholder="محدودیت استفاده" className="w-full h-11 rounded-xl border border-border bg-background px-4" />
              <input type="date" value={form.startsAt} onChange={e => setForm(p => ({ ...p, startsAt: e.target.value }))} className="w-full h-11 rounded-xl border border-border bg-background px-4" />
              <input type="date" value={form.endsAt} onChange={e => setForm(p => ({ ...p, endsAt: e.target.value }))} className="w-full h-11 rounded-xl border border-border bg-background px-4" />
              <button onClick={handleCreate} disabled={saving} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{saving ? '...' : 'ایجاد'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {discounts.length === 0 ? <div className="text-center py-16"><Percent className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">کد تخفیفی وجود ندارد</p></div> : (
        <div className="space-y-4">
          {discounts.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center"><Percent className="w-6 h-6 text-white" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg">{d.code}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', d.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700')}>{d.isActive ? 'فعال' : 'غیرفعال'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{d.type === 'percentage' ? `${d.value}٪` : `${d.value.toLocaleString()} تومان`} • حداقل خرید {d.minOrderAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{d.usedCount}/{d.usageLimit}</div>
                  <div className="w-24 h-1.5 bg-accent rounded-full mt-1 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (d.usedCount / d.usageLimit) * 100)}%` }} /></div>
                  <button onClick={() => handleDelete(d.id)} className="mt-2 text-xs text-red-500 hover:underline"><Trash2 className="w-3 h-3 inline" /> حذف</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
