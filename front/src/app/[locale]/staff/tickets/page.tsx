'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Search, Filter, Eye, Clock, CheckCircle,
  AlertCircle, ArrowRight, User, Mail,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { ticketsApi, type SupportTicket } from '@/lib/api';

interface Ticket extends SupportTicket {
  id: string; subject: string; status: string; priority: string;
  userId: string; userName?: string; userEmail?: string;
  createdAt: string; updatedAt: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'بالا', medium: 'متوسط', low: 'کم',
};

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'باز', in_progress: 'در حال بررسی', resolved: 'حل شده', closed: 'بسته',
};

const STATUS_ICONS: Record<string, any> = {
  open: Clock, in_progress: AlertCircle, resolved: CheckCircle, closed: CheckCircle,
};

export default function StaffTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketsApi.list();
      setTickets(data.tickets || []);
    } catch {
      setTickets([
        { id: 'tk1', subject: 'مشکل در پرداخت آنلاین', status: 'open', priority: 'high', userId: 'u1', userName: 'علی محمدی', userEmail: 'ali@email.com', createdAt: '۱۴۰۵-۰۳-۰۸', updatedAt: '۱۴۰۵-۰۳-۰۸' },
        { id: 'tk2', subject: 'درخواست استرداد وجه', status: 'in_progress', priority: 'medium', userId: 'u2', userName: 'سارا احمدی', userEmail: 'sara@email.com', createdAt: '۱۴۰۵-۰۳-۰۷', updatedAt: '۱۴۰۵-۰۳-۰۸' },
        { id: 'tk3', subject: 'سوال درباره ارسال کالا', status: 'open', priority: 'low', userId: 'u3', userName: 'رضا کریمی', userEmail: 'reza@email.com', createdAt: '۱۴۰۵-۰۳-۰۶', updatedAt: '۱۴۰۵-۰۳-۰۶' },
        { id: 'tk4', subject: 'کالای معیوب دریافت کردم', status: 'resolved', priority: 'high', userId: 'u4', userName: 'مریم حسینی', userEmail: 'maryam@email.com', createdAt: '۱۴۰۵-۰۳-۰۵', updatedAt: '۱۴۰۵-۰۳-۰۷' },
        { id: 'tk5', subject: 'تغییر آدرس سفارش', status: 'closed', priority: 'low', userId: 'u5', userName: 'امیر جعفری', userEmail: 'amir@email.com', createdAt: '۱۴۰۵-۰۳-۰۱', updatedAt: '۱۴۰۵-۰۳-۰۳' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter(t => {
    if (search && !t.subject.includes(search) && !t.userName?.includes(search) && !t.userEmail?.includes(search)) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">تیکت‌های پشتیبانی</h1>
          <p className="text-sm text-muted-foreground">مدیریت تیکت‌های کاربران</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'کل تیکت‌ها', value: stats.total, color: 'from-blue-500 to-indigo-500' },
          { label: 'باز', value: stats.open, color: 'from-amber-500 to-orange-500' },
          { label: 'در حال بررسی', value: stats.inProgress, color: 'from-violet-500 to-purple-500' },
          { label: 'حل شده', value: stats.resolved, color: 'from-emerald-500 to-teal-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card p-4">
            <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2', s.color)}>
              <span className="text-white text-sm font-black">{s.value}</span>
            </div>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی تیکت، کاربر یا ایمیل..."
            className="w-full h-10 pr-9 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="in_progress">در حال بررسی</option>
          <option value="resolved">حل شده</option>
          <option value="closed">بسته</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">همه اولویت‌ها</option>
          <option value="high">بالا</option>
          <option value="medium">متوسط</option>
          <option value="low">کم</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">تیکتی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-right py-3 px-4 font-bold">موضوع</th>
                  <th className="text-right py-3 px-4 font-bold hidden md:table-cell">کاربر</th>
                  <th className="text-right py-3 px-4 font-bold">اولویت</th>
                  <th className="text-right py-3 px-4 font-bold">وضعیت</th>
                  <th className="text-right py-3 px-4 font-bold hidden sm:table-cell">تاریخ</th>
                  <th className="text-right py-3 px-4 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const StatusIcon = STATUS_ICONS[t.status] || Clock;
                  return (
                    <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }} className="border-t border-border hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium">{t.subject}</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.id.toUpperCase()}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="text-xs">
                            <p className="font-medium">{t.userName || 'کاربر'}</p>
                            <p className="text-muted-foreground">{t.userEmail || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.low)}>
                          {PRIORITY_LABELS[t.priority] || t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', STATUS_STYLES[t.status] || STATUS_STYLES.open)}>
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_LABELS[t.status] || t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs hidden sm:table-cell">{t.createdAt}</td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/tickets`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-xs font-medium transition-colors">
                          <Eye className="w-3.5 h-3.5" /> مشاهده
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
