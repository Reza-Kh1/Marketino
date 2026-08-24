'use client';

import {
  BadgeCheck,
  MapPin,
  Package,
  Phone,
  Share2,
  Shield,
  Star,
  Clock,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoreEntity } from './types';
import ImgTag from '../ImgTag';
import { Store } from '@/services/store.service';
import { ShareBtn } from '../product/ShareBtn';
import TooltipCustom from '../TooltipCustom';
import { Link } from '@/i18n/navigation';

interface StoreHeroProps {
  store: Store;
}

export default function StoreHero({ store }: StoreHeroProps) {
  const rating = store.rating;
  const avg = rating?.avgRating ?? 0;

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      {/* Banner */}
      <div className="relative h-40 sm:h-52 md:h-64 w-full bg-muted">
        {store.banner ? (
          <ImgTag src={store.banner} alt="" figureClass='h-full w-full' className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-cyan-600 via-blue-600 to-violet-600" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-14 sm:-mt-16 flex flex-col gap-5 pb-8 sm:flex-row sm:items-end sm:gap-6">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="size-24 sm:size-28 overflow-hidden rounded-3xl border-4 border-background bg-card shadow-xl ring-1 ring-border/60">
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <ImgTag src={store.logo} alt={store.name} figureClass='h-full w-full' className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-cyan-500/20 to-violet-500/20 text-3xl font-black text-cyan-700 dark:text-cyan-300">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>
            {store.isVerified && (
              <span className="absolute -bottom-1 -left-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-background">
                <Shield className="size-3.5" />
              </span>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-2.5 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {store.name}
              </h1>
              {store.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <BadgeCheck className="size-3.5" />
                  فروشگاه تایید‌شده
                </span>
              )}
              {store.businessType && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Building2 className="size-3" />
                  {store.businessType}
                </span>
              )}
            </div>

            {store.nameEn && (
              <p className="text-xs text-muted-foreground font-medium" dir="ltr">
                {store.nameEn}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {rating && (
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {avg.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  <span className="font-normal text-muted-foreground">
                    ({rating.totalReviews.toLocaleString('fa-IR')} نظر)
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Package className="size-3.5 opacity-70" />
                {(store?.rating?.productCount ?? 0).toLocaleString('fa-IR')} محصول
              </span>
              {(store.city || store.province) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 opacity-70" />
                  {[store.city, store.province].filter(Boolean).join('، ')}
                </span>
              )}
              {store.workingHours && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5 opacity-70" />
                  {store.workingHours}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:pb-1">
            {store.phone && <TooltipCustom placeHolder="تماس با فروشنده">
              <Link
                href={`tel:${store.phone}`}
                className="p-3 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/50 bg-white dark:bg-slate-900/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                title="تماس با فروشنده"
                aria-label="تماس با فروشنده"
              >
                <Phone className="w-5 h-5" />
              </Link>
            </TooltipCustom>}
            <ShareBtn text={store.name} title={store.description || ''} />
          </div>
        </div>
      </div>
    </section>
  );
}
