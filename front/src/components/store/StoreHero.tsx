import {
  BadgeCheck,
  MapPin,
  Package,
  Phone,
  Shield,
  Star,
  Clock,
  Building2,
} from 'lucide-react';
import ImgTag from '../ImgTag';
import { Store } from '@/services/store.service';
import { ShareBtn } from '../product/ShareBtn';
import TooltipCustom from '../TooltipCustom';
import { Link } from '@/i18n/navigation';
import Breadcrumb from '../product/Breadcrumb';

interface StoreHeroProps {
  store: Store;
}

export default function StoreHero({ store }: StoreHeroProps) {
  const rating = store.rating;
  const avg = rating?.avgRating ?? 0;
  const locationText = [store.city?.name, store.province?.name].filter(Boolean).join('، ');

  return (
    <section className="relative w-full border-b border-border/50 bg-card/30">
      <div className="relative h-52 sm:h-64 md:h-80 w-full bg-muted overflow-hidden">
        {store.banner ? (
          <ImgTag
            src={store.banner}
            alt={store.name}
            figureClass="h-full w-full"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-r from-cyan-600 via-blue-600 to-violet-600 opacity-90" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-black/40" />
        <div className="absolute top-0 right-0 left-0 z-10 mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <Breadcrumb
            itemsCustom={[
              { id: '2', name: 'فروشگاه', nameEn: 'store', slug: '/store', slugEn: '/store' },
              { id: store.id, name: store.name, nameEn: store.name, slug: store.slug, slugEn: store.slug },
            ]}
          />
        </div>
      </div>

      {/* Main Content Details */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="-mt-16 sm:-mt-20 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 min-w-0 flex-1">
            <div className="relative shrink-0 z-10">
              <div className="size-28 sm:size-36 overflow-hidden rounded-3xl border-4 border-background bg-card shadow-2xl ring-1 ring-border/80">
                {store.logo ? (
                  <ImgTag
                    src={store.logo}
                    alt={store.name}
                    figureClass="h-full w-full"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-cyan-500/20 to-violet-500/20 text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 select-none">
                    {store.name ? store.name.charAt(0) : 'F'}
                  </div>
                )}
              </div>
              {store.isVerified && (
                <span
                  className="absolute -bottom-1 -left-1 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-background"
                  title="فروشگاه تایید شده"
                >
                  <Shield className="size-4" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {store.name}
                </h1>
                {store.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="size-3.5" />
                    رسمی
                  </span>
                )}
                {store.businessType && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Building2 className="size-3" />
                    {store.businessType === 'company' ? 'حقوقی' : 'حقیقی'}
                  </span>
                )}
              </div>
              {store.nameEn && (
                <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide" dir="ltr">
                  {store.nameEn}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1">
                {rating && (
                  <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                    <Star className="size-4 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="tabular-nums">
                      {avg.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                    <span className="font-normal text-muted-foreground">
                      ({rating.totalReviews.toLocaleString('fa-IR')} دیدگاه)
                    </span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Package className="size-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  {(store?.rating?.productCount ?? store?.products?.length ?? 0).toLocaleString('fa-IR')} محصول
                </span>
                {locationText && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-rose-500 shrink-0" />
                    {locationText}
                  </span>
                )}
                {store.workingHours && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5 text-amber-500 shrink-0" />
                    {store.workingHours}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
            {store.phone && (
              <TooltipCustom placeHolder="تماس">
                <div className="p-3 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/50 bg-white dark:bg-slate-900/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
                  <Link
                    href={`tel:${store.phone}`}
                    title="تماس"
                    aria-label="تماس"
                  >
                    <Phone className="size-5" />
                  </Link>
                </div>
              </TooltipCustom>
            )}
            <ShareBtn text={store.name} title={store.description || ''} />
          </div>
        </div>
      </div>
    </section >
  );
}