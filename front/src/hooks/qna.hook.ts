// hooks/use-qna.ts
import { qnaService, QnAEntity, CreateQnaDTO, UpdateQnaDTO, SearchQnaDTO, QnaResponse } from "@/services/qna.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const QNA_KEYS = {
  all: ["qna"] as const,
  lists: () => [...QNA_KEYS.all, "list"] as const,
  listWithFilters: (filters: any) => [...QNA_KEYS.lists(), filters] as const,
  product: (productId: string) => [...QNA_KEYS.all, "product", productId] as const,
  pending: () => [...QNA_KEYS.all, "pending"] as const,
  admin: () => [...QNA_KEYS.all, "admin"] as const,
  details: () => [...QNA_KEYS.all, "detail"] as const,
  detail: (id?: string) => [...QNA_KEYS.details(), id] as const,
} as const;

// ============================================
// Queries
// ============================================

// دریافت Q&A محصول (عمومی)
export function useProductQnA(productId: string, params?: SearchQnaDTO) {
  return useQuery<QnaResponse>({
    queryKey: QNA_KEYS.product(productId),
    queryFn: () => qnaService.getByProduct(productId, params),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// دریافت Q&A ادمین
export function useAdminQnA(params?: SearchQnaDTO) {
  return useQuery<QnaResponse>({
    queryKey: QNA_KEYS.listWithFilters(params),
    queryFn: () => qnaService.getAdmin(params),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// دریافت یک Q&A
export function useQnA(id?: string) {
  return useQuery<QnAEntity | null>({
    queryKey: QNA_KEYS.detail(id),
    queryFn: () => qnaService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Mutations
// ============================================

// ایجاد پرسش یا پاسخ
export function useCreateQnA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQnaDTO) => qnaService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QNA_KEYS.all });
      toast.success("اطلاعات با موفقیت ایجاد شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد "];
      list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
    },
  });
}

// ویرایش پرسش یا پاسخ
export function useUpdateQnA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQnaDTO }) => qnaService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QNA_KEYS.all });
      toast.success("اطلاعات با موفقیت بروزرسانی شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در بروزرسانی"];
      list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
    },
  });
}

// حذف پرسش یا پاسخ
export function useDeleteQnA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => qnaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QNA_KEYS.all });
      toast.success("اطلاعات با موفقیت حذف شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در حذف"];
      list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
    },
  });
}
