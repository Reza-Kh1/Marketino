'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import {
  User, Package, ClipboardList, Heart, MessageSquare,
  Ticket, Wallet, Star, Settings, ChevronLeft,
  ShoppingCart, Eye,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

const DASHBOARD_MENU = [
  { href: '/profile', label: 'پروفایل من', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
  { href: '/orders', label: 'سفارشات من', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { href: '/cart', label: 'سبد خرید', icon: ShoppingCart, color: 'text-violet-600', bg: 'bg-violet-50' },
  { href: '/wishlist', label: 'علاقه‌مندی‌ها', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
  { href: '/chat', label: 'پیام‌های من', icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { href: '/tickets', label: 'تیکت پشتیبانی', icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
  { href: '/profile/wallet', label: 'کیف پول من', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { href: '/profile/reviews', label: 'نظرات من', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { href: '/profile/addresses', label: 'آدرس‌ها', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-50' },
];

const RECENT_ORDERS = [
  { id: 'BC-140301', product: 'گوشی هوشمند X1 Pro', status: 'تحویل شده', date: '۱۴۰۵-۰۳-۰۵', total: 22040000, statusColor: 'emerald' },
  { id: 'BC-140298', product: 'هدفون بیسیم ANC', status: 'در حال ارسال', date: '۱۴۰۵-۰۳-۰۳', total: 7380000, statusColor: 'blue' },
  { id: 'BC-140290', product: 'کیبورد مکانیکال RGB', status: 'لغو شده', date: '۱۴۰۵-۰۲-۲۸', total: 5500000, statusColor: 'red' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100 text-amber-700', text: 'dark:text-amber-400', label: 'در انتظار' },
  confirmed: { bg: 'bg-blue-100 text-blue-700', text: 'dark:text-blue-400', label: 'تأیید شده' },
  processing: { bg: 'bg-violet-100 text-violet-700', text: 'dark:text-violet-400', label: 'در حال پردازش' },
  shipped: { bg: 'bg-indigo-100 text-indigo-700', text: 'dark:text-indigo-400', label: 'ارسال شده' },
  delivered: { bg: 'bg-emerald-100 text-emerald-700', text: 'dark:text-emerald-400', label: 'تحویل شده' },
  cancelled: { bg: 'bg-red-100 text-red-700', text: 'dark:text-red-400', label: 'لغو شده' },
};

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">برای مشاهده پنل خود لطفاً وارد شوید</p>
          <Link href="/login" className="text-primary font-bold hover:underline">ورود / ثبت‌نام</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-black">
            {(user.firstName || user.username)[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black">
              سلام، {user.firstName || user.username}! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">به پنل کاربری خود خوش آمدید</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links Sidebar */}
        <div className="space-y-3 order-2 lg:order-1">
          <h3 className="font-black mb-3">دسترسی سریع</h3>
          {DASHBOARD_MENU.map((item, i) => (
            <Link key={item.href} href={item.href}>
              <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-sm group-hover:text-primary transition-colors">{item.label}</span>
                <ChevronLeft className="w-4 h-4 text-muted-foreground mr-auto rotate-180" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" /> آخرین سفارشات
              </h3>
              <Link href="/orders" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                همه سفارشات <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {RECENT_ORDERS.map(order => {
                const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                return (
                  <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl bg-accent/20 hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() => window.location.href = '/orders'}>
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{order.product}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.id} • {order.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                    <span className="font-bold text-sm shrink-0">{(order.total / 1000000).toFixed(1)}M</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'کل سفارشات', value: '12', sub: '۳ تحویل نشده', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'علاقه‌مندی‌ها', value: '8', sub: '۲ تخفیف‌خورده', color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'کیف پول', value: '۲.۵M', sub: 'تومان موجودی', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                className={`${s.bg} rounded-xl p-4`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs font-bold mt-1">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/checkout" className="card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors group">
              <ShoppingCart className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-bold text-sm">ادامه خرید</p>
                <p className="text-[11px] text-muted-foreground">{3} محصول در سبد</p>
              </div>
            </Link>
            <Link href="/products" className="card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors group">
              <Eye className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-bold text-sm">محصولات جدید</p>
                <p className="text-[11px] text-muted-foreground">مشاهده پیشنهادات</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
