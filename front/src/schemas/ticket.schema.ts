import { TicketPriority, TicketStatus } from "@/services/ticket.service";
import { z } from "zod";

// ============ اسکیماهای پایه ============

export const TicketStatusSchema = z.enum([
  TicketStatus.PENDING,
  TicketStatus.WAITING,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
]);

export const TicketPrioritySchema = z.enum([
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.URGENT,
  TicketPriority.CRITICAL,
]);

// ============ اسکیماهای DTO ============

// ایجاد تیکت
export const CreateTicketSchema = z.object({
  title: z.string()
    .min(1, "عنوان تیکت الزامی است")
    .max(100, "عنوان تیکت نباید بیشتر از 100 کاراکتر باشد"),
  
  orderId: z.string()
    .optional()
    .nullable(),
  
  priority: TicketPrioritySchema
    .default(TicketPriority.MEDIUM),
  
  content: z.string()
    .min(1, "متن تیکت الزامی است")
    .max(5000, "متن تیکت نباید بیشتر از 5000 کاراکتر باشد"),
});

// افزودن پیام
export const AddMessageSchema = z.object({
  content: z.string()
    .min(1, "متن پیام الزامی است")
    .max(5000, "متن پیام نباید بیشتر از 5000 کاراکتر باشد"),
});

// ============ تایپ‌های فرم ============

export type TicketFormData = z.infer<typeof CreateTicketSchema>;
export type TicketMessageFormData = z.infer<typeof AddMessageSchema>;