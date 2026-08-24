import React from "react";

export default function OffBtn({ value, name, }: { value?: number; name?: string; }) {
    if (!value) return null;
    return (
        <div className="absolute top-2 left-2 inline-flex items-center justify-center gap-1 bg-linear-to-tr from-rose-600 to-pink-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-1.5 rounded-xl shadow-md shadow-rose-500/30 leading-none select-none">
            <span className="flex items-center gap-0.5 leading-none">
                <span>٪</span>
                <span>{Number(value).toLocaleString()}</span>
            </span>
            {name && <span className="leading-none text-[9px] sm:text-[11px] opacity-90">{name}</span>}
        </div>
    );
}