import { Link } from '@/i18n/navigation';
import {
  Star,
  Package,
  MapPin,
  Shield,
  BadgeCheck,
  TrendingUp,
  MessageCircle,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreResponseEntity } from '@/services/store.service';
import ImgTag from '../ImgTag';
interface StoreCardProps {
  store: StoreResponseEntity;
  rank?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}
export default function StoreCard({ store, rank, className, variant = 'default' }: StoreCardProps) {
  const rating = store.rating;
  const avg = rating?.avgRating ?? 0;
  const sales = rating?.saleCount ?? 0;
  const products = rating?.productQuality ?? 0;
  const responseRate = rating?.responseRate ?? 0;
  const totalReview = rating?.totalReviews ?? 0;

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  return (
    <Link href={`/stores/${store.slug}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300',
        'border-border/70 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10',
        isFeatured && 'ring-1 ring-cyan-500/20', className
      )}
    >

      {/* Banner */}
      <div className={cn('relative overflow-hidden bg-muted', isCompact ? 'h-20' : 'h-28 sm:h-32')}>
        {store.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <ImgTag
            src={store.banner}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-cyan-500/25 via-blue-500/15 to-violet-500/20" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-card via-card/20 to-transparent" />

        {/* Rank */}
        {rank != null && rank <= 3 && (
          <div
            className={cn(
              'absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-xl text-[11px] font-black text-white shadow-lg',
              rank === 1 && 'bg-linear-to-br from-amber-400 to-amber-600',
              rank === 2 && 'bg-linear-to-br from-slate-400 to-slate-600',
              rank === 3 && 'bg-linear-to-br from-amber-700 to-amber-900'
            )}
          >
            #{rank.toLocaleString('fa-IR')}
          </div>
        )}

        {store.isVerified && (
          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-sm">
            <BadgeCheck className="size-3" />
            تایید‌شده
          </div>
        )}
      </div>

      {/* Logo overlapping banner */}
      <div className="relative z-10 -mt-8 flex items-end gap-3 px-3.5 sm:px-4">
        <div className="relative shrink-0">
          <div className="size-14 sm:size-16 overflow-hidden rounded-2xl border-2 border-card bg-muted shadow-md ring-1 ring-border/60">
            {store.logo ? (
              <ImgTag src={store.logo} alt={store.name} className="h-full w-full object-cover" figureClass='h-full' />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-cyan-500/20 to-violet-500/20 text-xl font-black text-cyan-700 dark:text-cyan-300">
                {store.name.charAt(0)}
              </div>
            )}
          </div>
          {store.isVerified && (
            <span className="absolute -bottom-0.5 -left-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-card">
              <Shield className="size-2.5" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 pb-0.5">
          <h3 className="truncate text-sm font-black text-foreground transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400 sm:text-base">
            {store.name}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
            {(store.city || store.province) && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="size-3 opacity-70" />
                {[store.city?.name, store.province?.name].filter(Boolean).join('، ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-3.5 pt-3 sm:p-4">
        {/* Rating row */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-2 py-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black tabular-nums text-amber-700 dark:text-amber-300">
              {avg.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({(rating?.totalReviews ?? 0).toLocaleString('fa-IR')})
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-3" />
            {sales.toLocaleString('fa-IR')} فروش
          </div>
        </div>

        {/* Mini metrics */}
        {!isCompact && (
          <div className="grid grid-cols-3 gap-1.5">
            <MetricChip icon={Package} label="محصول" value={products.toLocaleString('fa-IR')} />
            <MetricChip icon={MessageCircle} label="پاسخ" value={`${responseRate.toLocaleString('fa-IR')}٪`} />
            <MetricChip icon={Truck} label="تحویل" value={totalReview ? `${totalReview.toLocaleString('fa-IR')}٪` : '—'} />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2.5">
          <span className="text-[10px] text-muted-foreground">
            عضویت از{' '}
            {new Date(store.createdAt).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'short',
            })}
          </span>
          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
            مشاهده فروشگاه ←
          </span>
        </div>
      </div>
    </Link >
  );
}

function MetricChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 px-1.5 py-1.5 text-center">
      <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
        <Icon className="size-3" />
        <span className="text-[9px]">{label}</span>
      </div>
      <div className="mt-0.5 text-[11px] font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
