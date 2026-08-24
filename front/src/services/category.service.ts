import { apiClient, api } from "@/lib/api-client";
import { BreadcrumbsType } from "@/types/types";

const BASE_URL = "/categories";

export interface CategorysProduct {
    updatedAt: Date | string;
    id: string;
    name: string;
    image: string | null;
    icon: string | null;
    nameEn: string;
    slug: string;
    slugEn: string | null;
    sortOrder: number;
}

export interface CategorySingleType {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
    slugEn: string;
    parentId: string | null;
    icon: string;
    image: string;
    ancestorIds: string[];
    sortOrder: number;
    isActive: boolean;
    metaTitle: string | null;
    metaTitleEn: string | null;
    metaDescription: string;
    metaDescriptionEn: string;
    createdAt: string;
    updatedAt: string;
    children: CategorysTypes[];
    breadcrumbs: BreadcrumbsType[]
}

export interface CategorysTypes {
    id: string;
    name: string;
    nameEn: string | null;
    slug: string;
    slugEn: string | null;
    parentId: string | null;
    icon: string | null;
    image: string | null;
    ancestorIds: string[];
    description: string | null;
    descriptionEn: string | null;
    sortOrder: number;
    isFeatured: boolean
    isDigital: boolean
    isActive: boolean;
    metaTitle: string | null;
    metaTitleEn: string | null;
    metaDescription: string | null;
    status: string
    metaDescriptionEn: string | null;
    createdAt: Date;
    updatedAt: Date;
    children?: CategorysTypes[];
    _count: { products: number }
}

export interface FormCategoryDTO {
    name: string;
    nameEn: string;
    description?: string;
    descriptionEn?: string;
    parentId?: string;
    icon?: string;
    sortOrder?: number;
    metaTitle?: string;
    metaTitleEn?: string;
    metaDescription?: string;
    metaDescriptionEn?: string;
}

export const categoryService = {
    list: (filter: any) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filter || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<CategorysTypes[]>(`${BASE_URL}?${queryString}`);
    },
    listAdmin: () => {
        return apiClient.get<CategorysTypes[]>(`${BASE_URL}/admin`);
    },
    listProduct: () => {
        return apiClient.get<CategorysProduct[]>(`${BASE_URL}/products`);
    },
    listWithSlug: (slug: string) => {
        return apiClient.get<CategorySingleType>(`${BASE_URL}/${slug}`);
    },
    create: (data: FormCategoryDTO) => {
        return apiClient.post<CategorysTypes>(BASE_URL, data);
    },
    update: (id: string, data: FormCategoryDTO) => {
        return apiClient.put<CategorysTypes>(`${BASE_URL}/${id}`, data);
    },
    delete: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },
};