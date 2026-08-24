import { apiClient } from "@/lib/api-client";

const BASE_URL_SETTING = "/settings";
const BASE_URL_SHIPPING = BASE_URL_SETTING + "/shipping";

export interface ShippingMethodType {
    id: string;
    name: string;
    nameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    cost: number;
    phrase?: string | null;
    freeThreshold?: number | null;
    estimatedDays?: string | null;
    estimatedDaysEn?: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateShippingMethodDto {
    name: string;
    nameEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    cost: number | null;
    phrase: string | null;
    freeThreshold: number;
    estimatedDays: string;
    estimatedDaysEn: string | null;
    isActive: boolean;
    sortOrder: number | null;
}

export const settingService = {
    getAllShipping: () => {
        return apiClient.get<ShippingMethodType[]>(BASE_URL_SHIPPING);
    },
    createShipping: (data: CreateShippingMethodDto) => {
        return apiClient.post(BASE_URL_SHIPPING, data);
    },
    deleteShipping: (id: string) => {
        return apiClient.delete(`${BASE_URL_SHIPPING}/${id}`);
    },

};