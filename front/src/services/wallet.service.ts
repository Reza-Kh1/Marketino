import { PaginationType, SearchDefualtType } from "@/lib/api";
import { apiClient } from "@/lib/api-client";

const BASE_URL_WALLET = "/wallet";
const BASE_URL_ADMIN = BASE_URL_WALLET + "/admin";
const BASE_URL_WITHDRAW = BASE_URL_WALLET + "/withdraw";



export interface WalletEntity {
    id: string;
    userId: string;
    balance: string;
    pendingBalance: string;
    withdrawBalance: string;
    frozenBalance: string,
    isPlatform: boolean;
    createdAt: string;
    bankAccountId: string
    updatedAt: string;
    bankAccounts?: {
        iban: string;
        bankName: string;
        cardNumber: string;
        accountHolder: string;
    }[] | null;
    user: {
        lastName: string, firstName: string, username: string, phone: string,
        store: { name: string, nameEn: string, phone: string }
    } | null;
}

export interface WalletAllEntity {
    wallet: WalletEntity[]
    pagination: PaginationType
}

type TransactionType = 'deposit' | 'withdraw' | 'commission' | 'tax' | 'refund' | 'purchase' | 'sale_settlement' | 'return_deduction'
type TransactionStatus = 'pending' | 'completed' | 'failed'
export interface WalletTransactionEntity {
    id: string;
    amount: string;
    type: TransactionType;
    status: TransactionStatus;
    trackingCode: string;
    description: string | null
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    walletId: string;
    orderId: string | null
    returnRequestId: string | null
    SettlementDate: string | null
}

export interface AllTransaction {
    transaction: WalletTransactionEntity[]
    pagination: PaginationType
}

export interface TransactionSearchDto extends SearchDefualtType {
    type?: TransactionType
    status?: TransactionStatus
    trackingCode?: string
    userId?: string
}

export interface WalletSearchDto extends SearchDefualtType {
    userId?: string
}

export interface CompleteOrFailTransactionDto {
    description?: string;
}

export const walletService = {
    getMyWallet: () => {
        return apiClient.get<WalletEntity>(`${BASE_URL_WALLET}/my`);
    },
    getWallet: (id: string) => {
        return apiClient.get<WalletEntity>(`${BASE_URL_WALLET}/profile/${id}`);
    },
    createMyWallet: () => {
        return apiClient.post(`${BASE_URL_WALLET}/my`);
    },
    getMyTransactions: (params?: TransactionSearchDto) => {
        return apiClient.get<AllTransaction>(`${BASE_URL_WALLET}/my/transactions`);
    },

    requestWithdrawal: (amount: string) => {
        return apiClient.post<WalletTransactionEntity>(`${BASE_URL_WITHDRAW}`, { amount });
    },

    getAllWallets: (params?: WalletSearchDto) => {
        return apiClient.get<WalletAllEntity>(`${BASE_URL_ADMIN}/all?${params}`);
    },

    getAllTransactions: (params?: TransactionSearchDto) => {
        return apiClient.get<AllTransaction>(`${BASE_URL_ADMIN}/transactions?${params}`);
    },
    approveWithdrawal: (id: string, data?: CompleteOrFailTransactionDto) => {
        return apiClient.patch<WalletTransactionEntity>(`${BASE_URL_ADMIN}/withdraw/${id}/approve`, data);
    },

    rejectWithdrawal: (id: string, data?: CompleteOrFailTransactionDto) => {
        return apiClient.patch<WalletTransactionEntity>(`${BASE_URL_ADMIN}/withdraw/${id}/reject`, data);
    },

    completeTransaction: (id: string, data?: CompleteOrFailTransactionDto) => {
        return apiClient.patch<WalletTransactionEntity>(`${BASE_URL_ADMIN}/transactions/${id}/complete`, data);
    },

    failTransaction: (id: string, data?: CompleteOrFailTransactionDto) => {
        return apiClient.patch<WalletTransactionEntity>(`${BASE_URL_ADMIN}/transactions/${id}/fail`, data);
    },

    deleteTransaction: (id: string) => {
        return apiClient.delete<{ message: string }>(`${BASE_URL_ADMIN}/transactions/${id}`);
    },
};