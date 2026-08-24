import { apiClient } from "@/lib/api-client";
import { AllProductsEntity } from "./product.service";

const BASE_URL = "/search";
export enum SortSearchOption {
    BEST_SELLING = 'best_selling',
    POPULAR = 'popular',
    PRICE_HIGH = 'price_high',
    PRICE_LOW = 'price_low',
    NEWEST = 'newest',
}

export interface SearchParamsDto {
    q?: string;
    brand?: string;
    hasOffer?: boolean;
    featured?: boolean;
    condition?: "new" | "used" | "";
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: SortSearchOption;
    page?: number
    category?: string
    storeId?: string
}

export const searchService = {
    getSearch: (params: SearchParamsDto) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) =>
                value !== '' && value !== null && value !== undefined
            )
        );
        const queryString = new URLSearchParams(cleanParams as any).toString();
        console.log(`${BASE_URL}?${queryString}`);

        return apiClient.get<AllProductsEntity>(`${BASE_URL}?${queryString}`);
    },
    getCategory: (params: SearchParamsDto, category: string) => {
        return apiClient.get<AllProductsEntity>(`${BASE_URL}/category-${params}?${params}`);
    },
};