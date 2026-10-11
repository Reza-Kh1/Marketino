import { cn } from "@/lib/utils";
import { Percent } from "lucide-react";
import React from "react";

export default function OffBtn({ value, name, haveFeature }: { value?: number; name?: string; haveFeature?: boolean }) {
    if (!value) return null;
    return (
        <div className={cn(
            haveFeature ? 'top-9 right-2' : 'top-2 right-2',
            "absolute inline-flex items-center justify-center gap-1 bg-linear-to-tr from-rose-600 to-pink-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md shadow-rose-500/30"
        )}>
            <span className="flex gap-1 mt-0.5">{Number(value).toLocaleString('fa')}<Percent className="w-2.5 h-2.5 sm:w-3 sm:h-3"/></span>
            {name && <span className="text-[9px] sm:text-[11px] opacity-90">{name}</span>}
        </div>
    );
}