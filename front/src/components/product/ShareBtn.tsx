'use client'
import React, { useState } from 'react';
import { Share2, Copy, Check, X, Send, MessageCircle, Twitter } from 'lucide-react';
import TooltipCustom from '../TooltipCustom';
interface ShareButtonProps {
    title?: string;
    text?: string;
    url?: string;
}

export const ShareBtn: React.FC<ShareButtonProps> = ({
    title = "هودی اسپرت طرح دار",
    text = "این محصول فوق‌العاده رو در فروشگاه بررسی کنید!",
    url = typeof window !== 'undefined' ? window.location.href : '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
                return;
            } catch (error) {
                if ((error as Error).name === 'AbortError') return;
            }
        }
        setIsOpen(true);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <>
            <TooltipCustom placeHolder="اشتراک‌گذاری">
                <button
                    onClick={handleShare}
                    className="p-3 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                    title="اشتراک‌گذاری"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </TooltipCustom>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
                    <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-3xl p-6 shadow-2xl dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] z-10 transition-all">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
                                    <Share2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                        اشتراک‌گذاری محصول
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        این محصول را با دوستان خود به اشتراک بگذارید
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* بخش شبکه‌های اجتماعی سریع در دسکتاپ */}
                        <div className="py-5">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                ارسال مستقیم از طریق:
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {/* تلگرام */}
                                <a
                                    href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/50 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 transition-all gap-1.5 text-xs font-medium"
                                >
                                    <Send className="w-5 h-5" />
                                    <span>تلگرام</span>
                                </a>

                                {/* واتساپ */}
                                <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${url}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200/50 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all gap-1.5 text-xs font-medium"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>واتساپ</span>
                                </a>

                                {/* توییتر / X */}
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all gap-1.5 text-xs font-medium"
                                >
                                    <Twitter className="w-5 h-5" />
                                    <span>توییتر</span>
                                </a>
                            </div>
                        </div>

                        {/* بخش کپی لینک با فیلد ورودی */}
                        <div className="pt-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                یا لینک صفحه را کپی کنید:
                            </p>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    readOnly
                                    value={url}
                                    className="w-full pl-24 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 dir-ltr outline-none focus:border-cyan-500"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className={`absolute left-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${copied
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>کپی شد!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>کپی لینک</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* توضیحات پایین دیالوگ */}
                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
                            <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                                ✨ با به اشتراک‌گذاری این محصول، به دوستان خود در انتخاب بهتر کمک کنید. لینک کپی شده تا همیشه معتبر خواهد بود.
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};