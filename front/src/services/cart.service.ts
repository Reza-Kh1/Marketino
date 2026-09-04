import { apiClient } from "@/lib/api-client";
import { CartType } from "@/types/types";
const BASE_URL = "/cart";

export interface AllCartsEntity {
    // carts: CartType[]
    stores: StoreCartsType[]
    totalItems: number
    totalPrice: number
}

export interface StoreCartsType {
    storeId: string;
    storeName: string;
    storeNameEn: string;
    storeSlug: string;
    carts: {
        id: string;
        quantity: number;
        createdAt: string;
        variantId: string;
        product: {
            id: string;
            storeId: string;
            title: string;
            titleEn: string;
            slug: string;
            slugEn: string;
            store: {
                name: string;
                nameEn: string;
                slug: string;
            };
            images: {
                alt: string | null;
                url: string;
            }[];
        };
        variant: {
            name: string;
            nameEn: string;
            id: string;
            color: {
                name: string;
                nameEn: string;
            };
            price: string;
            sku: string;
            attributes: {
                value: string;
                id: string;
                attribute: {
                    key: string;
                    label: string;
                    id: string;
                };
            }[];
            discount: {
                isActive: boolean;
                value: number;
                id: string;
                type: string;
                endsAt: string;
            };
        };
        totalPrice: number;
        totalDiscount: number;
    }[];
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