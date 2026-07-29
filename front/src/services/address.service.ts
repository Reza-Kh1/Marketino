import { apiClient } from "@/lib/api-client";

const BASE_URL = "/addresses";

export interface AddressType {
    id: string;
    title: string | null;        // e.g. "خانه", "محل کار"
    fullName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FormAddressDTO {
    title?: string | null;
    fullName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode?: string | null;
    isDefault?: boolean;
}

export interface UpdateAddressDTO {
    title?: string | null;
    fullName?: string;
    phone?: string;
    province?: string;
    city?: string;
    address?: string;
    postalCode?: string | null;
    isDefault?: boolean;
}

export const addressService = {
    list: () => {
        return apiClient.get<AddressType[]>(BASE_URL);
    },

    getById: (id?: string) => {
        return apiClient.get<AddressType>(`${BASE_URL}/${id}`);
    },
    getDefault: () => {
        return apiClient.get<AddressType>(`${BASE_URL}/default`);
    },

    create: (data: FormAddressDTO) => {
        return apiClient.post<AddressType>(BASE_URL, data);
    },

    update: (id: string, data: UpdateAddressDTO) => {
        return apiClient.put<AddressType>(`${BASE_URL}/${id}`, data);
    },

    delete: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },

    setDefault: (id: string) => {
        return apiClient.put<AddressType>(`${BASE_URL}/${id}/set-default`);
    },
};