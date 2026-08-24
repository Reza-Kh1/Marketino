'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProductReviews } from '@/hooks/review.hook';
import { Star, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  productId: string;
  initialData?: any[];
}
export default function MoreReviewDetail({ productId, initialData = [] }: Props) {
  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductReviews(productId,);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {data?.pages.map((item) => {
        return item.reviews.map((rev, index) => (
          <div
            key={index++}
            className="p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-3 sm:space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs sm:text-sm text-cyan-400 shrink-0">
                  {rev.user?.firstName?.slice(0, 1) || ''}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm">
                      {rev.user?.firstName} {rev.user?.lastName}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      خریدار واقعی
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>

              <div className="flex text-amber-400 self-start sm:self-auto">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rev.body}</p>
            {rev.answerReview && (
              <div className="p-3 sm:p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs space-y-1">
                <div className="font-bold text-cyan-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  پاسخ فروشگاه:
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.answerReview}</p>
              </div>
            )}
          </div>
        ))
      })}
      <div ref={bottomRef} className="py-4 text-center">
        {isFetching && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            <span>در حال دریافت نظرات بیشتر...</span>
          </div>
        )}
      </div>
    </div>
  );
}