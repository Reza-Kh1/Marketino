import { orderService, Order, OrdersResponse, OrderStats, CreateRefundDto, CreatePaymentDto, UpdateOrderStatusDto, CreateOrderDto } from "@/services/order.service";
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
    seller: () => [...ORDERS_KEYS.all, "seller"] as const,
    sellerWithFilters: (filters: Record<string, any>) => [...ORDERS_KEYS.seller(), filters] as const,
    admin: () => [...ORDERS_KEYS.allAdmin, "list"] as const,
    adminWithFilters: (filters: Record<string, any>) => [...ORDERS_KEYS.admin(), filters] as const,
    stats: () => [...ORDERS_KEYS.allAdmin, "stats"] as const,
    tracking: (id: string) => [...ORDERS_KEYS.detail(id), "tracking"] as const,
    refunds: () => [...ORDERS_KEYS.all, "refunds"] as const,
    payments: (id: string) => [...ORDERS_KEYS.detail(id), "payments"] as const,
} as const;

// ============================================
// ۱. دریافت سفارشات کاربر
// ============================================
export function useOrders() {
    return useQuery<OrdersResponse>({
        queryKey: ORDERS_KEYS.lists(),
        queryFn: () => orderService.list(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۲. دریافت جزئیات سفارش
// ============================================
export function useOrder(id: string) {
    return useQuery<Order>({
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
export function useSellerOrders(filters?: Record<string, any>) {
    return useQuery<OrdersResponse>({
        queryKey: filters ? ORDERS_KEYS.sellerWithFilters(filters) : ORDERS_KEYS.seller(),
        queryFn: () => orderService.getSellerOrders(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۴. دریافت تمام سفارشات (ادمین)
// ============================================
export function useAdminOrders(filters?: Record<string, any>) {
    return useQuery<OrdersResponse>({
        queryKey: filters ? ORDERS_KEYS.adminWithFilters(filters) : ORDERS_KEYS.admin(),
        queryFn: () => orderService.listAdmin(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۵. دریافت آمار سفارشات (ادمین)
// ============================================
export function useOrderStats() {
    return useQuery<OrderStats>({
        queryKey: ORDERS_KEYS.stats(),
        queryFn: () => orderService.getStats(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۶. دریافت رهگیری سفارش
// ============================================
export function useOrderTracking(id: string) {
    return useQuery({
        queryKey: ORDERS_KEYS.tracking(id),
        queryFn: () => orderService.getTracking(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۷. دریافت مرجوعی‌های کاربر
// ============================================
export function useRefunds() {
    return useQuery({
        queryKey: ORDERS_KEYS.refunds(),
        queryFn: () => orderService.getRefunds(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// ۸. دریافت پرداخت‌های سفارش
// ============================================
export function useOrderPayments(id: string) {
    return useQuery({
        queryKey: ORDERS_KEYS.payments(id),
        queryFn: () => orderService.getPayments(id),
        enabled: !!id,
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
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در ثبت سفارش"];

            list.forEach((msg) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// ============================================
// ۱۰. لغو سفارش
// ============================================
export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => orderService.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });
            toast.success("سفارش با موفقیت لغو شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در لغو سفارش");
        },
    });
}

// ============================================
// ۱۱. تغییر وضعیت سفارش
// ============================================
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
            orderService.updateStatus(id, data),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.seller() });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.admin() });
            toast.success("وضعیت سفارش با موفقیت تغییر کرد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در تغییر وضعیت سفارش");
        },
    });
}

// ============================================
// ۱۲. ایجاد پرداخت
// ============================================
export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreatePaymentDto }) =>
            orderService.createPayment(id, data),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.payments(id) });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
            toast.success("پرداخت با موفقیت ایجاد شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در ایجاد پرداخت");
        },
    });
}

// ============================================
// ۱۳. تأیید پرداخت
// ============================================
export function useConfirmPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentId, params }: { paymentId: string; params?: Record<string, any> }) =>
            orderService.confirmPayment(paymentId, params),
        onSuccess: (_data, { paymentId }) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.admin() });
            toast.success("پرداخت با موفقیت تأیید شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در تأیید پرداخت");
        },
    });
}

// ============================================
// ۱۴. درخواست مرجوعی
// ============================================
export function useRequestRefund() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateRefundDto }) =>
            orderService.requestRefund(id, data),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.refunds() });
            toast.success("درخواست مرجوعی با موفقیت ثبت شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در ثبت درخواست مرجوعی");
        },
    });
}

// ============================================
// ۱۵. پردازش مرجوعی (ادمین)
// ============================================
export function useProcessRefund() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ refundId, data }: { refundId: string; data?: { status: 'paid' | 'cancelled' } }) =>
            orderService.processRefund(refundId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.refunds() });
            queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.admin() });
            toast.success("مرجوعی با موفقیت پردازش شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در پردازش مرجوعی");
        },
    });
}