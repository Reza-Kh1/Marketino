"use client";

import React, { useMemo, useState } from "react";
import { Check, ShoppingCart, PackageX } from "lucide-react";
import DiscountBox from "./DiscountBox";
import { ProductVariant } from "@/types/types";
import {
  getUniqueColors,
  findVariantByAttributes,
  getVariantAttributeGroups,
  getAttributeOptionsForColor,
  getAttributeValue,
  findExactVariant,
  findClosestVariant,
  resolveDefaultAttributes,
  getVariantFinalPrice,
  getVariantDiscountPercent,
  isVariantDiscountActive,
  toToman,
  hasRealVariants,
} from "@/lib/utils-product";
import CustomButton from "../CustomButton";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useAddToCart, useCart } from "@/hooks/cart.hook";

interface ProductBuyBoxProps {
  variants: ProductVariant[];
  fallbackOriginalPrice: number;
  fallbackMinPrice: number;
  countdownSlot?: React.ReactNode;
  productId: string;
}

export default function ProductBuyBox({
  variants,
  fallbackOriginalPrice,
  fallbackMinPrice,
  countdownSlot,
  productId,
}: ProductBuyBoxProps) {
  const locale = useLocale();
  const colors = useMemo(() => getUniqueColors(variants), [variants]);
  const attributeGroups = useMemo(() => getVariantAttributeGroups(variants), [variants]);
  const { mutate: addToCart, isPending } = useAddToCart();
  const { data: cartData } = useCart();
  const showVariantPicker = hasRealVariants(variants);

  const [selectedColorId, setSelectedColorId] = useState(colors[0]?.colorId ?? "");
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string | null>>(() =>
    resolveDefaultAttributes(variants, colors[0]?.colorId ?? "", attributeGroups)
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => findVariantByAttributes(variants, selectedColorId, selectedAttrs) ?? variants[0],
    [variants, selectedColorId, selectedAttrs]
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
    setSelectedAttrs(resolveDefaultAttributes(variants, colorId, attributeGroups));
    setQuantity(1);
  }

  function handleAttributeSelect(groupKey: string, value: string) {
    const tentative = { ...selectedAttrs, [groupKey]: value };
    const exact = findExactVariant(variants, selectedColorId, tentative);
    const resolved = exact ?? findClosestVariant(variants, selectedColorId, tentative, groupKey);
    if (!resolved) return;
    const nextAttrs: Record<string, string | null> = {};
    for (const group of attributeGroups) {
      nextAttrs[group.key] = getAttributeValue(resolved, group.key);
    }
    setSelectedAttrs(nextAttrs);
    setQuantity(1);
  }

  function isLightColorHex(hexCode: string): boolean {
    const hex = hexCode?.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  const addCart = () => {
    addToCart({
      productId: productId,
      quantity: 1,
      variantId: selectedVariant.id,
    });
  };

  const checkCart = (variantId: string) => {
    const check = cartData?.carts.some((item) => {
      return item.variantId === variantId;
    });
    return check;
  };
  return (
    <div className="space-y-4 sm:space-y-6">

      {showVariantPicker && colors.length > 1 && (
        <div className="space-y-2 sm:space-y-3">
          <label className="text-xs sm:text-sm flex items-center gap-1.5 font-bold">
            رنگ انتخابی:
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">
              {colors?.find((c) => c?.colorId === selectedColorId)?.name}
            </span>
          </label>
          <div className="flex gap-2.5 sm:gap-3">
            {colors?.map((color) => {
              if (!color.colorId) return
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
                    <div
                      className={`absolute inset-0 rounded-lg flex items-center justify-center ${isLightColor ? "bg-black/10" : "bg-white/10"
                        }`}
                    >
                      <Check
                        className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg ${isLightColor ? "text-slate-800" : "text-white"
                          }`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {showVariantPicker &&
        attributeGroups.map((group) => {
          const options = getAttributeOptionsForColor(variants, selectedColorId, group.key);
          if (options.length === 0) return null;

          return (
            <div key={group.key} className="space-y-2 sm:space-y-3">
              <span className="text-xs sm:text-sm font-bold">انتخاب {group.label}:</span>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {options.map(({ value, inStock: optionInStock }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!optionInStock}
                    onClick={() => handleAttributeSelect(group.key, value)}
                    className={`min-w-12 h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 font-black text-xs sm:text-sm transition-all duration-300 ${selectedAttrs[group.key] === value
                        ? "border-cyan-700 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.25)] scale-105"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      } ${!optionInStock ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

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
        <CustomButton
          onClick={addCart}
          isPending={isPending}
          classDiv="w-full"
          name={inStock ? (checkCart(selectedVariant?.id) ? "در سبد شماست" : "افزودن به سبد") : "ناموجود"}
          disabled={!inStock || checkCart(selectedVariant?.id)}
          iconEnd={inStock ? <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> : <PackageX className="w-4 h-4 sm:w-5 sm:h-5" />}
          data-variant-id={selectedVariant?.id}
          type="button"
          color="neon"
          data-quantity={quantity}
        />
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
        <CustomButton
          onClick={addCart}
          isPending={isPending}
          classDiv="w-full"
          className={cn(locale === "en" ? "ml-auto" : "mr-auto")}
          name={inStock ? (checkCart(selectedVariant?.id) ? "در سبد شماست" : "افزودن به سبد") : "ناموجود"}
          disabled={!inStock || checkCart(selectedVariant?.id)}
          iconEnd={<ShoppingCart className="w-4 h-4" />}
          data-variant-id={selectedVariant?.id}
          type="button"
          color="neon"
          data-quantity={quantity}
        />
      </div>
    </div>
  );
}