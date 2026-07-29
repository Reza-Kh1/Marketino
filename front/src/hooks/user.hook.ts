import { UserDto, userService, UserType } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const USER_KEYS = {
    all: ["user"] as const,
    profile: () => [...USER_KEYS.all, "profile"] as const,
    lists: () => [...USER_KEYS.all, "list"] as const,
    listWithFilters: (filters: Record<string, any>) => [...USER_KEYS.lists(), filters] as const,
    details: () => [...USER_KEYS.all, "detail"] as const,
    detail: (slug: string) => [...USER_KEYS.details(), slug] as const,
} as const;

export function useProfileUser() {
    return useQuery<UserType>({
        queryKey: USER_KEYS.profile(),
        queryFn: () => userService.profile(),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UserDto) => {
            return userService.update(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
            toast.success("اطلاعات با موفقیت ویرایش شد");
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