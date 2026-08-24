'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  X,
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Grid3X3,
  Monitor,
  Watch,
  Camera,
  Gamepad2,
} from 'lucide-react';
import { CategorysTypes } from '@/services/category.service';
import { useCategories } from '@/hooks/category.hook';
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Monitor,
  Watch,
  Camera, Gamepad2,
};

// تغییر: نوع پارامتر به CategorysTypes
function getCategoryName(cat: CategorysTypes, locale: string) {
  return locale === 'en' && cat.nameEn ? cat.nameEn : cat.name;
}

// تغییر: نوع پارامتر به CategorysTypes
function getCategorySlug(cat: CategorysTypes, locale: string) {
  return locale === 'en' && cat.slugEn ? cat.slugEn : cat.slug;
}

export default function CategoryMenu({ className }: { className?: string }) {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const { data: categoriesData } = useCategories()
  
  // Desktop
  const [desktopOpen, setDesktopOpen] = useState(false);
  // تغییر: نوع به CategorysTypes
  const desktopRef = useRef<HTMLDivElement>(null);

  // Mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  // بستن دسکتاپ با کلیک بیرون
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // جلوگیری از اسکرول
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);
  const hasChildren = (cat: CategorysTypes) => !!(cat.children && cat.children.length > 0);

  // if (!categoriesData?.length) return
  const [hoveredMain, setHoveredMain] = useState<CategorysTypes | null>(categoriesData?.length ? categoriesData[0] : null);
  const [activeMainId, setActiveMainId] = useState<string>(categoriesData?.length ? categoriesData[0]?.id : '');
  const activeMain = categoriesData?.find((c: CategorysTypes) => c.id === activeMainId) || categoriesData?.length ? categoriesData[0] : null;

  return (
    <>
      {/* ========== دکمه دسکتاپ ========== */}
      <div className={cn('relative hidden lg:block', className)} ref={desktopRef}>
        <button
          onMouseEnter={() => setDesktopOpen(true)}
          onClick={() => setDesktopOpen(!desktopOpen)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
            desktopOpen
              ? 'bg-primary/12 text-primary shadow-sm'
              : 'text-foreground/80 hover:text-primary hover:bg-primary/8'
          )}
        >
          <Grid3X3 className="w-4.5 h-4.5" />
          <span>دسته‌بندی کالاها</span>
        </button>

        {/* مگا منوی دسکتاپ - بزرگ‌تر */}
        {desktopOpen && (
          <div
            onMouseLeave={() => setDesktopOpen(false)}
            className="absolute top-full right-0 mt-2 w-[min(92vw,860px)] bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50 animate-scale-in"
          >
            <div className="flex h-[min(70vh,480px)]">
              {/* سایدبار دسته‌های اصلی */}
              <div className="w-60 xl:w-64 border-l border-border bg-muted/20 overflow-y-auto">
                {categoriesData?.map((cat: CategorysTypes) => {
                  const Icon = cat.icon ? iconMap[cat.icon] : Grid3X3;
                  const isActive = hoveredMain?.id === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setHoveredMain(cat)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3.5 text-[15px] transition-all text-right',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold border-r-[3px] border-primary'
                          : 'hover:bg-muted/50 text-foreground/90'
                      )}
                    >
                      {/* <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} /> */}
                      <span className="flex-1 truncate">{getCategoryName(cat, locale)}</span>
                      {hasChildren(cat) && (
                        <ChevronLeft className={cn('w-4 h-4', isActive ? 'text-primary' : 'opacity-40')} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* پنل محتوا */}
              <div className="flex-1 p-6 overflow-y-auto bg-background">
                {hoveredMain && (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-lg text-foreground">
                        {getCategoryName(hoveredMain, locale)}
                      </h3>
                      <Link
                        href={`/products?category=${getCategorySlug(hoveredMain, locale)}`}
                        onClick={() => setDesktopOpen(false)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        مشاهده همه
                      </Link>
                    </div>

                    {hasChildren(hoveredMain) ? (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        {hoveredMain.children!.map((child: CategorysTypes) => (
                          <div key={child.id}>
                            <Link
                              href={`/products?category=${getCategorySlug(child, locale)}`}
                              onClick={() => setDesktopOpen(false)}
                              className="font-semibold text-[15px] text-foreground hover:text-primary transition-colors block mb-2"
                            >
                              {getCategoryName(child, locale)}
                            </Link>

                            {hasChildren(child) && (
                              <div className="space-y-1.5 pr-1">
                                {child.children!.map((grand: CategorysTypes) => (
                                  <Link
                                    key={grand.id}
                                    href={`/products?category=${getCategorySlug(grand, locale)}`}
                                    onClick={() => setDesktopOpen(false)}
                                    className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                                  >
                                    {getCategoryName(grand, locale)}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={`/products?category=${getCategorySlug(hoveredMain, locale)}`}
                        onClick={() => setDesktopOpen(false)}
                        className="inline-flex items-center gap-2 text-[15px] text-primary font-semibold hover:underline mt-2"
                      >
                        مشاهده محصولات این دسته
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== دکمه موبایل ========== */}
      <button
        onClick={() => {
          setMobileOpen(true);
          setActiveMainId(categoriesData?.length ? categoriesData[0]?.id : '');
        }}
        className={cn(
          'lg:hidden p-2 rounded-xl hover:bg-muted/80 transition-colors',
          className
        )}
        aria-label="دسته‌بندی‌ها"
      >
        <Grid3X3 className="w-5 h-5" />
      </button>

      {/* ========== Drawer موبایل (شبیه دیجی‌کالا) ========== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[6px] animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* پنل اصلی */}
          <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-background shadow-2xl flex flex-col animate-slide-in-right">
            {/* هدر */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0 bg-card/80 backdrop-blur-md">
              <h2 className="font-bold text-base">دسته‌بندی کالاها</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* بدنه: سایدبار راست + محتوا */}
            <div className="flex flex-1 overflow-hidden">
              {/* سایدبار دسته‌های اصلی (ثابت سمت راست) */}
              <div className="w-[88px] sm:w-24 border-l border-border bg-muted/30 overflow-y-auto shrink-0">
                {categoriesData?.map((cat: CategorysTypes) => {
                  const Icon = cat.icon ? iconMap[cat.icon] : Grid3X3;
                  const isActive = activeMainId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveMainId(cat.id)}
                      className={cn(
                        'w-full flex flex-col items-center gap-1.5 py-3.5 px-1.5 transition-all relative',
                        isActive
                          ? 'bg-background text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {/* خط اکتیو */}
                      {isActive && (
                        <div className="absolute right-0 top-2 bottom-2 w-[3px] rounded-l-full bg-primary" />
                      )}

                      <div
                        className={cn(
                          'w-11 h-11 rounded-2xl flex items-center justify-center transition-all',
                          isActive
                            ? 'bg-primary/12 text-primary shadow-sm'
                            : 'bg-muted/60'
                        )}
                      >
                        {/* <Icon className="w-5 h-5" /> */}
                      </div>
                      <span
                        className={cn(
                          'text-[11px] font-medium text-center leading-tight px-0.5 line-clamp-2',
                          isActive && 'font-bold'
                        )}
                      >
                        {getCategoryName(cat, locale)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* محتوای زیر‌دسته‌ها */}
              <div className="flex-1 overflow-y-auto relative">
                {/* گرادیانت پس‌زمینه ملایم */}
                <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
                <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-20 right-0 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

                {activeMain && (
                  <div className="relative p-3 pb-10">
                    {/* عنوان دسته اصلی */}
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="font-bold text-[15px] text-foreground">
                        {getCategoryName(activeMain, locale)}
                      </h3>
                      <Link
                        href={`/products?category=${getCategorySlug(activeMain, locale)}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        مشاهده همه
                      </Link>
                    </div>

                    {hasChildren(activeMain) ? (
                      <div className="space-y-1">
                        {activeMain.children!.map((child: CategorysTypes) => {
                          const isLeaf = !hasChildren(child);

                          // ---------- حالت برگ نهایی → نمایش با عکس ----------
                          if (isLeaf) {
                            return (
                              <Link
                                key={child.id}
                                href={`/products?category=${getCategorySlug(child, locale)}`}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-primary/5 transition-colors"
                              >
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted/40 border border-border/40 shrink-0">
                                  {child.image ? (
                                    <img
                                      src={child.image}
                                      alt={getCategoryName(child, locale)}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/15 to-violet-500/10">
                                      <span className="text-base font-bold text-primary/70">
                                        {getCategoryName(child, locale)[0]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium text-sm text-foreground">
                                  {getCategoryName(child, locale)}
                                </span>
                              </Link>
                            );
                          }

                          // ---------- حالت دارای فرزند → آکاردئون تمیز ----------
                          return (
                            <AccordionItem
                              key={child.id}
                              category={child}
                              locale={locale}
                              onClose={() => setMobileOpen(false)}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <Link
                        href={`/products?category=${getCategorySlug(activeMain, locale)}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex flex-col items-center justify-center py-16 gap-3 text-primary"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                          {activeMain.icon && iconMap[activeMain.icon] ? (
                            (() => {
                              const Icon = iconMap[activeMain.icon!];
                              // return <Icon className="w-8 h-8" />;
                            })()
                          ) : (
                            <Grid3X3 className="w-8 h-8" />
                          )}
                        </div>
                        <span className="font-semibold text-sm">مشاهده محصولات این دسته</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// تغییر: نوع props به CategorysTypes
function AccordionItem({
  category,
  locale,
  onClose,
}: {
  category: CategorysTypes;
  locale: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {/* هدر آکاردئون */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-primary/5 transition-colors"
      >
        {/* عکس کوچک */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted/40 border border-border/40 shrink-0">
          {category.image ? (
            <img
              src={category.image}
              alt={getCategoryName(category, locale)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/15 to-violet-500/10">
              <span className="text-base font-bold text-primary/70">
                {getCategoryName(category, locale)[0]}
              </span>
            </div>
          )}
        </div>

        <span className="flex-1 text-right font-medium text-sm text-foreground">
          {getCategoryName(category, locale)}
        </span>

        <ChevronLeft
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-300',
            open && '-rotate-90'
          )}
        />
      </button>

      {/* زیرمنوها */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {/* فقط یک خط جداکننده */}
        <div className="border-t border-border/50 mx-2" />

        <div className="pt-2 pb-1 grid grid-cols-3 gap-2">
          {category.children!.map((grand: CategorysTypes) => (
            <Link
              key={grand.id}
              href={`/products?category=${getCategorySlug(grand, locale)}`}
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 group py-1.5"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-muted/30 border border-border/40 group-hover:border-primary/50 transition-all">
                {grand.image ? (
                  <img
                    src={grand.image}
                    alt={getCategoryName(grand, locale)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-violet-500/10">
                    <span className="text-sm font-bold text-primary/60">
                      {getCategoryName(grand, locale)[0]}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium text-center text-foreground/90 group-hover:text-primary transition-colors line-clamp-2 leading-tight px-0.5">
                {getCategoryName(grand, locale)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}