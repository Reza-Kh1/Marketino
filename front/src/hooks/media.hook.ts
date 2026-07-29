import { mediaService, MediaAllEntity, MediaEntity, MediaTypeDto, SearchMediaEntity } from "@/services/media.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const MEDIA_KEYS = {
    all: ["media"] as const,
    lists: () => [...MEDIA_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...MEDIA_KEYS.lists(), filters] as const,
    details: () => [...MEDIA_KEYS.all, "detail"] as const,
    detail: (slug: string) => [...MEDIA_KEYS.details(), slug] as const,
} as const;

export function useMedias(filter: SearchMediaEntity) {
    return useQuery<MediaAllEntity[] | []>({
        queryKey: MEDIA_KEYS.listWithFilters(filter),
        queryFn: () => mediaService.list(filter),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useUploadMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MediaTypeDto) => {
            return mediaService.create(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            toast.success("عکس با موفقیت آپلود شد");
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

export function useDeleteMedia(options?: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (key: string) => mediaService.delete(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.all });
            toast.success('رسانه با موفقیت حذف شد');
            options?.onSuccess?.();
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message ?? 'خطا در حذف رسانه';
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        },

    });
}