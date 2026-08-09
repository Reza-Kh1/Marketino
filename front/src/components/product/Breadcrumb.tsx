import { ChevronLeft } from 'lucide-react'

export default function Breadcrumb() {
    return (
        <nav className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-6 overflow-x-auto whitespace-nowrap">
            <span className="hover:text-cyan-500 transition-colors cursor-pointer">خانه</span>
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hover:text-cyan-500 transition-colors cursor-pointer">پوشاک زنانه</span>
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hover:text-cyan-500 transition-colors cursor-pointer">لباس زنانه</span>
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold truncate">ماهرانه</span>
        </nav>
    )
}
