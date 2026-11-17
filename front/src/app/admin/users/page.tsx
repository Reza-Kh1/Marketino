'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Shield, CheckCircle, XCircle, User, Store } from 'lucide-react';
import { adminApi, PaginationType, type User as UserType } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import PaginationBar from '@/components/admin/PaginationBar';
import { toast } from 'sonner';

interface AdminUser extends UserType {
  orderCount?: number;
  permissions?: string[];
  isSuperAdmin?: boolean;
}

const ROLE_NAMES: Record<string, string> = { buyer: 'خریدار', seller: 'فروشنده', admin: 'مدیر' };
const ROLE_COLORS: Record<string, string> = { buyer: 'bg-blue-100 text-blue-700', seller: 'bg-emerald-100 text-emerald-700', admin: 'bg-red-100 text-red-700' };
const STATUS_COLORS: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationType>();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const pages = useSearchParams()
  const fetchUsers = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.users({ page: pages.get('page') || 1, role: roleFilter || undefined, q: search || undefined });
      setUsers(res.users);
      setTotal(res.pagination?.total);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(page); }, [page, roleFilter]);
  useEffect(() => {
    if (search === '') fetchUsers(1);
  }, [search, pages]);

  const handleSearch = () => fetchUsers(1);

  const handleToggle = async (id: string) => {
    try {
      await adminApi.toggleUser(id);
      toast.success('وضعیت کاربر تغییر کرد');
      fetchUsers(page);
    } catch (err: any) { toast.error(err?.message || 'خطا'); }
  };

  const handleChangeRole = async (id: string, role: string) => {
    try {
      await adminApi.changeRole(id, role);
      toast.success('نقش کاربر تغییر کرد');
      fetchUsers(page);
    } catch (err: any) { toast.error(err?.message || 'خطا'); }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">مدیریت کاربران</h2>
        <p className="text-muted-foreground text-sm">مشاهده و مدیریت تمام کاربران ({total} کاربر)</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="جستجو نام، ایمیل یا نام کاربری..."
            className="w-full h-10 pr-9 pl-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm">
          <option value="">همه نقش‌ها</option>
          <option value="buyer">خریدار</option>
          <option value="seller">فروشنده</option>
          <option value="admin">مدیر</option>
          <option value="superAdmin">مدیر اصلی</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {users.length ?
            <table className="w-full text-sm">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-right py-3 px-4 font-bold">کاربر</th>
                  <th className="text-right py-3 px-4 font-bold hidden md:table-cell">ایمیل</th>
                  <th className="text-right py-3 px-4 font-bold">نقش</th>
                  <th className="text-right py-3 px-4 font-bold hidden sm:table-cell">وضعیت</th>
                  <th className="text-right py-3 px-4 font-bold hidden lg:table-cell">تاریخ عضویت</th>
                  <th className="text-right py-3 px-4 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-3 px-4"><div className="h-10 bg-accent rounded-xl animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-5 bg-accent rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-6 w-16 bg-accent rounded-full animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-6 w-12 bg-accent rounded-full animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-20 bg-accent rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-8 w-16 bg-accent rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : (
                  users?.length && users?.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-t border-border hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold text-sm">
                            {(u.firstName || u.username)[0]}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1">
                              {u.firstName} {u.lastName}
                              {u.isSuperAdmin && <Shield className="w-3.5 h-3.5 text-red-500" />}
                            </div>
                            <div className="text-xs text-muted-foreground">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', ROLE_COLORS[u.role])}>
                          {u.isSuperAdmin ? 'مدیر اصلی' : ROLE_NAMES[u.role]}
                        </span>
                        {u.role === 'seller' && u.sellerStatus && (
                          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold mr-1', STATUS_COLORS[u.sellerStatus])}>
                            {u.sellerStatus === 'approved' ? 'تأیید شده' : u.sellerStatus === 'pending' ? 'در انتظار' : 'رد شده'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                          {u.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fa-IR') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => handleToggle(u.id)} title={u.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                            className={cn('p-2 rounded-lg transition-colors', u.isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-emerald-50 text-emerald-600')}>
                            {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          {u.role !== 'admin' && !u.isSuperAdmin && (
                            <button onClick={() => handleChangeRole(u.id, u.role === 'buyer' ? 'seller' : 'buyer')}
                              className="p-2 rounded-lg hover:bg-accent transition-colors" title="تغییر نقش">
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
            : null}
        </div>

        {!loading && users.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">کاربری یافت نشد</p>
          </div>
        )}
      </div>
      <PaginationBar
        pagination={pagination}
      />
    </div>
  );
}
