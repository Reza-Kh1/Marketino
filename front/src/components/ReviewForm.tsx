'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { shopsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  sellerId: string;
  sellerName: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ sellerId, sellerName, onSuccess }: ReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <p className="text-muted-foreground text-sm">برای ثبت نظر باید وارد حساب کاربری خود شوید</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-black text-emerald-700 dark:text-emerald-400">نظر شما ثبت شد!</h3>
        <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">با تشکر از بازخورد شما</p>
      </motion.div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('لطفاً امتیاز را انتخاب کنید'); return; }
    if (body.trim().length < 5) { toast.error('لطفاً نظر خود را بنویسید (حداقل ۵ کاراکتر)'); return; }

    setLoading(true);
    try {
      await shopsApi.review?.(sellerId, { rating, body: body.trim() });
      setSubmitted(true);
      toast.success('نظر شما با موفقیت ثبت شد');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ثبت نظر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-black text-lg mb-4">نظر شما درباره {sellerName}</h3>

      {/* Star Selector */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button"
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
            className="transition-all duration-150 hover:scale-125"
          >
            <Star
              className={cn(
                'w-8 h-8 transition-colors',
                (hoverRating || rating) >= i
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30',
              )}
            />
          </button>
        ))}
        <span className="text-sm font-bold text-amber-500 mr-2">
          {rating > 0 ? `${rating} از ۵` : 'امتیاز دهید'}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="نظر خود را درباره این فروشنده بنویسید..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none mb-3"
      />

      {/* Submit */}
      <button type="submit" disabled={loading}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all',
          'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg',
          loading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <Send className="w-4 h-4" />
        {loading ? 'در حال ثبت...' : 'ثبت نظر'}
      </button>
    </form>
  );
}
