'use client';

import React, { useEffect, useRef } from 'react';
import { useProductQnA } from '@/hooks/qna.hook'; // مسیر دقیق هوک خود را بگذارید
import { HelpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import QNAForm from './QNAForm'; // مسیر دقیق QNAForm خود را بگذارید

interface Props {
  productId: string;
  initialQnaData?: any;
}

export default function MoreQnaDetails({ productId, initialQnaData }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useProductQnA(productId, initialQnaData);

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
      {data?.pages?.map((rev) => {
        return rev?.qnas?.map((q, index) => (
          <div
            key={index++}
            className="p-3 rounded-xl sm:rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-2"
          >
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-2 min-w-0">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 shrink-0 mt-0.5" />
                <span className="font-bold text-xs sm:text-sm leading-relaxed">{q.content}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">
                {new Date(q.createdAt).toLocaleDateString('fa-IR')}
              </span>
            </div>

            {/* پاسخ‌ها */}
            {q.replies && q.replies.length > 0 &&
              q.replies.map((reply: any) => (
                <div
                  key={reply.id}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {reply.role === 'seller' ? 'فروشنده' : 'خریدار'} :
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">
                      {new Date(reply.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                    {reply.content}
                  </p>
                </div>
              ))}

            {/* فرم ثبت پاسخ */}
            <div>
              <QNAForm productId={productId} parentId={q.id} minimal={true} answer={true} />
            </div>
          </div>
        ))
      })}

      {/* المان انتهای لیست برای IntersectionObserver */}
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