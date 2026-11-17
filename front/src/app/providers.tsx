"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { ReactQueryProvider } from "@/providers/query-provider";
import TooltipProviders from "@/providers/tooltip-provider";
import { DirectionProvider } from "@/components/ui/direction"; // ⚠️ این فایل رو از پروژه قبلی کپی کن، اینجا موجود نبود
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {

  const isRTL = true;
  return (
    <DirectionProvider dir={isRTL ? "rtl" : "ltr"}>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
                <TooltipProviders>
                  {children}
                  <Toaster />
                </TooltipProviders>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
    </DirectionProvider>
  );
}