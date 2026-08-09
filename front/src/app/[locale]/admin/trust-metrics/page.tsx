'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Shield, Star, TrendingUp, Truck, MessageSquare, CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import StarRating from '@/components/StarRating';
import TrustBadge from '@/components/TrustBadge';
import { toast } from 'sonner';

interface TrustMetrics {
  totalSellers: number; verifiedSellers: number; approvedSellers: number;
  verifiedPercent: number; avgRating: number; avgResponseRate: number;
  avgOnTimeDelivery: number; totalReviews: number;
  ratingTiers: { fiveStar: number; fourStar: number; threeStar: number; belowThree: number };
  topRatedSellers: { id: string; storeName: string; isVerified: boolean; reviewCount: number; avgRating: number }[];
  lowRatedSellers: { id: string; storeName: string; isVerified: boolean; reviewCount: number; avgRating: number }[];
}

export default function AdminTrustMetricsPage() {
  const [data, setData] = useState<TrustMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.trustMetrics();
        setData(res);
      } catch {
        toast.error('خطا در دریافت معیارهای اعتماد');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="space-y-6">
      <div className="h-8 w-48 bg-accent rounded-lg animate-pulse" />
      <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-accent rounded-2xl animate-pulse" />)}</div>
    </div>;
  }

  if (!data) return null;

  const totalRating = Object.values(data.ratingTiers).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">معیارهای اعتماد</h2>
        <p className="text-muted-foreground text-sm">آمار اعتماد و اعتبار فروشندگان</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'درصد فروشندگان تأیید شده', value: `${data.verifiedPercent}%`, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
          { label: 'میانگین امتیاز', value: data.avgRating.toFixed(1), icon: Star, color: 'from-amber-500 to-orange-500' },
          { label: 'نرخ پاسخگویی', value: `${data.avgResponseRate}%`, icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
          { label: 'تحویل به موقع', value: `${data.avgOnTimeDelivery}%`, icon: Truck, color: 'from-green-500 to-emerald-500' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 text-center">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3', card.color)}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Rating Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-lg mb-4">توزیع امتیازات</h3>
          {[
            { label: '۵ ستاره', count: data.ratingTiers.fiveStar, color: 'bg-emerald-500' },
            { label: '۴-۵ ستاره', count: data.ratingTiers.fourStar, color: 'bg-blue-500' },
            { label: '۳-۴ ستاره', count: data.ratingTiers.threeStar, color: 'bg-amber-500' },
            { label: 'زیر ۳ ستاره', count: data.ratingTiers.belowThree, color: 'bg-red-500' },
          ].map(tier => {
            const pct = totalRating > 0 ? (tier.count / totalRating) * 100 : 0;
            return (
              <div key={tier.label} className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium w-20">{tier.label}</span>
                <div className="flex-1 h-5 bg-accent rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                    className={cn('h-full rounded-full', tier.color)} />
                </div>
                <span className="text-xs font-mono font-bold w-12 text-left">{tier.count}</span>
                <span className="text-xs text-muted-foreground w-10">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </motion.div>

        {/* General Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-lg mb-4">آمار کلی</h3>
          <div className="space-y-4">
            {[
              { label: 'کل فروشندگان', value: data.totalSellers },
              { label: 'فروشندگان تأیید شده', value: data.verifiedSellers },
              { label: 'فروشندگان فعال', value: data.approvedSellers },
              { label: 'کل نظرات', value: data.totalReviews },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                <span className="text-sm">{s.label}</span>
                <span className="font-black text-lg">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top & Low Rated Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="font-black text-lg">فروشندگان برتر</h3>
          </div>
          <div className="space-y-3">
            {data.topRatedSellers.map(s => (
              <Link key={s.id} href={`/shops/${s.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className={cn('w-5 h-5', s.isVerified ? 'text-blue-500' : 'text-muted-foreground')} />
                  <span className="font-bold text-sm">{s.storeName}</span>
                </div>
                <div>
                  <StarRating rating={s.avgRating} size="sm" count={s.reviewCount} />
                </div>
              </Link>
            ))}
            {data.topRatedSellers.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">موردی یافت نشد</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-lg">فروشندگان نیازمند بررسی</h3>
          </div>
          <div className="space-y-3">
            {data.lowRatedSellers.map(s => (
              <Link key={s.id} href={`/shops/${s.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-sm">{s.storeName}</span>
                </div>
                <StarRating rating={s.avgRating} size="sm" count={s.reviewCount} />
              </Link>
            ))}
            {data.lowRatedSellers.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400/50" />
                فروشنده ضعیفی یافت نشد
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
