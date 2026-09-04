import { z } from "zod";

export const cityFormSchema = z.object({
    name: z
        .string()
        .min(1, "نام شهر نمی‌تواند خالی باشد")
        .max(50, "نام شهر حداکثر 50 کاراکتر باشد"),
    nameEn: z
        .string()
        .optional(),
    provinceId: z.string().min(1, "استان نمی‌تواند خالی باشد")
});

export type CityFormSchema = z.infer<typeof cityFormSchema>;

export const citySchema = cityFormSchema.extend({
    id: z.string().optional(),
});

export type CitySchema = z.infer<typeof citySchema>;

export const provinceFormSchema = z.object({
    name: z
        .string()
        .min(1, "نام استان نمی‌تواند خالی باشد")
        .max(50, "نام استان حداکثر 50 کاراکتر باشد"),
    nameEn: z
        .string()
        .optional(),
});

export type ProvinceFormSchema = z.infer<typeof provinceFormSchema>;

export const provinceSchema = provinceFormSchema.extend({
    id: z.string().optional(),
});

export type ProvinceSchema = z.infer<typeof provinceSchema>;