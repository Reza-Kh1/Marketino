import { PaginationType } from "@/lib/api";
import { apiClient } from "@/lib/api-client";
import { ProductEntity } from "./product.service";

const BASE_URL = "/wishlist";

export interface WishlistResponse {
    items: {
        product: ProductEntity
    }[]
    pagination: PaginationType
}

// سرویس
export const wishlistService = {
    // لیست علاقه‌مندی‌ها
    list: (pages: number) => {
        return apiClient.get<WishlistResponse>(`${BASE_URL}?page=${pages}`);
    },

    // افزودن به علاقه‌مندی‌ها
    add: (productId: string) => {
        return apiClient.post(`${BASE_URL}/${productId}`);
    },

    // حذف از علاقه‌مندی‌ها
    remove: (productId: string) => {
        return apiClient.delete(`${BASE_URL}/${productId}`);
    },

    // بررسی وجود در علاقه‌مندی‌ها
    check: (productId: string) => {
        return apiClient.get<{ exists: boolean }>(`${BASE_URL}/check/${productId}`);
    },

    getAllId: () => {
        return apiClient.get<string[]>(`${BASE_URL}/ids`);
    },
};