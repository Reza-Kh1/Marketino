"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useFormatter } from "next-intl";

interface CountdownProps {
  targetDate?: Date | undefined;
}

const getValidDate = (input: any): Date | null => {
  if (!input) return null;
  if (input instanceof Date) return input;
  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

export default function Countdown({ targetDate }: CountdownProps) {
  const t = useTranslations("Countdown");
  const format = useFormatter();

  const [isMounted, setIsMounted] = useState(false);
  const targetTime = useMemo(() => {
    const validDate = getValidDate(targetDate);
    if (validDate) {
      return validDate.getTime();
    }
    return targetDate
      ? targetDate.getTime()
      : Date.now() + 24 * 60 * 60 * 1000;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const calculateTimeLeft = () => {
      const difference = targetTime - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const formatNumber = (num: number) => {
    return format.number(num, { minimumIntegerDigits: 2, numberingSystem: "latn" });
  };

  if (!isMounted) {
    return (
      <div className="flex items-center gap-1 sm:gap-1.5 ltr:flex-row rtl:flex-row opacity-50 animate-pulse">
        <div className="w-8 h-9 sm:w-10 sm:h-11 bg-slate-200 dark:bg-slate-800 rounded-md sm:rounded-lg border border-slate-300 dark:border-slate-700" />
        <span className="text-cyan-500 dark:text-cyan-100 font-bold text-xs sm:text-sm">:</span>
        <div className="w-8 h-9 sm:w-10 sm:h-11 bg-slate-200 dark:bg-slate-800 rounded-md sm:rounded-lg border border-slate-300 dark:border-slate-700" />
        <span className="text-cyan-500 dark:text-cyan-100 font-bold text-xs sm:text-sm">:</span>
        <div className="w-8 h-9 sm:w-10 sm:h-11 bg-slate-200 dark:bg-slate-800 rounded-md sm:rounded-lg border border-slate-300 dark:border-slate-700" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="text-[10px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 dark:border-rose-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">
        {t("expired")}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-1.5 [direction:ltr]">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center justify-center w-8 h-9 sm:w-10 sm:h-11 rounded-md sm:rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm dark:shadow-[0_0_1px_rgba(6,182,212,0.15)] group hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors">
              <span className="text-[11px] sm:text-sm font-black text-slate-800 dark:text-cyan-100 group-hover:scale-110 transition-transform">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-[7px] sm:text-[9px] text-slate-400 dark:text-slate-500 -mt-0.5 sm:-mt-1 font-medium">
                {t("days")}
              </span>
            </div>
            <span className="text-slate-300 dark:text-cyan-500 font-bold text-[10px] sm:text-sm animate-pulse">:</span>
          </>
        )}

        <div className="flex flex-col items-center justify-center w-8 h-9 sm:w-10 sm:h-11 rounded-md sm:rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm dark:shadow-[0_0_1px_rgba(6,182,212,0.15)] group hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors">
          <span className="text-[11px] sm:text-sm font-black text-slate-800 dark:text-cyan-100 group-hover:scale-110 transition-transform">
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-[7px] sm:text-[9px] text-slate-400 dark:text-slate-500 -mt-0.5 sm:-mt-1 font-medium">
            {t("hours")}
          </span>
        </div>

        <span className="text-slate-300 dark:text-cyan-500 font-bold text-[10px] sm:text-sm animate-pulse">:</span>

        <div className="flex flex-col items-center justify-center w-8 h-9 sm:w-10 sm:h-11 rounded-md sm:rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm dark:shadow-[0_0_1px_rgba(6,182,212,0.15)] group hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors">
          <span className="text-[11px] sm:text-sm font-black text-slate-800 dark:text-cyan-100 group-hover:scale-110 transition-transform">
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-[7px] sm:text-[9px] text-slate-400 dark:text-slate-500 -mt-0.5 sm:-mt-1 font-medium">
            {t("minutes")}
          </span>
        </div>

        <span className="text-slate-300 dark:text-cyan-500 font-bold text-[10px] sm:text-sm animate-pulse">:</span>

        <div className="flex flex-col items-center justify-center w-8 h-9 sm:w-10 sm:h-11 rounded-md sm:rounded-lg bg-white dark:bg-slate-900/80 border border-cyan-400/60 dark:border-cyan-500/40 shadow-sm dark:shadow-[0_0_1px_rgba(6,182,212,0.25)] group hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-400/5 dark:bg-cyan-500/5 animate-pulse" />
          <span className="text-[11px] sm:text-sm font-black text-cyan-600 dark:text-cyan-100 relative z-10 group-hover:scale-110 transition-transform">
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="text-[7px] sm:text-[9px] text-slate-400 dark:text-slate-500 -mt-0.5 sm:-mt-1 font-medium relative z-10">
            {t("seconds")}
          </span>
        </div>
      </div>
    </div>
  );
}