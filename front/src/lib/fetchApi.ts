export type FetchOptions<TBody = unknown> = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: TBody;
  headers?: HeadersInit;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  signal?: AbortSignal;
  isFormData?: boolean;
};
// revalidateTag(`product-${productId}`);
// revalidateTag('products-list'); // delete cache
export type ApiResponse<TData> = 
  | { success: true; data: TData; status: number }
  | { success: false; error: string; status: number };

export const fetchApi = async <TData = any, TBody = unknown>({
  url,
  method = "GET",
  token,
  body,
  headers = {},
  cache,
  revalidate,
  tags,
  signal,
  isFormData = false,
}: FetchOptions<TBody>): Promise<ApiResponse<TData>> => {
  
  // تنظیم هدرها به صورت هوشمند
  const requestHeaders: Record<string, string> = {
    ...headers as Record<string, string>,
  };

  // اگر فایل/FormData نباشد، Content-Type را JSON می‌گذاریم
  if (!isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // اضافه کردن توکن فقط در صورت وجود
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // تنظیمات مربوط به Next.js Caching & Revalidation
  const nextConfig: NextFetchRequestConfig = {};
  if (typeof revalidate !== "undefined") {
    nextConfig.revalidate = revalidate;
  }
  if (tags && tags.length > 0) {
    nextConfig.tags = tags;
  }

  const options: RequestInit = {
    method,
    headers: requestHeaders,
    signal,
    ...(cache && { cache }),
    ...(Object.keys(nextConfig).length > 0 && { next: nextConfig }),
  };

  // مدیریت Body
  if (body) {
    options.body = isFormData ? (body as unknown as FormData) : JSON.stringify(body);
  }

  try {
    // تمیزکاری آدرس برای جلوگیری از داشتن // اضافه
    const baseUrl = process.env.NEXT_PUBLIC_URL_API?.replace(/\/$/, "") || "";
    const endpoint = url.replace(/^\//, "");
    
    const res = await fetch(`${baseUrl}/${endpoint}`, options);
    
    // در صورتی که پاسخ بدنه نداشته باشد (مثل 204 No Content)
    const isNoContent = res.status === 204;
    const json = isNoContent ? null : await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: json?.message || json?.error || `خطا با کد status: ${res.status}`,
        status: res.status,
      };
    }

    return {
      success: true,
      data: json as TData,
      status: res.status,
    };
  } catch (err: any) {
    // تشخیص انصراف از درخواست (AbortController)
    if (err.name === "AbortError") {
      return {
        success: false,
        error: "درخواست لغو شد.",
        status: 499,
      };
    }

    return {
      success: false,
      error: err?.message || "خطا در ارتباط با سرور",
      status: 500,
    };
  }
};