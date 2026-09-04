import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { provinceService, ProvinceEntity, CreateProvinceDto, CreateCityDto } from '@/services/province.service';
import { toast } from 'sonner';

const CITY_KEYS = {
    all: ['cities'] as const,
    lists: () => [...CITY_KEYS.all, 'list'] as const,
    details: () => [...CITY_KEYS.all, 'detail'] as const,
    detail: (id?: string) => [...CITY_KEYS.details(), id] as const,
} as const;

const PROVINCE_KEYS = {
    all: ['provinces'] as const,
    lists: () => [...PROVINCE_KEYS.all, 'list'] as const,
    details: () => [...PROVINCE_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...PROVINCE_KEYS.details(), id] as const,
} as const;

export function useProvinces() {
    return useQuery({
        queryKey: PROVINCE_KEYS.lists(),
        queryFn: () => provinceService.listProvince(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateProvince() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProvinceDto) => provinceService.createProvince(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
            toast.success('استان با موفقیت ایجاد شد');
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? 'خطا در ایجاد استان'];
            list.forEach((msg: string) => {
                toast.error(msg, { position: 'top-center' });
            });
        },
    });
}

export function useUpdateProvince() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateProvinceDto }) => provinceService.updateProvince(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
            toast.success('استان با موفقیت بروزرسانی شد');
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? 'خطا در بروزرسانی'];
            list.forEach((msg: string) => {
                toast.error(msg, { position: 'top-center' });
            });
        },
    });
}

export function useDeleteProvince() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => provinceService.deleteProvince(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
            toast.success('استان با موفقیت حذف شد');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'خطا در حذف استان');
        },
    });
}
export function useCities() {
    return useQuery({
        queryKey: CITY_KEYS.lists(),
        queryFn: () => provinceService.listCity(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCity(id?: string) {
    return useQuery({
        queryKey: CITY_KEYS.detail(id),
        queryFn: () => provinceService.getByIdCity(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateCity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCityDto) => provinceService.createCity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CITY_KEYS.all });
            toast.success('شهر با موفقیت ایجاد شد');
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? 'خطا در ایجاد شهر'];
            list.forEach((msg: string) => {
                toast.error(msg, { position: 'top-center' });
            });
        },
    });
}

export function useUpdateCity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateCityDto }) => provinceService.updateCity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CITY_KEYS.all });
            toast.success('شهر با موفقیت بروزرسانی شد');
        },
        onError: (error: any) => {
            const messages = error?.response?.data?.message;
            const list = Array.isArray(messages) ? messages : [messages ?? 'خطا در بروزرسانی'];
            list.forEach((msg: string) => {
                toast.error(msg, { position: 'top-center' });
            });
        },
    });
}

export function useDeleteCity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => provinceService.deleteCity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CITY_KEYS.all });
            toast.success('شهر با موفقیت حذف شد');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'خطا در حذف شهر');
        },
    });
}