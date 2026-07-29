import { apiClient, api } from "@/lib/api-client";

const BASE_URL = "/categories";

export interface CategorysTypes {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
    slugEn: string | null;
    description: string | null;
    descriptionEn: string | null;
    parentId: string | null;
    icon: string | null;
    image: string | null;
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
    children?: CategorysTypes[] | [];
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
    list: () => {
        return apiClient.get<CategorysTypes[]>(BASE_URL);
    },
    listAdmin: () => {
        return apiClient.get<CategorysTypes[]>(`${BASE_URL}/admin`);
    },
    listWithSlug: (slug: string) => {
        return apiClient.get<CategorysTypes[]>(`${BASE_URL}/${slug}`);
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