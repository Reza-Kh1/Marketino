'use client';

import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoreReviewItem } from './types';

interface StoreReviewsListProps {
  reviews: StoreReviewItem[];
  className?: string;
}

export default function StoreReviewsList({ reviews, className }: StoreReviewsListProps) {
  if (!reviews.length) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground', className)}>
        هنوز نظری برای این فروشگاه ثبت نشده است.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {reviews.map((r) => (
        <article
          key={r.id}
          className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-sm transition-colors hover:border-cyan-500/25"
        >
          <Quote className="absolute top-3 left-3 size-8 text-cyan-500/10" />
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-cyan-500/20 to-violet-500/20 text-xs font-black text-cyan-700 dark:text-cyan-300">
                {r.author.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold">{r.author}</div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-3.5',
                    i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">{r.body}</p>
          {r.productTitle && (
            <div className="mt-2.5 inline-flex rounded-lg border border-border/60 bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground">
              محصول: {r.productTitle}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
