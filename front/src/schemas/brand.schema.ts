import { z } from "zod";

export const BrandSchema = z.object({
    name: z.string(),
    nameEn: z.string(),
    slug: z.string(),
    logo: z.string().nullable().optional(),
    description: z.string().optional(),
    sortOrder: z.int().optional()
});

export type Brand = z.infer<typeof BrandSchema>;