// utils.ts

import { ProductDetail, ProductVariant } from "@/types/types";

/** عدد رو با جداکننده و ارقام فارسی نمایش می‌ده */
export function toToman(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return n.toLocaleString("fa-IR");
}

/** آدرس نهایی تصویر روی CDN. اگه url از قبل کامل بود (http) دست‌نخورده برمی‌گردونه */
export function resolveImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_CDN_URL ?? "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/** آیا تخفیف این وریانت الان فعاله؟ */
export function isVariantDiscountActive(variant: ProductVariant): boolean {
  return Boolean(variant.discount?.isActive);
}

/** قیمت نهایی وریانت بعد از اعمال تخفیف (اگه فعال باشه) */
export function getVariantFinalPrice(variant: ProductVariant): number {
  const base = Number(variant.price);
  if (!isVariantDiscountActive(variant) || !variant.discount) return base;

  if (variant.discount.type === "percentage") {
    return Math.round(base - (base * variant.discount.value) / 100);
  }
  return Math.max(0, base - variant.discount.value);
}

/** درصد تخفیف نمایشی وریانت (برای بج قرمز) */
export function getVariantDiscountPercent(variant: ProductVariant): number {
  if (!isVariantDiscountActive(variant) || !variant.discount) return 0;
  if (variant.discount.type === "percentage") return variant.discount.value;

  const base = Number(variant.price);
  if (!base) return 0;
  return Math.round((variant.discount.value / base) * 100);
}

/** یک مقدار مشخصه از attributes وریانت رو برمی‌گردونه، مثلاً size */
export function getAttributeValue(variant: ProductVariant, key: string): string | null {
  return variant.attributes.find((a) => a.attribute.key === key)?.value ?? null;
}

/** لیست رنگ‌های یکتای موجود بین وریانت‌ها */
export function getUniqueColors(variants: ProductVariant[]) {
  const map = new Map<string, ProductVariant["color"] & { colorId: string }>();
  for (const v of variants) {
    if (!map.has(v.colorId)) {
      map.set(v.colorId, { ...v.color, colorId: v.colorId });
    }
  }
  return Array.from(map.values());
}

/** لیست سایزهای یکتای یک رنگ خاص (بر اساس attributes.key === 'size') */
export function getSizesForColor(variants: ProductVariant[], colorId: string) {
  const sizes = new Map<string, { size: string; variant: ProductVariant }>();
  for (const v of variants) {
    if (v.colorId !== colorId) continue;
    const size = getAttributeValue(v, "size");
    if (size && !sizes.has(size)) {
      sizes.set(size, { size, variant: v });
    }
  }
  return Array.from(sizes.values());
}

/** پیدا کردن وریانت دقیق بر اساس رنگ + سایز انتخابی */
export function findVariant(
  variants: ProductVariant[],
  colorId: string,
  size: string | null
): ProductVariant | undefined {
  return variants.find((v) => {
    if (v.colorId !== colorId) return false;
    if (!size) return true;
    return getAttributeValue(v, "size") === size;
  });
}

/** آیا اصلاً این محصول رنگ/سایز چندگانه داره یا فقط یک وریانت پیش‌فرض داره */
export function hasRealVariants(variants: ProductVariant[]): boolean {
  if (variants.length <= 1) return false;
  const colors = getUniqueColors(variants);
  const hasMultipleColors = colors.length > 1;
  const hasSizes = variants.some((v) => getAttributeValue(v, "size"));
  return hasMultipleColors || hasSizes;
}

/** قیمت پایه‌ی نمایشی محصول وقتی هنوز وریانتی انتخاب نشده (fallback) */
export function getProductBasePrice(product: ProductDetail) {
  return {
    original: Number(product.originalPrice),
    min: Number(product.minPrice),
  };
}
