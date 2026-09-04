'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ClipboardList, BarChart3, Settings,
  ArrowRight, Store, Percent, Star, TrendingUp, MessageSquare,
  DollarSign, Wallet, Truck, FileUp, Menu, X,
  CreditCard,
  ArrowLeftRight, MailQuestion,
  Loader2,
  ArrowUpNarrowWide
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const MENU = [
  { href: '/seller', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/seller/products', label: 'مدیریت محصولات', icon: Package },
  { href: '/seller/orders', label: 'مدیریت سفارشات', icon: ClipboardList },
  { href: '/seller/analytics', label: 'آمار و تحلیل', icon: BarChart3 },
  { href: '/seller/reviewStore', label: 'نظرات مشتریان', icon: ArrowUpNarrowWide },
  { href: '/seller/reviews', label: 'نظرات محصولات', icon: Star },
  { href: '/seller/qna', label: 'پرسش و پاسخ', icon: MailQuestion },
  { href: '/seller/discounts', label: 'کدهای تخفیف', icon: Percent },
  { href: '/seller/finance', label: 'تراکنش های مالی', icon: ArrowLeftRight },
  { href: '/seller/wallet', label: 'کیف پول', icon: Wallet },
  { href: '/seller/shipping', label: 'تنظیمات ارسال', icon: Truck },
  { href: '/seller/settings', label: 'تنظیمات فروشگاه', icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, storeId } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/seller') return pathname === '/seller';
    return pathname.startsWith(href);
  };

  const sidebar = (
    <nav className="flex flex-col gap-1">
      {MENU.map(item => (
        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
            isActive(item.href)
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          )}>
          <item.icon className="w-5 h-5" /> {item.label}
        </Link>
      ))}
      <hr className="my-2 border-border" />
      <Link href={`/shops`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
        <Store className="w-5 h-5" /> فروشگاه من
      </Link>
      <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
        <ArrowRight className="w-5 h-5" /> بازگشت به بازارچه
      </Link>
    </nav>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">پنل فروشنده</h1>
            <p className="text-sm text-muted-foreground">مدیریت فروشگاه، محصولات و سفارشات</p>
          </div>
        </div>
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
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          {sidebar}
        </aside>

        {/* Content */}
        {isLoading &&
          <div className="flex items-center justify-center min-h-100">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        }
        {!storeId ?
          <div className="text-center w-full py-20">
            <p className="text-muted-foreground">با خطا مواجه شدیم لطفا بعدا دوباره تلاش کنید</p>
            <Link href="/seller/products" className="text-emerald-500 hover:underline mt-4 inline-block">
              بازگشت به سایت
            </Link>
          </div> : <main className="flex-1 min-w-0">{children}</main>
        }
      </div>
    </div>
  );
}
