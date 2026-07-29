'use client';
import { motion } from 'framer-motion';
import { Star, Clock, MessageSquare, Truck, ThumbsUp } from 'lucide-react';
import StarRating from './StarRating';
import { cn } from '@/lib/utils';

interface ShopRatingBreakdownProps {
  avgRating: number;
  totalReviews: number;
  ratingDistribution?: { 1: number; 2: number; 3: number; 4: number; 5: number };
  responseRate?: number;
  onTimeDelivery?: number;
  productQuality?: number;
  communication?: number;
}

export default function ShopRatingBreakdown({
  avgRating, totalReviews, ratingDistribution,
  responseRate, onTimeDelivery, productQuality, communication,
}: ShopRatingBreakdownProps) {
  const dist = ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxCount = Math.max(...Object.values(dist), 1);

  const metrics = [
    { label: 'کیفیت محصولات', value: productQuality || avgRating, icon: ThumbsUp, color: 'from-violet-500 to-purple-500' },
    { label: 'پاسخگویی', value: responseRate || 0, icon: MessageSquare, color: 'from-blue-500 to-cyan-500', isPercent: true },
    { label: 'تحویل به موقع', value: onTimeDelivery || 0, icon: Truck, color: 'from-emerald-500 to-teal-500', isPercent: true },
    { label: 'ارتباط با مشتری', value: communication || avgRating, icon: Star, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Rating Overview */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-black text-lg mb-4">امتیاز کلی فروشنده</h3>
        <div className="flex items-center gap-5 mb-6">
          <div className="text-5xl font-black text-amber-500">{avgRating.toFixed(1)}</div>
          <div>
            <StarRating rating={avgRating} size="md" showValue={false} />
            <p className="text-xs text-muted-foreground mt-1">{totalReviews.toLocaleString('fa-IR')} نظر</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-5 font-bold">{star}</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(dist[star as keyof typeof dist] / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, delay: star * 0.1 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-6 text-left font-mono">
                {dist[star as keyof typeof dist]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-black text-lg mb-4">معیارهای عملکرد</h3>
        <div className="space-y-4">
          {metrics.map((m, i) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn('w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center', m.color)}>
                    <m.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{m.label}</span>
                </div>
                <span className="text-sm font-black">
                  {m.isPercent ? `${m.value}%` : m.value.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.isPercent ? m.value : (m.value / 5) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={cn('h-full bg-gradient-to-r rounded-full', m.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
