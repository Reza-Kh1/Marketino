import { colorService, ColorEntity, ColorResponse, CreateColorDTO, UpdateColorDTO } from "@/services/color.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const COLOR_KEYS = {
    all: ["colors"] as const,
    admin: () => [...COLOR_KEYS.all, "admin"] as const,
    detail: (filter: any) => [...COLOR_KEYS.all, "admin", filter] as const,
    list: () => [...COLOR_KEYS.all, "list"] as const
} as const;

export function useColors() {
    return useQuery<ColorEntity[]>({
        queryKey: COLOR_KEYS.list(),
        queryFn: () => colorService.list(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useColorsAdmin(filters: any) {
    return useQuery<ColorResponse>({
        queryKey: COLOR_KEYS.detail(filters),
        queryFn: () => colorService.listAdmin(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateColor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateColorDTO) => colorService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COLOR_KEYS.admin() });
            toast.success("رنگ با موفقیت ایجاد شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد رنگ"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

export function useUpdateColor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateColorDTO }) => colorService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COLOR_KEYS.admin() });
            toast.success("رنگ با موفقیت بروزرسانی شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در بروزرسانی رنگ"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}

export function useDeleteColor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => colorService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COLOR_KEYS.admin() });
            toast.success("رنگ با موفقیت حذف شد");
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? "خطا در حذف رنگ"];
            list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
        },
    });
}