'use client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Star, Package, TrendingUp, Shield, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n-context';
import type { User } from '@/lib/api';

const BUSINESS_LABELS: Record<string, string> = {
  electronics: 'کالای دیجیتال', clothing: 'پوشاک و مد', home: 'خانه و آشپزخانه',
  sports: 'ورزش و سفر', beauty: 'زیبایی و سلامت', books: 'کتاب و لوازم تحریر',
  toys: 'اسباب‌بازی و کودک', food: 'خوراکی', jewelry: 'طلا و جواهرات',
  art: 'هنر و صنایع دستی', cars: 'خودرو', tools: 'ابزار صنعتی',
  medical: 'پزشکی', music: 'موسیقی', other: 'سایر',
};

export default function ShopCard({
  shop,
  rank,
}: {
  shop: User & { totalProducts?: number; avgRating?: number; totalSales?: number; businessType?: string; sellerStatus?: string };
  rank?: number;
}) {
  const bType = shop.businessType || '';
  const isVerified = shop.sellerStatus === 'approved';
  const { locale } = useTranslation();
  const isFa = locale === 'fa';

  const totalSalesDisplay = (shop.totalSales || 0).toLocaleString(isFa ? 'fa-IR' : 'en-US');
  const totalProducts = shop.totalProducts || 0;
  const totalProductsDisplay = totalProducts.toLocaleString(isFa ? 'fa-IR' : 'en-US');

  return (
    <Link href={`/shops/${shop.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-card border border-border/60 rounded-2xl p-3.5 sm:p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group relative overflow-hidden"
      >
        {/* Top gradient line on hover */}
        <div className="absolute top-0 rtl:right-0 ltr:left-0 rtl:left-0 ltr:right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rank badge */}
        {rank && rank <= 3 && (
          <div className={cn(
            'absolute -top-1 rtl:-right-1 ltr:-left-1 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-bl-2xl text-white font-black shadow-lg z-10',
            rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
            rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
            'bg-gradient-to-br from-amber-700 to-amber-900'
          )}>
            <span className="text-[10px] sm:text-sm relative -top-0.5 sm:-top-1 rtl:-right-0.5 sm:rtl:-right-1 ltr:-left-0.5 sm:ltr:-left-1">#{rank}</span>
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 
                            flex items-center justify-center text-xl sm:text-3xl group-hover:scale-110 transition-transform duration-300 shadow-sm
                            border border-border/30">
              {shop.storeLogo || '🏪'}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 rtl:-right-1 ltr:-left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
              {shop.storeName}
            </h3>
            {bType && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {BUSINESS_LABELS[bType] || bType}
              </p>
            )}
            <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                <span className="font-bold text-foreground">{shop.avgRating || 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3 shrink-0" />
                {totalProductsDisplay} {isFa ? 'محصول' : 'products'}
              </span>
            </div>
          </div>
        </div>

        {/* Sales stat */}
        {shop.totalSales != null && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-muted-foreground">{isFa ? 'کل فروش:' : 'Total Sales:'}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 shrink-0" />
              {totalSalesDisplay} {isFa ? 'سفارش' : 'orders'}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-2.5 sm:mt-3.5">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary 
                           group-hover:gap-2 transition-all duration-300 
                           px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg group-hover:bg-primary/10">
            {isFa ? 'مشاهده فروشگاه' : 'View Shop'}
            <ArrowLeft className={cn(
              'w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-0 group-hover:opacity-100 transition-opacity',
              isFa && 'rotate-180'
            )} />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
