"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import ImgTag from "@/components/ImgTag";
import { resolveImageUrl } from "./../../lib/utils-product";
import { ProductImage } from "@/types/types";
import OffBtn from "./OffBtn";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  discountPercent?: number;
  lowStock?: boolean;
  stockCount?: number;
}

export default function ProductGallery({
  images,
  title,
  discountPercent = 0,
  lowStock = false,
  stockCount,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const active = sorted[selectedImage] ?? sorted[0];

  if (!active) return null;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative aspect-4/5 max-h-90 sm:max-h-120 w-full mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-cyan-500/25 bg-white dark:bg-slate-900/40 shadow-lg dark:shadow-[0_0_40px_rgba(6,182,212,0.12)] backdrop-blur-md group flex items-center justify-center">
        <ImgTag
          priority
          loading="eager"
          src={resolveImageUrl(active.url)}
          alt={active.alt || title}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        {discountPercent > 0 && (
          <OffBtn value={discountPercent} name="تخفیف" />
        )}

        {lowStock && (
          <div className="absolute bottom-3 right-3 left-3 sm:bottom-4 sm:right-4 sm:left-4 bg-white/90 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/30 backdrop-blur-sm text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-amber-500 dark:text-amber-400" />
            <span className="font-medium">
              تنها {(stockCount ?? 0).toLocaleString("fa-IR")} عدد در انبار باقی مانده است!
            </span>
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center lg:justify-start px-1">
          {sorted.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => setSelectedImage(idx)}
              aria-label={img.alt || `تصویر ${idx + 1}`}
              className={`relative w-16 h-18 sm:w-24 sm:h-28 rounded-xl p-1 overflow-hidden border shrink-0 transition-all duration-300 ${selectedImage === idx
                ? "border-cyan-300 dark:border-cyan-300/40 shadow shadow-cyan-500/30 dark:shadow-cyan-400/20 scale-95"
                : "border-slate-200/80 cursor-pointer dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 opacity-60 hover:opacity-100"
                }`}
            >
              <ImgTag
                src={resolveImageUrl(img.url)}
                alt={img.alt || `${title} - ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
