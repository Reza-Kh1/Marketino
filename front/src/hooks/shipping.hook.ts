import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shippingService, ShippingMethodType, CreateShippingMethodDto, ShippingStoreMethodType, ShippingStoreRateType, ShippingMethodOrderType } from "@/services/shipping.service";
import {
  CreateShippingMethodFormSchema,
  CreateStoreShippingFormSchema,
  UpdateStoreShippingFormSchema,
  CreateStoreShippingRateFormSchema,
} from "@/schemas/shipping.schema";
import { toast } from "sonner";

// کلیدهای کش اختصاصی React Query
export const SHIPPING_KEYS = {
  all: ["shipping"] as const,
  methods: () => [...SHIPPING_KEYS.all, "methods"] as const,
  orderMethods: () => [...SHIPPING_KEYS.all, "order"] as const,
  orderMethodsProvince: (id?: string) => [...SHIPPING_KEYS.all, "order", id] as const,
  storeShipping: () => [...SHIPPING_KEYS.all, "store-shipping"] as const,
  storeShippingDetail: (id: string) => [...SHIPPING_KEYS.storeShipping(), id] as const,
  rates: () => [...SHIPPING_KEYS.all, "rates"] as const,
} as const;

const handleError = (error: any) => {
  const messages = error?.response?.data?.message;
  const list = Array.isArray(messages) ? messages : [messages ?? "خطایی رخ داده است"];
  list.forEach((msg: string) => toast.error(msg, { position: "top-center" }));
};

// ==========================================
// 1. Hooks: Shipping Methods
// ==========================================
export function useShippingMethods(enabled = true) {
  return useQuery<ShippingMethodType[]>({
    queryKey: SHIPPING_KEYS.methods(),
    queryFn: () => shippingService.getAllShipping(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useShippingOrder(proviceId?: string) {
  return useQuery<ShippingMethodOrderType[]>({
    queryKey: SHIPPING_KEYS.orderMethodsProvince(proviceId),
    queryFn: () => shippingService.getShippingOrder(proviceId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!proviceId,
  });
}

export function useCreateShippingMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShippingMethodDto) => shippingService.createShipping(data),
    onSuccess: () => {
      toast.success("روش ارسال جدید اضافه شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.methods() });
    },
    onError: handleError,
  });
}

export function useUpdateShippingMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateShippingMethodDto }) =>
      shippingService.updateShipping(id, data),
    onSuccess: () => {
      toast.success("روش ارسال با موفقیت بروزرسانی شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.methods() });
    },
    onError: handleError,
  });
}

export function useDeleteShippingMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.deleteShipping(id),
    onSuccess: () => {
      toast.success("روش ارسال با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.methods() });
    },
    onError: handleError,
  });
}

// ==========================================
// 2. Hooks: Store Shipping
// ==========================================
export function useStoreShippings(enabled = true) {
  return useQuery<ShippingStoreMethodType[]>({
    queryKey: SHIPPING_KEYS.storeShipping(),
    queryFn: () => shippingService.getAllStoreShipping(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useStoreShippingDetail(id: string, enabled = true) {
  return useQuery<ShippingStoreRateType[]>({
    queryKey: SHIPPING_KEYS.storeShippingDetail(id),
    queryFn: () => shippingService.getStoreShippingById(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateStoreShipping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreShippingFormSchema) => shippingService.createStoreShipping(data),
    onSuccess: () => {
      toast.success("روش ارسال فروشگاه ایجاد شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.storeShipping() });
    },
    onError: handleError,
  });
}

export function useUpdateStoreShipping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreShippingFormSchema }) =>
      shippingService.updateStoreShipping(id, data),
    onSuccess: () => {
      toast.success("روش ارسال فروشگاه بروزرسانی شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.storeShipping() });
    },
    onError: handleError,
  });
}

export function useDeleteStoreShipping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.deleteStoreShipping(id),
    onSuccess: () => {
      toast.success("روش ارسال فروشگاه حذف شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.storeShipping() });
    },
    onError: handleError,
  });
}

// ==========================================
// 3. Hooks: Shipping Rates
// ==========================================
export function useCreateShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreShippingRateFormSchema) => shippingService.createShippingRate(data),
    onSuccess: () => {
      toast.success("نرخ ارسال استانی اضافه شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.storeShipping() });
    },
    onError: handleError,
  });
}

export function useUpdateShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStoreShippingRateFormSchema> }) =>
      shippingService.updateShippingRate(id, data),
    onSuccess: () => {
      toast.success("نرخ ارسال با موفقیت بروزرسانی شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.storeShipping() });
    },
    onError: handleError,
  });
}

export function useDeleteShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.deleteShippingRate(id),
    onSuccess: () => {
      toast.success("نرخ ارسال با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.storeShipping() });
    },
    onError: handleError,
  });
}