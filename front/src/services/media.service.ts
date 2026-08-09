import { PaginationType, ProductImage } from "@/lib/api";
import { apiClient, api } from "@/lib/api-client";

const BASE_URL = "/media";

export interface MediaTypeDto {
    alt?: string
    sortOrder: number
    isMain: boolean
    productId?: number
    useCase?: MediaUseCase
}

export enum MediaUseCase {
    AVATAR = 'AVATAR',
    PRODUCT = 'PRODUCT',
    POST = 'POST',
    ATTACHMENT = 'ATTACHMENT',
    THUMBNAIL = 'THUMBNAIL',
    WATERMARK = 'WATERMARK',
    REPORTS = 'REPORTS',
    MAINS = 'MAINS'
}
export interface MediaAllEntity {
    data: ProductImage[]
    pagination: PaginationType
}

export interface SearchMediaEntity {
    page?: number | null
    order?: string
    limit?: number | null
    isMain?: boolean
    productId?: number
    url?: string
}

export const mediaService = {
    list: (filetr: SearchMediaEntity) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filetr || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();        
        return apiClient.get<MediaAllEntity>(`${BASE_URL}?${queryString}`);
    },
    create: (data: MediaTypeDto) => {
        return apiClient.post<MediaTypeDto>(BASE_URL, data);
    },
    delete: (url: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${url}`);
    },
};