// stores.schema.ts
import { z } from 'zod';

export const storeFormSchema = z.object({
  name: z.string().min(2, 'نام فروشگاه الزامی است'),
  nameEn: z.string().optional().or(z.literal('')),
  slug: z.string().optional().or(z.literal('')),
  logo: z.string().optional().or(z.literal('')),
  banner: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  descriptionEn: z.string().optional().or(z.literal('')),
  businessType: z.string().optional().or(z.literal('')),
  nationalId: z.string().optional().or(z.literal('')),
  economicCode: z.string().optional().or(z.literal('')),
  provinceId: z.string().optional().or(z.literal('')),
  cityId: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  telegram: z.string().optional().or(z.literal('')),
  bale: z.string().optional().or(z.literal('')),
  shippingTime: z.string().optional().or(z.literal('')),
  whatsApp: z.string().optional().or(z.literal('')),
  robika: z.string().optional().or(z.literal('')),
  workingHours: z.string().optional().or(z.literal('')),
  commissionRate: z.int().optional().or(z.literal('')),
  statusReason: z.string().optional().or(z.literal('')),
  hasPhysicalStore: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  isVerified: z.string().optional().or(z.literal('')),
});

export const storeReviewFormSchema = z.object({
  rating: z.number().min(1, 'امتیاز حداقل ۱ است').max(5, 'امتیاز حداکثر ۵ است'),
  body: z.string().min(3, 'متن نظر حداقل ۳ کاراکتر است'),
  productQuality: z.number().min(1).max(5),
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;
export type StoreReviewFormValues = z.infer<typeof storeReviewFormSchema>;