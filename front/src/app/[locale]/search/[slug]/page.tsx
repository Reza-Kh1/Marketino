import { fetchApi } from '@/lib/fetchApi'
import { PagePropsType, ProductDetail } from '@/types/types'
import { notFound } from 'next/navigation'

export async function getData(slug: string) {
    const res = await fetchApi({ url: `products/${slug}`, cache: 'no-cache', tags: ['products', slug] })
    if (res.status === 404) {
        notFound()
    }
    if (!res.success) {
        throw new Error(`Failed to load post: ${res.status}`)
    }
    return res
}

export async function generateMetadata({ params }: PagePropsType) {
    const { slug } = await params;
    const { data: product }: { data: ProductDetail } = await getData(slug)
    return {
        title: `خرید ${product.title} | قیمت و مشخصات | دیجی‌کالا`,
        description: product.description,
        keywords: `${product.title}, کت زنانه, پوشاک زنانه, مدل ${product.brand}`,
        openGraph: {
            title: product.title,
            description: product.description,
            images: [product.images],
        },
    };
}

export default function page({ params }: PagePropsType) {
    return (
        <div>
            search
        </div>
    )
}