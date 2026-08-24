'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Package,
  Star,
  Info,
  MessageSquare,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import StoreHero from '@/components/store/StoreHero';
import StoreRatingPanel from '@/components/store/StoreRatingPanel';
import StoreContactCard from '@/components/store/StoreContactCard';
import StoreReviewsList from '@/components/store/StoreReviewsList';
import StoreCard from '@/components/store/StoreCard';
import ProductCard from '@/components/product/ProductCard';
import { MOCK_STORES, MOCK_STORE_REVIEWS } from '@/components/store/mock-stores';
import type { ProductEntity } from '@/services/product.service';
import { Store } from '@/services/store.service';

type TabId = 'products' | 'about' | 'ratings' | 'reviews';

const TABS: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'محصولات', icon: LayoutGrid },
  { id: 'about', label: 'درباره فروشگاه', icon: Info },
  { id: 'ratings', label: 'امتیاز و عملکرد', icon: Star },
  { id: 'reviews', label: 'نظرات', icon: MessageSquare },
];

export default function StoreDetailClient({ store }: { store: Store }) {
  const [tab, setTab] = useState<TabId>('products');
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav
        aria-label="مسیر"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 text-xs text-muted-foreground"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-cyan-600 dark:hover:text-cyan-400">
            خانه
          </Link>
          <span>/</span>
          <Link href="/store" className="hover:text-cyan-600 dark:hover:text-cyan-400">
            فروشگاه‌ها
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground truncate max-w-56">{store.name}</span>
        </div>
      </nav>

      <StoreHero store={store} />

      {/* Tabs */}
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all',
                    active
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-6">
            {tab === 'products' && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-black flex items-center gap-2">
                    <Package className="size-4 text-cyan-600 dark:text-cyan-400" />
                    محصولات فروشگاه
                    <span className="text-xs font-medium text-muted-foreground">
                      ({store.products?.length.toLocaleString('fa-IR')})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {store.products?.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            {tab === 'about' && (
              <section className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
                  <h2 className="mb-3 text-base font-black">درباره {store.name}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {store.description || 'توضیحاتی برای این فروشگاه ثبت نشده است.'}
                  </p>
                  {store.descriptionEn && (
                    <p className="mt-4 border-t border-border/60 pt-4 text-sm leading-7 text-muted-foreground" dir="ltr">
                      {store.descriptionEn}
                    </p>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoTile label="تاریخ عضویت" value={new Date(store.createdAt).toLocaleDateString('fa-IR')} />
                  <InfoTile label="وضعیت" value={store.isActive ? 'فعال' : 'غیرفعال'} />
                  {store.economicCode && <InfoTile label="کد اقتصادی" value={store.economicCode} />}
                  <InfoTile
                    label="وضعیت تایید"
                    value={store.isVerified ? 'تایید‌شده' : 'در انتظار تایید'}
                  />
                </div>
              </section>
            )}

            {tab === 'ratings' && (
              <section>
                <h2 className="mb-4 text-base font-black">عملکرد و امتیازها</h2>
                <StoreRatingPanel rating={store.rating} />
              </section>
            )}

            {tab === 'reviews' && (
              <section>
                <h2 className="mb-4 text-base font-black">نظر خریداران</h2>
                <StoreReviewsList reviews={MOCK_STORE_REVIEWS} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 space-y-4 lg:w-80">
            <StoreContactCard store={store} className="lg:sticky lg:top-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}
