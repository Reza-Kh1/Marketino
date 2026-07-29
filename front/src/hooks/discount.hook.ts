import { AllDiscount } from "@/lib/api";
import { discountService, ValidateDiscountDto } from "@/services/discount.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
const DISCOUNT_KEYS = {
    all: ["discount"] as const,
    lists: () => [...DISCOUNT_KEYS.all, "list"] as const,
    listWithFilters: (filters: number) => [...DISCOUNT_KEYS.lists(), filters] as const,
} as const;

export function useDiscounts(page: number) {
    return useQuery<AllDiscount>({
        queryKey: DISCOUNT_KEYS.listWithFilters(page),
        queryFn: () => discountService.list(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useValidateDiscount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ValidateDiscountDto) => {
            return discountService.validate(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success("کد تخفیف با موفقیت اعمال شد");
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