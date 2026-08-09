// schemas/report.schema.ts
import { z } from "zod";

export const ReportStatusEnum = z.enum([
  "PENDING",
  "RESOLVED",
  "CLOSED",
]);

export const getReportSchema = (t: (key: string) => string) => {
  return z.object({
    title: z
      .string()
      .min(1, t("errors.title_required")),

    nameSeller: z.string().optional(),

    orderCode: z.string().optional(),

    content: z
      .string()
      .min(1, t("errors.content_required"))
      .min(10, t("errors.content_min")),

    images: z.array(z.any()).optional().default([]),
  });
};

export type CreateReportFormDTO = z.infer<
  ReturnType<typeof getReportSchema>
>;