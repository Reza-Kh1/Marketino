"use client";
import { Heart, HeartOff } from "lucide-react";
import TooltipCustom from "../TooltipCustom";
import MotionWrapper from "../motion/MotionWrapper";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useWishlistItem } from "@/hooks/wishList.hook";

export default function LikeButton({ productId, isCard = false }: { productId: string, isCard?: boolean }) {
  const { isInWishlist, isLoading, toggleWishlist } = useWishlistItem(productId)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // تا وقتی mount نشده، همیشه false بده تا با سرور یکی باشه
  const liked = mounted ? isInWishlist : false

  const addWishList = () => {
    toggleWishlist()
  }

  return (
    <>
      {isCard ?
        <TooltipCustom placeHolder="افزودن به علاقه مندی ها">
          <MotionWrapper className=" absolute z-40 left-2 top-2" preset="slideUpBlur">
            <button
              type="button"
              aria-label="افزودن به علاقه‌مندی‌ها"
              aria-pressed={liked}
              onClick={addWishList}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                ' p-2 rounded-lg cursor-pointer transition-all duration-300',
                'backdrop-blur-xl bg-white/60 text-slate-950/70 dark:bg-slate-950/50 hover:dark:text-red-500 hover:dark:bg-white/80 dark:text-white/70 border shadow',
                liked && 'text-red-500 dark:text-red-500'
              )}
            >
              {liked && isHovered ? (
                <HeartOff className="sm:w-4 w-3.5 sm:h-4 h-3.5" />
              ) : (
                <Heart className={cn(
                  'sm:w-4 w-3.5 sm:h-4 h-3.5 transition-all duration-300 relative z-10',
                  liked && 'fill-red-500'
                )} />
              )}
            </button>
          </MotionWrapper>
        </TooltipCustom>
        :
        <div>
          <TooltipCustom placeHolder="افزودن به علاقه مندی ها">
            <MotionWrapper preset="slideUpBlur">
              <button
                type="button"
                onClick={addWishList}
                aria-pressed={liked}
                aria-label="افزودن به علاقه‌مندی‌ها"
                className={`p-3 cursor-pointer rounded-xl border dark:bg-slate-900/50 transition-all hover:shadow-lg hover:shadow-pink-800/20 ${liked
                  ? "dark:border-pink-800 border-red-500 text-red-500 dark:text-pink-800 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                  : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-pink-500 hover:border-pink-500/50"
                  }`}
              >
                {isLoading ? <div className="spinner" /> :
                  <Heart className={`w-5 h-5 `} />
                }
              </button>
            </MotionWrapper>
          </TooltipCustom>
        </div>
      }
    </>
  );
}