'use client';
import { Link, useRouter } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Package, Heart, Store, LogOut, LayoutDashboard, PlusCircle, BarChart3, ClipboardList, ChevronDown, MessageSquare, Settings, Camera, Sparkles, BellRing } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n-context';
import { useWishlist } from '@/lib/use-wishlist';
import { useChat } from '@/lib/chat-context';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';
import { useCart, useCartTotalItems } from '@/hooks/cart.hook';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { data: cartData } = useCart();

  const { itemIds } = useWishlist();
  const wishlistCount = itemIds.length;
  const { t } = useTranslation();
  const { unreadCount } = useChat();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tChat = useTranslations('chat');
  const tSeller = useTranslations('seller');
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (q: string) => {
    if (q.trim()) router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  const handleImageSearch = (file: File) => {
    setIsSearching(true);
    toast.success(`🔍 عکس "${file.name}" در حال پردازش...`, { duration: 2500, icon: '📸' });
    setTimeout(() => {
      setIsSearching(false);
      router.push(`/products?imageSearch=true`);
    }, 1800);
  };

  const navLinks = [
    { href: '/', label: tNav('home') },
    { href: '/products', label: tNav('products') },
    { href: '/shops', label: tNav('shops') },
    { href: '/products?sort=newest', label: tNav('newest') },
    { href: '/products?tag=تخفیف', label: tNav('discounts'), highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2 sm:gap-3">
          {/* Logo */}
          <Link href="/" className="shrink-0 group">
            <span className="text-lg xs:text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform inline-block">
              بازارچه
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 mx-2">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  pathname === l.href
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : l.highlight
                      ? 'text-accent-foreground hover:bg-accent hover:text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar with Image Upload */}
          <div className="hidden md:flex flex-1 max-w-lg mx-auto">
            <form
              onSubmit={e => { e.preventDefault(); handleSearch(searchValue); }}
              className="relative w-full group"
            >
              <div className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <input
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="جستجوی محصول، برند یا دسته‌بندی..."
                className="w-full h-10 rtl:pr-10 rtl:pl-24 ltr:pl-10 ltr:pr-24 rounded-xl bg-muted/70 border-2 border-transparent 
                           focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/5 
                           outline-none text-sm transition-all duration-300 placeholder:text-muted-foreground/60"
              />
              <div className="absolute rtl:left-1.5 ltr:right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {searchValue && (
                  <button type="button" onClick={() => setSearchValue('')} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                {/* Image Search Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-accent-foreground group/image"
                  title="جستجو با عکس"
                >
                  <Camera className="w-4 h-4 group-hover/image:scale-110 transition-transform" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { handleImageSearch(f); e.target.value = ''; }
                  }}
                />
                <button
                  type="submit"
                  disabled={!searchValue.trim() || isSearching}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold 
                             hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40 transition-all duration-200"
                >
                  {isSearching ? (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                  ) : 'جستجو'}
                </button>
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 ms-auto">
            <LanguageSwitcher />
            <ThemeToggle />

            <Link href="/wishlist" className="p-2 rounded-xl hover:bg-muted/80 transition-all duration-200 hidden sm:block relative" aria-label={tCommon('wishlist')}>
              <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <Link href="/chat" className="p-2 rounded-xl hover:bg-muted/80 transition-all duration-200 relative" aria-label={tChat('title')}>
                <MessageSquare className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-scale-in shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {user && <Link href="/cart" className="p-2 rounded-xl hover:bg-muted/80 transition-all duration-200 relative" aria-label={tCommon('cart')}>
              <ShoppingCart className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              {Number(cartData?.totalItems) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-scale-in shadow-sm">
                  {Number(cartData?.totalItems) > 99 ? '99+' : Number(cartData?.totalItems)}
                </span>
              )}
            </Link>}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-muted/80 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {(user.firstName || user.username || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium truncate max-w-[80px]">
                    {user.firstName || user.username}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 sm:w-60 bg-card border border-border rounded-2xl shadow-xl shadow-black/5 overflow-hidden animate-scale-in z-50">
                    <div className="p-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="font-bold text-sm">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>

                    <div className="p-1.5">
                      {[
                        { href: '/profile', icon: User, label: tCommon('profile') },
                        { href: '/profile/orders', icon: Package, label: tCommon('orders') },
                        { href: '/profile/saved-searches', icon: BellRing, label: 'جستجوهای من' },
                        { href: '/chat', icon: MessageSquare, label: tChat('title') },
                        { href: '/wishlist', icon: Heart, label: tCommon('wishlist'), mobile: true },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-colors', item.mobile && 'sm:hidden')}>
                          <item.icon className="w-4 h-4 text-muted-foreground" /> {item.label}
                        </Link>
                      ))}
                    </div>

                    {isSeller && (
                      <div className="p-1.5 border-t border-border">
                        <div className="px-3 py-1 text-xs text-muted-foreground font-semibold">{tCommon('seller_panel')}</div>
                        {[
                          { href: '/seller', icon: Store, label: tSeller('dashboard'), primary: true },
                          { href: '/seller/products', icon: PlusCircle, label: tSeller('products') },
                          { href: '/seller/orders', icon: ClipboardList, label: tSeller('orders') },
                          { href: '/seller/analytics', icon: BarChart3, label: tSeller('analytics') },
                          { href: '/seller/settings', icon: Settings, label: tCommon('settings') },
                        ].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-colors', item.primary && 'text-primary font-medium')}>
                            <item.icon className="w-4 h-4 text-muted-foreground" /> {item.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="p-1.5 border-t border-border">
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-colors text-primary font-medium">
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> {tCommon('admin_panel')}
                        </Link>
                      </div>
                    )}

                    <div className="p-1.5 border-t border-border">
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 text-sm transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" /> {tCommon('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all duration-200">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{tCommon('login')}</span>
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-muted/80 transition-colors" aria-label="منو">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden glass animate-fade-in-down border-t border-border/50">
          <div className="p-4 space-y-3">
            {/* Mobile Search with Image Upload */}
            <form
              onSubmit={e => { e.preventDefault(); handleSearch(searchValue); setMenuOpen(false); }}
              className="relative w-full group"
            >
              <div className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <input
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="جستجوی محصول..."
                className="w-full h-11 rtl:pr-10 rtl:pl-24 ltr:pl-10 ltr:pr-24 rounded-xl bg-muted/70 border-2 border-transparent 
                           focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/5 
                           outline-none text-sm transition-all duration-300"
              />
              <div className="absolute rtl:left-1.5 ltr:right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {searchValue && (
                  <button type="button" onClick={() => setSearchValue('')} className="p-1.5 rounded-lg hover:bg-muted">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="جستجو با عکس">
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!searchValue.trim() || isSearching}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 transition-all duration-200"
                >
                  {isSearching ? (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                  ) : 'جستجو'}
                </button>
              </div>
            </form>

            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className={cn(
                'block px-4 py-3 rounded-xl font-medium transition-colors',
                pathname === l.href ? 'bg-primary/10 text-primary' : 'hover:bg-muted/80'
              )}>
                {l.label}
              </Link>
            ))}
            <hr className="border-border/50" />
            <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80 transition-colors">
              <Package className="w-5 h-5 text-muted-foreground" /> {tCommon('orders')}
            </Link>
            {isAuthenticated && (
              <Link href="/profile/saved-searches" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80 transition-colors">
                <BellRing className="w-5 h-5 text-muted-foreground" /> جستجوهای ذخیره شده
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80 transition-colors">
                <MessageSquare className="w-5 h-5 text-muted-foreground" /> {tChat('title')}
              </Link>
            )}
            {isSeller && (
              <Link href="/seller" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80 text-primary font-medium transition-colors">
                <Store className="w-5 h-5" /> {tCommon('seller_panel')}
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80 text-primary font-medium transition-colors">
                <LayoutDashboard className="w-5 h-5" /> {tCommon('admin_panel')}
              </Link>
            )}
            {isAuthenticated && (
              <button onClick={() => { setMenuOpen(false); logout(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors w-full">
                <LogOut className="w-5 h-5" /> {tCommon('logout')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
