// services/review.service.ts
import { PaginationType, SearchDefualtType } from "@/lib/api";
import { apiClient } from "@/lib/api-client";

const BASE_URL = "/reviews";

export interface ReviewUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface ReviewProduct {
  id: string;
  title: string;
  slug: string;
}

export enum ReviewModerateStatus {
  approve = "approve",
  reject = "reject",
}

export interface ReviewEntity {
  id: string;
  rating: number;
  title: string;
  body: string;
  isApproved: boolean;
  answerReview: string | null;
  createdAt: string;
  orderId: string | null;
  product: ReviewProduct;
  user: ReviewUser;
  answer: string | null;
}

export interface CreateReviewDTO {
  rating: number;
  title?: string;
  body: string;
  productId: string;
  orderId?: string | null;
}

export interface ModerateReviewDTO {
  status: ReviewModerateStatus;
}

export interface AnswerReviewDTO {
  answer: string;
}

export interface SearchReviewDTO extends SearchDefualtType {
  isApproved?: boolean;
  productId?: string;
}

export interface ReviewResponse {
  reviews: ReviewEntity[];
  pagination: PaginationType;
}

export interface ProductReviewResponse {
  reviews: ReviewEntity[];
  pagination: PaginationType;
}

export const reviewService = {
  // دریافت نظرات تاییدشده یک محصول
  getByProduct: (productId: string, params?: SearchReviewDTO) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    return apiClient.get<ProductReviewResponse>(`${BASE_URL}/product/${productId}${queryString ? `?${queryString}` : ""}`);
  },

  // ثبت نظر جدید توسط کاربر
  create: (data: CreateReviewDTO) => {
    return apiClient.post<ReviewEntity>(BASE_URL, data);
  },

  // تایید یا رد نظر (مخصوص ادمین)
  moderate: (id: string, data: ModerateReviewDTO) => {
    return apiClient.patch<ReviewEntity>(`${BASE_URL}/${id}/moderate`, data);
  },

  // پاسخ به نظر (مخصوص ادمین/فروشنده)
  answer: (id: string, data: AnswerReviewDTO) => {
    return apiClient.post<ReviewEntity>(`${BASE_URL}/${id}/answer`, data);
  },

  // حذف نظر
  delete: (id: string) => {
    return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
  },

  // دریافت تمام نظرات برای پنل ادمین
  getAdminAll: (params?: SearchReviewDTO) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    return apiClient.get<ReviewResponse>(`${BASE_URL}/admin/all?${queryString}`);
  },
};