import { Link } from '@/i18n/navigation'
import { BreadcrumbsType } from '@/types/types'
import { ChevronLeft } from 'lucide-react'

export default function Breadcrumb({ items }: { items?: BreadcrumbsType[] }) {
    if (!items?.length) return
    return (
        <nav className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-6 whitespace-nowrap">
            <Link href={'/'} className="hover:text-cyan-500 transition-colors cursor-pointer"> خانه </Link>
            {items.length > 0 && (<ChevronLeft className="w-3.5 h-3.5 shrink-0" />)}
            {items?.map((item, index) => (
                <Link href={'/search/category-' + item.slug} key={item.id} className="flex items-center gap-2">
                    <span
                        className={`hover:text-cyan-500 transition-colors cursor-pointer ${index === items.length - 1 ? 'text-cyan-600 dark:text-cyan-400 font-semibold truncate' : ''}`}
                    >
                        {item.name}
                    </span>
                    {index < items.length - 1 && (<ChevronLeft className="w-3.5 h-3.5 shrink-0" />)}
                </Link>
            ))}
        </nav>
    )
}