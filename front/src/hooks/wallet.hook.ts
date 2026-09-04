import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    walletService,
    WalletEntity,
    WalletAllEntity,
    AllTransaction,
    WalletTransactionEntity,
    WalletSearchDto,
    TransactionSearchDto,
    CompleteOrFailTransactionDto
} from "@/services/wallet.service";
import { toast } from "sonner";

// کلیدهای کش اختصاصی React Query
export const WALLET_KEYS = {
    all: ["wallet"] as const,
    myWallet: () => [...WALLET_KEYS.all, "my"] as const,
    wallet: (id: string) => [...WALLET_KEYS.all, "profile", id] as const,
    myTransactions: () => [...WALLET_KEYS.all, "my-transactions"] as const,
    adminWallets: (params?: WalletSearchDto) =>
        [...WALLET_KEYS.all, "admin", "wallets", params] as const,
    adminTransactions: (params?: TransactionSearchDto) =>
        [...WALLET_KEYS.all, "admin", "transactions", params] as const,
} as const;

const handleError = (error: any) => {
    const messages = error?.response?.data?.message;
    const list = Array.isArray(messages) ? messages : [messages ?? "خطایی رخ داده است"];
    list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
};

// ==========================================
// 1. Hooks: User Wallet
// ==========================================
export function useMyWallet(enabled = true) {
    return useQuery<WalletEntity>({
        queryKey: WALLET_KEYS.myWallet(),
        queryFn: () => walletService.getMyWallet(),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
        enabled,
    });
}

export function useWallet(id: string, enabled = true) {
    return useQuery<WalletEntity>({
        queryKey: WALLET_KEYS.wallet(id),
        queryFn: () => walletService.getWallet(id),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        enabled: Boolean(id) && enabled,
    });
}

export function useCreateMyWallet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => walletService.createMyWallet(),
        onSuccess: () => {
            toast.success("کیف پول با موفقیت ایجاد شد");
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.myWallet() });
        },
        onError: handleError,
    });
}

export function useMyTransactions(params: TransactionSearchDto, enabled = true) {
    return useQuery<AllTransaction>({
        queryKey: WALLET_KEYS.myTransactions(),
        queryFn: () => walletService.getMyTransactions(params),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        enabled,
    });
}

export function useRequestWithdrawal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: string) => walletService.requestWithdrawal(amount),
        onSuccess: () => {
            toast.success("درخواست برداشت با موفقیت ثبت شد");
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.myWallet() });
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.myTransactions() });
        },
        onError: handleError,
    });
}

// ==========================================
// 2. Hooks: Admin Wallet
// ==========================================
export function useAdminWallets(params?: WalletSearchDto, enabled = true) {
    return useQuery<WalletAllEntity>({
        queryKey: WALLET_KEYS.adminWallets(params),
        queryFn: () => walletService.getAllWallets(params),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        enabled,
    });
}

export function useAdminTransactions(params?: TransactionSearchDto, enabled = true) {
    return useQuery<AllTransaction>({
        queryKey: WALLET_KEYS.adminTransactions(params),
        queryFn: () => walletService.getAllTransactions(params),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        enabled,
    });
}

export function useApproveWithdrawal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: CompleteOrFailTransactionDto }) =>
            walletService.approveWithdrawal(id, data),
        onSuccess: () => {
            toast.success("درخواست برداشت با موفقیت تأیید شد");
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminWallets() });
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminTransactions() });
        },
        onError: handleError,
    });
}

export function useRejectWithdrawal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: CompleteOrFailTransactionDto }) =>
            walletService.rejectWithdrawal(id, data),
        onSuccess: () => {
            toast.success("درخواست برداشت رد شد");
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminWallets() });
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminTransactions() });
        },
        onError: handleError,
    });
}

export function useCompleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: CompleteOrFailTransactionDto }) =>
            walletService.completeTransaction(id, data),
        onSuccess: () => {
            toast.success("تراکنش با موفقیت تکمیل شد");
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminWallets() });
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminTransactions() });
        },
        onError: handleError,
    });
}

export function useFailTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: CompleteOrFailTransactionDto }) =>
            walletService.failTransaction(id, data),
        onSuccess: () => {
            toast.success("تراکنش ناموفق ثبت شد");
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminWallets() });
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminTransactions() });
        },
        onError: handleError,
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => walletService.deleteTransaction(id),
        onSuccess: () => {
            toast.success("تراکنش با موفقیت حذف شد");
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminWallets() });
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.adminTransactions() });
        },
        onError: handleError,
    });
}