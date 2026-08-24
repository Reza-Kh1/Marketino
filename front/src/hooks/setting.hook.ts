import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShippingMethodType, CreateShippingMethodDto, settingService } from "@/services/setting.service";
import { toast } from "sonner";

// کلیدهای کش برای React Query
export const SHIPPING_KEYS = {
    all: ["shipping"] as const,
    listsShipping: () => [...SHIPPING_KEYS.all, "list"] as const,
    list: () => [...SHIPPING_KEYS.listsShipping()] as const,
    detail: (id: string) => [...SHIPPING_KEYS.all, "detail", id] as const,
} as const;

export const PAYMENT_KEYS = {
    all: ["payment"] as const,
    listsShipping: () => [...SHIPPING_KEYS.all, "list"] as const,
    list: () => [...SHIPPING_KEYS.listsShipping()] as const,
    detail: (id: string) => [...SHIPPING_KEYS.all, "detail", id] as const,
} as const;

// هوک برای دریافت همه روش‌های ارسال
export function useShippingMethods(show?: boolean) {
    return useQuery<ShippingMethodType[]>({
        queryKey: SHIPPING_KEYS.list(),
        queryFn: () => settingService.getAllShipping(),
        staleTime: 5 * 60 * 1000, // 5 دقیقه
        refetchOnWindowFocus: false,
        enabled: show
    });
}

// هوک برای ایجاد روش ارسال جدید
export function useCreateShippingMethod() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateShippingMethodDto) => settingService.createShipping(data),
        onSuccess: () => {
            toast.success('روش ارسال با موفقیت اضافه شد');
            queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.listsShipping() });
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ارسال پاسخ"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

// هوک برای حذف روش ارسال
export function useDeleteShippingMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => settingService.deleteShipping(id),
        onSuccess: () => {
            toast.success('روش ارسال با موفقیت حذف شد');
            queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.listsShipping() });
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ارسال پاسخ"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}