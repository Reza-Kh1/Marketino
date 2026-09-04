'use client'
import { useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Star, Eye, ShoppingBag, Sparkles, CheckCircle2, ImageIcon, ArrowLeft, ShoppingBasket, X } from 'lucide-react';
import ImgTag from '../ImgTag';
import CustomButton from '../CustomButton';
import { ProductEntity } from '@/services/product.service';
import FeaturedBtn from './FeaturedBtn';
import OffBtn from './OffBtn';

export default function QuickViewDialog({ product }: { product: ProductEntity }) {
  if (!product) return null;
  const [open, setOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const originalPrice = Number(product.originalPrice) || 0;
  const minPrice = Number(product.minPrice) || 0;
  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && originalPrice > minPrice;
  const images = product.images || [];
  return (
    <>
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 z-20">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 font-bold text-xs px-3 py-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 transition-all transform translate-y-3 group-hover:translate-y-0 duration-300 cursor-pointer hover:scale-105"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-500" />
          <span>مشاهده سریع</span>
        </button>
      </div>
      <Dialog open={open} onOpenChange={(val) => !val && setOpen(false)}>
        <DialogContent showCloseButton={false} className="max-w-3xl sm:max-w-4xl p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 text-slate-800 dark:text-slate-100 rounded-3xl backdrop-blur-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{product.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-7 max-h-[85vh] overflow-y-auto">
            <div className="md:col-span-5 space-y-3 w-full">
              <div className="relative aspect-4/3 sm:aspect-square rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 overflow-hidden">
                {images.length > 0 ? (
                  <ImgTag
                    figureClass='h-full'
                    src={images[activeImageIndex]?.url}
                    alt={images[activeImageIndex]?.alt || product.title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-1">
                    <ImageIcon className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs">تصویری ثبت نشده است</span>
                  </div>
                )}

                {/* بج‌ها */}
                {hasDiscount && (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-linear-to-tr from-rose-600 to-pink-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md shadow-rose-500/30 z-10">
                    ٪{discountPercent} تخفیف
                  </div>
                )}
                <OffBtn value={discountPercent} name="تخفیف" />
                {product.isFeatured && <FeaturedBtn />}
              </div>

              {/* گالری تصاویر کوچک (Thumbnails) */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 transition-all cursor-pointer ${activeImageIndex === idx
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30 scale-105'
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                    >
                      <ImgTag src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ----------------- سمت چپ: اطلاعات کامل محصول ----------------- */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">

                {/* دسته‌بندی، برند و آمار */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1 rounded-lg">
                      {product.category?.icon || '🏷️'} {product.category?.name}
                    </span>
                    {product.brand && (
                      <span className="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-500/20">
                        {product.brand.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1" title="تعداد بازدید">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{product.viewCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1" title="تعداد فروش">
                      <ShoppingBasket className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{product.saleCount || 0} فروش</span>
                    </span>
                  </div>
                </div>

                {/* عنوان فارسی و انگلیسی */}
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                    {product.title}
                  </h2>
                  {product.titleEn && (
                    <span className="text-[11px] text-slate-400 font-mono dir-ltr block mt-0.5">
                      {product.titleEn}
                    </span>
                  )}
                </div>

                {/* امتیاز و فروشگاه */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md text-xs border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating || '5.0'}</span>
                    </div>
                    <span className="text-xs text-slate-400">({product.reviewCount || 0} دیدگاه)</span>
                  </div>
                </div>

                {/* توضیحات */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">درباره محصول:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {product.description || 'توضیحاتی برای این محصول ثبت نشده است.'}
                  </p>
                </div>

                {/* وضعیت کالا */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>وضعیت اصالت: <strong className="text-slate-700 dark:text-slate-200">{product.condition === 'new' ? 'نو و آکبند' : 'دست دوم'}</strong></span>
                </div>
              </div>

              {/* ----------------- قیمت و دکمه‌های اکشن ----------------- */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">قیمت نهایی:</span>
                  <div className="flex flex-col items-end">
                    {hasDiscount && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through font-medium">
                        {originalPrice.toLocaleString('fa-IR')}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400">
                        {minPrice.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">تومان</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <CustomButton
                    name='مشاهده محصول'
                    link={`/products/${product.slug}`}
                    color='blueRadinat'
                    iconEnd={<ShoppingBag className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}