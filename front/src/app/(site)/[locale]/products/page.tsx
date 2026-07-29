'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, X, Grid3X3, List } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { productsApi, categoriesApi, type Product, type Category } from '@/lib/api';
import { cn } from '@/lib/utils';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';
  const tag = searchParams.get('tag') || '';

  useEffect(() => { setPage(1); }, [category, q, sort, tag]);

  // Fetch categories
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      try {
        const params: any = { page, limit: 12 };
        if (category) params.category = category;
        if (tag) params.tag = decodeURIComponent(tag);
        if (q) params.q = q;
        if (sort === 'cheapest') params.sort = 'price_asc';
        else if (sort === 'expensive') params.sort = 'price_desc';
        else if (sort === 'newest') params.sort = 'newest';
        else if (sort === 'rating') params.sort = 'rating';

        const data = await productsApi.list(params);
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      } catch {
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, q, sort, tag, page]);

  const updateUrl = (key: string, value: string) => {
    const url = new URL(location.href);
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    history.pushState({}, '', url.toString());
    // Force re-render via navigation
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const catName = ['asd'];
  // const catName = categories?.find(c => c.slug === category)?.name;
  const title = q ? `نتایج جستجو: "${q}"` : tag ? `محصولات: ${decodeURIComponent(tag)}` : catName || 'همه محصولات';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black">{title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{total} محصول یافت شد</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)} className="gap-2">
          <SlidersHorizontal className="w-4 h-4" /> فیلترها
        </Button>

        <select
          value={sort}
          onChange={e => updateUrl('sort', e.target.value)}
          className="h-9 px-3 rounded-xl border-2 border-border bg-transparent text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
        >
          <option value="">مرتب‌سازی پیش‌فرض</option>
          <option value="cheapest">ارزان‌ترین</option>
          <option value="expensive">گران‌ترین</option>
          <option value="newest">جدیدترین</option>
          <option value="rating">محبوب‌ترین</option>
        </select>

        {/* Active tags */}
        {tag && <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => updateUrl('tag', '')}>{decodeURIComponent(tag)} <X className="w-3 h-3" /></Badge>}
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          className="mb-6 p-5 bg-card border border-border rounded-2xl overflow-hidden">
          <h3 className="font-bold mb-3">دسته‌بندی</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => updateUrl('category', '')} className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-all', !category ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent')}>همه</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => updateUrl('category', c.slug)}
                className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-all', category === c.slug ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent')}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold">محصولی یافت نشد</h2>
          <p className="text-muted-foreground mt-2">لطفاً عبارت دیگری جستجو کنید</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary disabled:opacity-30 transition-colors">←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + Math.max(1, page - 2);
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn('w-10 h-10 rounded-xl font-bold text-sm transition-all', p === page ? 'bg-primary text-primary-foreground' : 'border-2 border-border hover:border-primary')}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary disabled:opacity-30 transition-colors">→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-32"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
