import { apiClient } from "@/lib/api-client";
import { CartType } from "@/types/types";
const BASE_URL = "/cart";

export interface AllCartsEntity {
    carts: CartType[]
    totalItems: number
    totalPrice: number
}

export interface CartDto {
    productId?: string
    quantity?: number
    variantId?: string
}


export const cartService = {
    list: () => {
        return apiClient.get<AllCartsEntity>(BASE_URL);
    },
    listAdmin: () => {
        return apiClient.get<AllCartsEntity>(BASE_URL);
    },
    add: (data: CartDto) => {
        return apiClient.post(BASE_URL, data);
    },
    delete: (id: string) => {
        return apiClient.delete(`${BASE_URL}/${id}`);
    },
    deleteAll: () => {
        return apiClient.delete(`${BASE_URL}`);
    },
    update: (id: string, data: CartDto) => {
        return apiClient.put<{ message: string }>(`${BASE_URL}/${id}`, data);
    },
};