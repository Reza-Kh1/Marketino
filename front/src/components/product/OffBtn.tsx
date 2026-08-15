import React from 'react'

export default function OffBtn({ value, name }: { value?: number, name?: string }) {
    if (!value) return
    return (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-linear-to-tr from-rose-600 to-pink-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md shadow-rose-500/30">
            ٪{Number(value).toLocaleString()} {name}
        </div>
    )
}
