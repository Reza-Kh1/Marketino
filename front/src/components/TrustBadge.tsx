'use client';
import { Shield, Clock, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  isVerified: boolean;
  avgRating: number;
  totalSales: number;
  reviewCount: number;
  onTimeDelivery?: number;
  responseRate?: number;
  size?: 'sm' | 'md' | 'lg';
}

interface TrustLevel {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Shield;
  score: number;
}

export default function TrustBadge({
  isVerified, avgRating, totalSales, reviewCount,
  onTimeDelivery, responseRate, size = 'md',
}: TrustBadgeProps) {
  const trustScore = Math.min(100, Math.round(avgRating * 20));

  const getTrustLevel = (): TrustLevel => {
    if (isVerified && avgRating >= 4.5 && totalSales >= 100 && reviewCount >= 20) {
      return {
        label: 'فروشنده معتبر',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700',
        icon: Award,
        score: trustScore,
      };
    }
    if (isVerified && avgRating >= 4.0) {
      return {
        label: 'فروشنده تأیید شده',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
        icon: CheckCircle2,
        score: trustScore,
      };
    }
    if (totalSales < 10 && reviewCount < 5) {
      return {
        label: 'فروشنده جدید',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
        icon: Clock,
        score: trustScore,
      };
    }
    if (avgRating < 3) {
      return {
        label: 'نیاز به بررسی',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
        icon: AlertTriangle,
        score: trustScore,
      };
    }
    return {
      label: 'فروشنده',
      color: 'text-muted-foreground',
      bgColor: 'bg-accent border-border',
      icon: Shield,
      score: trustScore,
    };
  };

  const level = getTrustLevel();
  const Icon = level.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-lg',
    md: 'px-3 py-1 text-xs gap-1.5 rounded-xl',
    lg: 'px-4 py-1.5 text-sm gap-2 rounded-xl',
  };

  return (
    <div className={cn(
      'inline-flex items-center border font-bold',
      sizeClasses[size],
      level.bgColor, level.color,
    )}>
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
      <span>{level.label}</span>
      <span className="opacity-70">• {level.score}%</span>
    </div>
  );
}
