import React from "react";
import { Clock, Gift } from "lucide-react";
import { toToman } from "./../../lib/utils-product";

interface DiscountBoxProps {
  originalPrice: number;
  finalPrice: number;
  percent: number;
  countdownSlot?: React.ReactNode;
}

export default function DiscountBox({
  originalPrice,
  finalPrice,
  percent,
  countdownSlot,
}: DiscountBoxProps) {
  if (percent <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 flex-col sm:flex-row rounded-xl sm:rounded-2xl border border-indigo-500/30 bg-linear-to-br from-indigo-50/80 via-blue-50/60 to-purple-50/80 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-purple-950/30 px-2.5 py-2 sm:px-4 sm:py-3.5 backdrop-blur-sm transition-colors duration-300 shadow-sm shadow-indigo-500/5">
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* آیکون - کوچک‌تر در موبایل */}
        <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-linear-to-br from-indigo-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 shrink-0">
          <Gift className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-black bg-linear-to-r from-indigo-600 via-blue-600 to-purple-600 dark:from-indigo-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent text-xs sm:text-base">
              {percent.toLocaleString("fa-IR")}٪ تخفیف
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 line-through decoration-indigo-500/60">
              {toToman(originalPrice)}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            قیمت با تخفیف: <span className="font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{toToman(finalPrice)}</span> تومان
          </span>
        </div>
      </div>
      
      {/* تایمر - کوچک‌تر در موبایل */}
      {countdownSlot && (
        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-medium bg-indigo-500/10 dark:bg-indigo-500/15 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-indigo-500/20 shrink-0 backdrop-blur-sm w-full sm:w-auto justify-center sm:justify-start">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {countdownSlot}
        </div>
      )}
    </div>
  );
}