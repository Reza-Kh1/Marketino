import { variantService, AttributeDefinition, CreateAttributeDefinitionDTO, CreateVariantDTO, CreateVariantAttributeDTO, VariantEntity, UpdateVariantDTO } from "@/services/variant.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const VARIANT_KEYS = {
    all: ["variants"] as const,
    attributeDefinitions: () => [...VARIANT_KEYS.all, "attributeDefinitions"] as const,
    productVariants: (productId?: string) => [...VARIANT_KEYS.all, "productVariants", productId] as const,
} as const;

const ATTRIBUTE_DEFINITIONS_KEYS = {
    all: ["attribute"] as const,
    attributeDefinitions: () => [...ATTRIBUTE_DEFINITIONS_KEYS.all, "attributeDefinitions"] as const,
    attributeDefinitionsFilters: (filter: any) => [...ATTRIBUTE_DEFINITIONS_KEYS.all, "att", filter] as const,
} as const;

// ============ هوک‌های AttributeDefinition ============

// دریافت لیست AttributeDefinitionها
export function useAttributeDefinitions(filter: any) {
    return useQuery({
        queryKey: ATTRIBUTE_DEFINITIONS_KEYS.attributeDefinitionsFilters(filter),
        queryFn: () => variantService.getAttributeDefinitions(filter),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ایجاد AttributeDefinition
export function useCreateAttributeDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAttributeDefinitionDTO) => variantService.createAttributeDefinition(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ATTRIBUTE_DEFINITIONS_KEYS.all });
            toast.success("AttributeDefinition با موفقیت ایجاد شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

// ویرایش AttributeDefinition
export function useUpdateAttributeDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { data: CreateAttributeDefinitionDTO, id: string }) => variantService.updateAttributeDefinition({ data, id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ATTRIBUTE_DEFINITIONS_KEYS.all });
            toast.success("AttributeDefinition با موفقیت ویرایش شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

// حذف AttributeDefinition
export function useDeleteAttributeDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => variantService.deleteAttributeDefinition(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ATTRIBUTE_DEFINITIONS_KEYS.all });
            toast.success("AttributeDefinition با موفقیت حذف شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در حذف"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

// ============ هوک‌های Variant ============

// دریافت لیست Variantهای یک محصول
export function useProductVariants(productId?: string) {
    return useQuery<VariantEntity[]>({
        queryKey: VARIANT_KEYS.productVariants(productId),
        queryFn: () => variantService.getByProduct(productId),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ایجاد Variant
export function useCreateVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateVariantDTO) => variantService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VARIANT_KEYS.all });
            toast.success("Variant با موفقیت ایجاد شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

export function useUpdateVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: UpdateVariantDTO }) => variantService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VARIANT_KEYS.all });
            toast.success("Variant با موفقیت ویرایش شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

// حذف Variant
export function useDeleteVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => variantService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VARIANT_KEYS.all });
            toast.success("Variant با موفقیت حذف شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در حذف"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}