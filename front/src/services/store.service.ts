// stores.service.ts
import { PaginationType } from "@/lib/api";
import { apiClient } from "@/lib/api-client";
import { ProductEntity } from "./product.service";

const BASE_URL = "/stores";

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  nameEn: string | null;
  slug: string;
  logo: string | null;
  banner: string | null;
  description: string | null;
  descriptionEn: string | null;
  businessType: string | null;
  nationalId: string | null;
  economicCode: string | null;
  commissionRate: number;
  status: "pending" | "approved" | "rejected";
  statusReason: string | null;
  isActive: boolean;
  isVerified: boolean;
  province: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  hasPhysicalStore: boolean
  instagram: string | null;
  telegram: string | null;
  workingHours: string | null;
  createdAt: Date;
  updatedAt: Date;
  rating?: StoreRating;
  products?: ProductEntity[]
}

export interface StoreRating {
  productCount: number | null
  id: string;
  avgRating: number;
  totalReviews: number;
  productQuality: number;
  productQualityTotal: number;
  productQualityCount: number;
  totalResponseRequests: number;
  answeredResponses: number;
  totalResponseTime: number;
  responseRate: number;
  responseTime: number;
  saleCount: number;
  onTimeDelivery: number | null;
  communication: number | null;
  storeId: string;
  updatedAt: Date;
}

export interface StoreReview {
  id: string;
  rating: number;
  body: string;
  productQuality: number;
  status: "pending" | "approved" | "rejected";
  answer: string | null;
  storeId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormStoreDTO {
  name: string;
  nameEn?: string;
  slug?: string;
  logo?: string;
  banner?: string;
  description?: string;
  descriptionEn?: string;
  businessType?: string;
  nationalId?: string;
  economicCode?: string;
  province?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  telegram?: string;
  workingHours?: string;
  isVerified?: boolean
  hasPhysicalStore?: boolean
}

export interface FormStoreReviewDTO {
  rating: number;
  body: string;
  productQuality: number;
}

export interface FormStoreReviewDTO {
  rating: number;
  body: string;
  productQuality: number;
}

export interface StoreResponseEntity {
  id: string;
  banner: string | null
  name: string;
  nameEn: string | null;
  slug: string;
  logo: string | null;
  status: 'pending' | 'approved' | 'rejected';
  statusReason: string | null;
  isActive: boolean;
  isVerified: boolean;
  businessType: string | null;
  commissionRate: number;
  province: string | null;
  city: string | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string;
  };
  rating?: {
    avgRating: number;
    totalReviews: number;
    productQuality: number;
    answeredResponses: number;
    totalResponseRequests: number;
    responseRate: number;
    responseTime: number;
    saleCount: number;
  };
}


export interface AllStoreResponseEntity {
  pagination: PaginationType
  stores: StoreResponseEntity[]
}


export const storeService = {
  list: (params?: Record<string, any>) => {
    const clean = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null));
    const qs = new URLSearchParams(clean).toString();
    return apiClient.get<AllStoreResponseEntity>(`${BASE_URL}?${qs}`);
  },
  listAdmin: (filter: any) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filter || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    return apiClient.get<AllStoreResponseEntity>(`${BASE_URL}/admin?${queryString}`)
  },
  getBySlug: (slug: string) => apiClient.get<Store>(`${BASE_URL}/${slug}`),
  create: (data: FormStoreDTO) => apiClient.post<Store>(BASE_URL, data),
  update: (id: string, data: FormStoreDTO) => { return apiClient.put<Store>(`${BASE_URL}/${id}`, data) },
  updateStatus: (id: string, status: string) => apiClient.put<Store>(`${BASE_URL}/${id}/status`, { status }),
  delete: (id: string) => apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`),
  createReview: (storeId: string, data: FormStoreReviewDTO) => apiClient.post<StoreReview>(`${BASE_URL}/${storeId}/reviews`, data),
  approveReview: (reviewId: string) => apiClient.put<StoreReview>(`${BASE_URL}/reviews/${reviewId}/approve`, {}),
  rejectReview: (reviewId: string) => apiClient.put<StoreReview>(`${BASE_URL}/reviews/${reviewId}/reject`, {}),
  answerReview: (reviewId: string, answer: string) => apiClient.put<StoreReview>(`${BASE_URL}/reviews/${reviewId}/answer`, { answer }),
};