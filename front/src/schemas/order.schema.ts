import { string, z } from "zod";

export const checkoutSchema = z
    .object({
        shippingName: z
            .string()
            .trim()
            .min(3, 'نام گیرنده باید حداقل ۳ کاراکتر باشد')
            .max(100, 'نام گیرنده نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'),
        shippingPhone: z
            .string()
            .trim()
            .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
        shippingProvince: z
            .string()
            .trim()
            .min(2, 'استان را انتخاب کنید')
            .max(50, 'نام استان معتبر نیست'),
        shippingCity: z
            .string()
            .trim()
            .min(2, 'شهر را انتخاب کنید')
            .max(50, 'نام شهر معتبر نیست'),
        shippingAddress: z
            .string()
            .trim()
            .min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد')
            .max(500, 'آدرس نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد'),
        shippingPostal: z
            .string()
            .trim()
            .regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
        status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"], {
            error: "نوع سفارش را انتخاب کنید",
        }),
        paymentStatus: z.enum(["pending", "paid", "refunded"], {
            error: "نوع وضعیت پرداخت را انتخاب کنید",
        })
    })
type CheckoutFormType = z.infer<typeof checkoutSchema>;