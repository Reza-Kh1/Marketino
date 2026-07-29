import { useAuth } from "@/lib/auth-context";
import { AllCartsEntity, CartDto, cartService } from "@/services/cart.service";
import { DiscountType } from "@/services/discount.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
const CART_KEYS = {
    all: ["cart"] as const,
    lists: () => [...CART_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...CART_KEYS.lists(), filters] as const,
    details: () => [...CART_KEYS.all, "detail"] as const,
    detail: (id: string) => [...CART_KEYS.details(), id] as const,
    total: () => [...CART_KEYS.all, "total"] as const,
} as const;

// ============================================
// ۱. دریافت سبد خرید
// ============================================
export function useCart() {
    const { user } = useAuth()
    return useQuery<AllCartsEntity>({
        queryKey: CART_KEYS.all,
        queryFn: () => cartService.list(),
        staleTime: 5 * 60 * 1000, // 5 دقیقه
        refetchOnWindowFocus: false,
        enabled: !!user
    });
}


export const discountChange = (price: number, discount: DiscountType | null) => {
    if (!discount) return {
        total: price,
        discount: 0
    }
    let discountValue = 0
    if (discount.value) {
        discountValue = discount.type === 'percentage'
            ? Math.min((price * discount.value) / 100, discount.maxDiscount || Infinity)
            : Math.min(discount.value, price);
    }
    const total = price - discountValue;
    return {
        total: total,
        discount: discountValue
    }
}

// ============================================
// ۲. دریافت سبد خرید (ادمین)
// ============================================
export function useCartAdmin() {
    const { user } = useAuth()

    return useQuery<AllCartsEntity>({
        queryKey: CART_KEYS.lists(),
        queryFn: () => cartService.listAdmin(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!user
    });
}

// ============================================
// ۳. افزودن به سبد خرید
// ============================================
export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CartDto) => cartService.add(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
            toast.success("محصول با موفقیت به سبد خرید اضافه شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در افزودن به سبد خرید"];

            list.forEach((msg: string) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// ============================================
// ۴. بروزرسانی سبد خرید
// ============================================
export function useUpdateCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CartDto }) =>
            cartService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
            toast.success("سبد خرید با موفقیت بروزرسانی شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در بروزرسانی سبد خرید");
        },
    });
}

// ============================================
// ۵. حذف از سبد خرید
// ============================================
export function useDeleteFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => cartService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
            toast.success("محصول با موفقیت از سبد خرید حذف شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در حذف از سبد خرید");
        },
    });
}

// ============================================
// ۶. خالی کردن سبد خرید
// ============================================
export function useClearCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => cartService.deleteAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
            toast.success("سبد خرید با موفقیت خالی شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در خالی کردن سبد خرید");
        },
    });
}

// ============================================
// ۷. دریافت تعداد کل آیتم‌های سبد خرید
// ============================================
export function useCartTotalItems() {
    const { data } = useCart();
    return data?.totalItems || 0;
}

// ============================================
// ۸. دریافت قیمت کل سبد خرید
// ============================================
export function useCartTotalPrice() {
    const { data } = useCart();
    return data?.totalPrice || 0;
}