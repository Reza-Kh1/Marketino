'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, Send, AlertTriangle } from 'lucide-react';
import { ticketsApi, type SupportTicket } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PRIORITY: Record<string, { label: string; color: string }> = { low: { label: 'کم', color: 'bg-gray-100 text-gray-700' }, medium: { label: 'متوسط', color: 'bg-blue-100 text-blue-700' }, high: { label: 'بالا', color: 'bg-amber-100 text-amber-700' }, urgent: { label: 'فوری', color: 'bg-red-100 text-red-700' } };
const STATUS: Record<string, { label: string; color: string }> = { open: { label: 'باز', color: 'bg-amber-100 text-amber-700' }, in_progress: { label: 'در حال بررسی', color: 'bg-blue-100 text-blue-700' }, resolved: { label: 'حل شده', color: 'bg-green-100 text-green-700' }, closed: { label: 'بسته', color: 'bg-gray-100 text-gray-700' } };

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = async () => {
    setLoading(true); setError(false);
    try { const r = await ticketsApi.list(); setTickets(r.tickets); } catch { setError(true); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleReply = async (id: string) => {
    if (!reply.trim()) return;
    setSending(true);
    try { await ticketsApi.reply(id, reply); toast.success('پاسخ ارسال شد'); setReply(''); fetch(); } catch { toast.error('خطا'); } finally { setSending(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await ticketsApi.updateStatus(id, status); toast.success('وضعیت تغییر کرد'); fetch(); } catch { toast.error('خطا'); }
  };

  const filtered = statusFilter ? tickets.filter(t => t.status === statusFilter) : tickets;

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-accent rounded-2xl animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black mb-1">تیکت‌های پشتیبانی</h2><p className="text-muted-foreground text-sm">{tickets.length} تیکت</p></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-border bg-background px-4 text-sm">
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <div className="text-center py-16"><MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">تیکتی وجود ندارد</p></div> : (
        <div className="space-y-4">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="w-full p-5 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs">{t.ticketNumber}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', PRIORITY[t.priority]?.color)}>{PRIORITY[t.priority]?.label}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', STATUS[t.status]?.color)}>{STATUS[t.status]?.label}</span>
                  </div>
                  <h3 className="font-black">{t.subject}</h3>
                  <p className="text-xs text-muted-foreground">{t.user?.firstName} {t.user?.lastName} • {new Date(t.createdAt).toLocaleDateString('fa-IR')}</p>
                </div>
                <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', expanded === t.id && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {expanded === t.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
                    <div className="p-5 space-y-4">
                      <div className="bg-accent rounded-xl p-4"><p className="text-sm">{t.message}</p></div>
                      {t.replies.map(r => (
                        <div key={r.id} className={cn('rounded-xl p-4', r.isAdmin ? 'bg-blue-50 mr-8' : 'bg-accent ml-8')}>
                          <p className="text-sm mb-1">{r.message}</p>
                          <span className="text-[10px] text-muted-foreground">{r.isAdmin ? 'پشتیبانی' : 'کاربر'} • {new Date(r.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <input value={reply} onChange={e => setReply(e.target.value)} placeholder="پاسخ خود را بنویسید..." className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm" />
                        <button onClick={() => handleReply(t.id)} disabled={sending || !reply.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center gap-1"><Send className="w-4 h-4" /> ارسال</button>
                      </div>

                      <div className="flex gap-2">
                        {['in_progress', 'resolved', 'closed'].filter(s => s !== t.status).map(s => (
                          <button key={s} onClick={() => handleStatus(t.id, s)} className="px-3 py-1.5 bg-accent rounded-lg text-xs font-bold hover:bg-primary/10">{STATUS[s]?.label}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
