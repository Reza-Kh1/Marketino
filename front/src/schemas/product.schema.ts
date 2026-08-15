// src/schemas/product.schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(2, 'عنوان حداقل ۲ کاراکتر باشد'),
  titleEn: z.string().min(2, 'عنوان انگلیسی حداقل ۲ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات حداقل ۱۰ کاراکتر باشد'),
  descriptionEn: z.string().min(10, 'توضیحات انگلیسی حداقل ۱۰ کاراکتر باشد'),
  isFeatured: z.string().optional(),
  isDigital: z.string().optional(),
  condition: z.enum(['new', 'used']),
  categoryId: z.string().min(1, 'دسته‌بندی انتخاب شود'),
  brandId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaTitleEn: z.string().optional(),
  content: z.any().optional(),
  contentEn: z.any().optional(),
  images: z.any().optional(),
  status: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export const AttributeItemSchema = z.object({
  key: z.string().min(1, 'نام ویژگی الزامی است'),
  value: z.string().min(1, 'مقدار ویژگی الزامی است'),
});
export const ProductVariantSchema = z.object({
  name: z.string(),
  nameEn: z.string().optional(),
  image: z.string().optional(),
  discountId: z.string().optional(),
  quantity: z.number().int(),
  price: z.number().int(),
  attributes: z.array(AttributeItemSchema).default([]),
  attributesEn: z.array(AttributeItemSchema).default([]),
});

export type ProductVariantType = z.infer<typeof ProductVariantSchema>;