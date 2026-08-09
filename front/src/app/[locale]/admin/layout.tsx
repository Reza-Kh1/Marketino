'use client';

import {
  LayoutDashboard, Users, Store, Package, ClipboardList, Tag,
  ArrowRight, Shield, Star, TrendingUp, DollarSign, UserPlus,
  Settings, Menu, X, Image, Grid3X3, BarChart3, MessageSquare,
  Bell, History,
  Ribbon,
  ShoppingCart,
  ImageUp,
  Headset,
  MessagesSquare,
  Flag, MailQuestion,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Metadata } from 'next';
import { Link, usePathname, useRouter } from '@/i18n/navigation';

// export const metadata: Metadata = {
//   title: 'پنل مدیریت | وارن',
//   robots: { index: false, follow: false }, // ادمین هیچ‌وقت نباید ایندکس بشه
// };

const FULL_MENU = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, permission: 'dashboard' },
  { href: '/admin/users', label: 'کاربران', icon: Users, permission: 'users' },
  { href: '/admin/sellers', label: 'فروشندگان', icon: Store, permission: 'sellers' },
  { href: '/admin/products', label: 'محصولات', icon: Package, permission: 'products' },
  { href: '/admin/orders', label: 'سفارشات', icon: ClipboardList, permission: 'orders' },
  { href: '/admin/discounts', label: 'تخفیف‌ها', icon: Tag, permission: 'discounts' },
  { href: '/admin/banners', label: 'بنرها', icon: Image, permission: 'banners' },
  { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: Grid3X3, permission: 'categories' },
  { href: '/admin/reports', label: 'گزارشات', icon: BarChart3, permission: 'reports' },
  { href: '/admin/net-profit', label: 'سود خالص', icon: DollarSign, permission: 'dashboard' },
  { href: '/admin/carts', label: 'سبد خرید', icon: ShoppingCart, permission: 'dashboard', superAdminOnly: true },
  { href: '/admin/tickets', label: 'تیکت‌ها', icon: Headset, permission: 'tickets' },
  { href: '/admin/notifications', label: 'اعلان‌ها', icon: Bell, permission: 'notifications' },
  { href: '/admin/trust-metrics', label: 'معیارهای اعتماد', icon: TrendingUp, permission: 'sellers' },
  { href: '/admin/seller-reviews', label: 'نظرات فروشندگان', icon: Star, permission: 'reviews' },
  { href: '/admin/activity-log', label: 'گزارش فعالیت', icon: History, permission: 'activity' },
  { href: '/admin/colleagues', label: 'همکاران', icon: UserPlus, permission: null, superAdminOnly: true },
  { href: '/admin/report', label: 'گزارش تخلف', icon: ShieldAlert, permission: null, superAdminOnly: true },
  { href: '/admin/brand', label: 'برند', icon: Ribbon, permission: null },
  { href: '/admin/chats', label: 'چت ها', icon: MessagesSquare, permission: 'settings' },
  { href: '/admin/media', label: 'رسانه ها', icon: ImageUp, permission: 'settings' },
  { href: '/admin/qna', label: 'پرسش و پاسخ', icon: MailQuestion, },
  { href: '/admin/settings', label: 'تنظیمات', icon: Settings, permission: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading, isSuperAdmin, permissions } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // useEffect(() => {
  //   if (!isLoading && (!isAuthenticated || !isAdmin)) {
  //     router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
  //   }
  // }, [isLoading, isAuthenticated, isAdmin, router, pathname]);

  const filteredMenu = FULL_MENU.filter(item => {
    if (isSuperAdmin) return true;
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (!item.permission) return false;
    return permissions.includes(item.permission);
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  const sidebar = (
    <nav className="flex flex-col gap-1">
      {filteredMenu.map(item => (
        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
            pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground',
          )}>
          <item.icon className="w-5 h-5" /> {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background antialiased" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">پنل مدیریت</h1>
              <p className="text-sm text-muted-foreground">
                {isSuperAdmin ? 'مدیر اصلی • دسترسی کامل' : 'دسترسی محدود'}
              </p>
            </div>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile overlay */}
          {mobileOpen && (
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="absolute top-0 right-0 w-72 h-full bg-card border-l border-border p-6 pt-20 overflow-y-auto"
                onClick={e => e.stopPropagation()}>
                {sidebar}
                <Link href="/" className="flex items-center gap-2 mt-6 px-4 py-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" /> بازگشت به سایت
                </Link>
              </div>
            </div>
          )}

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            {sidebar}
            <Link href="/" className="flex items-center gap-2 mt-6 px-4 py-3 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowRight className="w-4 h-4" /> بازگشت به سایت
            </Link>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
