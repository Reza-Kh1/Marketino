'use client';

import { Star, CheckCircle2, MessageSquareReply, Package, Store, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreReview } from '@/services/store.service';
import ReviewForm from '../product/ReviewForm';

interface StoreReviewsListProps {
  reviews: StoreReview[];
  className?: string;
}

export default function StoreReviewsList({ reviews, className }: StoreReviewsListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/40',
          className
        )}
      >
        <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <Store className="size-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">هنوز نظری ثبت نشده است</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          اولین نفری باشید که تجربه خود را از این فروشگاه به اشتراک می‌گذارید.
        </p>
        <div className='mt-5 w-1/2'>
          <ReviewForm productId=''/>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {reviews.map((r, index) => {
        const fullName = `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || 'کاربر مهمان';
        const avatarInitial = r.user.firstName?.charAt(0) || 'ک';

        return (
          <article
            key={index}
            className={cn(
              'relative overflow-hidden rounded-xl border bg-card p-2 sm:p-5 transition-all duration-200 hover:shadow-xs',
              r.verifiedPurchase ? 'border-emerald-500/20' : 'border-border/70'
            )}
          >
            {/* Header: User Info, Product Tag & Date at Corner */}
            <div className="flex justify-between gap-3  items-center">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar with subtle border & shadow */}
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-xs border transition-transform',
                    r.verifiedPurchase
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5'
                      : 'bg-muted text-muted-foreground border-border/60'
                  )}
                >
                  {avatarInitial}
                </div>

                {/* Name, Badge & Product Tag */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground truncate max-w-45 sm:max-w-65">
                      {fullName}
                    </span>
                    {r.verifiedPurchase && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        خریدار
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Pending Badge aligned to Top Left corner */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">
                  <time dateTime={r.createdAt} className="tabular-nums">
                    {new Date(r.createdAt).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </time>
                </div>
                {r.status === 'pending' && (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    در انتظار تایید
                  </span>
                )}
              </div>
            </div>

            {/* Ratings Summary */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-muted/40 border border-border/40 px-2.5 py-1 text-xs">
                <span className="text-muted-foreground text-[11px] leading-none">امتیاز فروشگاه:</span>
                <div className="flex items-center gap-1 font-bold text-foreground leading-none">
                  <span className="tabular-nums leading-none">{r.rating}</span>
                  <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                </div>
              </div>
              {r.productQuality > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-muted/40 border border-border/40 px-2.5 py-1 text-xs">
                  <span className="text-muted-foreground text-[11px] leading-none">کیفیت محصول:</span>
                  <div className="flex items-center gap-1 font-bold text-foreground leading-none">
                    <span className="tabular-nums leading-none">{r.productQuality}</span>
                    <Star className="size-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                  </div>
                </div>
              )}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-muted/40 border border-border/40 px-2.5 py-1 text-xs">
              <span className="text-muted-foreground text-[11px] leading-none">Headphone</span>
              <div className="flex items-center gap-1 font-bold text-foreground leading-none">
                <Package className="size-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            {/* Review Body */}
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-foreground/90 wrap-break-word whitespace-pre-line">
              {r.body}
            </p>

            {/* Seller Response Section */}
            {r.answerReview && (
              <div className="mt-4 rounded-lg border-r-2 shadow-lg border-r-cyan-500 bg-muted/30 p-3.5 sm:p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    <MessageSquareReply className="size-3.5" />
                    <span>پاسخ فروشگاه</span>
                  </div>

                  {/* Response Date on Top-Left Corner */}
                  {r.answerAt && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded-md">
                      <Clock className="size-2.5 opacity-70" />
                      <time dateTime={r.answerAt} className="tabular-nums">
                        {new Date(r.answerAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground wrap-break-word whitespace-pre-line">
                  {r.answerReview}
                </p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}