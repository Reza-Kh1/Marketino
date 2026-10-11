import { orderService, OrdersResponse, CreateOrderDto, MyCheckout, CheckoutsType, UpdateCheckout, UpdateOrder } from "@/services/order.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
const ORDERS_KEYS = {
    all: ["orders"] as const,
    allAdmin: ["ordersAdmin"] as const,
    lists: () => [...ORDERS_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...ORDERS_KEYS.lists(), filters] as const,
    details: () => [...ORDERS_KEYS.all, "detail"] as const,
    detail: (id: string) => [...ORDERS_KEYS.details(), id] as const,
    store: () => [...ORDERS_KEYS.all, "Store"] as const,
    storeWithFilters: (filters: Record<string, any>) => [...ORDERS_KEYS.store(), filters] as const,
    admin: () => [...ORDERS_KEYS.allAdmin, "list"] as const,
    adminWithFilters: (filters?: Record<string, any>) => [...ORDERS_KEYS.admin(), filters] as const,
    adminWithFiltersOrder: (filters?: Record<string, any>) => [...ORDERS_KEYS.admin(), filters, 'order'] as const,
    stats: () => [...ORDERS_KEYS.allAdmin, "stats"] as const,
    tracking: (id: string) => [...ORDERS_KEYS.detail(id), "tracking"] as const,
    refunds: () => [...ORDERS_KEYS.all, "refunds"] as const,
    payments: (id: string) => [...ORDERS_KEYS.detail(id), "payments"] as const,
} as const;

// ✅ helper برای نمایش ارورها (یکجا، نه تکراری)
const showErrors = (error: any, fallback = "خطایی رخ داد") => {
    const messages = error?.response?.data?.message;
    const list = Array.isArray(messages) ? messages : [messages ?? fallback];
    list.forEach((msg) => toast.error(msg, { position: "top-center" }));
};

// ============================================
// ۱. دریافت سفارشات کاربر
// ============================================
export function useOrders(filters: Record<string, any>) {
    return useQuery<MyCheckout>({
        queryKey: ORDERS_KEYS.listWithFilters(filters),
        queryFn: () => orderService.list(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۲. دریافت جزئیات سفارش
// ============================================
export function useOrder(id: string) {
    return useQuery<CheckoutsType>({
        queryKey: ORDERS_KEYS.detail(id),
        queryFn: () => orderService.getOne(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۳. دریافت سفارشات فروشنده
// ============================================
export function useStoreOrders({ filters, storeId, enabled }: { enabled: boolean, storeId?: string, filters?: Record<string, any> }) {
    return useQuery<OrdersResponse>({
        queryKey: filters ? ORDERS_KEYS.storeWithFilters(filters) : ORDERS_KEYS.store(),
        queryFn: () => orderService.getStoreOrders(filters, storeId),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled
    });
}

// ============================================
// ۴. دریافت تمام سفارشات (ادمین)
// ============================================
export function useAdminOrders(filters?: Record<string, any>) {
    return useQuery<OrdersResponse>({
        queryKey: ORDERS_KEYS.adminWithFiltersOrder(filters),
        queryFn: () => orderService.listAdminOrder(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useAdminCheckouts(filters?: Record<string, any>) {
    return useQuery<MyCheckout>({
        queryKey: filters ? ORDERS_KEYS.adminWithFilters(filters) : ORDERS_KEYS.admin(),
        queryFn: () => orderService.listAdminCheckouts(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۹. ثبت سفارش جدید
// ============================================
export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrderDto) => {
            return orderService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.lists() });
            toast.success("سفارش با موفقیت ثبت شد");
        },
        onError: (error: any) => showErrors(error, "خطا در ثبت سفارش"),
    });
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string, body: UpdateOrder }) => {
            return orderService.updateOrder(id, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.allAdmin });
            toast.success("سفارش با موفقیت ویرایش شد");
        },
        onError: (error: any) => showErrors(error, "خطا در ثبت سفارش"),
    });
}

// ============================================
// بخش ادمین
// ============================================
export function updateCheckoutAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string, body: UpdateCheckout }) => {
            return orderService.updateCheckout(id, body);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.admin() });
            toast.success("سفارش با موفقیت ویرایش شد");
        },
        onError: (error: any) => showErrors(error, "خطا در ویرایش سفارش"),
    });
}
export function useDeleteCheckout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => orderService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.admin() });
            toast.success("سفارش با موفقیت حذف شد");
        },
        onError: (error: any) => showErrors(error, "خطا در حذف سفارش"),
    });
}
export function useConfirmPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => orderService.confirmPayment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.admin() });
            toast.success("سفارش با موفقیت آپدیت شد");
        },
        onError: (error: any) => showErrors(error, "خطا در آپدیت سفارش"),
    });
}


// ============================================
// بخش کاربر
// ============================================

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => orderService.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });
            toast.success("سفارش با موفقیت لغو شد");
        },
        onError: (error: any) => showErrors(error, "خطا در لغو سفارش"),
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderDto) => {
            return orderService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.lists() });
            toast.success("سفارش با موفقیت ثبت شد");
        },
        onError: (error: any) => showErrors(error, "خطا در ثبت سفارش"),
    });
}