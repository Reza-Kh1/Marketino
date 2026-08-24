import { Eye, Star, ImageIcon, ShoppingBasket } from 'lucide-react';
import QuickViewDialog from './QuickViewDialog';
import ImgTag from '../ImgTag';
import { ProductEntity } from '@/services/product.service';
import { Link } from '@/i18n/navigation';
import FeaturedBtn from './FeaturedBtn';
import OffBtn from './OffBtn';
import { cn } from '@/lib/utils';
import LikeButton from './LikeButton';

interface ProductCardProps {
  product: ProductEntity;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const originalPrice = Number(product.originalPrice) || 0;
  const minPrice = Number(product.minPrice) || 0;
  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && originalPrice > minPrice;
  const imageUrl = product.images?.[0]?.url;
  const isFeatured = Boolean(product.isFeatured) && product.isFeatured !== 'false' && product.isFeatured !== '0';

  return (
    <article
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl',
        'border border-border/70 bg-card text-card-foreground',
        'shadow-sm transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-cyan-500/35 hover:shadow-lg hover:shadow-cyan-500/10',
        'dark:hover:border-cyan-400/30 dark:hover:shadow-cyan-500/5',
        className
      )}
    >
      <LikeButton isCard productId={product.id} />

      {/* soft accent glow on hover only */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10"
      />

      {/* Image area */}
      {/* Image area */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/40 dark:bg-muted/20">
        {imageUrl ? (
          <ImgTag
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
            <ImageIcon className="h-8 w-8 stroke-[1.4]" />
            <span className="text-[10px] font-medium">بدون تصویر</span>
          </div>
        )}

        {/* badges */}
        {isFeatured && <FeaturedBtn />}
        <OffBtn value={discountPercent} />
        <QuickViewDialog product={product} />

        {/* bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card/90 to-transparent"
        />
      </div>

      {/* Body */}
      <Link
        href={'/products/' + product.slug}
        aria-label={product.title}
        className="relative z-10 flex flex-1 flex-col justify-between gap-2.5 p-3 sm:p-3.5"
      >
        {/* category + brand */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1 truncate">
              <span className="shrink-0" aria-hidden>
                {product.category?.icon || '🏷️'}
              </span>
              <span className="truncate">{product.category?.name}</span>
            </span>
            {product.brand?.name && (
              <span className="max-w-[40%] shrink-0 truncate font-semibold text-foreground/80">
                {product.brand.name}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-xs font-bold leading-snug text-foreground transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400 sm:text-[13px]">
            {product.title}
          </h3>
        </div>

        {/* meta + price */}
        <div className="space-y-2.5 border-t border-border/60 pt-2.5">
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-bold text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{product.rating?.toLocaleString('fa-IR') ?? '—'}</span>
            </div>

            <div className="flex items-center gap-2.5 font-medium">
              <span className="inline-flex items-center gap-0.5" title="بازدید">
                <Eye className="h-3 w-3 opacity-70" />
                <span className="tabular-nums">{(product.viewCount || 0).toLocaleString('fa-IR')}</span>
              </span>
              <span
                className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400"
                title="فروش"
              >
                <ShoppingBasket className="h-3 w-3" />
                <span className="tabular-nums">{(product.saleCount || 0).toLocaleString('fa-IR')}</span>
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              {hasDiscount && (
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground line-through">
                  {originalPrice.toLocaleString('fa-IR')}
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black tabular-nums tracking-tight text-cyan-600 dark:text-cyan-400 sm:text-base">
                  {minPrice.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] font-medium text-muted-foreground">تومان</span>
              </div>
            </div>

            {hasDiscount && (
              <span className="shrink-0 rounded-lg bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                ٪{discountPercent.toLocaleString('fa-IR')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
