import { Link } from '@/i18n/navigation'
import { BreadcrumbsType } from '@/types/types'
import { useLocale } from 'next-intl'
interface BreadcrumbType {
    items?: BreadcrumbsType[]
    pageName?: {
        name: string,
        nameEn: string,
        slug: string,
    }
    itemsCustom?: BreadcrumbsType[]
}
export default function Breadcrumb({ items, pageName, itemsCustom }: BreadcrumbType) {
    const locale = useLocale()
    return (
        <nav aria-label="مسیر" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-6 whitespace-nowrap">
            <Link href={'/'} className="hover:text-cyan-500 transition-colors cursor-pointer"> خانه </Link>
            {items?.length || itemsCustom?.length && '/'}
            {items?.map((item, index) => (
                <Link href={'/search/category-' + item.slug} key={item.id} className="flex items-center gap-2">
                    <span
                        className={`hover:text-cyan-500 transition-colors cursor-pointer ${index === items.length - 1 ? 'dark:text-white text-black font-semibold truncate' : ''}`}
                    >
                        {item.name}
                    </span>
                    {index < items.length - 1 && '/'}
                </Link>
            ))}
            {itemsCustom?.map((item, index) => (
                <Link href={item.slug} key={item.id} className="flex items-center gap-2">
                    <span
                        className={`hover:text-cyan-500 transition-colors cursor-pointer ${index === itemsCustom.length - 1 ? 'dark:text-white text-black font-semibold truncate' : ''}`}
                    >
                        {item.name}
                    </span>
                    {index < itemsCustom.length - 1 && '/'}
                </Link>
            ))}
            {pageName?.name && (
                <>
                    <span>/</span>
                    <p className="flex items-center gap-2">
                        <span
                            className={`text-slate-950 dark:text-white font-semibold truncate`}
                        >
                            {locale === "en" ? pageName.nameEn : pageName.name}
                        </span>
                    </p>
                </>
            )}
        </nav>
    )
}