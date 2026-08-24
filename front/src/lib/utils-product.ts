// utils.ts

import { ProductDetail, ProductVariant } from "@/types/types";
interface VariantForStock {
  quantity: number;
  saleCount: number;
}

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

/** یک مقدار مشخصه از attributes وریانت رو برمی‌گردونه، مثلاً size یا ram */
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

/**
 * @deprecated فقط برای سازگاری با کدهای قدیمی نگه‌داشته شده — کلید "size" رو هاردکد می‌کنه.
 * برای پیکر جدید از getVariantAttributeGroups + getAttributeOptions استفاده کن.
 */
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

/**
 * @deprecated فقط برای سازگاری با کدهای قدیمی نگه‌داشته شده — فقط size رو چک می‌کنه.
 * برای پیکر جدید از findVariantByAttributes استفاده کن.
 */
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

// ============================================================
// 🔽 توابع جدید — پشتیبانی از هر تعداد attribute پویا (سایز، رم، حافظه، ...)
// رنگ همیشه جدا مدیریت می‌شه (فیلد اختصاصی colorId/color)، این توابع فقط
// روی attributeهای دیگه (هرچی که attribute.key آن‌ها "color" نباشه) کار می‌کنن.
// ============================================================

export interface AttributeGroup {
  key: string;
  label: string;
}

/** همه‌ی attributeهای غیر-رنگ که بین وریانت‌های این محصول متغیرن، به هر تعداد و هر اسمی */
export function getVariantAttributeGroups(variants: ProductVariant[]): AttributeGroup[] {
  const map = new Map<string, string>();
  for (const v of variants) {
    for (const a of v.attributes) {
      if (a.attribute.key === "color") continue; // رنگ جدا مدیریت می‌شه
      if (!map.has(a.attribute.key)) {
        map.set(a.attribute.key, a.attribute.label);
      }
    }
  }
  return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
}

/**
 * مقادیر ممکن یک attribute خاص برای یک رنگ مشخص — بدون فیلتر کردن بر اساس بقیه
 * attributeهای انتخاب‌شده (چون attributeها لزوماً مستقل از هم نیستن؛ مثلاً یه محصول
 * ممکنه storage=512 فقط با ram=16 موجود باشه، نه هر ترکیبی). همیشه همه مقادیر
 * موجود برای این رنگ نشون داده می‌شن.
 */
export function getAttributeOptionsForColor(
  variants: ProductVariant[],
  colorId: string,
  groupKey: string
): { value: string; inStock: boolean }[] {
  const map = new Map<string, boolean>(); // value -> inStock (اگه حداقل یه وریانت با این مقدار موجود باشه)
  for (const v of variants) {
    if (v.colorId !== colorId) continue;
    const value = getAttributeValue(v, groupKey);
    if (!value) continue;
    const inStock = v.quantity > 0;
    map.set(value, (map.get(value) ?? false) || inStock);
  }
  return Array.from(map.entries()).map(([value, inStock]) => ({ value, inStock }));
}

/** وریانتی که دقیقاً با رنگ + همه‌ی attributeهای انتخاب‌شده مطابقت داره (اگه چنین ترکیبی وجود داشته باشه) */
export function findExactVariant(
  variants: ProductVariant[],
  colorId: string,
  selectedAttrs: Record<string, string | null>
): ProductVariant | undefined {
  return variants.find((v) => {
    if (v.colorId !== colorId) return false;
    return Object.entries(selectedAttrs).every(([key, value]) => !value || getAttributeValue(v, key) === value);
  });
}


export function calculateProductSoldPercent(variants: VariantForStock[]) {
  const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity ?? 0), 0);
  const totalSold = variants.reduce((sum, v) => sum + (v.saleCount ?? 0), 0);
  const totalStock = totalQuantity + totalSold;

  if (totalStock <= 0) {
    return { totalSold, totalQuantity, totalStock, percent: 0 };
  }

  const percent = Math.round((totalSold / totalStock) * 100);

  return {
    totalSold, // تعداد فروخته‌شده
    totalQuantity, // موجودی فعلی
    totalStock, // موجودی کل (فروخته‌شده + فعلی)
    percent, // درصد فروش، مثلاً 20
  };
}

/**
 * وقتی ترکیب انتخاب‌شده دقیقاً وجود نداره (مثلاً کاربر یه attribute رو عوض کرده که با
 * بقیه انتخاب‌های قبلی‌اش ترکیب واقعی نمی‌سازه)، نزدیک‌ترین وریانت واقعی رو پیدا می‌کنه:
 * اول حتماً باید مقدار همون attributeای که تازه عوض شده رعایت بشه، بعد از بین گزینه‌های
 * باقی‌مونده، اونی که بیشترین تطابق با بقیه انتخاب‌های فعلی داره انتخاب می‌شه.
 */
export function findClosestVariant(
  variants: ProductVariant[],
  colorId: string,
  selectedAttrs: Record<string, string | null>,
  changedGroupKey: string
): ProductVariant | undefined {
  const colorVariants = variants.filter((v) => v.colorId === colorId);
  const mustMatch = colorVariants.filter(
    (v) => getAttributeValue(v, changedGroupKey) === selectedAttrs[changedGroupKey]
  );
  if (mustMatch.length === 0) return colorVariants[0];
  if (mustMatch.length === 1) return mustMatch[0];

  let best = mustMatch[0];
  let bestScore = -1;
  for (const v of mustMatch) {
    let score = 0;
    for (const [key, value] of Object.entries(selectedAttrs)) {
      if (key === changedGroupKey || !value) continue;
      if (getAttributeValue(v, key) === value) score++;
    }
    if (score > bestScore || (score === bestScore && v.quantity > 0 && best.quantity <= 0)) {
      best = v;
      bestScore = score;
    }
  }
  return best;
}

/** پیش‌فرض یک رنگ: اولین وریانت موجودِ آن رنگ (یا اولین وریانت اگه هیچ‌کدوم موجود نبود) */
export function resolveDefaultAttributes(
  variants: ProductVariant[],
  colorId: string,
  groups: AttributeGroup[]
): Record<string, string | null> {
  const colorVariants = variants.filter((v) => v.colorId === colorId);
  const defaultVariant = colorVariants.find((v) => v.quantity > 0) ?? colorVariants[0];

  const result: Record<string, string | null> = {};
  for (const group of groups) {
    result[group.key] = defaultVariant ? getAttributeValue(defaultVariant, group.key) : null;
  }
  return result;
}

/** پیدا کردن وریانت دقیق بر اساس رنگ + همه‌ی attributeهای انتخاب‌شده (هر تعداد) */
export function findVariantByAttributes(
  variants: ProductVariant[],
  colorId: string,
  selectedAttrs: Record<string, string | null>
): ProductVariant | undefined {
  return findExactVariant(variants, colorId, selectedAttrs);
}

/** آیا اصلاً این محصول رنگ/attribute چندگانه داره یا فقط یک وریانت پیش‌فرض داره */
export function hasRealVariants(variants: ProductVariant[]): boolean {
  if (variants.length <= 1) return false;
  const colors = getUniqueColors(variants);
  if (colors.length > 1) return true;

  const groups = getVariantAttributeGroups(variants);
  return groups.some((g) => {
    const values = new Set(variants.map((v) => getAttributeValue(v, g.key)).filter(Boolean));
    return values.size > 1;
  });
}

/** قیمت پایه‌ی نمایشی محصول وقتی هنوز وریانتی انتخاب نشده (fallback) */
export function getProductBasePrice(product: ProductDetail) {
  return {
    original: Number(product.originalPrice),
    min: Number(product.minPrice),
  };
}