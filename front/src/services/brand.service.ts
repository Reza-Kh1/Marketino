import { apiClient, api } from "@/lib/api-client";

const BASE_URL = "/brand";

export interface BrandType {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
    logo: string | null;
    description: string | null;
    sortOrder: number
    _count: {
        products: number;
    };
};

export interface FormBrandDTO {
    sortOrder: number;
    name: string;
    nameEn: string;
    slug: string;
    logo: string | null;
    description: string | null;
}

export const brandService = {
    list: () => {
        return apiClient.get<BrandType[]>(BASE_URL);
    },
    listAdmin: () => {
        return apiClient.get<BrandType[]>(`${BASE_URL}/admin`);
    },
    create: (data: FormBrandDTO) => {
        return apiClient.post<BrandType>(BASE_URL, data);
    },
    update: (id: string, data: FormBrandDTO) => {
        return apiClient.put<BrandType>(`${BASE_URL}/${id}`, data);
    },
    delete: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },
};