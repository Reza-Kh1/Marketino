'use client';

import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  Send, 
  MessageCircle, 
  Twitter, 
  Linkedin, 
  Instagram,
  Facebook,
  Share,
  MessageSquare
} from 'lucide-react';
import TooltipCustom from '../TooltipCustom';
import { usePathname } from 'next/navigation';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
}

export const ShareBtn: React.FC<ShareButtonProps> = ({
  title = "هودی اسپرت طرح دار",
  text = "این محصول فوق‌العاده رو در فروشگاه بررسی کنید!",
  url: customUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const path = usePathname();

  useEffect(() => {
    if (customUrl) {
      setShareUrl(customUrl);
    } else {
      const origin = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_SITE_URL || '');
      setShareUrl(`${origin}${path}`);
    }
  }, [customUrl, path]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
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
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  const handleInstagramShare = async () => {
    await handleCopyLink();
    window.open('https://www.instagram.com/direct/inbox/', '_blank');
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title}\n${text}`);
  const sharePlatforms = [
    {
      name: 'تلگرام',
      icon: <Send className="w-5 h-5" />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      style: 'bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 border-sky-200/50 dark:border-sky-500/20 text-sky-600 dark:text-sky-400',
    },
    {
      name: 'واتساپ',
      icon: <MessageCircle className="w-5 h-5" />,
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      style: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 border-emerald-200/50 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      name: 'اینستاگرام',
      icon: <Instagram className="w-5 h-5" />,
      onClick: handleInstagramShare,
      style: 'bg-pink-50 dark:bg-pink-500/10 hover:bg-pink-100 border-pink-200/50 dark:border-pink-500/20 text-pink-600 dark:text-pink-400',
    },
    {
      name: 'بله',
      icon: <MessageSquare className="w-5 h-5" />,
      href: `https://ble.ir/share?url=${encodedUrl}&text=${encodedTitle}`,
      style: 'bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 border-teal-200/50 dark:border-teal-500/20 text-teal-600 dark:text-teal-400',
    },
    {
      name: 'روبیکا',
      icon: <Share className="w-5 h-5" />,
      href: `https://rubika.ir/share?url=${encodedUrl}&text=${encodedTitle}`,
      style: 'bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
    },
    {
      name: 'ایتا',
      icon: <Send className="w-5 h-5 rotate-45" />,
      href: `https://eitaa.com/share?url=${encodedUrl}&text=${encodedTitle}`,
      style: 'bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 border-orange-200/50 dark:border-orange-500/20 text-orange-600 dark:text-orange-400',
    },
    {
      name: 'لینکدین',
      icon: <Linkedin className="w-5 h-5" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      style: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 border-blue-200/50 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      name: 'توییتر (X)',
      icon: <Twitter className="w-5 h-5" />,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      style: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    },
    {
      name: 'فیسبوک',
      icon: <Facebook className="w-5 h-5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      style: 'bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 border-indigo-200/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <>
      <TooltipCustom placeHolder="اشتراک‌ گذاری">
        <button
          onClick={handleShare}
          className="p-3 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/50 bg-white dark:bg-slate-900/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
          title="اشتراک‌ گذاری"
          aria-label="اشتراک‌ گذاری"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </TooltipCustom>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-3xl p-6 shadow-2xl dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] z-10 animate-in zoom-in-95 duration-200">
            {/* هدر */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    اشتراک‌گذاری محصول
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    این محصول را در شبکه اجتماعی دلخواه ارسال کنید
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* گرید کامل پیام‌رسان‌ها */}
            <div className="py-5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                انتخاب شبکه اجتماعی:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {sharePlatforms.map((platform, idx) => (
                  platform.href ? (
                    <a
                      key={idx}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1.5 text-[11px] font-bold ${platform.style}`}
                    >
                      {platform.icon}
                      <span>{platform.name}</span>
                    </a>
                  ) : (
                    <button
                      key={idx}
                      onClick={platform.onClick}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1.5 text-[11px] font-bold cursor-pointer ${platform.style}`}
                    >
                      {platform.icon}
                      <span>{platform.name}</span>
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* بخش کپی لینک */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 mt-3">
                یا لینک صفحه را کپی کنید:
              </p>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full pl-28 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 dir-ltr outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  onClick={handleCopyLink}
                  className={`absolute left-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    copied
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
          </div>
        </div>
      )}
    </>
  );
};