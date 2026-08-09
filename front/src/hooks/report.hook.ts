import {
    reportService,
    ReportType,
    ReportsStats,
    UpdateReportStatusDTO,
    CreateReportDTO,
    AllReports
} from "@/services/report.service";

import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import { toast } from "sonner";
import { useTranslations } from "next-intl";

const REPORT_KEYS = {
    all: ["reports"] as const,
    lists: () => [...REPORT_KEYS.all, "list"] as const,
    listAdmin: (filter: Record<string, any>) => [...REPORT_KEYS.lists(), "admin", filter] as const,
    details: () => [...REPORT_KEYS.all, "detail"] as const,
    detail: (id?: string) => [...REPORT_KEYS.details(), id] as const,
    stats: () => [...REPORT_KEYS.all, "stats"] as const,
} as const;


// ============================================
// Queries
// ============================================

export function useReportsAdmin(filter: any) {
    return useQuery<AllReports>({
        queryKey: REPORT_KEYS.listAdmin(filter),
        queryFn: () => reportService.listAdmin(filter),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useReportsStats() {
    return useQuery<ReportsStats | null>({
        queryKey: REPORT_KEYS.stats(),
        queryFn: () => reportService.getStats(),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useReport(id?: string) {
    return useQuery<ReportType | null>({
        queryKey: REPORT_KEYS.detail(id),
        queryFn: () => reportService.getById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}


// ============================================
// Mutations
// ============================================

export function useCreateReport() {

    const queryClient = useQueryClient();
    const t = useTranslations("report.toast");

    return useMutation({

        mutationFn: (data: CreateReportDTO) => {
            return reportService.create(data);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: REPORT_KEYS.lists()
            });
            toast.success(t("createSuccess"));
        },

        onError: (error: any) => {

            const messages = error?.response?.data?.message;

            const list = Array.isArray(messages)
                ? messages
                : [messages ?? t("createError")];

            list.forEach((msg) => {
                toast.error(msg, {
                    position: "top-center"
                });
            });
        },
    });
}

export function useDeleteReport() {

    const queryClient = useQueryClient();
    const t = useTranslations("report.toast");

    return useMutation({

        mutationFn: (id: string) => {
            return reportService.delete(id);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: REPORT_KEYS.lists()
            });
            toast.success(t("createSuccess"));
        },

        onError: (error: any) => {

            const messages = error?.response?.data?.message;

            const list = Array.isArray(messages)
                ? messages
                : [messages ?? t("createError")];

            list.forEach((msg) => {
                toast.error(msg, {
                    position: "top-center"
                });
            });
        },
    });
}

export function useUpdateReportStatus() {

    const queryClient = useQueryClient();
    const t = useTranslations("report.toast");

    return useMutation({

        mutationFn: ({
            id,
            data
        }: {
            id: string;
            data: UpdateReportStatusDTO
        }) =>
            reportService.updateStatus(id, data),

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: REPORT_KEYS.lists()
            });
            toast.success(t("updateSuccess"));
        },

        onError: (error: any) => {

            const messages = error?.response?.data?.message;

            const list = Array.isArray(messages)
                ? messages
                : [messages ?? t("updateError")];
            list.forEach((msg) => {
                toast.error(msg, {
                    position: "top-center"
                });
            });
        },
    });
}