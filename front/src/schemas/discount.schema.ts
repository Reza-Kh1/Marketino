import { string, z } from "zod";

export const discountSchema = z
    .object({
        code: z
            .string()
            .trim()
            .min(3, "کد تخفیف باید حداقل ۳ کاراکتر باشد")
            .max(50, "کد تخفیف بیش از حد طولانی است"),
        type: z.enum(["percentage", "fixed"], {
            error: "نوع تخفیف را انتخاب کنید",
        }),
        value: z
            .number({
                error: "مقدار تخفیف الزامی است",
            })
            .positive("مقدار تخفیف باید بیشتر از صفر باشد"),
        minOrderAmount: z
            .number()
            .min(0, "حداقل مبلغ سفارش نمی‌تواند منفی باشد")
            .default(0),
        maxDiscount: z
            .number()
            .min(0, "سقف تخفیف نمی‌تواند منفی باشد")
            .optional(),
        usageLimit: z
            .number()
            .int("باید عدد صحیح باشد")
            .min(0)
            .default(0),
        perUserLimit: z
            .number()
            .int("باید عدد صحیح باشد")
            .min(0)
            .default(0),
        storeId: z.array(z.string()).optional(),
        startsAt: z.coerce.date({
            error: "تاریخ شروع الزامی است",
        }),
        endsAt: z.coerce.date({
            error: "تاریخ پایان الزامی است",
        }),
        status: z.enum(["PLATFORM", "STORE", "COMMISSION", "PRODUCT"], {
            error: "نوع تخفیف را انتخاب کنید",
        }),
        isActive: z.boolean().default(true),
        description: z
            .string()
            .max(500, "توضیحات بیش از حد طولانی است")
            .optional(),
    })
    .refine(
        (data) => data.endsAt > data.startsAt,
        {
            message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
            path: ["endsAt"],
        }
    )
    .refine(
        (data) =>
            data.type !== "percentage" ||
            (data.value > 0 && data.value <= 100),
        {
            message: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد",
            path: ["value"],
        }
    );
type DiscountFormType = z.infer<typeof discountSchema>;