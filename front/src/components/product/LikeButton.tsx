"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import TooltipCustom from "../TooltipCustom";

export default function LikeButton({ initialLiked = false }: { initialLiked?: boolean }) {
  const [isLiked, setIsLiked] = useState(initialLiked);

  return (
    <TooltipCustom placeHolder="افزودن به علاقه مندی ها">
      <button
        type="button"
        onClick={() => setIsLiked((v) => !v)}
        aria-pressed={isLiked}
        aria-label="افزودن به علاقه‌مندی‌ها"
        className={`p-3 cursor-pointer rounded-xl border transition-all ${isLiked
          ? "border-pink-500 bg-pink-500/10 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
          : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-pink-500 hover:border-pink-500/50"
          }`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? "fill-pink-500" : ""}`} />
      </button>
    </TooltipCustom>
  );
}
