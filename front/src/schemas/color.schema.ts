import { z } from "zod";

export const ColorSchema = z.object({
    name: z.string()
        .min(1, "نام رنگ الزامی است")
        .max(50, "نام رنگ نباید بیشتر از 50 کاراکتر باشد"),
    nameEn: z.string()
        .min(1, "نام انگلیسی رنگ الزامی است")
        .max(50, "نام انگلیسی نباید بیشتر از 50 کاراکتر باشد"),
    hexCode: z.string()
        .min(1, "کد رنگ الزامی است")
        .regex(/^#?[0-9A-Fa-f]{6}$/, "کد رنگ باید به صورت HEX باشد (مثال: #FF5733)"),
    slug: z.string()
        .min(1, "اسلاگ الزامی است"),
});

export type ColorFormData = z.infer<typeof ColorSchema>;