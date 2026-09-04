import { PaginationType } from "@/lib/api";
import { apiClient } from "@/lib/api-client";

const BASE_URL = "/orders";

// ============================================
// تایپ‌ها
// ============================================

export interface OrderItem {
    id: string;
    sku: string;
    variantName: string;
    title: string;
    price: number;
    quantity: number;
    total: number;
    image: string | null;
    createdAt: string;
    orderId: string;
    productId: string;
    storeId: string;
    variantId: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentMethod: 'card' | 'wallet' | 'cod' | 'zarinpal' | null;
    paymentRef: string | null;
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    commissionAmount: number;
    total: number;
    shippingAddress: string | null;
    shippingCity: string | null;
    shippingProvince: string | null;
    shippingPostal: string | null;
    shippingPhone: string | null;
    shippingName: string | null;
    trackingCode: string | null;
    notes: string | null;
    sellerNotes: string | null;
    cancelledAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
    addressId: string | null;
    discountId: string | null;
    items: OrderItem[];
}

export interface OrdersResponse {
    orders: Order[];
    pagination: PaginationType
}

export interface CreateOrderDto {
    addressId: string
    discountId: string | null
    orders: {
        note: string | null
        shippingCost: string
        shippingId: string
        shippingName: string
        shippingTime: number  | string
        storeId: string
    }[]
    paymentMethod: string
}

export interface UpdateOrderStatusDto {
    status: Order['status'];
    sellerNotes?: string;
}

export interface Payment {
    id: string;
    amount: number;
    method: 'card' | 'wallet' | 'cod' | 'zarinpal';
    status: 'pending' | 'paid' | 'refunded';
    gatewayRef: string | null;
    authority: string | null;
    errorMessage: string | null;
    paidAt: string | null;
    createdAt: string;
    orderId: string;
}

export interface CreatePaymentDto {
    method: 'card' | 'wallet' | 'zarinpal';
}

export interface Refund {
    id: string;
    amount: number;
    reason: string;
    status: 'pending' | 'paid' | 'cancelled';
    processedAt: string | null;
    createdAt: string;
    orderId: string;
}

export interface CreateRefundDto {
    amount: number;
    reason: string;
}

export interface TrackingEvent {
    id: string;
    status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered';
    location: string | null;
    description: string;
    createdAt: string;
    orderId: string;
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    returnedOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    thisWeekRevenue: number;
    thisMonthRevenue: number;
}

// ============================================
// سرویس
// ============================================

export const orderService = {
    // ============================================
    // ۱. ثبت سفارش جدید
    // POST /orders
    // ============================================
    create: (data: CreateOrderDto) => {
        return apiClient.post<Order>(BASE_URL, data);
    },

    // ============================================
    // ۲. لیست سفارشات کاربر
    // GET /orders
    // ============================================
    list: () => {
        return apiClient.get<OrdersResponse>(BASE_URL);
    },

    // ============================================
    // ۳. جزئیات سفارش
    // GET /orders/{id}
    // ============================================
    getOne: (id: string) => {
        return apiClient.get<Order>(`${BASE_URL}/${id}`);
    },

    // ============================================
    // ۴. لغو سفارش توسط خریدار
    // PATCH /orders/{id}/cancel
    // ============================================
    cancel: (id: string) => {
        return apiClient.patch<{ message: string; order: Order }>(
            `${BASE_URL}/${id}/cancel`
        );
    },

    // ============================================
    // ۵. رهگیری سفارش با شماره سفارش
    // GET /orders/track/{orderNumber}
    // ============================================
    trackByNumber: (orderNumber: string) => {
        return apiClient.get<{ order: Order; tracking: TrackingEvent[] }>(
            `${BASE_URL}/track/${orderNumber}`
        );
    },

    // ============================================
    // ۶. رهگیری سفارش با آیدی
    // GET /orders/{id}/tracking
    // ============================================
    getTracking: (id: string) => {
        return apiClient.get<TrackingEvent[]>(`${BASE_URL}/${id}/tracking`);
    },

    // ============================================
    // ۷. سفارشات فروشنده
    // GET /orders/seller/items
    // ============================================
    getSellerOrders: (params?: { page?: number; limit?: number; status?: string }) => {
        return apiClient.get<OrdersResponse>(`${BASE_URL}/seller/items`, { params });
    },

    // ============================================
    // ۸. تغییر وضعیت سفارش
    // PUT /orders/{id}/status
    // ============================================
    updateStatus: (id: string, data: UpdateOrderStatusDto) => {
        return apiClient.put<{ message: string; order: Order }>(
            `${BASE_URL}/${id}/status`,
            data
        );
    },

    // ============================================
    // ۹. تمام سفارشات (ادمین)
    // GET /orders/admin/all
    // ============================================
    listAdmin: (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        fromDate?: string;
        toDate?: string;
    }) => {
        return apiClient.get<OrdersResponse>(`${BASE_URL}/admin/all`, { params });
    },

    // ============================================
    // ۱۰. آمار سفارشات (ادمین)
    // GET /orders/admin/stats
    // ============================================
    getStats: () => {
        return apiClient.get<OrderStats>(`${BASE_URL}/admin/stats`);
    },

    // ============================================
    // ۱۱. ایجاد پرداخت برای سفارش
    // POST /orders/{id}/payments
    // ============================================
    createPayment: (id: string, data: CreatePaymentDto) => {
        return apiClient.post<{ payment: Payment; redirectUrl?: string }>(
            `${BASE_URL}/${id}/payments`,
            data
        );
    },

    // ============================================
    // ۱۲. لیست پرداخت‌های سفارش
    // GET /orders/{id}/payments
    // ============================================
    getPayments: (id: string) => {
        return apiClient.get<Payment[]>(`${BASE_URL}/${id}/payments`);
    },

    // ============================================
    // ۱۳. تأیید پرداخت
    // PATCH /orders/payments/{paymentId}/confirm
    // ============================================
    confirmPayment: (paymentId: string, params?: { authority?: string; status?: string }) => {
        return apiClient.patch<{ message: string; order: Order }>(
            `${BASE_URL}/payments/${paymentId}/confirm`,
            params
        );
    },

    // ============================================
    // ۱۴. درخواست مرجوعی سفارش
    // POST /orders/{id}/refunds
    // ============================================
    requestRefund: (id: string, data: CreateRefundDto) => {
        return apiClient.post<{ message: string; refund: Refund }>(
            `${BASE_URL}/${id}/refunds`,
            data
        );
    },

    // ============================================
    // ۱۵. لیست مرجوعی‌های کاربر
    // GET /orders/refunds
    // ============================================
    getRefunds: () => {
        return apiClient.get<Refund[]>(`${BASE_URL}/refunds`);
    },

    // ============================================
    // ۱۶. پردازش مرجوعی توسط ادمین
    // PATCH /orders/refunds/{refundId}/process
    // ============================================
    processRefund: (refundId: string, data?: { status: 'paid' | 'cancelled' }) => {
        return apiClient.patch<{ message: string; refund: Refund }>(
            `${BASE_URL}/refunds/${refundId}/process`,
            data
        );
    },
};