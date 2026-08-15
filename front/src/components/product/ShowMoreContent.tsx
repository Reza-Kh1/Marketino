"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function ShowMoreContent({ children }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* 
        محتوا همیشه در HTML حضور دارد. 
        فقط با CSS ارتفاع آن محدود یا آزاد می‌شود.
      */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden relative ${
          !isExpanded ? "max-h-55" : "max-h-[5000px]"
        }`}
      >
        {children}

        {/* افکت محوشدگی انتهای متن در حالت بسته */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white dark:from-[#03050c] via-white/80 dark:via-[#03050c]/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* دکمه تعاملی */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-sm hover:border-cyan-500 hover:text-cyan-500 transition-all duration-300 cursor-pointer"
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
    </div>
  );
}