'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, MessageSquare, FileText,
  Package, Settings, ArrowRight, ShieldCheck,
  Menu, X, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const STAFF_MENU = [
  { href: '/staff', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/staff/tickets', label: 'تیکت‌های پشتیبانی', icon: MessageSquare },
  { href: '/staff/reviews', label: 'نظرات', icon: FileText },
  { href: '/admin/products', label: 'محصولات (بررسی)', icon: Package },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, permissions, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter menu based on permissions
  const filteredMenu = STAFF_MENU.filter(item => {
    if (item.href === '/staff') return true;
    if (item.href === '/staff/tickets' && permissions?.includes('tickets')) return true;
    if (item.href === '/staff/reviews' && permissions?.includes('reviews')) return true;
    if (item.href === '/admin/products' && permissions?.includes('products')) return true;
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">پنل کارمندان</h1>
            <p className="text-sm text-muted-foreground">سلام، {user?.firstName || user?.username || 'کارمند'}!</p>
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
              <nav className="flex flex-col gap-1">
                {filteredMenu.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      pathname === item.href ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground')}>
                    <item.icon className="w-5 h-5" /> {item.label}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                <button onClick={() => { logout(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" /> خروج
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="flex flex-col gap-1">
            {filteredMenu.map(item => (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname === item.href ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
                )}>
                <item.icon className="w-5 h-5" /> {item.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <button onClick={() => { logout(); window.location.href = '/'; }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" /> خروج از حساب
            </button>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
