'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Ticket, FileText, Package, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        داشبورد کارمند
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'تیکت‌های باز', value: '۸', color: 'from-amber-500 to-orange-500', icon: Ticket },
          { label: 'امروز پاسخ داده', value: '۱۲', color: 'from-emerald-500 to-teal-500', icon: CheckCircle },
          { label: 'محصولات بررسی شده امروز', value: '۵', color: 'from-blue-500 to-indigo-500', icon: Package },
          { label: 'نظرات جدید', value: '۳', color: 'from-violet-500 to-purple-500', icon: MessageSquare },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-black mb-4 flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> آخرین تیکت‌ها</h3>
          <div className="space-y-3">
            {[
              { id: 'TKT-001', subject: 'مشکل در ثبت سفارش', priority: 'high', status: 'open', time: '۱۰ دقیقه پیش' },
              { id: 'TKT-002', subject: 'سوال درباره مرجوعی کالا', priority: 'medium', status: 'open', statusLabel: 'در حال بررسی', time: '۲ ساعت پیش' },
              { id: 'TKT-003', subject: 'گزارش فروشنده متخلف', priority: 'urgent', status: 'in_progress', statusLabel: 'در حال رسیدگی', time: '۴ ساعت پیش' },
            ].map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-accent/30 hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{t.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    t.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t.priority === 'urgent' ? 'فوری' : t.priority === 'high' ? 'مهم' : 'معمول'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{t.subject}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-black mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> نظرات اخیر</h3>
          <div className="space-y-3">
            {[
              { product: 'هدفون بیسیم ANC Pro', rating: 5, user: 'علیرضا م.', time: 'دیروز' },
              { product: 'کیبورد مکانیکال RGB', rating: 3, user: 'سارا ا.', time: 'دیروز' },
              { product: 'تبلت Pro M2', rating: 4, user: 'رضا ج.', time: 'دیروز' },
            ].map(r => (
              <div key={r.product} className="p-3 rounded-xl bg-accent/30 flex items-center gap-3">
                <div className="shrink-0 flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-border'} `}>★</span>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.product}</p>
                  <p className="text-[11px] text-muted-foreground">{r.user} • {r.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
