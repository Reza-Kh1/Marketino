import { Sparkles } from 'lucide-react'
import React from 'react'

export default function FeaturedBtn({ value }: { value?: string }) {
    return (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-linear-to-bl from-amber-500/90 via-amber-500/90 to-orange-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md shadow-amber-500/30 ring-1 ring-white/30 backdrop-blur-md transition-all duration-300 hover:scale-105">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-200 fill-amber-100 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="tracking-tight drop-shadow-xs">{value || 'ویژه'}</span>
        </div>
    )
}
