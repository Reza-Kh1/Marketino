import { z } from "zod";

export const AddressSchema = z.object({
  title: z.string().optional().nullable(),
  fullName: z.string().min(1, "نام کامل الزامی است"),
  phone: z.string()
    .min(1, "شماره تلفن الزامی است")
    .regex(/^09[0-9]{9}$/, "شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود"),
  province: z.string().min(1, "استان الزامی است"),
  city: z.string().min(1, "شهر الزامی است"),
  address: z.string().min(1, "آدرس الزامی است"),
  postalCode: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  description: z.string().optional(),
  email: z.string().optional(),
});

export type FormAddressSchema = z.infer<typeof AddressSchema>;