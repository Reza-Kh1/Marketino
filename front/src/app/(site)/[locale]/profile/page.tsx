'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, Wallet, ClipboardList, Settings, LogOut, Store, TrendingUp, Package, ArrowRight, Edit, BellRing, MapPinHouse } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from '@/i18n/navigation';
import { userService } from '@/services/user.service';
import { useProfileUser } from '@/hooks/user.hook';
import PendingApi from '@/components/PendingApi';
import LoadingPage from '../shops/[id]/loading';

export default function ProfilePage() {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const router = useRouter();
  const { data, isFetching } = useProfileUser()
  if (isFetching) {
    return <LoadingPage />
  }
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <User className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-black mb-2">وارد نشده‌اید</h1>
        <p className="text-muted-foreground mb-6">برای مشاهده پروفایل، لطفاً وارد شوید</p>
        <Link href="/login" className="btn-primary px-8 py-3 rounded-xl font-bold">ورود به حساب</Link>
      </div>
    );
  }
  const menuItems = [
    { href: '/orders', icon: ShoppingBag, label: 'سفارشات من', desc: 'مشاهده و پیگیری سفارشات' },
    { href: '/wishlist', icon: Heart, label: 'علاقه‌مندی‌ها', desc: 'محصولات ذخیره شده' },
    { href: '/addresses', icon: MapPinHouse, label: 'آدرس های من', desc: 'مشاهده تمام آدرس های ثبت شده' },
    { href: '/profile/saved-searches', icon: BellRing, label: 'جستجوهای ذخیره شده', desc: 'هشدار کاهش قیمت' },
    { href: '/profile/setting', icon: Settings, label: 'تنظیمات حساب', desc: 'ویرایش اطلاعات شخصی' },
  ];

  const sellerItems = [
    { href: '/seller', icon: Store, label: 'داشبورد فروشنده', desc: 'مدیریت فروشگاه' },
    { href: '/seller/products', icon: Package, label: 'محصولات من', desc: 'مدیریت محصولات' },
    { href: '/seller/analytics', icon: TrendingUp, label: 'آمار فروش', desc: 'گزارش سود و زیان' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-6 md:p-10 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-lg">
            {(user?.firstName || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-black">{user?.firstName} {user?.lastName}</h1>
              <span className={cn('px-3 py-0.5 rounded-full text-xs font-bold',
                user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                  user?.role === 'seller' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              )}>
                {user?.role === 'admin' ? 'مدیر' : user?.role === 'seller' ? 'فروشنده' : 'خریدار'}
              </span>
            </div>
            <p className="text-muted-foreground">@{user?.username} | {user?.email}</p>
            {isSeller && user?.storeName && (
              <Link href={`/shops/${user.id}`} className="inline-flex items-center gap-1 mt-2 text-sm text-primary font-bold hover:underline">
                <Store className="w-4 h-4" /> {user.storeName}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'سفارشات', value: data?._count.orders, icon: ShoppingBag, color: 'from-blue-500 to-cyan-500' },
          { label: 'علاقه‌مندی‌ها', value: data?._count.wishlistItems, icon: Heart, color: 'from-red-500 to-pink-500' },
          // { label: 'امتیاز', value: '۴۸۰', icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
          // { label: 'کیف پول', value: '۲,۵۰۰,۰۰۰ ت', icon: Wallet, color: 'from-green-500 to-emerald-500' },
        ].map((card, i) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2', card.color)}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-black">{card.value}</div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Menu Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {menuItems.map((item, i) => (
          <Link key={item.href} href={item.href}
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all group">
            <item.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-black mb-1">{item.label}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </motion.div>

      {/* Seller Section */}
      {isSeller && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-xl font-black mb-4">پنل فروشنده</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sellerItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-emerald-500/30 transition-all group">
                <item.icon className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-black mb-1">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="flex gap-4 flex-wrap">
        {!isSeller && (
          <Link href="/register/seller" className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:shadow-lg transition-all inline-flex items-center gap-2">
            <Store className="w-4 h-4" /> فروشنده شوید
          </Link>
        )}
        <button onClick={() => toast.success('در حال ویرایش پروفایل...')} className="px-6 py-3 rounded-xl border border-border font-bold text-sm hover:bg-accent transition-all inline-flex items-center gap-2">
          <Edit className="w-4 h-4" /> ویرایش پروفایل
        </button>
        <button onClick={() => { logout(); router.replace('/'); }} className="px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all inline-flex items-center gap-2">
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </motion.div>
    </div>
  );
}
