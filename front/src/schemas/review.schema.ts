import { ReviewModerateStatus } from "@/services/review.service";
import { z } from "zod";

// ============ اسکیماهای پایه ============

export const ReviewModerateSchema = z.enum([
  ReviewModerateStatus.approve,
  ReviewModerateStatus.reject,
]);

// ============ اسکیماهای DTO ============

// ثبت نظر جدید
export const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string()
    .min(1, "متن نظر الزامی است")
    .max(2000, "متن نظر نباید بیشتر از 2000 کاراکتر باشد"),
  productId: z.string().min(1, "شناسه محصول الزامی است"),
  orderId: z.string().optional().nullable(),
});

// پاسخ به نظر
export const AnswerReviewSchema = z.object({
  answer: z.string()
    .min(1, "متن پاسخ الزامی است")
    .max(2000, "متن پاسخ نباید بیشتر از 2000 کاراکتر باشد"),
});

// ============ تایپ‌های فرم ============

export type CreateReviewFormData = z.infer<typeof CreateReviewSchema>;
export type AnswerReviewFormData = z.infer<typeof AnswerReviewSchema>;