import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().min(2, 'نام الزامی است'),
  slug: z.string().nullable().optional(),
  description: z.string().nullable().optional().or(z.literal('')),
  icon: z.string().nullable().optional().or(z.literal('')),
  image: z.string().nullable().optional().or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),
  isActive: z.string().default('true'),
  sortOrder: z.string().default('0'),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>