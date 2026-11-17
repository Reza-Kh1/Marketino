import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Providers } from '@/app/providers';
import localFont from "next/font/local";
import { cn } from '@/lib/utils';
export const vazir = localFont({
    src: [
        { path: "../fonts/Vazir-Light.woff2", weight: "300", style: "normal" },
        { path: "../fonts/Vazir.woff2", weight: "400", style: "normal" },
        { path: "../fonts/Vazir-Medium.woff2", weight: "500", style: "normal" },
        { path: "../fonts/Vazir-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-vazir",
    display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
    return {
        title:  'مارکتینو' ,
        alternates: {
            languages: { fa: '/fa', en: '/en' },
        },
    };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang={'fa'} dir={'rtl'} suppressHydrationWarning className={cn("font-sans", vazir.className)} >
            <body className="min-h-screen bg-background antialiased">
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}