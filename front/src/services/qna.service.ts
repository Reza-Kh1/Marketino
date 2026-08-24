// services/qna.service.ts
import { PaginationType, SearchDefualtType } from "@/lib/api";
import { apiClient } from "@/lib/api-client";

const BASE_URL = "/qna";

export enum StatusQna {
  approved = "approved",
  pending = "pending",
  rejected = "rejected",
}

export interface QnAEntity {
  id: string;
  content: string;
  productId: string;
  parentId: string | null;
  userId: string;
  role: string;
  status: StatusQna
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  parent?: QnAEntity | null;
  replies?: QnAEntity[];
  product?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface CreateQnaDTO {
  content: string;
  productId: string;
  parentId?: string | null;
}

export interface UpdateQnaDTO {
  content?: string;
  status: StatusQna
}

export interface SearchQnaDTO extends SearchDefualtType {
  productId?: string
  parentId?: string
  status?: StatusQna
}

export interface QnaResponse {
  qnas: QnAEntity[];
  pagination: PaginationType
}

export const qnaService = {
  // ایجاد پرسش یا پاسخ
  create: (data: CreateQnaDTO) => {
    return apiClient.post<QnAEntity>(BASE_URL, data);
  },

  // دریافت Q&A محصول (عمومی)
  getByProduct: (productId: string, page?: number | unknown) => {
    console.log(`${BASE_URL}/product/${productId}?page=${page}`);
    
    return apiClient.get<QnaResponse>(`${BASE_URL}/product/${productId}?page=${page}`);
  },

  // دریافت Q&A محصول (ادمین)
  getAdmin: (params?: SearchQnaDTO) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(params || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    return apiClient.get<QnaResponse>(`${BASE_URL}/admin?${queryString}`);
  },

  // دریافت یک Q&A
  getById: (id: string) => {
    return apiClient.get<QnAEntity>(`${BASE_URL}/${id}`);
  },

  // ویرایش Q&A
  update: (id: string, data: UpdateQnaDTO) => {
    return apiClient.put<QnAEntity>(`${BASE_URL}/${id}`, data);
  },

  // حذف Q&A
  delete: (id: string) => {
    return apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
  },

  // تایید Q&A (ادمین)
  approve: (id: string) => {
    return apiClient.patch<QnAEntity>(`${BASE_URL}/${id}/approve`);
  },

  // رد Q&A (ادمین)
  reject: (id: string) => {
    return apiClient.patch<QnAEntity>(`${BASE_URL}/${id}/reject`);
  },
};