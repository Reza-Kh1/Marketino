"use client";

import React, { useMemo, useState } from "react";
import { Check, ShoppingCart, PackageX } from "lucide-react";
import DiscountBox from "./DiscountBox";
import { ProductVariant } from "@/types/types";
import { getUniqueColors, getSizesForColor, findVariant, getVariantFinalPrice, getVariantDiscountPercent, isVariantDiscountActive, toToman, hasRealVariants, } from "@/lib/utils-product";

interface ProductBuyBoxProps {
  variants: ProductVariant[];
  fallbackOriginalPrice: number;
  fallbackMinPrice: number;
  countdownSlot?: React.ReactNode;
}

export default function ProductBuyBox({
  variants,
  fallbackOriginalPrice,
  fallbackMinPrice,
  countdownSlot,
}: ProductBuyBoxProps) {
  const colors = useMemo(() => getUniqueColors(variants), [variants]);
  const showVariantPicker = hasRealVariants(variants);
  const [selectedColorId, setSelectedColorId] = useState(colors[0]?.colorId ?? "");
  const sizes = useMemo(
    () => getSizesForColor(variants, selectedColorId),
    [variants, selectedColorId]
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0]?.size ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => findVariant(variants, selectedColorId, selectedSize) ?? variants[0],
    [variants, selectedColorId, selectedSize]
  );

  const inStock = (selectedVariant?.quantity ?? 0) > 0;
  const lowStock = inStock && (selectedVariant?.quantity ?? 0) <= 5;

  const finalPrice = selectedVariant
    ? getVariantFinalPrice(selectedVariant)
    : fallbackMinPrice;
  const originalPrice = selectedVariant ? Number(selectedVariant.price) : fallbackOriginalPrice;
  const discountPercent = selectedVariant ? getVariantDiscountPercent(selectedVariant) : 0;
  const discountActive = selectedVariant ? isVariantDiscountActive(selectedVariant) : false;

  function handleColorSelect(colorId: string) {
    setSelectedColorId(colorId);
    const nextSizes = getSizesForColor(variants, colorId);
    setSelectedSize(nextSizes[0]?.size ?? null);
    setQuantity(1);
  }
  function isLightColorHex(hexCode: string): boolean {
    const hex = hexCode.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {showVariantPicker && colors.length > 1 && (
        <div className="space-y-2 sm:space-y-3">
          <label className="text-xs sm:text-sm flex items-center gap-1.5 font-bold">
            رنگ انتخابی:
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">
              {colors.find((c) => c.colorId === selectedColorId)?.name}
            </span>
          </label>
          <div className="flex gap-2.5 sm:gap-3">
            {colors.map((color) => {
              const colorHasStock = variants.some(
                (v) => v.colorId === color.colorId && v.quantity > 0
              );
              const isLightColor = isLightColorHex(color.hexCode);
              return (
                <button
                  key={color.colorId}
                  type="button"
                  disabled={!colorHasStock}
                  onClick={() => handleColorSelect(color.colorId)}
                  title={color.name}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg shadow-lg border flex items-center justify-center transition-all relative ${selectedColorId === color.colorId
                    ? "ring-1 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-cyan-500 scale-110 shadow-cyan-400/20"
                    : "ring-1 cursor-pointer ring-slate-200/50 dark:ring-slate-700/50 hover:ring-cyan-400/50"
                    } ${!colorHasStock ? "opacity-30 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{ backgroundColor: color.hexCode }}
                >
                  {selectedColorId === color.colorId && (
                    <div className={`absolute inset-0 rounded-lg flex items-center justify-center ${isLightColor ? "bg-black/10" : "bg-white/10"
                      }`}>
                      <Check className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg ${isLightColor ? "text-slate-800" : "text-white"
                        }`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {showVariantPicker && sizes.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <span className="text-xs sm:text-sm font-bold">انتخاب سایز:</span>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {sizes.map(({ size, variant }) => (
              <button
                key={size}
                type="button"
                disabled={variant.quantity <= 0}
                onClick={() => {
                  setSelectedSize(size);
                  setQuantity(1);
                }}
                className={`w-12 h-10 sm:w-14 sm:h-12 rounded-lg sm:rounded-xl border-2 font-black text-xs sm:text-sm transition-all duration-300 ${selectedSize === size
                  ? "border-cyan-700 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.25)] scale-105"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                  } ${variant.quantity <= 0 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BUYING CARD */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-lg dark:shadow-[0_0_30px_rgba(0,0,0,0.6)] space-y-4 sm:space-y-5">
        {discountActive && (
          <DiscountBox
            originalPrice={originalPrice}
            finalPrice={finalPrice}
            percent={discountPercent}
            countdownSlot={countdownSlot}
          />
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 block mb-1">
              قیمت نهایی مصرف‌کننده
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                {toToman(finalPrice)}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-cyan-400/80">
                تومان
              </span>
              {discountActive && (
                <span className="text-xs sm:text-sm text-slate-400 line-through decoration-rose-500/60 mr-1.5">
                  {toToman(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {!inStock && (
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950/60 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition-colors text-slate-600 dark:text-slate-300"
              >
                -
              </button>
              <span className="px-3 py-2 sm:px-4 sm:py-2.5 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                {quantity.toLocaleString("fa-IR")}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(selectedVariant?.quantity ?? q, q + 1))
                }
                className="px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition-colors text-slate-600 dark:text-slate-300"
              >
                +
              </button>
            </div>
          )}
        </div>

        {lowStock && (
          <p className="text-[11px] sm:text-xs text-amber-500 font-medium">
            تنها {(selectedVariant?.quantity ?? 0).toLocaleString("fa-IR")} عدد باقی مانده
          </p>
        )}

        {/* دکمه‌ی افزودن به سبد - منطقش با خودته */}
        <button
          type="button"
          disabled={!inStock}
          data-variant-id={selectedVariant?.id}
          data-quantity={quantity}
          className="w-full cursor-pointer py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-linear-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-[0.99] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {inStock ? (
            <>
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              افزودن به سبد خرید
            </>
          ) : (
            <>
              <PackageX className="w-4 h-4 sm:w-5 sm:h-5" />
              ناموجود
            </>
          )}
        </button>
      </div>

      {/* نوار خرید چسبان موبایل - Badge تخفیف */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-2 bg-white/95 dark:bg-[#03050c]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 z-50 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-400 block">قیمت محصول</span>
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 dark:text-cyan-400">
                {toToman(finalPrice)}
              </span>
              <span className="text-[10px] font-bold text-cyan-500">تومان</span>
            </div>

            {discountActive && (
              <>
                <span className="text-[10px] text-slate-400 line-through">
                  {toToman(originalPrice)}
                </span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                  {discountPercent.toLocaleString("fa-IR")}%
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!inStock}
          data-variant-id={selectedVariant?.id}
          data-quantity={quantity}
          className="py-2.5 px-4 rounded-lg w-2/6 bg-linear-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          {inStock ? "افزودن به سبد" : "ناموجود"}
        </button>
      </div>
    </div>
  );
}
