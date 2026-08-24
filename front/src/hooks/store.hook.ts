
// stores.hooks.ts
import { AllStoreResponseEntity, FormStoreDTO, FormStoreReviewDTO, Store, storeService } from '@/services/store.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const STORE_KEYS = {
  all: ['stores'] as const,
  allAdmin: ['storesAdmin'] as const,
  lists: () => [...STORE_KEYS.all, 'list'] as const,
  listWithFilters: (filters: Record<string, any>) => [...STORE_KEYS.lists(), filters] as const,
  listWithFiltersAdmin: (filters: Record<string, any>) => [...STORE_KEYS.allAdmin, filters] as const,
  details: () => [...STORE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...STORE_KEYS.details(), id] as const,
  reviews: (storeId: string) => [...STORE_KEYS.detail(storeId), 'reviews'] as const,
} as const;

export function useStores(params?: Record<string, any>) {
  return useQuery<AllStoreResponseEntity>({
    queryKey: STORE_KEYS.listWithFilters(params || {}),
    queryFn: () => storeService.list(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useStoresAdmin(filter: any) {
  return useQuery<AllStoreResponseEntity>({
    queryKey: STORE_KEYS.listWithFiltersAdmin(filter),
    queryFn: () => storeService.listAdmin(filter),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useStore(slug: string) {
  return useQuery<Store>({
    queryKey: STORE_KEYS.detail(slug),
    queryFn: () => storeService.getBySlug(slug),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!slug,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormStoreDTO) => storeService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.allAdmin });
      qc.invalidateQueries({ queryKey: STORE_KEYS.all });
      toast.success('فروشگاه با موفقیت ایجاد شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در ایجاد فروشگاه'),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormStoreDTO }) => storeService.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.allAdmin });
      qc.invalidateQueries({ queryKey: STORE_KEYS.all });
      toast.success('فروشگاه با موفقیت بروزرسانی شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در ویرایش فروشگاه'),
  });
}

const errorhandler = (error: any, msg: string) => {
  const messages = error?.response?.data?.message;
  const list = Array.isArray(messages) ? messages : [messages ?? msg];
  list.forEach((msg: string) => {
    toast.error(msg, { position: "top-center" });
  });
}

export function useUpdateStoreStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => storeService.updateStatus(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.allAdmin });
      qc.invalidateQueries({ queryKey: STORE_KEYS.all });
      toast.success('وضعیت فروشگاه بروزرسانی شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در ویرایش فروشگاه'),
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.allAdmin });
      qc.invalidateQueries({ queryKey: STORE_KEYS.all });
      toast.success('فروشگاه حذف شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در حذف فروشگاه'),
  });
}

export function useCreateStoreReview(storeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormStoreReviewDTO) => storeService.createReview(storeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.detail(storeId) });
      qc.invalidateQueries({ queryKey: STORE_KEYS.reviews(storeId) });
      toast.success('نظر شما ثبت شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در ثبت نظر'),
  });
}

export function useApproveStoreReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => storeService.approveReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.all });
      toast.success('نظر تایید شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در تایید نظر'),
  });
}

export function useRejectStoreReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => storeService.rejectReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.all });
      toast.success('نظر رد شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در رد نظر'),
  });
}

export function useAnswerStoreReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, answer }: { reviewId: string; answer: string }) => storeService.answerReview(reviewId, answer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STORE_KEYS.all });
      toast.success('پاسخ ثبت شد');
    },
    onError: (err: any) => errorhandler(err, 'خطا در ثبت پاسخ'),
  });
}