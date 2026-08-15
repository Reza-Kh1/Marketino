import { Eye, Star, Sparkles, ImageIcon, ShoppingBasket } from 'lucide-react';
import QuickViewDialog from './QuickViewDialog';
import ImgTag from '../ImgTag';
import { ProductEntity } from '@/services/product.service';
import { Link } from '@/i18n/navigation';
import FeaturedBtn from './FeaturedBtn';
import OffBtn from './OffBtn';
interface ProductCardProps {
  product: ProductEntity;
}
export default function ProductCard({ product }: ProductCardProps) {
  const originalPrice = Number(product.originalPrice) || 0;
  const minPrice = Number(product.minPrice) || 0;
  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && originalPrice > minPrice;
  const imageUrl = product.images?.[0]?.url;

  return (
    <>
      <div className="group relative w-full max-w-65 sm:max-w-70 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-linear-to-b from-slate-50/90 via-white to-cyan-50/20  dark:from-slate-900/90 dark:via-slate-900 dark:to-cyan-950/20  text-slate-800 dark:text-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/10  hover:border-cyan-500/40 dark:hover:border-cyan-500/40 overflow-hidden dir-rtl flex flex-col justify-between">
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 via-fuchsia-500 to-indigo-500 rounded-3xl blur-xl opacity-40 animate-pulse"></div>

        <div className="relative w-full h-36 sm:h-44 overflow-hidden bg-slate-100/60 dark:bg-slate-950/40 flex items-center justify-center p-2.5">
          {imageUrl ? (
            <ImgTag
              src={imageUrl}
              alt={product.images?.[0]?.alt || product.title}
              className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105 relative z-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-1">
              <ImageIcon className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[10px]">بدون تصویر</span>
            </div>
          )}
          {product.isFeatured && <FeaturedBtn />}
          {<OffBtn value={discountPercent} />}
          <QuickViewDialog product={product} />
        </div>
        <Link
          className="p-3 space-y-2.5 flex-1 flex flex-col justify-between relative z-10"
          href={'/products/' + product.slug}
          aria-label={product.title}
        >
          <div className="space-y-1 relative z-0 pointer-events-none">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-0.5 truncate max-w-30">
                <span>{product.category?.icon || '🏷️'}</span>
                <span className="truncate">{product.category?.name}</span>
              </span>
              {product.brand && (
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-20">
                  {product.brand.name}
                </span>
              )}
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              {product.title}
            </h3>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 relative z-0">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <span className="flex items-center gap-0.5" title="تعداد بازدید">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{product.viewCount || 0}</span>
                </span>
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold" title="تعداد فروش">
                  <ShoppingBasket className="w-3 h-3" />
                  <span>{product.saleCount || 0}</span>
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between pt-1">
              <div className="flex flex-col">
                {hasDiscount && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-medium">
                    {originalPrice.toLocaleString('fa-IR')}
                  </span>
                )}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm sm:text-base font-black text-cyan-600 dark:text-cyan-400">
                    {minPrice.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">تومان</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}