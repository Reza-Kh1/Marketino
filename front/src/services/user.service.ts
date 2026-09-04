import { apiClient, api } from "@/lib/api-client";

const BASE_URL = "/users";

export interface UserDto {
    firstName: string
    lastName: string
    phone: string
    avatar: string
}

export type UserRole = 'seller' | 'user' | 'admin' | 'superAdmin'

export interface UserType {
    id: string
    username: string
    email: string
    firstName: string
    lastName: string
    phone: string
    avatar: null | string
    role: UserRole
    store: {
        commissionRate: string
        id: string
        slug: string
    },
    isActive: boolean,
    isVerified: boolean,
    emailVerified: boolean,
    hasSetPassword: boolean,
    language: 'fa' | 'en'
    lastLogin: string
    createdAt: string
    updatedAt: string
    permissions: null | string
}

export interface SellerListType {
    id: string
    username: string
    storeName: string
    storeSlug: string
}

export const userService = {
    profile: () => {
        return apiClient.get<UserType>(BASE_URL + '/me');
    },
    sellerList: () => {
        return apiClient.get<SellerListType[]>(BASE_URL + '/seller-list');
    },
    update: (dto: UserDto) => {
        return apiClient.put(`${BASE_URL}/me`, dto);
    },
};