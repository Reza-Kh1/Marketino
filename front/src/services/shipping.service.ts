import { apiClient } from "@/lib/api-client";

const BASE_URL_SHIPPING = "/shipping";
const BASE_URL_SHIPPING_STORE = BASE_URL_SHIPPING + "/store";
const BASE_URL_SHIPPING_RATE = BASE_URL_SHIPPING + "/rate";

export interface ShippingMethodType {
    id: string;
    name: string;
    nameEn?: string | null;
    isActive: boolean;
    isFreeMethod: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateShippingMethodDto {
    name: string;
    nameEn?: string;
    isActive?: boolean;
    isFreeMethod?: boolean;
}

export interface ShippingStoreMethodType {
    id: string;
    description: string;
    descriptionEn?: string;
    isActive: boolean;
    phrase?: string;
    minDays: number;
    maxDays: number;
    defaultPrice?: number;
    createdAt: string;
    updatedAt: string;
    storeId: string
    shippingMethodId: string
}

export interface UpdateStoreShippingDto {
    description: string;
    descriptionEn?: string;
    isActive: boolean;
    phrase?: string;
    minDays: number;
    maxDays: number;
    defaultPrice?: number;
}

export interface CreateStoreShippingDto extends UpdateStoreShippingDto {
    shippingMethodId: string;
}

export interface storeShippingMethods {
    id: string,
    description: string,
    descriptionEn: string,
    phrase: string,
    minDays: number
    maxDays: number
    defaultPrice: number | null
    rates: {
        deliveryMaxDays: number,
        price: number
    }[],
    shippingMethod: {
        isFreeMethod: string
        name: string
        nameEn: string
    }
}

export interface ShippingMethodOrderType {
    id: string,
    storeShippingMethods: storeShippingMethods[]
}

export interface ShippingStoreRateType {
    id: string,
    createdAt: string,
    price: number,
    deliveryMaxDays: number,
    province: { name: string, nameEn: string, id: string }
}



// --- Store Shipping Rate ---
export interface CreateStoreShippingRateDto {
    price: number;
    deliveryMaxDays: number;
    storeShippingMethodId: string;
    provinceId: string;
}

export const shippingService = {
    // ==========================================
    // 1. Shipping Methods
    // ==========================================
    getAllShipping: () => {
        return apiClient.get<ShippingMethodType[]>(BASE_URL_SHIPPING);
    },
    getShippingOrder: (proviceId?: string) => {
        console.log(`${BASE_URL_SHIPPING}/order/${proviceId}`);

        return apiClient.get<ShippingMethodOrderType[]>(`${BASE_URL_SHIPPING}/order/${proviceId}`);
    },
    createShipping: (data: CreateShippingMethodDto) => {
        return apiClient.post(BASE_URL_SHIPPING, data);
    },
    updateShipping: (id: string, data: CreateShippingMethodDto) => {
        return apiClient.put(`${BASE_URL_SHIPPING}/${id}`, data);
    },
    deleteShipping: (id: string) => {
        return apiClient.delete(`${BASE_URL_SHIPPING}/${id}`);
    },

    // ==========================================
    // 2. Store Shipping
    // ==========================================
    getAllStoreShipping: () => {
        return apiClient.get<ShippingStoreMethodType[]>(`${BASE_URL_SHIPPING_STORE}`);
    },
    getStoreShippingById: (id: string) => {
        return apiClient.get<ShippingStoreRateType[]>(`${BASE_URL_SHIPPING_STORE}/${id}`);
    },
    createStoreShipping: (data: CreateStoreShippingDto) => {
        return apiClient.post(`${BASE_URL_SHIPPING_STORE}`, data);
    },
    updateStoreShipping: (id: string, data: UpdateStoreShippingDto) => {
        return apiClient.put(`${BASE_URL_SHIPPING_STORE}/${id}`, data);
    },
    deleteStoreShipping: (id: string) => {
        return apiClient.delete(`${BASE_URL_SHIPPING_STORE}/${id}`);
    },

    // ==========================================
    // 3. Store Shipping Rates
    // ==========================================
    createShippingRate: (data: CreateStoreShippingRateDto) => {
        return apiClient.post(`${BASE_URL_SHIPPING_RATE}`, data);
    },
    updateShippingRate: (id: string, data: Partial<CreateStoreShippingRateDto>) => {
        return apiClient.put(`${BASE_URL_SHIPPING_RATE}/${id}`, data);
    },
    deleteShippingRate: (id: string) => {
        return apiClient.delete(`${BASE_URL_SHIPPING_RATE}/${id}`);
    },
};