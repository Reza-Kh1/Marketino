'use client';
import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Award, Shield } from 'lucide-react';
import TrustBadge from './TrustBadge';
import StarRating from './StarRating';
import type { User } from '@/lib/api';
import { cn } from '@/lib/utils';

interface VerifiedSeller extends User {
  totalProducts: number;
  avgRating: number;
  totalSales: number;
  reviewCount?: number;
  onTimeDelivery?: number;
  responseRate?: number;
}

interface Props {
  sellers: VerifiedSeller[];
  title?: string;
  loading?: boolean;
}

export default function VerifiedSellerShowcase({
  sellers, title = 'فروشندگان معتبر', loading = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    };
    check();
    const el = scrollRef.current;
    el?.addEventListener('scroll', check, { passive: true });
    return () => el?.removeEventListener('scroll', check);
  }, [sellers]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="shrink-0 w-64 h-40 rounded-2xl bg-accent animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (sellers.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-black">{title}</h2>
          <span className="text-sm text-muted-foreground">({sellers.length} فروشنده)</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} disabled={!canScrollLeft}
            className="p-2 rounded-xl bg-accent hover:bg-muted transition-colors disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => scroll('right')} disabled={!canScrollRight}
            className="p-2 rounded-xl bg-accent hover:bg-muted transition-colors disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Link href="/shops" className="text-sm font-bold text-primary hover:underline mr-2">
            مشاهده همه
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {sellers.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="shrink-0 w-64">
            <Link href={`/shops/${s.id}`}
              className="block bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all">
              {/* Logo + Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl shadow-sm">
                  {s.storeLogo || '🏪'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{s.storeName}</h3>
                  <TrustBadge
                    isVerified={s.isVerified}
                    avgRating={s.avgRating}
                    totalSales={s.totalSales}
                    reviewCount={s.reviewCount || 0}
                    onTimeDelivery={s.onTimeDelivery}
                    responseRate={s.responseRate}
                    size="sm"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                <StarRating rating={s.avgRating} size="sm" count={s.reviewCount} />
                <span className="font-mono font-bold">{s.totalSales.toLocaleString('fa-IR')} فروش</span>
              </div>

              {/* Product count */}
              <div className="mt-2 text-xs text-muted-foreground">
                {s.totalProducts} محصول فعال
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
