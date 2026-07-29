'use client';
/**
 * ============================================================
 * 🔄 React Query Hooks — تمام درخواست‌های API
 * ============================================================
 */
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  authApi, adminApi, productsApi, categoriesApi, cartApi, ordersApi,
  reviewsApi, wishlistApi, uploadApi,
  sellerApi, shopsApi,
  PaginationType,
  SearchDefualtType,
} from '@/lib/api';

// ────────────────────────────────────────────
// 🔐 Auth Hooks
// ────────────────────────────────────────────

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ login, password }: { login: string; password: string }) =>
      authApi.login(login, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => authApi.register(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => { qc.clear(); window.location.href = '/'; },
  });
}

export function useSendEmailOTP() {
  return useMutation({ mutationFn: (email: string) => authApi.sendEmailOTP(email) });
}

export function useVerifyEmailOTP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authApi.verifyEmailOTP(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });
}

// ────────────────────────────────────────────
// 📦 Products Hooks
// ────────────────────────────────────────────

export function useProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => productsApi.getBySlug(idOrSlug),
    enabled: !!idOrSlug,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | Record<string, any>) => productsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | Record<string, any> }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ────────────────────────────────────────────
// 👑 Admin Hooks
// ────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.dashboard(),
    refetchInterval: 30_000,
  });
}

export function useAdminProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => adminApi.products(params),
  });
}

export function useAdminUsers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.users(params),
  });
}

export function useAdminOrders(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminApi.orders(params),
  });
}

export function useAdminSellers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['admin', 'sellers', params],
    queryFn: () => adminApi.sellers(params),
  });
}

export function useAdminColleagues() {
  return useQuery({
    queryKey: ['admin', 'colleagues'],
    queryFn: () => adminApi.colleagues(),
  });
}

export function useAddColleague() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.addColleague(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'colleagues'] }),
  });
}

export function useUpdateColleaguePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      adminApi.updateColleaguePermissions(id, permissions),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'colleagues'] }),
  });
}

export function useToggleColleagueActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.toggleColleagueActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'colleagues'] }),
  });
}

export function useRemoveColleague() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.removeColleague(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'colleagues'] }),
  });
}

export function useAllCarts(query?: SearchDefualtType) {
  return useQuery({
    queryKey: ['admin', 'carts'],
    queryFn: () => adminApi.getCarts(query),
  });
}

export function useVerifySeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; approved: boolean; reason?: string }) =>
      adminApi.verifySeller(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useFeatureProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.featureProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useDeleteAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

// ────────────────────────────────────────────
// 🛒 Cart Hooks
// ────────────────────────────────────────────

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) =>
      cartApi.add(productId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// ────────────────────────────────────────────
// 📁 Upload Hook
// ────────────────────────────────────────────

export function useUpload() {
  return useMutation({
    mutationFn: (file: File) => uploadApi.image(file),
  });
}

// ────────────────────────────────────────────
// 🏷️ Categories Hooks
// ────────────────────────────────────────────

export function useCategories(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesApi.list(),
  });
}

// ────────────────────────────────────────────
// 📦 Orders Hooks
// ────────────────────────────────────────────

export function useUserOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', 'user', page],
    queryFn: () => ordersApi.list({ page }),
  });
}

// ────────────────────────────────────────────
// 📝 Reviews Hooks
// ────────────────────────────────────────────

export function useProductReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => reviewsApi.getByProduct(productId, page),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => reviewsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

// ────────────────────────────────────────────
// ❤️ Wishlist Hooks
// ────────────────────────────────────────────

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get(),
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.add(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}
