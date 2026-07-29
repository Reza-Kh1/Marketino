import { ProductImage } from "@/lib/api";
import { apiClient, api } from "@/lib/api-client";
import { number } from "zod";

const BASE_URL = "/cart";
export interface CartType {
    id: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    userId: string;
    productId: string;
    variantId: string;
    product: {
        title: string;
        titleEn: string;
        id: string;
        images: ProductImage[];
        seller: {
            storeName: string;
        };
    };
    variant: {
        discount: null | any;
        id: string;
        discountId: string | null;
        image: string | null;
        name: string;
        nameEn: string;
        price: number;
        sku: string;
    };
}

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