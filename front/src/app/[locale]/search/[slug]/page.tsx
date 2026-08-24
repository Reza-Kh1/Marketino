import { fetchApi } from '@/lib/fetchApi'
import { CategorySingleType } from '@/services/category.service'
import { PagePropsType } from '@/types/types'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SearchClient from '../SearchClient'

export async function getData(slug: string): Promise<{ data: CategorySingleType }> {
    const slugCat = slug.replace(/^category-/, '')
    const res = await fetchApi({ url: `categories/${slugCat}`, cache: 'no-cache', tags: ['category', slugCat] })
    if (res.status === 404) {
        notFound()
    }
    if (!res.success) {
        throw new Error(`Failed to load category: ${res.status}`)
    }
    return res
}

export async function generateMetadata({ params }: PagePropsType): Promise<Metadata> {
    const { slug } = await params;
    const { data: category } = await getData(slug)
    const title = category.metaTitle || `خرید ${category.name} | قیمت و مشخصات`
    const description = category.metaDescription || `خرید انواع ${category.name} با بهترین قیمت و کیفیت`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
    const canonicalUrl = `${siteUrl}/category-${category.slug}`

    return {
        title: `${title} | فروشگاه شما`,
        description: description,
        keywords: [category.name, category.nameEn, ...(category.children?.map(c => c.name) || [])].filter(Boolean),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: 'فروشگاه شما',
            images: category.image ? [
                {
                    url: category.image,
                    width: 800,
                    height: 600,
                    alt: category.name,
                }
            ] : [],
            locale: 'fa_IR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: category.image ? [category.image] : [],
        },
        robots: {
            index: category.isActive, // اگر دسته‌بندی غیرفعال بود گوگل ایندکس نکند
            follow: category.isActive,
        }
    };
}

export default async function Page({ params }: PagePropsType) {
    const { slug } = await params;
    const { data: category } = await getData(slug);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': category.breadcrumbs?.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': `${siteUrl}/category-${item.slug}`,
        })) || []
    }
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <main>
                <h1>{category.name}</h1>
                <SearchClient categoryName={category.id} />
            </main>
        </>
    )
}