import { brandService, BrandType, FormBrandDTO } from "@/services/brand.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
const BRANDS_KEYS = {
    all: ["brands"] as const,
    allAdmin: ["brandsAdmin"] as const,
    lists: () => [...BRANDS_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...BRANDS_KEYS.lists(), filters] as const,
    details: () => [...BRANDS_KEYS.all, "detail"] as const,
    detail: (slug: string) => [...BRANDS_KEYS.details(), slug] as const,
    dropdown: () => [...BRANDS_KEYS.all, "dropdown"] as const,
} as const;

export function useBrands() {
    return useQuery<BrandType[] | []>({
        queryKey: BRANDS_KEYS.all,
        queryFn: () => brandService.list(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useBrandAdmin() {
    return useQuery<BrandType[] | []>({
        queryKey: BRANDS_KEYS.allAdmin,
        queryFn: () => brandService.listAdmin(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormBrandDTO) => {
            return brandService.create(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BRANDS_KEYS.allAdmin });
            toast.success("برند با موفقیت ایجاد شد");
        },
        onError: (error: any) => {

            const messages = error?.response?.data?.message;

            const list = Array.isArray(messages)
                ? messages
                : [messages ?? "خطای نامشخص"];

            list.forEach((msg) => {
                toast.error(msg, { position: "top-center" });
            });
        },
    });
}

// Hook to update Brand
export function useUpdateBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormBrandDTO }) => brandService.update(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: BRANDS_KEYS.allAdmin });
            toast.success("برند با موفقیت بروزرسانی شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در بروزرسانی برند");
        },
    });
}

// Hook to delete Brand
export function useDeleteBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => brandService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BRANDS_KEYS.allAdmin });
            toast.success("برند با موفقیت حذف شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در حذف برند");
        },
    });
}