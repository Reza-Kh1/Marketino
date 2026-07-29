'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, AlertTriangle, CheckCircle2, XCircle, Edit, PlusCircle, Trash2, User } from 'lucide-react';
import { activityLogApi, type ActivityLog } from '@/lib/api';
import { cn } from '@/lib/utils';

const ACTION_COLORS: Record<string, string> = { 'تأیید': 'bg-emerald-50 text-emerald-600', 'حذف': 'bg-red-50 text-red-600', 'ویرایش': 'bg-blue-50 text-blue-600', 'ایجاد': 'bg-green-50 text-green-600', 'تغییر': 'bg-violet-50 text-violet-600' };
const ACTION_ICONS: Record<string, any> = { 'تأیید': CheckCircle2, 'حذف': Trash2, 'ویرایش': Edit, 'ایجاد': PlusCircle, 'تغییر': Edit };

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true); setError(false);
    try { const r = await activityLogApi.list(); setLogs(r.logs); } catch { setError(true); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const filtered = search ? logs.filter(l => l.adminName.includes(search) || l.action.includes(search) || l.target.includes(search)) : logs;

  if (loading) return <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-accent rounded-2xl animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-20"><History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black mb-1">گزارش فعالیت</h2><p className="text-muted-foreground text-sm">{logs.length} فعالیت ثبت شده</p></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." className="h-11 rounded-xl border border-border bg-background px-4 text-sm w-48" />
      </div>

      {filtered.length === 0 ? <div className="text-center py-16"><History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">فعالیتی یافت نشد</p></div> : (
        <div className="relative">
          <div className="absolute top-0 bottom-0 right-6 w-0.5 bg-border" />
          <div className="space-y-4">
            {filtered.map((l, i) => {
              const colorMatch = Object.entries(ACTION_COLORS).find(([k]) => l.action.includes(k));
              const colorCls = colorMatch?.[1] || 'bg-gray-50 text-gray-600';
              const Icon = colorMatch ? (ACTION_ICONS[colorMatch[0]] || User) : User;
              return (
                <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="relative pr-12">
                  <div className={cn('absolute right-4 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center z-10', colorCls.split(' ')[0])}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', colorCls)}>{l.action}</span>
                      <span className="text-sm font-bold">{l.target}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{l.details}</p>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {l.adminName}</span>
                      <span>{l.createdAt}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
