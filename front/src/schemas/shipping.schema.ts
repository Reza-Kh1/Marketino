import { z } from "zod";

// ==========================================
// 1. Base Shipping Method Schemas
// ==========================================
export const createShippingMethodFormSchema = z.object({
  name: z
    .string()
    .min(1, "نام روش ارسال نمی‌تواند خالی باشد")
    .max(100, "نام روش ارسال حداکثر ۱۰۰ کاراکتر باشد"),
  nameEn: z.string().optional(),
  isActive: z.boolean().optional(),
  isFreeMethod: z.boolean().optional(),
});

export type CreateShippingMethodFormSchema = z.infer<typeof createShippingMethodFormSchema>;

export const shippingMethodSchema = createShippingMethodFormSchema.extend({
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ShippingMethodSchema = z.infer<typeof shippingMethodSchema>;

// ==========================================
// 2. Store Shipping Schemas
// ==========================================
export const updateStoreShippingFormSchema = z.object({
  description: z.string().min(1, "توضیحات نمی‌تواند خالی باشد"),
  descriptionEn: z.string().optional(),
  isActive: z.boolean().default(true),
  phrase: z.string().optional(),
  minDays: z
    .number({ message: "حداقل روز باید عدد باشد" })
    .min(0, "حداقل روز نمی‌تواند منفی باشد"),
  maxDays: z
    .number({ message: "حداکثر روز باید عدد باشد" })
    .min(0, "حداکثر روز نمی‌تواند منفی باشد"),
  defaultPrice: z.number().optional(),
});

export type UpdateStoreShippingFormSchema = z.infer<typeof updateStoreShippingFormSchema>;

export const createStoreShippingFormSchema = updateStoreShippingFormSchema.extend({
  shippingMethodId: z.string().min(1, "روش ارسال اصلی الزامی است"),
});

export type CreateStoreShippingFormSchema = z.infer<typeof createStoreShippingFormSchema>;

export const storeShippingSchema = createStoreShippingFormSchema.extend({
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type StoreShippingSchema = z.infer<typeof storeShippingSchema>;

// ==========================================
// 3. Store Shipping Rate Schemas
// ==========================================
export const createStoreShippingRateFormSchema = z.object({
  price: z
    .number({ message: "مبلغ باید عدد باشد" })
    .min(0, "مبلغ نمی‌تواند منفی باشد"),
  deliveryMaxDays: z
    .number({ message: "حداکثر زمان ارسال باید عدد باشد" })
    .min(0, "حداکثر زمان ارسال نمی‌تواند منفی باشد"),
  storeShippingMethodId: z.string().min(1, "روش ارسال فروشگاه الزامی است"),
  provinceId: z.string().min(1, "استان الزامی است"),
});

export type CreateStoreShippingRateFormSchema = z.infer<typeof createStoreShippingRateFormSchema>;

export const storeShippingRateSchema = createStoreShippingRateFormSchema.extend({
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type StoreShippingRateSchema = z.infer<typeof storeShippingRateSchema>;