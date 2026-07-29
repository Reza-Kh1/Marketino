'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Search, Store, CheckCircle, XCircle, Star, Eye, ShieldAlert } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SellerItem {
  id: string; username: string; email: string;
  firstName?: string; lastName?: string;
  storeName?: string; storeLogo?: string; businessType?: string;
  sellerStatus: string; isActive: boolean; isVerified: boolean;
  commissionRate: number; createdAt: string;
  productCount: number; totalSales: number;
  rating: number; reviewCount?: number;
}

const STATUS_COLORS: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };
const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار تأیید', approved: 'تأیید شده', rejected: 'رد شده' };

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [reason, setReason] = useState('');
  const [total, setTotal] = useState(0);

  const fetchSellers = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.sellers({ page: p, status: statusFilter || undefined });
      setSellers(res.sellers as SellerItem[]);
      setTotal(res.total);
      setTotalPages(Math.ceil(res.total / 20));
    } catch {
      toast.error('خطا در دریافت لیست فروشندگان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSellers(page); }, [page, statusFilter]);

  const handleVerify = async (approved: boolean) => {
    try {
      await adminApi.verifySeller(selectedId, { approved, reason: reason || undefined });
      toast.success(approved ? 'فروشنده تأیید شد' : 'فروشنده رد شد');
      setModalOpen(false);
      setReason('');
      fetchSellers(page);
    } catch (err: any) { toast.error(err?.message || 'خطا'); }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">مدیریت فروشندگان</h2>
        <p className="text-muted-foreground text-sm">مشاهده، تأیید و مدیریت فروشندگان ({total})</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm">
          <option value="">همه وضعیت‌ها</option>
          <option value="pending">در انتظار تأیید</option>
          <option value="approved">تأیید شده</option>
          <option value="rejected">رد شده</option>
        </select>
      </div>

      {/* Sellers Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/50">
              <tr>
                <th className="text-right py-3 px-4 font-bold">فروشگاه</th>
                <th className="text-right py-3 px-4 font-bold hidden md:table-cell">ایمیل</th>
                <th className="text-right py-3 px-4 font-bold">وضعیت</th>
                <th className="text-right py-3 px-4 font-bold hidden sm:table-cell">محصولات</th>
                <th className="text-right py-3 px-4 font-bold hidden lg:table-cell">امتیاز</th>
                <th className="text-right py-3 px-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-3 px-4"><div className="h-10 bg-accent rounded-xl animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-5 bg-accent rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-6 w-20 bg-accent rounded-full animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-5 w-12 bg-accent rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-5 w-12 bg-accent rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-8 w-20 bg-accent rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : sellers.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-xl">
                        {s.storeLogo || '🏪'}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1 text-sm">
                          {s.storeName || s.username}
                          {s.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground">@{s.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{s.email}</td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', STATUS_COLORS[s.sellerStatus] || '')}>
                      {STATUS_LABELS[s.sellerStatus] || s.sellerStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm font-bold hidden sm:table-cell">{s.productCount}</td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-mono font-bold text-sm">{s.rating}</span>
                      <span className="text-xs text-muted-foreground">({s.reviewCount})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Link href={`/shops/${s.id}`} className="p-2 rounded-lg hover:bg-accent transition-colors" title="مشاهده">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </Link>
                      {s.sellerStatus === 'pending' && (
                        <button onClick={() => { setSelectedId(s.id); setModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-accent transition-colors" title="بررسی">
                          <ShieldAlert className="w-4 h-4 text-amber-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && sellers.length === 0 && (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">فروشنده‌ای یافت نشد</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-muted disabled:opacity-30 text-sm font-bold">قبلی</button>
          <span className="text-sm font-bold px-3">{page} از {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-muted disabled:opacity-30 text-sm font-bold">بعدی</button>
        </div>
      )}

      {/* Verify Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-black mb-4">بررسی فروشنده</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="دلیل تأیید یا رد را بنویسید..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => handleVerify(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors">
                <CheckCircle className="w-4 h-4" /> تأیید فروشنده
              </button>
              <button onClick={() => handleVerify(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">
                <XCircle className="w-4 h-4" /> رد فروشنده
              </button>
            </div>
            <button onClick={() => setModalOpen(false)}
              className="w-full mt-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-primary transition-colors">
              انصراف
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
