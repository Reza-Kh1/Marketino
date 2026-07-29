"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { ReactQueryProvider } from "@/providers/query-provider";
import TooltipProviders from "@/providers/tooltip-provider";
import { DirectionProvider } from "@/components/ui/direction"; // ⚠️ این فایل رو از پروژه قبلی کپی کن، اینجا موجود نبود
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n-context"; // چندزبانه بودن — نگه داشته شد، جدید محسوب نمی‌شه
import { ChatProvider } from "@/lib/chat-context";
import { WishlistProvider } from "@/lib/use-wishlist";
import QuickViewModal from "@/components/QuickViewModal";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {

  const isRTL = true;
  return (
    <DirectionProvider dir={isRTL ? "rtl" : "ltr"}>
      <I18nProvider>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              <ChatProvider>
                <WishlistProvider>
                  <TooltipProviders>
                    <Toaster />
                    <HotToaster
                      position="bottom-center"
                      toastOptions={{
                        style: {
                          fontFamily: "system-ui, sans-serif",
                          borderRadius: "12px",
                          padding: "12px 16px",
                        },
                      }}
                    />
                    {children}
                    <QuickViewModal />
                  </TooltipProviders>
                </WishlistProvider>
              </ChatProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </I18nProvider>
    </DirectionProvider>
  );
}