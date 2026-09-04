import { AllDiscount, DiscountCode, PaginationType } from "@/lib/api";
import { apiClient, api } from "@/lib/api-client";
const BASE_URL = "/discounts";

export interface ValidateDiscountDto {
    code: string
    stores: any
}

export interface DiscountCreateDto {
    code: string,
    value: number,
    minOrderAmount: number,
    maxDiscount?: number | null | undefined,
    usageLimit: number,
    startsAt: string,
    endsAt: string,
    description?: string | null,
    isActive: boolean,
    storeId: string[]
    status: 'PLATFORM' | 'STORE' | 'COMMISSION' | 'PRODUCT'
}

export interface DiscountType {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    maxDiscount: number;
    usageLimit: number;
    usedCount: number;
    perUserLimit: number;
    startsAt: string; // یا Date
    endsAt: string; // یا Date
    isActive: boolean;
    description: string;
    createdAt: string; // یا Date
    updatedAt: string; // یا Date
    creatorId: string;
    storeId: string | null;
    status: 'PLATFORM' | 'STORE' | 'COMMISSION' | 'PRODUCT'
    discountCodeStores?: { storeId: string }[]
    discountAmount?: number; // اضافی (محاسبه شده)
}

export interface AllDiscountResponse {
    pagination: PaginationType
    discounts: DiscountType[]
}

export interface ListDiscountType {
    id: string
    code: string
    isActive: boolean
}

export const discountService = {
    // دریافت لیست با فیلتر (برای ادمین)
    list: (filters?: Record<string, any>) => {
        return apiClient.get<AllDiscountResponse>(BASE_URL);
    },

    // دریافت لیست ساده برای select
    listDiscount: () => {
        return apiClient.get<ListDiscountType[]>(`${BASE_URL}/list`);
    },

    // اعتبارسنجی کد تخفیف
    validate: (data: ValidateDiscountDto) => {
        return apiClient.post(`${BASE_URL}/validate`, data);
    },

    // ایجاد تخفیف جدید
    create: (data: DiscountCreateDto) => {
        return apiClient.post(BASE_URL, data);
    },

    // ویرایش تخفیف
    update: (data: DiscountCreateDto, id: string) => {
        return apiClient.patch(`${BASE_URL}/${id}`, data);
    },

    // حذف تخفیف
    delete: (id: string) => {
        return apiClient.delete(`${BASE_URL}/${id}`);
    },

    // فعال/غیرفعال کردن تخفیف (toggle)
    toggle: (id: string) => {
        return apiClient.put(`${BASE_URL}/${id}/toggle`);
    },
};