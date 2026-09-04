'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller, type Control } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Star, Package, TrendingUp, Flame, Sparkles, History,
  Filter, Tag, Store, Zap, RotateCcw, SlidersHorizontal, Loader2,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { cn } from '@/lib/utils';
import Breadcrumb from '@/components/product/Breadcrumb';
import CustomButton from '@/components/CustomButton';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { useCategoriesProducts } from '@/hooks/category.hook';
import { useSearch } from '@/hooks/search.hook';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SearchParamsDto, SortSearchOption } from '@/services/search.service';
import AutocompleteCustom from '@/components/inputs/AutoCompleteCustom';
import { useBrands } from '@/hooks/brand.hook';
import { Link } from '@/i18n/navigation';
import { BreadcrumbsType } from '@/types/types';
import LoadingPage from '@/components/LoadingPage';
import { useStores } from '@/hooks/store.hook';
interface SavedSearch {
  id: string;
  label: string;
  values: Partial<SearchParamsDto>;
  ts: number;
}

/* ── constants ── */
const PRICE_MIN = 0;
const PRICE_MAX = 500_000_000;
const LS_KEY = 'bazarche_recent_searches';
const MAX_SAVED = 8;
const QUERY_DEBOUNCE_MS = 3000;

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'جدیدترین', icon: Sparkles },
  { value: 'best_selling' as const, label: 'بیش‌ترین فروش', icon: Flame },
  { value: 'popular' as const, label: 'محبوب‌ترین', icon: Star },
  { value: 'price_low' as const, label: 'ارزان‌ترین', icon: TrendingUp },
  { value: 'price_high' as const, label: 'گران‌ترین', icon: Tag },
];

/* ── helpers ── */
const loadSaved = (): SavedSearch[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
};
const saveToLS = (items: SavedSearch[]) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_SAVED))); } catch { }
};

