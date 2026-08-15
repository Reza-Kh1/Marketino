import { reviewService, ReviewEntity, ReviewResponse, CreateReviewDTO, ModerateReviewDTO, AnswerReviewDTO, SearchReviewDTO } from "@/services/review.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const REVIEW_KEYS = {
  all: ["reviews"] as const,
  lists: () => [...REVIEW_KEYS.all, "list"] as const,
  listWithFilters: (filters: SearchReviewDTO) => [...REVIEW_KEYS.lists(), filters] as const,
  admin: () => [...REVIEW_KEYS.all, "admin"] as const,
  adminFilters: (filters: SearchReviewDTO) => [...REVIEW_KEYS.admin(), filters] as const,
  product: (productId: string) => [...REVIEW_KEYS.all, "product", productId] as const,
  detail: (id: string) => [...REVIEW_KEYS.all, "detail", id] as const,
} as const;

// ============ هوک‌های Query ============

// دریافت تمام نظرات برای پنل ادمین
export function useAdminReviews(params?: SearchReviewDTO) {
  return useQuery<ReviewResponse>({
    queryKey: REVIEW_KEYS.adminFilters(params || {}),
    queryFn: () => reviewService.getAdminAll(params),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// دریافت نظرات تاییدشده یک محصول
export function useProductReviews(productId: string, params?: SearchReviewDTO) {
  return useQuery<ReviewResponse>({
    queryKey: REVIEW_KEYS.product(productId),
    queryFn: () => reviewService.getByProduct(productId, params),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// دریافت یک نظر
export function useReview(id?: string) {
  return useQuery<ReviewEntity | null>({
    queryKey: REVIEW_KEYS.detail(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      const data = await reviewService.getAdminAll();
      return data.reviews.find(r => r.id === id) ?? null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============ هوک‌های Mutation ============

// ثبت نظر جدید
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDTO) => reviewService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
      toast.success("نظر شما با موفقیت ثبت شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ثبت نظر"];
      list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
    },
  });
}

// تایید یا رد نظر
export function useModerateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModerateReviewDTO }) => reviewService.moderate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.detail(variables.id) });
      toast.success("وضعیت نظر با موفقیت تغییر کرد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در تغییر وضعیت"];
      list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
    },
  });
}

// پاسخ به نظر
export function useAnswerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AnswerReviewDTO }) => reviewService.answer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.detail(variables.id) });
      toast.success("پاسخ با موفقیت ثبت شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ارسال پاسخ"];
      list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
    },
  });
}

// حذف نظر
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
      toast.success("نظر با موفقیت حذف شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در حذف"];
      list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
    },
  });
}