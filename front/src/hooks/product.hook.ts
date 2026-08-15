import { ProductService, FormProductDTO, ProductEntity, FormVariantDTO, VariantType } from "@/services/product.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
const PRODUCT_KEYS = {
    all: ["products"] as const,
    lists: () => [...PRODUCT_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...PRODUCT_KEYS.lists(), filters] as const,
    details: () => [...PRODUCT_KEYS.all, "detail"] as const,
    detail: (slug: string) => [...PRODUCT_KEYS.details(), slug] as const,
    dropdown: () => [...PRODUCT_KEYS.all, "dropdown"] as const,
} as const;

export function useProducts(filter?: any) {
    return useQuery<ProductEntity[] | []>({
        queryKey: PRODUCT_KEYS.listWithFilters(filter),
        queryFn: () => ProductService.list(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useProductSlug(slug: string) {
    return useQuery<ProductEntity>({
        queryKey: PRODUCT_KEYS.detail(slug),
        queryFn: () => ProductService.getBySlug(slug),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormProductDTO) => {
            return ProductService.create(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
            toast.success("محصول با موفقیت ایجاد شد");
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

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormProductDTO }) => ProductService.update(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
            toast.success("محصول با موفقیت بروزرسانی شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در بروزرسانی محصول");
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ProductService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
            toast.success("محصول با موفقیت حذف شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در حذف محصول");
        },
    });
}