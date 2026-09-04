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
  provinceId: string | null
  cityId: string | null
  province: { name: string, nameEn: string } | null
  city: { name: string, nameEn: string } | null
  address: string | null;
  phone: string | null;
  email: string | null;
  hasPhysicalStore: boolean
  instagram: string | null;
  telegram: string | null;
  workingHours: string | null;
  whatsApp: string | null;
  shippingTime: null | string
  bale: null | string
  robika: null | string
  createdAt: Date;
  updatedAt: Date;
  _count: { storeReview: number }
  rating?: StoreRating;
  products?: ProductEntity[]
  storeReview: StoreReview[]
}

export interface StoreRating {
  productCount: number | null
  id: string;
  avgRating: number;
  returnCount: number
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
  body: string;
  createdAt: string;
  productName: string | null;
  productQuality: number;
  rating: number;
  user: {
    firstName: string;
    lastName: string;
  };
  verifiedPurchase: boolean;
  answerAt: string | null;
  answerReview: string | null;
  storeId: string
  store: StoreResponseEntity
  status: 'pending' | 'approved' | 'rejected'
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
  province?: { name: true, nameEn: true }
  city?: { name: true, nameEn: true }
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

export interface AllStoreReviewEntity {
  pagination: PaginationType
  storesReview: StoreReview[]
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
  RebuildStore: (id: string) => apiClient.patch<Store>(`${BASE_URL}/${id}`),
  delete: (id: string) => apiClient.delete<{ message: string }>(`${BASE_URL}/${id}`),
  // review
  listReview: (storeId: string, page: string | unknown) => apiClient.get<AllStoreReviewEntity>(`${BASE_URL}/reviews/${storeId}?page=${page || 1}`),
  listReviewAdmin: (filter: any) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filter || {})
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    return apiClient.get<AllStoreReviewEntity>(`${BASE_URL}/reviews-admin?${queryString}`)
  },
  createReview: (storeId: string, data: FormStoreReviewDTO) => apiClient.post<StoreReview>(`${BASE_URL}/${storeId}/reviews`, data),
  approveReview: (reviewId: string) => apiClient.put<StoreReview>(`${BASE_URL}/reviews/${reviewId}/approve`),
  rejectReview: (reviewId: string) => apiClient.put<StoreReview>(`${BASE_URL}/reviews/${reviewId}/reject`),
  answerReview: (reviewId: string, answer: string) => {
    console.log(answer, reviewId);

    return apiClient.put<StoreReview>(`${BASE_URL}/reviews/${reviewId}/answer`, answer)
  },
  deleteReview: (reviewId: string) => apiClient.delete<StoreReview>(`${BASE_URL}/reviews/${reviewId}`),
};