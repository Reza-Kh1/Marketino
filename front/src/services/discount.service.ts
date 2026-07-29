import { AllDiscount, DiscountCode } from "@/lib/api";
import { apiClient, api } from "@/lib/api-client";
const BASE_URL = "/discounts";

export interface ValidateDiscountDto {
    code: string
    orderAmount: number
}

export interface DiscountType {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    maxDiscount: number | null;
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
    sellerId: string | null;
    discountAmount?: number; // اضافی (محاسبه شده)
}

export const discountService = {
    list: () => {
        return apiClient.get<AllDiscount>(BASE_URL);
    },
    validate: (data: ValidateDiscountDto) => {
        return apiClient.post(BASE_URL + "/validate", data);
    }
};