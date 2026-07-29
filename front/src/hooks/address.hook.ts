import { addressService, AddressType, FormAddressDTO, UpdateAddressDTO } from "@/services/address.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ADDRESS_KEYS = {
    all: ["addresses"] as const,
    lists: () => [...ADDRESS_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...ADDRESS_KEYS.lists(), filters] as const,
    details: () => [...ADDRESS_KEYS.all, "detail"] as const,
    detail: (id?: string) => [...ADDRESS_KEYS.details(), id] as const,
    default: () => [...ADDRESS_KEYS.all, "default"] as const,
} as const;

export function useAddresses() {
    return useQuery<AddressType[] | []>({
        queryKey: ADDRESS_KEYS.lists(),
        queryFn: () => addressService.list(),
        staleTime: 5 * 60 * 1000, // 5 دقیقه
        refetchOnWindowFocus: false,
    });
}

// دریافت آدرس پیش‌فرض کاربر
export function useDefaultAddress() {
    return useQuery<AddressType | null>({
        queryKey: ADDRESS_KEYS.default(),
        queryFn: () => addressService.getDefault(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false, // اگر آدرس پیش‌فرض نبود خطا نده
    });
}

// دریافت یک آدرس خاص (برای ویرایش)
export function useAddress(id?: string) {
    return useQuery<AddressType | null>({
        queryKey: ADDRESS_KEYS.detail(id),
        queryFn: () => addressService.getById(id), // باید به سرویس اضافه کنی
        enabled: !!id, // فقط وقتی id وجود داره اجرا میشه
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ============================================
// Mutations
// ============================================

// ایجاد آدرس جدید
export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormAddressDTO) => {
            return addressService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.default() });
            toast.success("آدرس با موفقیت ایجاد شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در ایجاد آدرس"];

            list.forEach((msg) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// به‌روزرسانی آدرس
export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAddressDTO }) => 
            addressService.update(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.default() });
            toast.success("آدرس با موفقیت بروزرسانی شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در بروزرسانی آدرس"];

            list.forEach((msg) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// حذف آدرس
export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => addressService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.default() });
            toast.success("آدرس با موفقیت حذف شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در حذف آدرس"];

            list.forEach((msg) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// ست کردن آدرس به عنوان پیش‌فرض
export function useSetDefaultAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => addressService.setDefault(id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.default() });
            queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.detail(variables) });
            toast.success("آدرس پیش‌فرض با موفقیت تنظیم شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطا در تنظیم آدرس پیش‌فرض"];

            list.forEach((msg) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}