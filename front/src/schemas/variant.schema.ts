import { z } from "zod";

// اسکیما ایجاد AttributeDefinition
export const CreateAttributeDefinitionSchema = z.object({
    key: z.string()
        .min(1, "کلید الزامی است")
        .max(50, "کلید نباید بیشتر از 50 کاراکتر باشد"),
    label: z.string()
        .min(1, "برچسب الزامی است")
        .max(100, "برچسب نباید بیشتر از 100 کاراکتر باشد"),
    categoryIds: z.array(z.string())
        .min(1, "حداقل یک دسته‌بندی انتخاب کنید"),
});

// اسکیما ایجاد Variant
export const CreateVariantSchema = z.object({
    name: z.string()
        .min(1, "نام الزامی است")
        .max(200, "نام نباید بیشتر از 200 کاراکتر باشد"),
    nameEn: z.string().optional(),
    price: z.number()
        .min(0, "قیمت نمی‌تواند منفی باشد"),
    quantity: z.number()
        .min(0, "تعداد نمی‌تواند منفی باشد"),
    colorId: z.string()
        .min(1, "انتخاب رنگ الزامی است"),
    productId: z.string()
        .min(1, "محصول الزامی است"),
    image: z.string().optional(),
    discountId: z.string().optional(),
});

// اسکیما ویرایش Variant
export const UpdateVariantSchema = z.object({
    name: z.string().optional(),
    nameEn: z.string().optional(),
    price: z.number().optional(),
    quantity: z.number().optional(),
    colorId: z.string().optional(),
    image: z.string().optional(),
    discountId: z.string().optional(),
});

// اسکیما ایجاد VariantAttribute
export const CreateVariantAttributeSchema = z.object({
    value: z.string()
        .min(1, "مقدار الزامی است"),
    variantId: z.string()
        .min(1, "آیدی واریانت الزامی است"),
    attributeId: z.string()
        .min(1, "آیدی اتریبیوت الزامی است"),
});

// تایپ‌های فرم
export type CreateAttributeDefinitionFormData = z.infer<typeof CreateAttributeDefinitionSchema>;
export type CreateVariantFormData = z.infer<typeof CreateVariantSchema>;
export type UpdateVariantFormData = z.infer<typeof UpdateVariantSchema>;
export type CreateVariantAttributeFormData = z.infer<typeof CreateVariantAttributeSchema>;