const makeLabel = (v: Partial<SearchParamsDto>) => {
  const p: string[] = [];
  if (v.q) p.push(`«${v.q}»`);
  if (v.brand) p.push(v.brand);
  if (v.storeId) p.push(v.storeId);
  if (v.hasOffer) p.push('تخفیف‌دار');
  if (v.featured) p.push('ویژه');
  if (v.condition) p.push(v.condition === 'new' ? 'نو' : 'دست‌دوم');
  if (v.minPrice && v.minPrice > PRICE_MIN) p.push(`از ${v.minPrice.toLocaleString('fa-IR')}`);
  if (v.maxPrice && v.maxPrice < PRICE_MAX) p.push(`تا ${v.maxPrice.toLocaleString('fa-IR')}`);
  return p.join(' · ') || 'جستجوی خالی';
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  const [isPending, setIsPending] = useState(false);
  useEffect(() => {
    if (value === debounced) return;
    setIsPending(true);
    const t = setTimeout(() => {
      setDebounced(value);
      setIsPending(false);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return [debounced, isPending, setDebounced] as const;
}
interface FilterPanelProps {
  control: Control<SearchParamsDto>;
  mobile?: boolean;
  activeFilterCount: number;
  onClear: () => void;
}

function FilterPanel({ control, mobile = false, activeFilterCount, onClear }: FilterPanelProps) {
  const { data: brandData, isLoading } = useBrands()
  const { data: storeDatas, isLoading: loadingStore } = useStores({ forSelect: true })
  const storeData: any = storeDatas || []
  function formBrandData() {
    return brandData?.map((item) => {
      return { id: item.slug, name: item.name }
    })
  }
  return (
    <div className={cn('space-y-5', mobile && 'p-4')}>
      {!mobile && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2"><Filter className="w-4 h-4 text-cyan-600" />فیلترها</h2>
          {activeFilterCount > 0 && (
            <button type="button" onClick={onClear} className="text-[11px] text-cyan-600 cursor-pointer hover:underline flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />پاک کردن ({activeFilterCount})
            </button>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <h3 className="text-xs font-bold text-muted-foreground" aria-label='برند'></h3>
        <Controller name="brand" control={control} render={({ field }) => (
          <AutocompleteCustom onChange={field.onChange}
            value={field.value}
            label='برند'
            options={formBrandData() || []}
            placeholder={isLoading ? 'صبر کنید ...' : 'انتخاب کنید'}
            emptyText='متاسفم برند مدنظر شما یافت نشد!'
          />
        )} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xs font-bold text-muted-foreground" aria-label='فروشگاه'></h3>
        <Controller name="storeId" control={control} render={({ field }) => (
          <AutocompleteCustom onChange={field.onChange}
            value={field.value}
            label='فروشگاه'
            options={storeData}
            placeholder={isLoading ? 'صبر کنید ...' : 'انتخاب کنید'}
            emptyText='متاسفم فروشگاه مدنظر شما یافت نشد!'
          />
        )} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground">محدوده قیمت</h3>
        <div className="flex flex-col gap-2">
          <Controller name="minPrice" control={control} render={({ field }) => (
            <input
              min={PRICE_MIN}
              value={field.value === PRICE_MIN ? '' : field.value?.toLocaleString('fa')}
              onChange={e => {
                let value = e.target.value.replace(/[٠-٩۰-۹]/g, (char) => {
                  const code = char.charCodeAt(0);
                  if (code >= 1776 && code <= 1785) { return String.fromCharCode(code - 1776 + 48); }
                  if (code >= 1632 && code <= 1641) { return String.fromCharCode(code - 1632 + 48); }
                  return char;
                });
                const raw = value.replace(/[^0-9]/g, '');
                field.onChange(raw === '' ? PRICE_MIN : Math.max(PRICE_MIN, Number(raw)));
              }}
              className="w-full h-9 rounded-lg border border-border bg-background px-2 py-1"
              placeholder="از"
            />
          )} />
          <Controller name="maxPrice" control={control} render={({ field }) => (
            <input
              min={PRICE_MIN}
              value={field.value === PRICE_MAX ? '' : field.value?.toLocaleString('fa')}
              onChange={e => {
                let value = e.target.value.replace(/[٠-٩۰-۹]/g, (char) => {
                  const code = char.charCodeAt(0);
                  if (code >= 1776 && code <= 1785) { return String.fromCharCode(code - 1776 + 48); }
                  if (code >= 1632 && code <= 1641) { return String.fromCharCode(code - 1632 + 48); }
                  return char;
                });
                const raw = value.replace(/[^0-9]/g, '');
                field.onChange(raw === '' ? PRICE_MAX : Math.max(PRICE_MIN, Number(raw)));
              }}
              className="w-full h-9 rounded-lg border border-border bg-background px-2 py-1"
              placeholder="تا"
            />
          )} />
        </div>
      </div>

      <Controller name="hasOffer" control={control} render={({ field }) => (
        <label className="flex items-center gap-2.5 cursor-pointer rounded-xl px-2.5 py-2 hover:bg-muted/50">
          <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="size-4 rounded accent-cyan-600" />
          <span className="text-xs font-medium">فقط تخفیف‌دار</span>
          <Zap className="w-3.5 h-3.5 text-amber-500 mr-auto" />
        </label>
      )} />

      <Controller name="featured" control={control} render={({ field }) => (
        <label className="flex items-center gap-2.5 cursor-pointer rounded-xl px-2.5 py-2 hover:bg-muted/50">
          <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="size-4 rounded accent-cyan-600" />
          <span className="text-xs font-medium">محصولات ویژه</span>
          <Sparkles className="w-3.5 h-3.5 text-violet-500 mr-auto" />
        </label>
      )} />

      <div className="space-y-1.5">
        <h3 className="text-xs font-bold text-muted-foreground">وضعیت</h3>
        <Controller name="condition" control={control} render={({ field }) => (
          <div className="flex gap-2">
            {(['', 'new', 'used'] as const).map(c => (
              <button key={c || 'all'} type="button" onClick={() => field.onChange(c)}
                className={cn('flex-1 h-8 rounded-lg text-[11px] font-semibold border transition-all',
                  field.value === c ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700' : 'border-border text-muted-foreground hover:bg-muted')}>
                {c === '' ? 'همه' : c === 'new' ? 'نو' : 'دست‌دوم'}
              </button>
            ))}
          </div>
        )} />
      </div>
    </div>
  );
}

type SearchClientType = {
  initialQuery?: string
  breadcrumb?: BreadcrumbsType
  categoryName?: string
}

/* ── component ── */
export default function SearchClient({ initialQuery = '', breadcrumb, categoryName }: SearchClientType) {
  const { data: categoryData } = useCategoriesProducts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useHorizontalWheelScroll<HTMLDivElement>();
  const [showSuggest, setShowSuggest] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => { setSavedSearches(loadSaved()); }, []);

  const defaultValues: SearchParamsDto = {
    q: initialQuery || searchParams.get('q') || '',
    brand: searchParams.get('brand') || '',
    hasOffer: searchParams.get('hasOffer') === 'true',
    featured: searchParams.get('featured') === 'true',
    condition: (searchParams.get('condition') as any) || '',
    minPrice: Number(searchParams.get('minPrice')) || PRICE_MIN,
    maxPrice: Number(searchParams.get('maxPrice')) || PRICE_MAX,
    sortBy: (searchParams.get('sortBy') as SortSearchOption) || 'newest',
    storeId: searchParams.get('storeId') || '',
    category: categoryName || 'all',
  };
  const { control, watch, setValue, reset } = useForm<SearchParamsDto>({ defaultValues, mode: 'onChange' });
  const formValues = watch();
  const [debouncedQ, isQPending, setDebouncedQ] = useDebouncedValue(formValues.q, QUERY_DEBOUNCE_MS);
  const [debouncedMinPrice, isMinPending, setDebouncedMinPrice] = useDebouncedValue(formValues.minPrice, QUERY_DEBOUNCE_MS);
  const [debouncedMaxPrice, isMaxPending, setDebouncedMaxPrice] = useDebouncedValue(formValues.maxPrice, QUERY_DEBOUNCE_MS);
  const isQueryPending = isQPending || isMinPending || isMaxPending;

  function useHorizontalWheelScroll<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    return ref;
  }

  const searchParamsForHook = useMemo(() => ({
    q: debouncedQ || undefined,
    brand: formValues.brand || undefined,
    hasOffer: formValues.hasOffer || undefined,
    featured: formValues.featured || undefined,
    condition: formValues.condition || undefined,
    minPrice: Number(debouncedMinPrice) > PRICE_MIN ? debouncedMinPrice : undefined,
    maxPrice: Number(debouncedMaxPrice) < PRICE_MAX ? debouncedMaxPrice : undefined,
    sortBy: formValues.sortBy as SortSearchOption,
    category: formValues.category,
    storeId: formValues.storeId
  }), [
    debouncedQ, debouncedMinPrice, debouncedMaxPrice, formValues.brand,
    formValues.hasOffer, formValues.featured, formValues.condition, formValues.sortBy, formValues.storeId
  ]);

  const lastUrlRef = useRef<string>('');
  const category = formValues.category;
  const brand = formValues.brand;
  const storeId = formValues.storeId;
  const hasOffer = formValues.hasOffer;
  const featured = formValues.featured;
  const condition = formValues.condition;
  const sortBy = formValues.sortBy;

  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (debouncedQ?.trim()) p.set('q', debouncedQ.trim());
      if (brand) p.set('brand', brand);
      if (storeId) p.set('storeId', storeId);
      if (hasOffer) p.set('hasOffer', 'true');
      if (featured) p.set('featured', 'true');
      if (condition) p.set('condition', condition);
      if (Number(debouncedMinPrice) > PRICE_MIN) p.set('minPrice', String(debouncedMinPrice));
      if (Number(debouncedMaxPrice) < PRICE_MAX) p.set('maxPrice', String(debouncedMaxPrice));
      if (sortBy !== 'newest') p.set('sortBy', sortBy as SortSearchOption);
      if (category && category !== 'all') p.set('category', category);
      const next = p.toString();
      if (next === lastUrlRef.current) return;
      lastUrlRef.current = next;
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [debouncedQ, debouncedMinPrice, debouncedMaxPrice, brand, hasOffer, featured, condition, sortBy, category, pathname, router, storeId]);

  const persistSearch = useCallback((v: SearchParamsDto) => {
    if (!v.q?.trim() && !v.brand && !v.hasOffer && !v.featured && !v.condition && !v.storeId &&
      v.minPrice === PRICE_MIN && v.maxPrice === PRICE_MAX) return;

    const item: SavedSearch = {
      id: Date.now().toString(36),
      label: makeLabel(v),
      values: { ...v, page: 1 },
      ts: Date.now(),
    };

    setSavedSearches(prev => {
      const next = [item, ...prev.filter(s => s.label !== item.label)].slice(0, MAX_SAVED);
      saveToLS(next);
      return next;
    });
  }, []);

  const runSearch = (q?: string) => {
    const finalQ = (q ?? formValues.q)?.trim() ?? '';
    setValue('q', finalQ);
    setDebouncedQ(finalQ); // جستجوی صریح (submit) دیگر منتظر ۳ ثانیه نمی‌ماند
    setDebouncedMinPrice(formValues.minPrice);
    setDebouncedMaxPrice(formValues.maxPrice);
    setShowSuggest(false);
    persistSearch({ ...formValues, q: finalQ, page: 1 });
  };

  const applySaved = (s: SavedSearch) => {
    const next = { ...defaultValues, ...s.values, page: 1 };
    reset(next);
    setDebouncedQ(next.q ?? '');
    setDebouncedMinPrice(next.minPrice ?? PRICE_MIN);
    setDebouncedMaxPrice(next.maxPrice ?? PRICE_MAX);
    setShowSuggest(false);
  };

  const removeSaved = (id: string) => {
    setSavedSearches(prev => {
      const next = prev.filter(s => s.id !== id);
      saveToLS(next);
      return next;
    });
  };

  const clearFilters = useCallback(() => {
    reset({
      ...formValues, brand: '', storeId: '', hasOffer: false, featured: false, condition: '' as any,
      minPrice: PRICE_MIN, maxPrice: PRICE_MAX, sortBy: SortSearchOption.NEWEST, page: 1, category: 'all',
    });
    setDebouncedMinPrice(PRICE_MIN);
    setDebouncedMaxPrice(PRICE_MAX);
  }, [formValues, reset, setDebouncedMinPrice, setDebouncedMaxPrice]);

  const {
    data: productData,
    isLoading: loadingSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSearch(searchParamsForHook);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const activeFilterCount =
    (formValues.category && formValues.category !== 'all' ? 1 : 0) + (formValues.brand ? 1 : 0) + (formValues.storeId ? 1 : 0) +
    (formValues.hasOffer ? 1 : 0) + (formValues.featured ? 1 : 0) +
    (formValues.condition ? 1 : 0) +
    (Number(formValues.minPrice) > PRICE_MIN || Number(formValues.maxPrice) < PRICE_MAX ? 1 : 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative border-b border-border/60 z-40">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/8 via-transparent to-violet-500/8" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <Breadcrumb pageName={breadcrumb || { name: 'جستجو', nameEn: 'search', slug: 'search' }} />
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              جستجوی هوشمند <span className="bg-linear-to-l from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">محصولات</span>
            </h1>

            <form role="search" onSubmit={e => { e.preventDefault(); runSearch(); }} className="relative">
              <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-500 pointer-events-none" />
                <Controller name="q" control={control} render={({ field }) => (
                  <input {...field} ref={inputRef} type="search"
                    onChange={e => { field.onChange(e); setShowSuggest(true); }}
                    onFocus={() => setShowSuggest(true)}
                    onBlur={() => setTimeout(() => setShowSuggest(false), 180)}
                    placeholder="نام محصول مد نظرتو بنویس ..."
                    className="w-full h-13 sm:h-14 rounded-2xl border border-border/80 bg-card/95 pr-12 pl-28 text-sm shadow-md outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/15 transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                    autoComplete="off" />
                )} />
                {isQueryPending && (
                  <Loader2 className="absolute left-28 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
                )}
                {formValues.q && (
                  <X className="absolute left-24 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-50 cursor-pointer" onClick={() => setValue('q', '')} />
                )}
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <CustomButton name="جستجو" type="submit" color="blueRadinat" />
                </div>
              </div>

              <AnimatePresence>
                {showSuggest && savedSearches.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-card shadow-xl overflow-hidden text-right">
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                        <History className="w-3 h-3" />جستجوهای اخیر
                      </div>
                      {savedSearches.map(s => (
                        <div key={s.id} className="group flex items-center gap-1 rounded-xl hover:bg-muted transition-colors">
                          <button type="button" onMouseDown={() => applySaved(s)} className="flex-1 flex items-center gap-2 px-3 py-2 text-xs text-right">
                            <History className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{s.label}</span>
                          </button>
                          <button type="button" onMouseDown={e => { e.preventDefault(); removeSaved(s.id); }}
                            className="p-2 opacity-0 cursor-pointer group-hover:opacity-100 hover:text-red-500 transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {savedSearches.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {savedSearches.slice(0, 5).map(s => (
                  <button key={s.id} type="button" onClick={() => applySaved(s)}
                    className="group inline-flex cursor-pointer items-center gap-1 rounded-full border border-border/70 bg-card/80 px-2.5 py-1 text-[11px] font-medium hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all">
                    <History className="w-3 h-3 text-muted-foreground" />
                    <span className="max-w-35 truncate">{s.label}</span>
                    <span onClick={e => { e.stopPropagation(); removeSaved(s.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">
                      <X className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category strip */}
      {!!categoryData?.length && (
        <section ref={categoryScrollRef} className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
              <Link aria-disabled={formValues.category === 'all'} href={'/search'}
                className={cn('shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold border transition-all',
                  formValues.category === 'all' ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700' : 'bg-card border-border/70 text-muted-foreground')}>
                همه
              </Link>
              {categoryData.map((cat) => (
                <Link href={'/search/category-' + cat.slug} key={cat.id}
                  className={cn('shrink-0 hover:border-cyan-500/40 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold border transition-all',
                    formValues.category === (cat.id)
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700'
                      : 'bg-card border-border/70 text-muted-foreground')}
                >
                  <span>{cat.icon}</span>{cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
              <FilterPanel control={control} activeFilterCount={activeFilterCount} onClear={clearFilters} />
            </div>
          </aside>

          <div className="flex-1 min-w-0 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/70 px-3.5 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowFilters(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                  <SlidersHorizontal className="w-3.5 h-3.5" />فیلتر
                  {activeFilterCount > 0 && <span className="min-w-4.5 h-4.5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center px-1">{activeFilterCount}</span>}
                </button>
                <p className="text-xs text-muted-foreground">
                  {debouncedQ ? <>نتیجه برای <span className="font-bold text-foreground">«{debouncedQ}»</span>: </> : null}
                  <span className="font-bold text-foreground tabular-nums">
                    {(productData?.pages?.reduce((acc, page) => acc + (page.products?.length || 0), 0) ?? 0).toLocaleString('fa-IR')}
                  </span> محصول
                </p>
              </div>

              <div className="hidden md:flex items-center gap-1 rounded-xl border border-border p-0.5 bg-background/50">
                {SORT_OPTIONS.map(o => {
                  const Icon = o.icon;
                  return (
                    <button key={o.value} type="button"
                      onClick={() => setValue('sortBy', o.value as SortSearchOption)}
                      className={cn('inline-flex items-center cursor-pointer gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all',
                        formValues.sortBy === o.value ? 'bg-cyan-500/15 text-cyan-700 shadow-sm' : 'text-muted-foreground hover:bg-muted/60')}>
                      <Icon className="w-3 h-3" />{o.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {loadingSearch ? <LoadingPage /> :
              !productData?.pages?.some(i => Number(i.pagination.total) > 0) ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center space-y-3">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
                  <h2 className="text-base font-bold">نتیجه‌ای پیدا نشد</h2>
                  <CustomButton type="button" color="blueRadinat" name="شروع دوباره"
                    onClick={() => {
                      clearFilters();
                      setValue('q', '');
                      setDebouncedQ('');
                      setDebouncedMinPrice(PRICE_MIN);
                      setDebouncedMaxPrice(PRICE_MAX);
                    }} />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {productData?.pages?.map((product) => {
                    return product.products.map((item) => (
                      <ProductCard key={item.id} product={item} />
                    ))
                  })}
                </div>
              )
            }
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>
      </div>

      {/* CTA */}
      <MotionWrapper preset="slideUpBlur" delay={0.1} triggerOnScroll>
        <section className="border-t border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="rounded-3xl border border-border/60 bg-linear-to-br from-cyan-500/8 via-card to-violet-500/8 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-right space-y-1.5">
                <h2 className="text-lg sm:text-xl font-black">فروشنده شو</h2>
                <p className="text-sm text-muted-foreground max-w-md">کالای خودت را در بازارچه عرضه کن.</p>
              </div>
              <CustomButton link="/register" name="شروع فروش" color="blueRadinat" iconStart={<Store className="w-4 h-4" />} />
            </div>
          </div>
        </section>
      </MotionWrapper>

      {/* Mobile Filter */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 bottom-0 right-0 z-50 w-[min(100%,340px)] bg-background border-l border-border shadow-2xl lg:hidden overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3">
                <h2 className="text-sm font-bold">فیلتر و مرتب‌سازی</h2>
                <button type="button" onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <FilterPanel control={control} mobile activeFilterCount={activeFilterCount} onClear={clearFilters} />
              <div className="p-4 flex gap-2 border-t border-border sticky bottom-0 bg-background">
                <button type="button" onClick={() => { clearFilters(); setShowFilters(false); }}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-semibold hover:bg-muted">پاک کردن</button>
                <button type="button" onClick={() => setShowFilters(false)}
                  className="flex-1 h-10 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500">
                  اعمال فیلتر
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}