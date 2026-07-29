'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Check, Info, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { notificationsApi, type AdminNotification } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/navigation';

const TYPE_ICONS: Record<string, any> = { info: Info, warning: AlertCircle, success: CheckCircle2, error: AlertTriangle };
const TYPE_COLORS: Record<string, string> = { info: 'text-blue-500 bg-blue-50', warning: 'text-amber-500 bg-amber-50', success: 'text-emerald-500 bg-emerald-50', error: 'text-red-500 bg-red-50' };

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = async () => {
    setLoading(true); setError(false);
    try { const r = await notificationsApi.list(); setNotifs(r.notifications); setUnread(r.unreadCount); } catch { setError(true); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const markRead = async (id: string) => {
    try { await notificationsApi.markRead(id); setNotifs(p => p.map(n => n.id === id ? { ...n, isRead: true } : n)); setUnread(p => Math.max(0, p - 1)); } catch { toast.error('خطا'); }
  };

  const markAllRead = async () => {
    try { await notificationsApi.markAllRead(); setNotifs(p => p.map(n => ({ ...n, isRead: true }))); setUnread(0); toast.success('همه خوانده شدند'); } catch { toast.error('خطا'); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-accent rounded-2xl animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-20"><Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black mb-1">اعلان‌ها</h2>
          <p className="text-muted-foreground text-sm">{unread > 0 ? `${unread} اعلان خوانده نشده` : 'همه خوانده شده'}</p>
        </div>
        {unread > 0 && <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-accent rounded-xl text-sm font-bold hover:bg-primary/10"><Check className="w-4 h-4" /> خواندن همه</button>}
      </div>

      {notifs.length === 0 ? <div className="text-center py-16"><Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">اعلانی وجود ندارد</p></div> : (
        <div className="space-y-3">
          {notifs.map((n, i) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            const colorCls = TYPE_COLORS[n.type] || 'text-muted-foreground bg-accent';
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cn('bg-card border rounded-2xl p-4 flex items-start gap-4 transition-colors', n.isRead ? 'border-border' : 'border-primary/30 bg-primary/5')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorCls)}><Icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn('text-sm', !n.isRead && 'font-black')}>{n.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{new Date(n.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && <button onClick={() => markRead(n.id)} className="p-2 rounded-lg bg-accent hover:bg-primary/10"><Check className="w-4 h-4" /></button>}
                  {n.targetLink && <Link href={n.targetLink} className="p-2 rounded-lg bg-accent hover:bg-primary/10"><ExternalLink className="w-4 h-4" /></Link>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
