import MotionWrapper from '@/components/motion/MotionWrapper';
import FormReport from './FormReport';
import { Flag } from 'lucide-react';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'گزارش تخلف',
    description: 'در صورت مشاهده هرگونه تخلف، مشکل یا رفتار نامناسب، از طریق این فرم گزارش دهید. هویت شما محفوظ خواهد ماند.',
    keywords: 'گزارش تخلف, ثبت شکایت, فروشگاه اینترنتی, تخلف فروشنده, کالای تقلبی, گران‌فروشی, عدم ارسال کالا',
    alternates: {
      canonical: '/report',
      languages: {
        fa: '/fa/report',
      },
    },
    openGraph: {
      title: 'گزارش تخلف',
      description: 'در صورت مشاهده هرگونه تخلف، مشکل یا رفتار نامناسب، از طریق این فرم گزارش دهید. هویت شما محفوظ خواهد ماند.',
      type: 'website',
      url: 'https://yourdomain.com/report',
      siteName: 'بازارچه',
      locale: 'fa_IR',
      images: [
        {
          url: '/images/og-report.jpg',
          width: 1200,
          height: 630,
          alt: 'گزارش تخلف',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'گزارش تخلف',
      description: 'در صورت مشاهده هرگونه تخلف، مشکل یا رفتار نامناسب، از طریق این فرم گزارش دهید. هویت شما محفوظ خواهد ماند.',
      images: ['/images/og-report.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function ReportPage() {
  return (
    <>
      <div className="min-h-screen" dir="rtl">
        <section className="relative py-16 overflow-hidden mb-6">
          <div className="absolute inset-0 bg-linear-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <MotionWrapper preset="slideUpBlur">
              <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Flag className="w-10 h-10 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6">گزارش تخلف</h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                در صورت مشاهده هرگونه تخلف، مشکل یا رفتار نامناسب، از طریق این فرم گزارش دهید. هویت شما محفوظ خواهد ماند.
              </p>
            </MotionWrapper>
          </div>
        </section>
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <FormReport />
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'خانه',
                item: 'https://yourdomain.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'گزارش تخلف',
                item: 'https://yourdomain.com/report',
              },
            ],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'گزارش تخلف',
            description: 'در صورت مشاهده هرگونه تخلف، مشکل یا رفتار نامناسب، از طریق این فرم گزارش دهید. هویت شما محفوظ خواهد ماند.',
            url: 'https://yourdomain.com/report',
            about: {
              '@type': 'Thing',
              name: 'گزارش تخلف فروشگاه اینترنتی',
            },
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'گزارش تخلف',
            description: 'در صورت مشاهده هرگونه تخلف، مشکل یا رفتار نامناسب، از طریق این فرم گزارش دهید. هویت شما محفوظ خواهد ماند.',
            url: 'https://yourdomain.com/report',
            mainEntity: {
              '@type': 'WebApplication',
              name: 'فرم گزارش تخلف',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'All',
              browserRequirements: 'Requires JavaScript',
            },
          }),
        }}
      />
    </>
  );
}