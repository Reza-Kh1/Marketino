import { z } from "zod";

export const BrandSchema = z.object({
    name: z.string(),
    nameEn: z.string(),
    slug: z.string(),
    logo: z.string().nullable().optional(),
    description: z.string().optional(),
});

export type Brand = z.infer<typeof BrandSchema>;