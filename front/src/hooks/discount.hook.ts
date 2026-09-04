// hooks/discount.hook.ts
import { AllDiscount } from "@/lib/api";
import { AllDiscountResponse, DiscountCreateDto, discountService, ListDiscountType, ValidateDiscountDto } from "@/services/discount.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorhandler } from "./store.hook";

// Query keys
const DISCOUNT_KEYS = {
    all: ["discount"] as const,
    lists: () => [...DISCOUNT_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...DISCOUNT_KEYS.lists(), filters] as const,
    listForSelect: () => [...DISCOUNT_KEYS.all, "select"] as const,
} as const;

// لیست تخفیف‌ها با فیلتر (برای ادمین)
export function useDiscounts(filters: Record<string, any>) {
    return useQuery<AllDiscountResponse>({
        queryKey: DISCOUNT_KEYS.listWithFilters(filters),
        queryFn: () => discountService.list(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// لیست ساده برای select (فقط id و code)
export function useDiscountsList() {
    return useQuery<ListDiscountType[]>({
        queryKey: DISCOUNT_KEYS.listForSelect(),
        queryFn: () => discountService.listDiscount(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// اعتبارسنجی کد تخفیف (برای فرانت)
export function useValidateDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ValidateDiscountDto) => discountService.validate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
        },
        // onError: (err) => errorhandler(err, 'خطای نامشخص')
    });
}

// ایجاد تخفیف جدید
export function useCreateDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: DiscountCreateDto) => discountService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success("کد تخفیف با موفقیت افزوده شد");
        },
        onError: (err) => errorhandler(err, 'خطای نامشخص')
    });
}

// ویرایش تخفیف
export function useUpdateDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data, id }: { data: DiscountCreateDto; id: string }) =>
            discountService.update(data, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success("کد تخفیف با موفقیت آپدیت شد");
        },
        onError: (err) => errorhandler(err, 'خطای نامشخص')
    });
}

// حذف تخفیف
export function useDeleteDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => discountService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success("کد تخفیف با موفقیت حذف شد");
        },
        onError: (err) => errorhandler(err, 'خطای نامشخص')
    });
}

// فعال/غیرفعال کردن تخفیف
export function useToggleDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => discountService.toggle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success("وضعیت تخفیف تغییر کرد");
        },
        onError: (err) => errorhandler(err, 'خطای نامشخص')
    });
}