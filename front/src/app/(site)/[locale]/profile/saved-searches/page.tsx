'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import {
  Search, Bell, BellRing, Plus, X, Save, Trash2, Clock, ArrowLeft,
  ChevronLeft, Tag, RefreshCw, AlertCircle, CheckCircle, ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { productsApi, type Product } from '@/lib/api';

/* ========================================================================
 * 💾 ذخیره جستجوها و هشدار قیمت
 * ======================================================================== */

interface SavedSearch {
  id: string;
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  createdAt: number;
}

interface PriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  targetPrice: number;
  currentPrice: number;
  createdAt: number;
  active: boolean;
}

const SEARCH_KEY = 'bazarche_saved_searches';
const ALERT_KEY = 'bazarche_price_alerts';

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function setStored(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showNewSearch, setShowNewSearch] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);

  // New search form
  const [newQuery, setNewQuery] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newMinPrice, setNewMinPrice] = useState('');
  const [newMaxPrice, setNewMaxPrice] = useState('');

  // New alert form
  const [alertProduct, setAlertProduct] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [searchAlertResults, setSearchAlertResults] = useState<Product[]>([]);

  useEffect(() => {
    setSearches(getStored(SEARCH_KEY, []));
    setAlerts(getStored(ALERT_KEY, []));
  }, []);

  const addSearch = () => {
    if (!newQuery.trim()) return;
    const newItem: SavedSearch = {
      id: Date.now().toString(),
      query: newQuery.trim(),
      category: newCategory || undefined,
      minPrice: newMinPrice ? Number(newMinPrice) : undefined,
      maxPrice: newMaxPrice ? Number(newMaxPrice) : undefined,
      createdAt: Date.now(),
    };
    const updated = [newItem, ...searches].slice(0, 20);
    setSearches(updated);
    setStored(SEARCH_KEY, updated);
    setNewQuery('');
    setNewCategory('');
    setNewMinPrice('');
    setNewMaxPrice('');
    setShowNewSearch(false);
    toast.success('جستجو ذخیره شد!');
  };

  const removeSearch = (id: string) => {
    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    setStored(SEARCH_KEY, updated);
    toast.success('حذف شد');
  };

  const addAlert = () => {
    const product = searchAlertResults.find(p => p.id === alertProduct || p.title.includes(alertProduct));
    if (!product || !alertPrice) return;
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      targetPrice: Number(alertPrice),
      currentPrice: product.price,
      createdAt: Date.now(),
      active: true,
    };
    const updated = [newAlert, ...alerts].slice(0, 30);
    setAlerts(updated);
    setStored(ALERT_KEY, updated);
    setAlertProduct('');
    setAlertPrice('');
    setSearchAlertResults([]);
    setShowNewAlert(false);
    toast.success('هشدار قیمت تنظیم شد!');
  };

  const removeAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    setStored(ALERT_KEY, updated);
    toast.success('هشدار حذف شد');
  };

  const toggleAlert = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAlerts(updated);
    setStored(ALERT_KEY, updated);
    toast.success(updated.find(a => a.id === id)?.active ? 'هشدار فعال شد' : 'هشدار غیرفعال شد');
  };

  const searchProducts = async (q: string) => {
    if (q.length < 2) { setSearchAlertResults([]); return; }
    try {
      const data = await productsApi.list({ q, limit: 5 });
      setSearchAlertResults(data.products || []);
    } catch {
      setSearchAlertResults([]);
    }
  };

  // Generate search URL
  const buildSearchUrl = (s: SavedSearch) => {
    const params = new URLSearchParams();
    params.set('q', s.query);
    if (s.category) params.set('category', s.category);
    if (s.minPrice) params.set('minPrice', String(s.minPrice));
    if (s.maxPrice) params.set('maxPrice', String(s.maxPrice));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/profile" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> بازگشت به پروفایل
        </Link>
        <h1 className="text-2xl font-black">جستجوهای ذخیره شده و هشدار قیمت</h1>
        <p className="text-sm text-muted-foreground mt-1">جستجوهای خود را ذخیره کنید و برای محصولات مورد علاقه هشدار کاهش قیمت تنظیم کنید</p>
      </motion.div>

      {/* ── Saved Searches ── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border/40 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Save className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-black text-lg">جستجوهای ذخیره شده</h2>
              <p className="text-xs text-muted-foreground">{searches.length} جستجو</p>
            </div>
          </div>
          <button onClick={() => setShowNewSearch(!showNewSearch)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> جستجوی جدید
          </button>
        </div>

        {/* New Search Form */}
        {showNewSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-4 rounded-xl bg-muted/50 border border-border/40 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-1 block">عبارت جستجو *</label>
                <input value={newQuery} onChange={e => setNewQuery(e.target.value)}
                  placeholder="مثلاً: گوشی سامسونگ" className="w-full h-10 px-3 rounded-xl bg-card border border-border focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">دسته‌بندی</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-card border border-border focus:border-indigo-500 outline-none text-sm">
                  <option value="">همه دسته‌ها</option>
                  <option value="electronics">کالای دیجیتال</option>
                  <option value="clothing">پوشاک</option>
                  <option value="home">خانه و آشپزخانه</option>
                  <option value="sports">ورزش</option>
                  <option value="books">کتاب</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">حداقل قیمت (تومان)</label>
                <input value={newMinPrice} onChange={e => setNewMinPrice(e.target.value)} type="number"
                  placeholder="مثلاً: ۱۰۰۰۰۰۰" className="w-full h-10 px-3 rounded-xl bg-card border border-border focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">حداکثر قیمت (تومان)</label>
                <input value={newMaxPrice} onChange={e => setNewMaxPrice(e.target.value)} type="number"
                  placeholder="مثلاً: ۵۰۰۰۰۰۰۰" className="w-full h-10 px-3 rounded-xl bg-card border border-border focus:border-indigo-500 outline-none text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addSearch} disabled={!newQuery.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors">
                ذخیره جستجو
              </button>
              <button onClick={() => setShowNewSearch(false)}
                className="px-4 py-2 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors">
                انصراف
              </button>
            </div>
          </motion.div>
        )}

        {/* Saved Searches List */}
        {searches.length === 0 ? (
          <div className="text-center py-10">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">هنوز جستجویی ذخیره نکردید</p>
            <p className="text-xs text-muted-foreground/60 mt-1">جستجوهای پرتکرار خود را برای دسترسی سریع ذخیره کنید</p>
          </div>
        ) : (
          <div className="space-y-2">
            {searches.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={buildSearchUrl(s)} className="text-sm font-bold hover:text-indigo-600 transition-colors">
                    {s.query}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    {s.category && <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> {s.category}</span>}
                    {s.minPrice && <span>از {s.minPrice.toLocaleString('fa-IR')}</span>}
                    {s.maxPrice && <span>تا {s.maxPrice.toLocaleString('fa-IR')}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(s.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={buildSearchUrl(s)}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    title="اجرای جستجو">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => removeSearch(s.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors"
                    title="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ── Price Alerts ── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border/40 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="font-black text-lg">هشدار کاهش قیمت</h2>
              <p className="text-xs text-muted-foreground">{alerts.filter(a => a.active).length} هشدار فعال</p>
            </div>
          </div>
          <button onClick={() => setShowNewAlert(!showNewAlert)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> هشدار جدید
          </button>
        </div>

        {/* New Alert Form */}
        {showNewAlert && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-4 rounded-xl bg-muted/50 border border-border/40 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-1 block">جستجوی محصول *</label>
                <input value={alertProduct} onChange={e => { setAlertProduct(e.target.value); searchProducts(e.target.value); }}
                  placeholder="نام محصول را جستجو کنید..." className="w-full h-10 px-3 rounded-xl bg-card border border-border focus:border-rose-500 outline-none text-sm" />
                {searchAlertResults.length > 0 && (
                  <div className="mt-1 border border-border rounded-xl overflow-hidden">
                    {searchAlertResults.map(p => (
                      <button key={p.id} onClick={() => { setAlertProduct(p.title); setSearchAlertResults([]); }}
                        className="w-full flex items-center gap-2 p-2 hover:bg-muted text-sm text-right transition-colors">
                        <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="flex-1 truncate">{p.title}</span>
                        <span className="text-xs font-bold text-muted-foreground">{p.price.toLocaleString('fa-IR')} تومان</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">قیمت هدف (تومان) *</label>
                <input value={alertPrice} onChange={e => setAlertPrice(e.target.value)} type="number"
                  placeholder="قیمتی که می‌خواهید..." className="w-full h-10 px-3 rounded-xl bg-card border border-border focus:border-rose-500 outline-none text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addAlert} disabled={!alertProduct || !alertPrice}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm disabled:opacity-50 hover:bg-rose-700 transition-colors">
                تنظیم هشدار
              </button>
              <button onClick={() => setShowNewAlert(false)}
                className="px-4 py-2 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors">
                انصراف
              </button>
            </div>
          </motion.div>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">هیچ هشداری تنظیم نکردید</p>
            <p className="text-xs text-muted-foreground/60 mt-1">برای محصولات مورد علاقه هشدار کاهش قیمت تنظیم کنید</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-colors group',
                a.active ? 'hover:bg-muted/50' : 'opacity-50 hover:opacity-75'
              )}>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {a.productImage ? (
                    <img src={a.productImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${a.productId}`} className="text-sm font-bold hover:text-rose-600 transition-colors">
                    {a.productTitle}
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5 text-xs">
                    <span className="text-muted-foreground">قیمت فعلی: <span className="font-bold">{a.currentPrice.toLocaleString('fa-IR')}</span></span>
                    <span className="text-rose-600 font-bold">هدف: {a.targetPrice.toLocaleString('fa-IR')}</span>
                    {a.targetPrice < a.currentPrice && (
                      <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                        <ArrowLeft className="w-3 h-3 rotate-[315deg]" /> {(a.currentPrice - a.targetPrice).toLocaleString('fa-IR')} کاهش نیاز است
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleAlert(a.id)}
                    className={cn('p-1.5 rounded-lg transition-colors',
                      a.active ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 hover:bg-emerald-100')}
                    title={a.active ? 'غیرفعال کردن' : 'فعال کردن'}>
                    {a.active ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => removeAlert(a.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors"
                    title="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
