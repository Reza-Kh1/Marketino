import { calculateProductSoldPercent } from '@/lib/utils-product'
import { ProductSeller, ProductVariant } from '@/types/types'
import { Flame, Sparkles, Zap } from 'lucide-react'

export default function Featured({ seller, discount, variants }: { seller: ProductSeller, discount: number | null, variants?: ProductVariant[] }) {
  const { percent } = calculateProductSoldPercent(variants || [])
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 dark:border-cyan-500/30 bg-linear-to-r from-slate-50 via-cyan-50/40 to-indigo-50/60 dark:from-slate-950 dark:via-[#070b18] dark:to-indigo-950/80 p-3.5 sm:p-5 backdrop-blur-xl shadow-lg dark:shadow-[0_0_30px_rgba(6,182,212,0.12)] mb-6 transition-colors duration-300">
      <div className="absolute top-0 right-0 left-0 h-0.5 bg-linear-to-r from-indigo-300 via-cyan-500 to-indigo-300 dark:from-indigo-950 dark:via-cyan-400 dark:to-indigo-950 animate-pulse" />
      <div className="absolute -top-10 -right-10 w-28 h-28 sm:w-36 sm:h-36 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 sm:w-36 sm:h-36 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Icon Box */}
          <div className="relative p-2 sm:p-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 dark:to-orange-700 text-white shadow-lg shadow-amber-500/25 shrink-0 border border-amber-400/30">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-amber-500"></span>
            </span>
          </div>

          {/* Text Container */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-lg font-black bg-linear-to-r from-cyan-600 via-slate-800 to-indigo-700 dark:from-cyan-400 dark:via-slate-200 dark:to-indigo-300 bg-clip-text text-transparent">
                پیشنهاد ویژه
              </span>

              {/* Discount Badge */}
              {discount && (
                <span className="inline-flex items-center gap-1 bg-cyan-500/15 dark:bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-400 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md font-bold">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {discount}٪ تخفیف
                </span>
              )}
            </div>
            <div className="w-full overflow-hidden whitespace-nowrap mt-0.5 max-w-50 sm:max-w-none">
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium animate-marquee sm:animate-none sm:whitespace-normal">
                فرصت محدود — {discount && ' تخفیف ویژه '} فروش فوق‌العاده {seller.storeName}
              </p>
            </div>
          </div>
        </div>

        {/* CENTER / LEFT SIDE: Stock Progress Bar */}
        <div className="w-full md:w-52 space-y-1 sm:space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 md:border-t-0 md:pt-0">
          <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 dark:text-amber-400" />
              فروش رفته:
            </span>
            <span className="text-cyan-600 dark:text-cyan-400 font-black">{percent.toLocaleString('fa')}٪</span>
          </div>
          <div className="w-full h-2 sm:h-2.5 bg-slate-200/80 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300/80 dark:border-slate-800/80 p-0.5">
            <div
              className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-500 dark:to-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-1000"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}