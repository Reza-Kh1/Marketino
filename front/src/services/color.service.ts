import { apiClient } from "@/lib/api-client";
import { PaginationType } from "@/lib/api";

const BASE_URL = "/colors";

export interface ColorEntity {
    id: string;
    name: string;
    nameEn: string;
    hexCode: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        productVariants: number;
    };
}

export interface ColorResponse {
    colors: ColorEntity[];
    pagination: PaginationType;
}

export interface CreateColorDTO {
    name: string;
    nameEn: string;
    hexCode: string;
    slug: string;
}

export interface UpdateColorDTO {
    name?: string;
    nameEn?: string;
    hexCode?: string;
    slug?: string;
}

export const colorService = {
    create: (data: CreateColorDTO) => {
        return apiClient.post<ColorEntity>(BASE_URL, data);
    },
    list: () => {
        return apiClient.get<ColorEntity[]>(`${BASE_URL}`);
    },
    listAdmin: (filter: any) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filter || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<ColorResponse>(`${BASE_URL}/admin?${queryString}`);
    },

    update: (id: string, data: UpdateColorDTO) => {
        return apiClient.put<ColorEntity>(`${BASE_URL}/${id}`, data);
    },

    delete: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },
};