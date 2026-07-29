"use client";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err: any) => {
            const status = err?.response?.status;

            if (status === 403) {
              toast.error("شما مجاز به این عملیات نیستید !");
              window.location.href = "/";
            } else {
              toast.error("در ارتباط با سرور خطا رخ داد");
            }
          },

        }),
        defaultOptions: {
          queries: {
            staleTime: 10 * 1000, // 10 دقیقه
            gcTime: 15 * 60 * 1000, // 15 دقیقه
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}