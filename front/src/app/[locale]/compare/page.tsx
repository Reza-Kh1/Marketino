'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { ArrowLeftRight, X, Plus, AlertTriangle, Search, Star, ShoppingBag } from 'lucide-react';
import { comparisonApi, productsApi, type Product } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const fetch = async () => {
    setLoading(true); setError(false);
    try { const r = await comparisonApi.get(products.map(p => p.id)); setProducts(r.products || []); } catch { setError(true); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (products.length === 0) { fetch(); } else { setLoading(false); }
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try { const r = await productsApi.list({ search: searchTerm }); setSearchResults(r.products.slice(0, 8)); } catch {}
  };

  const addProduct = (p: Product) => {
    if (products.length >= 4) return;
    if (products.some(x => x.id === p.id)) return;
    setProducts(prev => [...prev, p]);
    setShowSearch(false); setSearchTerm('');
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const allSpecs = Array.from(new Set(products.flatMap(p => Object.keys(p.specs || {}))));

  if (loading && products.length === 0) return <div className="text-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (error && products.length === 0) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={fetch} className="text-primary font-bold">تلاش مجدد</button></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black mb-1">مقایسه محصولات</h2><p className="text-muted-foreground text-sm">{products.length} از ۴ محصول</p></div>
        {products.length < 4 && (
          <button onClick={() => setShowSearch(!showSearch)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm"><Plus className="w-4 h-4" /> افزودن محصول</button>
        )}
      </div>

      {showSearch && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <div className="flex gap-2">
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} placeholder="جستجوی محصول..." className="flex-1 h-11 rounded-xl border border-border bg-background px-4" />
            <button onClick={handleSearch} className="px-4 py-2 bg-accent rounded-xl"><Search className="w-5 h-5" /></button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map(p => (
                <button key={p.id} onClick={() => addProduct(p)} className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-xl text-sm">
                  <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                  <span className="flex-1 text-right">{p.title}</span>
                  <span className="font-bold">{p.price.toLocaleString()} تومان</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">محصولی برای مقایسه انتخاب نشده</p>
          <button onClick={() => setShowSearch(true)} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold"><Plus className="w-4 h-4 inline ml-1" />افزودن اولین محصول</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              {/* Header row */}
              <div className="font-bold text-sm p-3">ویژگی</div>
              {products.map(p => (
                <div key={p.id} className="p-3 text-center">
                  <button onClick={() => removeProduct(p.id)} className="float-left p-1 hover:bg-accent rounded-lg"><X className="w-4 h-4 text-red-500" /></button>
                  <img src={p.image} alt={p.title} className="w-20 h-20 object-cover rounded-xl mx-auto mb-2" />
                  <Link href={`/products/${p.slug}`} className="font-black text-sm block hover:text-primary">{p.title}</Link>
                  <div className="text-primary font-black mt-1">{p.price.toLocaleString()} تومان</div>
                  <div className="flex items-center justify-center gap-1 mt-1">{Array(5).fill(0).map((_, j) => <Star key={j} className={cn('w-3 h-3', j < Math.round(p.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />)}<span className="text-xs text-muted-foreground">({p.rating})</span></div>
                </div>
              ))}

              {/* Rows */}
              {[{ label: 'برند', key: 'brand' }, { label: 'وضعیت', key: 'status' }, { label: 'بازدید', key: 'viewCount' }, { label: 'فروش', key: 'saleCount' }, { label: 'موجودی', key: 'quantity' }].map(row => (
                <div key={row.key} className="contents">
                  <div className="py-3 px-3 text-sm font-bold border-t border-border">{row.label}</div>
                  {products.map(p => (
                    <div key={p.id} className="py-3 px-3 text-sm text-center border-t border-border">{row.key === 'status' ? (p.status === 'approved' ? '✔️ فعال' : '⏳ در انتظار') : (p as any)[row.key]?.toLocaleString?.() || (p as any)[row.key] || '-'}</div>
                  ))}
                </div>
              ))}

              {allSpecs.map(specKey => (
                <div key={specKey} className="contents">
                  <div className="py-3 px-3 text-sm font-bold border-t border-border">{specKey}</div>
                  {products.map(p => (
                    <div key={p.id} className="py-3 px-3 text-sm text-center border-t border-border">{p.specs?.[specKey] || '-'}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
