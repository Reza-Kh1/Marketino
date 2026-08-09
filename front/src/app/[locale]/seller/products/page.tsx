'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
import { sellerApi, productsApi, type Product } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_NAMES: Record<string, string> = { pending: 'در انتظار', approved: 'تأیید شده', inactive: 'غیرفعال', featured: 'ویژه' };
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600', featured: 'bg-violet-100 text-violet-700',
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerApi.products().then(data => setProducts(data.products || [])).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    if (search && !p.title.includes(search)) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black">محصولات من</h2>
          <p className="text-muted-foreground text-sm">مدیریت محصولات فروشگاه</p>
        </div>
        <Link href="/seller/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> محصول جدید
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی محصول..." className="w-full h-10 pr-9 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">همه وضعیت‌ها</option>
          <option value="pending">در انتظار تأیید</option>
          <option value="approved">تأیید شده</option>
          <option value="inactive">غیرفعال</option>
          <option value="featured">ویژه</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/50">
              <tr>
                <th className="text-right py-3 px-4 font-bold">محصول</th>
                <th className="text-right py-3 px-4 font-bold hidden md:table-cell">دسته‌بندی</th>
                <th className="text-right py-3 px-4 font-bold">قیمت</th>
                <th className="text-right py-3 px-4 font-bold hidden sm:table-cell">موجودی</th>
                <th className="text-right py-3 px-4 font-bold">وضعیت</th>
                <th className="text-right py-3 px-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{p.categoryId || '---'}</td>
                  <td className="py-3 px-4 font-bold">{(p.discountPrice || p.price).toLocaleString()}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">{p.quantity}</td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', p.isFeatured ? STATUS_COLORS.featured : STATUS_COLORS.approved)}>
                      {p.isFeatured ? 'ویژه' : 'تأیید شده'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Link href={`/products/${p.id}`} className="p-2 rounded-lg hover:bg-accent transition-colors" title="مشاهده"><Eye className="w-4 h-4" /></Link>
                      <Link href={`/seller/products/${p.id}/edit`} className="p-2 rounded-lg hover:bg-accent transition-colors" title="ویرایش"><Edit className="w-4 h-4" /></Link>
                      <button onClick={async () => {
                        if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
                        try {
                          await productsApi.delete(p.id);
                          setProducts(prev => prev.filter(pr => pr.id !== p.id));
                          toast.success('محصول حذف شد');
                        } catch { toast.error('خطا در حذف محصول'); }
                      }} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">محصولی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
