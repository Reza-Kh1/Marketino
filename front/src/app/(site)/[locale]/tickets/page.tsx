'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, X, Clock, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};
const PRIORITY_LABELS: Record<string, string> = { low: 'کم‌اهم', medium: 'معمول', high: 'مهم', urgent: 'فوری' };

export default function SupportTicketsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [tickets, setTickets] = useState([
    { id: 'TKT-101', subject: 'محصول دریافت نشده', status: 'open', priority: 'high', date: '۱۴۰۵-۰۳-۰۶', replies: 0 },
    { id: 'TKT-102', subject: 'خطا در پرداخت آنلاین', status: 'in_progress', priority: 'medium', date: '۱۴۰۵-۰۳-۰۵', replies: 2 },
    { id: 'TKT-103', subject: 'درخواست استرداد کالا', status: 'resolved', priority: 'low', date: '۱۴۰۵-۰۳-۰۳', replies: 4 },
    { id: 'TKT-104', subject: 'فروشنده کالای تقلبی فرستاده', status: 'open', priority: 'urgent', date: '۱۴۰۵-۰۳-۰۷', replies: 0 },
  ]);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' as string });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('لطفاً موضوع و متن پیام را وارد کنید');
      return;
    }
    const newTicket = {
      id: `TKT-${Date.now()}`,
      subject: form.subject,
      status: 'open',
      priority: form.priority,
      date: new Date().toLocaleDateString('fa-IR'),
      replies: 0,
    };
    setTickets([newTicket, ...tickets]);
    setShowNewModal(false);
    setForm({ subject: '', message: '', priority: 'medium' });
    toast.success('تیکت با موفقیت ثبت شد');
  };

  const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-amber-100 text-amber-700', label: 'باز' },
    in_progress: { bg: 'bg-blue-100 text-blue-700', label: 'در حال بررسی' },
    resolved: { bg: 'bg-emerald-100 text-emerald-700', label: 'حل شده' },
    closed: { bg: 'bg-gray-100 text-gray-600', label: 'بسته شده' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Send className="w-6 h-6 text-primary" /> تیکت پشتیبانی
        </h2>
        <button onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> تیکت جدید
        </button>
      </div>

      {/* Tickets List */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-right py-3 px-4 font-bold">شماره تیکت</th>
              <th className="text-right py-3 px-4 font-bold">موضوع</th>
              <th className="text-right py-3 px-4 font-bold hidden sm:table-cell">اولویت</th>
              <th className="text-right py-3 px-4 font-bold">وضعیت</th>
              <th className="text-right py-3 px-4 font-bold hidden lg:table-cell">پاسخ</th>
              <th className="text-right py-3 px-4 font-bold hidden lg:table-cell">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-t border-border hover:bg-accent/30 transition-colors cursor-pointer">
                <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{t.id}</td>
                <td className="py-3 px-4 font-medium max-w-[250px] truncate">{t.subject}</td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className={cn('px-2 py-0.5 rounded-lg text-[11px] font-bold', PRIORITY_STYLES[t.priority])}>
                    {PRIORITY_LABELS[t.priority]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-bold', STATUS_BADGES[t.status]?.bg, STATUS_BADGES[t.status]?.text)}>
                    {STATUS_BADGES[t.status]?.label || t.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs hidden lg:table-cell">{t.replies}</td>
                <td className="py-3 px-4 text-muted-foreground text-xs hidden lg:table-cell">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative card p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-black mb-4">ثبت تیکت جدید</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">موضوع *</label>
                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="خلاصه مشکل خود را بنویسید"
                  className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">توضیحات کامل *</label>
                <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="مشکل را با جزئیات توضیح دهید..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">اولویت</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <button key={p} type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-bold transition-colors',
                        form.priority === p
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      )}>
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> ارسال تیکت
                </button>
                <button type="button" onClick={() => setShowNewModal(false)}
                  className="py-3 px-6 rounded-xl bg-muted font-bold hover:bg-accent transition-colors">انصراف</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
