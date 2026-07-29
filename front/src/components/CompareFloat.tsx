'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n-context';

interface CompareProduct {
  id: string;
  title: string;
  image?: string;
}

const MAX_COMPARE = 4;
const STORAGE_KEY = 'bazarche_compare';

function getStored(): CompareProduct[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function store(items: CompareProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('compare-updated'));
}

export function toggleCompare(product: CompareProduct) {
  const current = getStored();
  const exists = current.find(p => p.id === product.id);
  if (exists) {
    store(current.filter(p => p.id !== product.id));
    return false; // removed
  } else {
    if (current.length >= MAX_COMPARE) {
      current.pop();
    }
    store([...current, product]);
    return true; // added
  }
}

export function isInCompare(productId: string): boolean {
  return getStored().some(p => p.id === productId);
}

export default function CompareFloat() {
  const [items, setItems] = useState<CompareProduct[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setItems(getStored());
    const handler = () => setItems(getStored());
    window.addEventListener('compare-updated', handler);
    return () => window.removeEventListener('compare-updated', handler);
  }, []);

  const { locale } = useTranslation();
  const isFa = locale === 'fa';

  if (items.length < 2) return null;

  return (
    <div className="fixed bottom-4 rtl:left-4 ltr:right-4 z-40 flex flex-col rtl:items-start ltr:items-end gap-2">
      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 p-4 min-w-[240px]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black">مقایسه ({items.length}/{MAX_COMPARE})</span>
              <button onClick={() => { store([]); setItems([]); setExpanded(false); }} className="text-xs text-rose-500 hover:underline font-bold">
                پاک کردن
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {items.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 group">
                  <img src={p.image || 'https://placehold.co/40x40'} alt={p.title} className="w-8 h-8 rounded-lg object-cover" />
                  <span className="text-xs font-medium flex-1 line-clamp-1">{p.title}</span>
                  <button
                    onClick={() => {
                      const updated = items.filter(i => i.id !== p.id);
                      store(updated);
                      setItems(updated);
                    }}
                    className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3 h-3 text-rose-500" />
                  </button>
                </div>
              ))}
            </div>

            <Link
              href={`/compare?ids=${items.map(p => p.id).join(',')}`}
              onClick={() => setExpanded(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
            >
              مقایسه محصولات {isFa ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-card border-2 border-amber-400/60 shadow-xl shadow-amber-400/20 hover:shadow-amber-400/30 font-bold text-sm transition-all"
      >
        <GitCompare className="w-4 h-4 text-amber-500" />
        <span>مقایسه</span>
        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
          {items.length}
        </span>
      </motion.button>
    </div>
  );
}
