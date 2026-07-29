'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, UserPlus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIVITIES = [
  { type: 'purchase', icon: ShoppingBag, text: 'یک گوشی آیفون ۱۵ خرید', name: 'علیرضا', time: '۲ دقیقه پیش', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
  { type: 'review', icon: Star, text: 'به هدفون بی‌سیم ۵ ستاره داد', name: 'سارا', time: '۵ دقیقه پیش', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
  { type: 'register', icon: UserPlus, text: 'به عنوان فروشنده ثبت‌نام کرد', name: 'رضا', time: '۸ دقیقه پیش', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
  { type: 'purchase', icon: ShoppingBag, text: 'یک لپ‌تاپ ایسوس خرید', name: 'مریم', time: '۱۲ دقیقه پیش', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
  { type: 'flash', icon: Zap, text: 'از تخفیف ویژه استفاده کرد', name: 'امیر', time: '۱۵ دقیقه پیش', color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' },
  { type: 'purchase', icon: ShoppingBag, text: 'یک مانتو خرید', name: 'نرگس', time: '۱۸ دقیقه پیش', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
  { type: 'review', icon: Star, text: 'یک نظر جدید ثبت کرد', name: 'حسین', time: '۲۰ دقیقه پیش', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
  { type: 'register', icon: UserPlus, text: 'عضو جدید بازارچه شد', name: 'فاطمه', time: '۲۵ دقیقه پیش', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
];

export default function LiveActivityTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activity = ACTIVITIES[current];

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-border/60 shadow-sm">
          {/* Live dot */}
          <div className="relative flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping-once opacity-75" />
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ms-1">فعال</span>

          <div className="w-px h-4 bg-border/50" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0', activity.color)}>
                <activity.icon className="w-3 h-3" />
              </div>
              <span className="text-xs">
                <span className="font-bold">{activity.name}</span>
                <span className="text-muted-foreground"> {activity.text}</span>
              </span>
              <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">{activity.time}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


