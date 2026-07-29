import { categoryService, CategorysTypes, FormCategoryDTO } from "@/services/category.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
const CATEGORY_KEYS = {
    all: ["categories"] as const,
    allAdmin: ["categoriesAdmin"] as const,
    lists: () => [...CATEGORY_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...CATEGORY_KEYS.lists(), filters] as const,
    details: () => [...CATEGORY_KEYS.all, "detail"] as const,
    detail: (slug: string) => [...CATEGORY_KEYS.details(), slug] as const,
    dropdown: () => [...CATEGORY_KEYS.all, "dropdown"] as const,
} as const;

export function useCategories() {
    return useQuery<CategorysTypes[] | []>({
        queryKey: ['categories'],
        queryFn: () => categoryService.list(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCategoriesAdmin() {
    return useQuery<CategorysTypes[] | []>({
        queryKey: ['categoriesAdmin'],
        queryFn: () => categoryService.listAdmin(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCategoriesSlug(slug: string) {
    return useQuery<CategorysTypes[] | []>({
        queryKey: CATEGORY_KEYS.detail(slug),
        queryFn: () => categoryService.listWithSlug(slug),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormCategoryDTO) => {
            return categoryService.create(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.allAdmin });
            toast.success("دسته با موفقیت ایجاد شد");
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

// Hook to update category
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormCategoryDTO }) => categoryService.update(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.allAdmin });
            toast.success("دسته با موفقیت بروزرسانی شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در بروزرسانی دسته");
        },
    });
}

// Hook to delete category
export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.allAdmin });
            toast.success("دسته با موفقیت حذف شد");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "خطا در حذف دسته");
        },
    });
}