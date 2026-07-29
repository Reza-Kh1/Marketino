'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n-context';

interface ViewedProduct {
  id: string;
  title: string;
  image: string;
  price: number;
  viewedAt: number;
}

const STORAGE_KEY = 'bazarche_recently_viewed';
const MAX_ITEMS = 20;

function getStored(): ViewedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function store(products: ViewedProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products.slice(0, MAX_ITEMS)));
}

export function addToRecentlyViewed(product: { id: string; title: string; image?: string; price: number }) {
  const current = getStored().filter(p => p.id !== product.id);
  current.unshift({
    id: product.id,
    title: product.title,
    image: product.image || '',
    price: product.price,
    viewedAt: Date.now(),
  });
  store(current);
  window.dispatchEvent(new Event('recently-viewed-updated'));
}

export default function RecentlyViewedBar() {
  const [items, setItems] = useState<ViewedProduct[]>([]);
  const [visible, setVisible] = useState(false);
  const { locale } = useTranslation();
  const isFa = locale === 'fa';

  useEffect(() => {
    setItems(getStored().slice(0, 6));
    const handler = () => setItems(getStored().slice(0, 6));
    window.addEventListener('recently-viewed-updated', handler);
    return () => window.removeEventListener('recently-viewed-updated', handler);
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!visible && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setVisible(true)}
            className="fixed bottom-4 rtl:right-4 ltr:left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <History className="w-4 h-4" />
            <span>{items.length} بازدید اخیر</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sliding Panel */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-indigo-500/30 shadow-2xl shadow-black/20 rounded-t-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-black text-sm">بازدیدهای اخیر</h3>
                  <span className="text-xs text-muted-foreground">({items.length} محصول)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { localStorage.removeItem(STORAGE_KEY); setItems([]); setVisible(false); }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline"
                  >
                    پاک کردن همه
                  </button>
                  <button
                    onClick={() => setVisible(false)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Products Row */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    onClick={() => setVisible(false)}
                    className="flex-shrink-0 w-32 group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors shadow-sm group-hover:shadow-md">
                      <img
                        src={item.image || `https://placehold.co/200x200/e2e8f0/94a3b8?text=No+Image`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="mt-1.5">
                      <p className="text-[11px] font-semibold line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs font-black mt-0.5">{item.price.toLocaleString('fa-IR')} تومان</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
