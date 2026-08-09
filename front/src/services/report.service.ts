// services/report.service.ts
import { PaginationType, ProductImage } from "@/lib/api";
import { apiClient } from "@/lib/api-client";

const BASE_URL = "/reports";

export interface ReportType {
    id: string;
    nameSeller: string;
    content: string;
    title: string;
    orderCode: string | null;
    trackingCode: string | null;
    status: "PENDING" | "RESOLVED" | "CLOSED";
    createdAt: string;
    updatedAt: string;
    images: ProductImage[];
}

export interface AllReports {
    reports: ReportType[] | []
    pagination: PaginationType
}

export interface ReportsStats {
    total: number;
    pending: number;
    resolved: number;
    closed: number;
}

export type CreateReportDTO = {
    nameSeller?: string;
    content: string;
    title: string;
    orderCode?: string | null;
    trackingCode?: string | null;
    status?: "PENDING" | "RESOLVED" | "CLOSED";
};

export type UpdateReportStatusDTO = {
    status: "PENDING" | "RESOLVED" | "CLOSED";
};

export const reportService = {
    // ایجاد گزارش جدید
    create: (data: CreateReportDTO) => {
        return apiClient.post<ReportType>(BASE_URL, data);
    },

    // دریافت تمام گزارش‌ها (ادمین)
    listAdmin: (filters?: any) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<AllReports>(`${BASE_URL}/admin/all?${queryString}`);
    },

    // دریافت جزئیات گزارش
    getById: (id: string) => {
        return apiClient.get<ReportType>(`${BASE_URL}/${id}`);
    },

    // تغییر وضعیت گزارش
    updateStatus: (id: string, data: UpdateReportStatusDTO) => {
        return apiClient.patch<ReportType>(`${BASE_URL}/${id}/status`, data);
    },

    // آمار گزارش‌ها (ادمین)
    getStats: () => {
        return apiClient.get<ReportsStats>(`${BASE_URL}/admin/stats`);
    },

    delete: (id:string) => {
        return apiClient.delete<ReportType>(`${BASE_URL}/${id}`);
    },
};