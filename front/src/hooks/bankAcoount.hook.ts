import { bankAccountService, BankAccountType, CreateBankAccountDTO, UpdateBankAccountDTO } from "@/services/bankAcoount.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============ Query Keys ============
const BANK_ACCOUNT_KEYS = {
    all: ["bankAccounts"] as const,
    lists: () => [...BANK_ACCOUNT_KEYS.all, "list"] as const,
    list: () => [...BANK_ACCOUNT_KEYS.lists()] as const,
    details: () => [...BANK_ACCOUNT_KEYS.all, "detail"] as const,
    detail: (id: string) => [...BANK_ACCOUNT_KEYS.details(), id] as const,
} as const;

// ============ ۱. دریافت لیست حساب‌های بانکی ============
export function useBankAccounts() {
    return useQuery<BankAccountType[] | []>({
        queryKey: BANK_ACCOUNT_KEYS.list(),
        queryFn: () => bankAccountService.list(),
        staleTime: 10 * 60 * 1000, // 10 دقیقه
        refetchOnWindowFocus: false,
    });
}

// ============ ۲. دریافت یک حساب بانکی ============
export function useBankAccount(id: string) {
    return useQuery<BankAccountType | null>({
        queryKey: BANK_ACCOUNT_KEYS.detail(id),
        queryFn: () => bankAccountService.getOne(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
}

// ============ ۳. ایجاد حساب بانکی جدید ============
export function useCreateBankAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBankAccountDTO) => {
            return bankAccountService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANK_ACCOUNT_KEYS.list() });
            toast.success("حساب بانکی با موفقیت ایجاد شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در ایجاد حساب بانکی"];

            list.forEach((msg: string) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// ============ ۴. ویرایش حساب بانکی ============
export function useUpdateBankAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBankAccountDTO }) => {
            return bankAccountService.update(id, data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: BANK_ACCOUNT_KEYS.list() });
            queryClient.invalidateQueries({
                queryKey: BANK_ACCOUNT_KEYS.detail(variables.id)
            });
            toast.success("حساب بانکی با موفقیت بروزرسانی شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در بروزرسانی حساب بانکی"];

            list.forEach((msg: string) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// ============ ۵. حذف حساب بانکی ============
export function useDeleteBankAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            return bankAccountService.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANK_ACCOUNT_KEYS.list() });
            toast.success("حساب بانکی با موفقیت حذف شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در حذف حساب بانکی"];

            list.forEach((msg: string) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// ============ ۶. تنظیم حساب پیش‌فرض (اختیاری) ============
export function useSetDefaultBankAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBankAccountDTO }) => {
            return bankAccountService.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANK_ACCOUNT_KEYS.list() });
            toast.success("حساب پیش‌فرض با موفقیت تغییر کرد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در تغییر حساب پیش‌فرض"];

            list.forEach((msg: string) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}