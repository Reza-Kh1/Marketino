import {
  Star,
  ThumbsUp,
  MessageSquare,
  Truck,
  Clock,
  ShoppingBag,
  BarChart3,
  Package,
  MessageSquareText,
  RotateCcw,
  PackageCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreRating } from '@/services/store.service';

interface StoreRatingPanelProps {
  rating: StoreRating | null | undefined;
  className?: string;
}

export default function StoreRatingPanel({ rating, className }: StoreRatingPanelProps) {
  if (!rating) {
    return (
      <div className={cn('rounded-2xl border border-border/70 bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        هنوز امتیازی ثبت نشده است.
      </div>
    );
  }

  const metrics = [
    {
      label: 'کیفیت محصولات',
      value: rating.productQuality,
      icon: PackageCheck,
      color: 'from-violet-500 to-purple-500',
      suffix: <Star className="size-3 fill-amber-400 text-amber-400" />,
      isPercent: false
    },
    {
      label: 'درصد پاسخگویی به سوالات',
      value: rating.responseRate,
      icon: MessageSquare,
      color: 'from-cyan-500 to-blue-500',
      suffix: '%',
      isPercent: true
    },
    {
      label: 'محصولات در حال عرضه',
      value: rating.productCount ?? 0,
      icon: Package,
      color: 'from-emerald-500 to-teal-500',
      suffix: '',
      isPercent: false,
    },
    {
      label: 'فروش موفق',
      value: rating.saleCount ?? rating.saleCount,
      icon: ShoppingBag,
      color: 'from-amber-500 to-orange-500',
      suffix: '',
      isPercent: false
    },
  ];

  // Fake distribution for UI richness (static demo)
  const dist = [
    { star: 5, pct: 68 },
    { star: 4, pct: 22 },
    { star: 3, pct: 7 },
    { star: 2, pct: 2 },
    { star: 1, pct: 1 },
  ];
  function formatResponseTime(minutes: number) {
    if (minutes < 1) return 'کمتر از ۱ دقیقه'

    if (minutes < 60) {
      return `حدود ${Math.round(minutes)} دقیقه`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)

    if (remainingMinutes === 0) {
      return `حدود ${hours} ساعت`
    }

    return `حدود ${hours} ساعت و ${remainingMinutes} دقیقه`
  }
  return (
    <div className={cn('space-y-5', className)}>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overall */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-black">امتیاز کلی فروشگاه</h3>
          </div>

          <div className="mb-5 flex items-center gap-4">
            <div className="text-4xl font-black tabular-nums text-amber-500 sm:text-5xl">
              {rating.avgRating.toLocaleString('fa-IR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-4',
                      i < Math.round(rating.avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                بر اساس {rating.totalReviews.toLocaleString('fa-IR')} نظر
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="w-4 text-[11px] font-bold tabular-nums text-muted-foreground">
                  {d.star.toLocaleString('fa-IR')}
                </span>
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-linear-to-l from-amber-400 to-orange-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-8 text-left text-[10px] tabular-nums text-muted-foreground">
                  {d.pct.toLocaleString('fa-IR')}٪
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm transition-colors hover:border-cyan-500/25"
            >
              <div
                className={cn(
                  'mb-2 flex size-9 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-sm',
                  m.color
                )}
              >
                <m.icon className="size-4" />
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">{m.label}</div>
              <div className="mt-0.5 text-lg flex gap-1 items-center font-black tabular-nums text-foreground">
                {!m.isPercent
                  ? m.value.toLocaleString('fa-IR')
                  : m.value.toLocaleString('fa-IR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                {m.suffix}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatBox
          icon={MessageSquareText}
          label="پاسخ های داده شده"
          value={rating.answeredResponses.toLocaleString('fa-IR')}
        />
        <StatBox
          icon={RotateCcw}
          label="کالاهای مرجوع شده"
          value={rating.returnCount.toLocaleString('fa-IR')}
        />
        <StatBox
          icon={Clock}
          label="میانگین زمان پاسخ"
          value={formatResponseTime(rating.responseTime)}
        />
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Clock;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-3.5 py-3',
        className
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-bold tabular-nums">{value}</div>
      </div>
    </div>
  );
}
