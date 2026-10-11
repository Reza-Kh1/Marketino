import { PaginationType } from "@/lib/api";
import { apiClient } from "@/lib/api-client";
const BASE_URL = "/orders";
export interface CheckoutsType {
    id: string
    checkoutNumber: string
    commissionAmount: string
    salesProfit: string
    totalAmount: string
    discountAmount: string,
    taxAmount: string
    discountStatus: null | 'PLATFORM' | 'STORE' | 'COMMISSION' | 'PRODUCT',
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
    paymentStatus: 'pending' | 'paid' | 'refunded',
    paymentMethod: null | string,
    paymentRef: null | string,
    shippingName: string
    shippingPhone: string
    shippingCity: string
    shippingProvince: string
    shippingAddress: string
    shippingPostal: string
    discountId: null | string
    userId: string
    addressId: string
    createdAt: string
    updatedAt: string
    orders: OrderType[];
}

export interface MyCheckout {
    checkouts: CheckoutsType[]
    pagination: PaginationType
}

export interface UpdateCheckout {
    shippingName: string
    shippingPhone: string
    shippingProvince: string
    shippingCity: string
    shippingAddress: string
    shippingPostal: string
    status: string
    paymentStatus: string
}

export interface UpdateOrder {
    storeId: string
    status: string
}

export interface OrderItemType {
    sku: string;
    name: string;
    nameEn: string;
    price: string;
    originalPrice: string;
    total: string;
    quantity: number;
    returnedQty: number;
    attributes?: {
        key: string;
        label: string;
        value: string;
    }[];
    colorName?: string | null;
    colorHex?: string | null;
    productId: string;
}

export interface OrderType {
    id: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    shippingCost: string;
    shippingName: string;
    storeName: string;
    storeNameEn: string;
    subtotal: string;
    totalPrice: string;
    discountAmount: string;
    note?: string | null;
    trackingCode?: string | null;
    storeShippingMethodId?: string | null;
    items: OrderItemType[];
    createdAt: string;
    updatedAt: string;
    deliveredAt?: string | null;
    cancelledAt?: string | null;
    storeId: string
    commission: string
    commissionAmount: string
    userId: string
    checkoutId: string
    discountCodeId: string | null
    returnDeadline?: string | null;
    taxAmount: string
}

export interface OrdersResponse {
    orders: OrderType[];
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
        shippingTime: number | string
        storeId: string
    }[]
    paymentMethod: string
}

export const orderService = {
    create: (data: CreateOrderDto) => {
        return apiClient.post<OrderType>(BASE_URL, data);
    },

    // ۲. لیست سفارشات کاربر
    list: (filters?: Record<string, any>) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<MyCheckout>(`${BASE_URL}/me?${queryString}`);
    },

    updateCheckout: async (id: string, data: UpdateCheckout) => {
        const texts = await apiClient.put<UpdateCheckout>(`${BASE_URL}/${id}`, data);
        return texts
    },

    updateOrder: (id: string, data: UpdateOrder) => {
        return apiClient.put<UpdateOrder>(`${BASE_URL}/edit/${id}`, data);
    },

    getOne: (id: string) => {
        return apiClient.get<CheckoutsType>(`${BASE_URL}/id/${id}`);
    },

    cancel: (id: string) => {
        return apiClient.delete<{ message: string; order: OrderType }>(`${BASE_URL}/${id}`);
    },

    delete: (id: string) => {
        return apiClient.delete<{ message: string; order: OrderType }>(`${BASE_URL}/${id}`);
    },

    // ۷. سفارشات فروشنده
    getStoreOrders: (filters?: Record<string, any>, storeId?: string) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<OrdersResponse>(`${BASE_URL}/store/${storeId}?${queryString}`);
    },

    // ۹. تمام سفارشات (ادمین)
    listAdminOrder: (filters?: Record<string, any>) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<OrdersResponse>(`${BASE_URL}/admin/order?${queryString}`);
    },
    confirmPayment: (id: string) => {
        return apiClient.patch(`${BASE_URL}/${id}`)
    },
    listAdminCheckouts: (filters?: Record<string, any>) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<MyCheckout>(`${BASE_URL}/admin?${queryString}`);
    },
};