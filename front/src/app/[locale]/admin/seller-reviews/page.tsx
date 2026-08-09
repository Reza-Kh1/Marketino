'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Trash2, User, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SellerReview {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  reviewer: { id: string; username: string; firstName?: string; lastName?: string };
  seller: { id: string; storeName?: string; username: string };
}

export default function AdminSellerReviewsPage() {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchReviews = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.sellerReviews({ page: p, limit: 20 });
      setReviews(res.reviews);
      setTotal(res.total);
      setTotalPages(res.pages);
    } catch {
      toast.error('خطا در دریافت نظرات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(page); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return;
    try {
      await adminApi.deleteSellerReview(id);
      toast.success('نظر با موفقیت حذف شد');
      fetchReviews(page);
    } catch (err: any) {
      toast.error(err?.message || 'خطا در حذف نظر');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">مدیریت نظرات فروشندگان</h2>
        <p className="text-muted-foreground text-sm">بررسی و حذف نظرات ({total} نظر)</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-accent rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <Star className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">نظری یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>

                  {/* Body */}
                  <p className="text-sm leading-relaxed mb-3">{review.body || 'بدون متن'}</p>

                  {/* Users */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>از: {review.reviewer?.firstName} {review.reviewer?.lastName} (@{review.reviewer?.username})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      <span>برای: {review.seller?.storeName || review.seller?.username}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleDelete(review.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl bg-accent hover:bg-muted disabled:opacity-30 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold px-4">
                {page} از {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl bg-accent hover:bg-muted disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
