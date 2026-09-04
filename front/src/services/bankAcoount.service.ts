import { apiClient } from "@/lib/api-client";

const BASE_URL = "/bank-accounts";

// ============ Types ============
export interface BankAccountType {
    id: string;
    bankName: string;
    accountHolder: string;
    iban: string;
    cardNumber: string;
    isDefault: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBankAccountDTO {
    bankName: string;
    accountHolder: string;
    iban: string;
    cardNumber: string;
    isDefault: boolean;
    walletId?: string
    isVerified: boolean;
}

export interface UpdateBankAccountDTO {
    bankName?: string;
    accountHolder?: string;
    iban?: string;
    cardNumber?: string;
    walletId?: string
    isDefault?: boolean;
    isVerified?: boolean;
}

// ============ Service ============
export const bankAccountService = {
    // دریافت لیست حساب‌های بانکی
    list: () => {
        return apiClient.get<BankAccountType[]>(BASE_URL);
    },

    // دریافت یک حساب بانکی
    getOne: (id: string) => {
        return apiClient.get<BankAccountType>(`${BASE_URL}/${id}`);
    },

    // ایجاد حساب بانکی جدید
    create: (data: CreateBankAccountDTO) => {
        return apiClient.post<BankAccountType>(BASE_URL, data);
    },

    // ویرایش حساب بانکی
    update: (id: string, data: UpdateBankAccountDTO) => {
        console.log(data, id);

        return apiClient.put<BankAccountType>(`${BASE_URL}/${id}`, data);
    },

    // حذف حساب بانکی
    delete: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
    },
};