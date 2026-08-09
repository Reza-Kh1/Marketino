import { apiClient } from "@/lib/api-client";
import { Order } from "./order.service";
import { UserType } from "./user.service";
import { PaginationType, ProductImage, SearchDefualtType } from "@/lib/api";

const BASE_URL = "/tickets";

// ============ Enums ============
export enum TicketStatus {
    PENDING = "PENDING",
    WAITING = "WAITING",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
}

export enum TicketPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT",
    CRITICAL = "CRITICAL",
}

// ============ Types ============
export interface Ticket {
    id: string;
    status: TicketStatus;
    priority: TicketPriority;
    title: string;
    trackingCode: string;
    isUserRead: boolean;
    createdAt: string;
    updatedAt: string;
    userId: string;
    orderId: string | null;
    user?: UserType;
    order?: Order;
    ticketMessages: TicketMessage[]
}

export interface AllTickets {
    pagination: PaginationType
    tickets: Ticket[]
}

export interface TicketMessage {
    id: string;
    content: string;
    ticketId: string;
    senderId: string;
    createdAt: string;
    updatedAt: string;
    images?: ProductImage[];
    sender?: UserType;
    ticket?: Ticket;
}

export interface TicketStats {
    total: number;
    pending: number;
    waiting: number;
    resolved: number;
    closed: number;
    byPriority: {
        [key in TicketPriority]: number;
    };
}

// ============ DTOs ============
export interface CreateTicketDto {
    title: string;
    orderId?: string;
    priority: TicketPriority;
    content: string;
    images?: string[];
}

export interface UpdateTicketDto {
    isUserRead?: boolean
    priority?: TicketPriority;
    status?: TicketStatus;
}

export interface AddMessageDto {
    content: string;
    images?: string[];
}

// ============ Service ============
export const ticketService = {
    // ایجاد تیکت جدید
    create: (data: CreateTicketDto) => {
        return apiClient.post<Ticket>(BASE_URL, data);
    },

    // لیست تیکت‌های کاربر
    getAll: (pages: SearchDefualtType) => {
        return apiClient.get<AllTickets>(BASE_URL + `?${pages}`);
    },

    // جزئیات تیکت
    getOne: (id: string | null) => {
        return apiClient.get<Ticket>(`${BASE_URL}/${id}`);
    },

    // ویرایش تیکت
    update: (id: string, data: UpdateTicketDto) => {
        return apiClient.patch<Ticket>(`${BASE_URL}/${id}`, data);
    },

    // برچسب‌گذاری به عنوان خوانده شده
    markAsRead: (id: string) => {
        return apiClient.patch(`${BASE_URL}/${id}/read`);
    },

    // افزودن پیام به تیکت
    addMessage: (id: string, data: AddMessageDto) => {
        return apiClient.post<TicketMessage>(`${BASE_URL}/${id}/messages`, data);
    },

    // تمام تیکت‌ها (ادمین)
    adminGetAll: (filters?: any) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters || {})
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        const queryString = new URLSearchParams(cleanFilters).toString();
        return apiClient.get<AllTickets>(`${BASE_URL}/admin/all?${queryString}`);
    },

    // آمار تیکت‌ها (ادمین)
    adminGetStats: () => {
        return apiClient.get<AllTickets>(`${BASE_URL}/admin/stats`);
    },

    // حذف تیکت‌ها (ادمین)
    deleteTicket: (id: string) => {
        return apiClient.delete<AllTickets>(`${BASE_URL}/${id}`);
    },
};