import { apiClient, api } from "@/lib/api-client";

const BASE_URL = "/users";

export interface UserDto {
    firstName: string
    lastName: string
    phone: string
    avatar: string
}

export interface UserType {
    id: string                 // UUID
    username: string;              // نام کاربری
    email: string;                 // ایمیل
    firstName: string;             // نام
    lastName: string;              // نام خانوادگی
    phone: string | null;          // شماره تلفن (می‌تونه null باشه)
    avatar: string | null;         // آواتار (می‌تونه null باشه)
    role: "buyer" | "seller" | "admin"; // نقش کاربر (با توجه به داده، احتمالاً این مقادیر)
    sellerStatus: string | null;   // وضعیت فروشنده (در صورت فروشنده بودن)
    sellerReason: string | null;   // دلیل درخواست فروشندگی
    commissionRate: number;        // نرخ کمیسیون (عدد)
    storeName: string | null;      // نام فروشگاه
    storeLogo: string | null;      // لوگوی فروشگاه
    storeDescription: string | null; // توضیحات فروشگاه (فارسی)
    storeDescriptionEn: string | null; // توضیحات فروشگاه (انگلیسی)
    isActive: boolean;             // فعال بودن کاربر
    isVerified: boolean;           // احراز هویت شده؟
    emailVerified: boolean;        // ایمیل تایید شده؟
    hasSetPassword: boolean;       // رمز عبور تنظیم شده؟
    language: "fa" | "en";         // زبان کاربر
    lastLogin: string;             // تاریخ آخرین ورود (ISO string)
    createdAt: string;             // تاریخ ایجاد (ISO string)
    updatedAt: string;             // تاریخ بروزرسانی (ISO string)
    _count: {
        products: number;            // تعداد محصولات
        orders: number;
        wishlistItems: number
    };
}

export const userService = {
    profile: () => {
        return apiClient.get<UserType>(BASE_URL + '/me');
    },

    update: (dto: UserDto) => {
        return apiClient.put(`${BASE_URL}/me`, dto);
    },
};