import { WishlistResponse, wishlistService } from "@/services/wishList.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "wishlist_ids";

// توابع کمکی مدیریت LocalStorage
const getStoredWishlistIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const setStoredWishlistIds = (ids: string[]) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
        window.dispatchEvent(new Event("wishlist-updated"));
    } catch (e) {
        console.error("Failed to update localStorage wishlist:", e);
    }
};

const WISHLIST_KEYS = {
    all: ["wishlist"] as const,
    list: (pages: number) => [...WISHLIST_KEYS.all, "list", pages] as const,
    ids: () => [...WISHLIST_KEYS.all, "ids"] as const,
} as const;

// ۱. هوک دریافت فقط آی‌دی‌ها از بک‌اند و ذخیره در LocalStorage
export function useFetchWishlistIds() {
    return useQuery<string[]>({
        queryKey: WISHLIST_KEYS.ids(),
        queryFn: async () => {
            const ids = await wishlistService.getAllId();
            setStoredWishlistIds(ids);
            return ids;
        },
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useWishlist(pages: number) {
    return useQuery<WishlistResponse>({
        queryKey: WISHLIST_KEYS.list(pages),
        queryFn: () => wishlistService.list(pages),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// ۳. هوک بررسی وجود محصول به صورت کاملاً محلی از LocalStorage
export function useCheckWishlist(productId: string) {
    const [isInWishlist, setIsInWishlist] = useState<boolean>(() => {
        return getStoredWishlistIds().includes(productId);
    });
    useEffect(() => {
        const checkStatus = () => {
            const ids = getStoredWishlistIds();
            setIsInWishlist(ids.includes(productId));
        };
        checkStatus();
        window.addEventListener("wishlist-updated", checkStatus);
        return () => window.removeEventListener("wishlist-updated", checkStatus);
    }, [productId]);
    return { exists: isInWishlist };
}

// ۴. هوک افزودن به علاقه‌مندی‌ها
export function useAddWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => wishlistService.add(productId),
        onSuccess: (_, productId) => {
            const currentIds = getStoredWishlistIds();
            if (!currentIds.includes(productId)) {
                setStoredWishlistIds([...currentIds, productId]);
            }

            queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
            queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
            toast.success("به علاقه‌مندی‌ها اضافه شد");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message ?? 'خطا در افزودن به علاقه‌مندی‌ها';
            toast.error(Array.isArray(message) ? message[0] : message);
        },
    });
}

// ۵. هوک حذف از علاقه‌مندی‌ها
export function useRemoveWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => wishlistService.remove(productId),
        onSuccess: (_, productId) => {
            const currentIds = getStoredWishlistIds();
            const updatedIds = currentIds.filter((id) => id !== productId);
            setStoredWishlistIds(updatedIds);

            queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
            queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
            toast.success("از علاقه‌مندی‌ها حذف شد");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message ?? 'خطا در حذف از علاقه‌مندی‌ها';
            toast.error(Array.isArray(message) ? message[0] : message);
        },
    });
}

// ۶. هوک ترکیبی toggle
export function useToggleWishlist() {
    const addMutation = useAddWishlist();
    const removeMutation = useRemoveWishlist();

    const toggle = (productId: string, isInWishlist: boolean) => {
        if (isInWishlist) {
            return removeMutation.mutate(productId);
        } else {
            return addMutation.mutate(productId);
        }
    };

    return {
        toggle,
        isAdding: addMutation.isPending,
        isRemoving: removeMutation.isPending,
        isLoading: addMutation.isPending || removeMutation.isPending,
    };
}

// ۷. هوک کامل برای استفاده در کامپوننت دکمه لایک
export function useWishlistItem(productId: string) {
    const { exists: isInWishlist } = useCheckWishlist(productId);
    const addMutation = useAddWishlist();
    const removeMutation = useRemoveWishlist();

    const isLoading = addMutation.isPending || removeMutation.isPending;

    const toggleWishlist = () => {
        if (isInWishlist) {
            removeMutation.mutate(productId);
        } else {
            addMutation.mutate(productId);
        }
    };

    return {
        isInWishlist,
        isLoading,
        toggleWishlist,
    };
}