import { SearchParamsDto, searchService } from "@/services/search.service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AllProductsEntity } from "@/services/product.service";

const REPORT_KEYS = {
    all: ["search"] as const,
    lists: () => [...REPORT_KEYS.all, "list"] as const,
    listFilter: (filter?: Record<string, any>) => [...REPORT_KEYS.lists(), filter] as const,
    listFilterCategory: (filter: Record<string, any>, category: string) => [...REPORT_KEYS.lists(), filter, category] as const,
} as const;

export function useSearchCategiry(filter: SearchParamsDto, category: string) {
    return useQuery<AllProductsEntity>({
        queryKey: REPORT_KEYS.listFilterCategory(filter, category),
        queryFn: () => searchService.getCategory(filter, category),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useSearch(filter?: SearchParamsDto) {
    return useInfiniteQuery<AllProductsEntity>({
        queryKey: REPORT_KEYS.listFilter(filter),
        queryFn: ({ pageParam = 1 }) =>
            searchService.getSearch({
                ...filter,
                page: pageParam as number,
            }),
        staleTime: 2 * 60 * 1000,
        initialPageParam: 1,
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.pagination.nextPage ? allPages.length + 1 : undefined;
        },
    });
}