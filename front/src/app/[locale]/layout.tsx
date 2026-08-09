import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Providers } from '@/app/[locale]/providers';
import localFont from "next/font/local";
import { cn } from '@/lib/utils';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const vazir = localFont({
    src: [
        { path: "../../fonts/Vazir-Light.woff2", weight: "300", style: "normal" },
        { path: "../../fonts/Vazir.woff2", weight: "400", style: "normal" },
        { path: "../../fonts/Vazir-Medium.woff2", weight: "500", style: "normal" },
        { path: "../../fonts/Vazir-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-vazir",
    display: "swap",
});

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: locale === 'fa' ? 'مارکتینو' : 'Marketino',
        alternates: {
            languages: { fa: '/fa', en: '/en' },
        },
    };
}

export default async function SiteLayout({ children, params }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    const messages = await getMessages();
    const dir = locale === 'fa' ? 'rtl' : 'ltr';
    return (
        <html lang={locale} dir={dir} suppressHydrationWarning className={cn("font-sans", vazir.className)} >
            <body className="min-h-screen bg-background antialiased">
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </div>
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}