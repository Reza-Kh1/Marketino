'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Search, Filter, Eye, MessageSquare, User,
  Package, CheckCircle, XCircle, Trash2, AlertTriangle,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Review {
  id: string; productId: string; productTitle: string; productImage?: string;
  userId: string; userName: string; userAvatar?: string;
  rating: number; comment: string; status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار', approved: 'تایید شده', rejected: 'رد شده',
};

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Using seller reviews API; in real backend there should be a staff-facing endpoint
      const { sellerReviewsApi } = await import('@/lib/api');
      // For now, use mock data until backend endpoint is available
      setReviews([
        { id: 'r1', productId: 'p1', productTitle: 'گوشی هوشمند X1 Pro 5G', productImage: '', userId: 'u1', userName: 'علی محمدی', rating: 4, comment: 'کیفیت ساخت عالی و دوربین فوق‌العاده. ارزش خرید بالایی داره.', status: 'approved', createdAt: '۱۴۰۵-۰۳-۰۷' },
        { id: 'r2', productId: 'p2', productTitle: 'هدفون بی‌سیم مدل AirBuds Pro', productImage: '', userId: 'u2', userName: 'سارا احمدی', rating: 5, comment: 'صدای واضح و باس قوی. بسته‌بندی هم عالی بود.', status: 'approved', createdAt: '۱۴۰۵-۰۳-۰۶' },
        { id: 'r3', productId: 'p3', productTitle: 'ساعت هوشمند مدل FitBand 7', productImage: '', userId: 'u3', userName: 'رضا کریمی', rating: 2, comment: 'باتریش خیلی زود خالی میشه. کیفیت ساخت متوسط.', status: 'pending', createdAt: '۱۴۰۵-۰۳-۰۸' },
        { id: 'r4', productId: 'p4', productTitle: 'کیف لپ‌تاپ چرم طبیعی', productImage: '', userId: 'u4', userName: 'مریم حسینی', rating: 3, comment: 'کیفیت معمولی. به نسبت قیمتش انتظار بیشتری داشتم.', status: 'pending', createdAt: '۱۴۰۵-۰۳-۰۸' },
        { id: 'r5', productId: 'p5', productTitle: 'پاوربانک 20000mAh فست شارژ', productImage: '', userId: 'u5', userName: 'امیر جعفری', rating: 1, comment: 'کاملا بی‌کیفیت! بعد از یک هفته دیگه شارژ نمیکنه', status: 'rejected', createdAt: '۱۴۰۵-۰۳-۰۵' },
      ]);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reviews.filter(r => {
    if (search && !r.comment.includes(search) && !r.productTitle.includes(search) && !r.userName.includes(search)) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (ratingFilter && r.rating !== Number(ratingFilter)) return false;
    return true;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0',
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={cn('w-3.5 h-3.5', i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600')} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">مدیریت نظرات</h1>
          <p className="text-sm text-muted-foreground">بررسی و تایید نظرات کاربران</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'کل نظرات', value: stats.total, color: 'from-blue-500 to-indigo-500' },
          { label: 'در انتظار تایید', value: stats.pending, color: 'from-amber-500 to-orange-500' },
          { label: 'تایید شده', value: stats.approved, color: 'from-emerald-500 to-teal-500' },
          { label: 'رد شده', value: stats.rejected, color: 'from-red-500 to-rose-500' },
          { label: 'میانگین امتیاز', value: stats.avgRating, color: 'from-violet-500 to-purple-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card p-4">
            <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2', s.color)}>
              <span className="text-white text-xs font-black">{s.value}</span>
            </div>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو در نظرات، محصولات یا کاربران..."
            className="w-full h-10 pr-9 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">همه وضعیت‌ها</option>
          <option value="pending">در انتظار تایید</option>
          <option value="approved">تایید شده</option>
          <option value="rejected">رد شده</option>
        </select>
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">همه امتیازها</option>
          <option value="5">★★★★★</option>
          <option value="4">★★★★</option>
          <option value="3">★★★</option>
          <option value="2">★★</option>
          <option value="1">★</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">نظری یافت نشد</p>
          </div>
        ) : (
          filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{r.userName}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', STATUS_STYLES[r.status])}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">{renderStars(r.rating)}</div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {r.productTitle}
                      </span>
                      <span>{r.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => toast.success('نظر تایید شد')}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="تایید نظر"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.success('نظر رد شد')}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="رد نظر"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('آیا از حذف این نظر مطمئن هستید؟')) toast.success('نظر حذف شد');
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    title="حذف نظر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
