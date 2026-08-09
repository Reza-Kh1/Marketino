"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";

interface CountdownProps {
  targetDate?: Date;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const t = useTranslations("Countdown");
  const format = useFormatter();

  const [isMounted, setIsMounted] = useState(false);
  const targetTime = useMemo(() => {
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
      <div className="flex items-center gap-1.5 ltr:flex-row rtl:flex-row opacity-50 animate-pulse">
        <div className="w-10 h-11 bg-slate-900 rounded-xl border border-slate-800" />
        <span className="text-cyan-500 font-bold">:</span>
        <div className="w-10 h-11 bg-slate-900 rounded-xl border border-slate-800" />
        <span className="text-cyan-500 font-bold">:</span>
        <div className="w-10 h-11 bg-slate-900 rounded-xl border border-slate-800" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
        {t("expired")}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold ltr:mr-1 rtl:ml-1">
        <Clock className="w-4 h-4 animate-spin animation-duration-[10s]" />
        <span className="hidden sm:inline">{t("remainingTime")}</span>
      </div>

      <div className="flex items-center gap-1.5 [direction:ltr]">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center justify-center w-10 h-11 rounded-xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_1px_rgba(6,182,212,0.15)] group hover:border-cyan-400 transition-colors">
              <span className="text-sm font-black text-cyan-400 group-hover:scale-110 transition-transform">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-[9px] text-slate-500 -mt-1 font-medium">
                {t("days")}
              </span>
            </div>
            <span className="text-cyan-500 font-bold text-sm animate-pulse">:</span>
          </>
        )}

        <div className="flex flex-col items-center justify-center w-10 h-11 rounded-lg bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_1px_rgba(6,182,212,0.15)] group hover:border-cyan-400 transition-colors">
          <span className="text-sm font-black text-cyan-400 group-hover:scale-110 transition-transform">
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-[9px] text-slate-500 -mt-1 font-medium">
            {t("hours")}
          </span>
        </div>

        <span className="text-cyan-500 font-bold text-sm animate-pulse">:</span>

        <div className="flex flex-col items-center justify-center w-10 h-11 rounded-lg bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_1px_rgba(6,182,212,0.15)] group hover:border-cyan-400 transition-colors">
          <span className="text-sm font-black text-cyan-400 group-hover:scale-110 transition-transform">
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-[9px] text-slate-500 -mt-1 font-medium">
            {t("minutes")}
          </span>
        </div>

        <span className="text-cyan-500 font-bold text-sm animate-pulse">:</span>

        <div className="flex flex-col items-center justify-center w-10 h-11 rounded-lg bg-slate-950/90 border border-cyan-500/40 shadow-[0_0_1px_rgba(6,182,212,0.25)] group hover:border-cyan-400 transition-colors relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
          <span className="text-sm font-black text-cyan-400 relative z-10 group-hover:scale-110 transition-transform">
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="text-[9px] text-slate-500 -mt-1 font-medium relative z-10">
            {t("seconds")}
          </span>
        </div>
      </div>
    </div>
  );
}