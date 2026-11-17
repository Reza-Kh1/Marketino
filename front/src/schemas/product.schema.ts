// src/schemas/product.schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(2, 'عنوان حداقل ۲ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات حداقل ۱۰ کاراکتر باشد'),
  isFeatured: z.string().optional(),
  isDigital: z.string().optional(),
  condition: z.enum(['new', 'used']),
  categoryId: z.string().min(1, 'دسته‌بندی انتخاب شود'),
  brandId: z.string().optional(),
  metaTitle: z.string().optional(),
  content: z.any().optional(),
  images: z.any().optional(),
  status: z.string().optional(),
  storeId: z.string().optional(),
  slug: z.string().min(5, 'اسلاگ حداقل 5 کاراکتر باشد'),
});

export type ProductFormData = z.infer<typeof productSchema>;
export const AttributeItemSchema = z.object({
  key: z.string().min(1, 'نام ویژگی الزامی است'),
  value: z.string().min(1, 'مقدار ویژگی الزامی است'),
});
export const ProductVariantSchema = z.object({
  name: z.string(),
  image: z.string().optional(),
  discountId: z.string().optional(),
  quantity: z.number().int(),
  price: z.number().int(),
  attributes: z.array(AttributeItemSchema).default([]),
});

export type ProductVariantType = z.infer<typeof ProductVariantSchema>;