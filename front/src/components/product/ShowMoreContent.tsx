"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function ShowMoreContent({ children }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // چک کردن ارتفاع محتوا پس از رندر شدن
    if (contentRef.current) {
      // 220px همان max-h-55 در تیلویند است (55 * 4px = 220px)
      const contentHeight = contentRef.current.scrollHeight;
      setShouldShowButton(contentHeight > 220);
    }
  }, [children]);

  // اگر هیچ محتوایی پاس داده نشده بود، چیزی رندر نشود
  if (!children) return null;
  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={`transition-all duration-500 ease-in-out overflow-hidden relative ${
          shouldShowButton && !isExpanded ? "max-h-55" : "max-h-[5000px]"
        }`}
      >
        {children}

        {/* سایه انتهای محتوا فقط در صورتی نمایش داده می‌شود که دکمه بسته باشد */}
        {shouldShowButton && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#f8fafc] dark:from-[#03050c]/60 via-white/40 dark:via-[#03050c]/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* دکمه فقط در صورتی رندر می‌شود که ارتفاع محتوا بیشتر از حد مجاز باشد */}
      {shouldShowButton && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#f1f5f9] dark:bg-[#0b0a22] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-sm hover:border-cyan-500 hover:text-cyan-500 transition-all duration-300 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>بستن و مشاهده کمتر</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>مشاهده کامل توضیحات</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}