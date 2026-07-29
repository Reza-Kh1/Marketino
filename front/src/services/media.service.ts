import { apiClient, api } from "@/lib/api-client";

const BASE_URL = "/media";

export interface MediaTypeDto {
    alt?: string
    sortOrder: number
    isMain: boolean
    productId?: number
}

export interface MediaEntity {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
    isMain: boolean;
    createdAt: Date;
    productId: string | null;
}

export interface MediaAllEntity {
    data: MediaEntity[]
    total: number,
    nextPage: number,
    prevPage: number
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
        return apiClient.get<MediaAllEntity[]>(BASE_URL);
    },
    create: (data: MediaTypeDto) => {
        return apiClient.post<MediaTypeDto>(BASE_URL, data);
    },
    delete: (url: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${url}`);
    },
};