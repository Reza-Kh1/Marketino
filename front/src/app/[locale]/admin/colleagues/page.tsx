'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Trash2, Settings, X, Save, Check, AlertTriangle, Power, PowerOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  useAdminColleagues, useAddColleague, useUpdateColleaguePermissions, useRemoveColleague, useToggleColleagueActive,
} from '@/lib/react-query-hooks';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Colleague {
  id: string; username: string; email: string; firstName: string; lastName: string;
  permissions: string[];
  isActive: boolean; createdAt: string;
}

const PERMISSION_LIST = [
  { key: 'dashboard', label: 'داشبورد' },
  { key: 'users', label: 'مدیریت کاربران' },
  { key: 'products', label: 'مدیریت محصولات' },
  { key: 'orders', label: 'مدیریت سفارشات' },
  { key: 'sellers', label: 'مدیریت فروشندگان' },
  { key: 'discounts', label: 'کدهای تخفیف' },
  { key: 'settings', label: 'تنظیمات' },
  { key: 'reviews', label: 'مدیریت نظرات' },
  { key: 'messages', label: 'پیام‌ها' },
  { key: 'blog', label: 'وبلاگ' },
  { key: 'banners', label: 'بنرها' },
  { key: 'wallet', label: 'کیف پول' },
  { key: 'categories', label: 'دسته‌بندی‌ها' },
];

// Safe permissions parser — handles string or array from backend
function safePermissions(perm: unknown): string[] {
  if (!perm) return [];
  if (Array.isArray(perm)) return perm;
  if (typeof perm === 'string') {
    try { return JSON.parse(perm); } catch { return [perm]; }
  }
  return [];
}

export default function AdminColleaguesPage() {
  const { isSuperAdmin } = useAuth();
  const { data: rawData, isLoading: loading, error: queryError } = useAdminColleagues();

  // Ensure colleagues is always an array
  const colleagues: Colleague[] = Array.isArray(rawData) ? rawData : [];

  const addMutation = useAddColleague();
  const updatePermsMutation = useUpdateColleaguePermissions();
  const removeMutation = useRemoveColleague();
  const toggleActiveMutation = useToggleColleagueActive();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);

  // New colleague form
  const [form, setForm] = useState({
    username: '', email: '', password: '', firstName: '', lastName: '',
    permissions: [] as string[],
  });

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-black mb-2">دسترسی محدود</h3>
        <p className="text-muted-foreground">فقط مدیر اصلی می‌تواند همکاران را مدیریت کند</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }
    if (form.permissions.length === 0) {
      toast.error('حداقل یک دسترسی انتخاب کنید');
      return;
    }

    try {
      await addMutation.mutateAsync(form);
      toast.success('همکار جدید با موفقیت اضافه شد');
      setShowModal(false);
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '', permissions: [] });
    } catch (err: any) {
      console.error('[AddColleague] Error:', err);
      const msg = err?.message || err?.response?.data?.message || JSON.stringify(err);
      toast.error(msg.length > 100 ? 'خطا در افزودن همکار' : msg);
    }
  };

  const handleUpdatePermissions = (id: string) => {
    updatePermsMutation.mutate({ id, permissions: editPerms }, {
      onSuccess: () => { toast.success('دسترسی‌ها بروزرسانی شد'); setEditingId(null); },
      onError: (err: any) => toast.error(err?.message || 'خطا در بروزرسانی'),
    });
  };

  const handleRemove = (id: string) => {
    if (!confirm('آیا از حذف این همکار اطمینان دارید؟')) return;
    removeMutation.mutate(id, {
      onSuccess: () => toast.success('همکار با موفقیت حذف شد'),
      onError: (err: any) => toast.error(err?.message || 'خطا در حذف همکار'),
    });
  };

  const handleToggleActive = (id: string) => {
    toggleActiveMutation.mutate(id, {
      onSuccess: (res: any) => toast.success(res?.message || 'وضعیت همکار تغییر کرد'),
      onError: (err: any) => toast.error(err?.message || 'خطا در تغییر وضعیت'),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black">مدیریت همکاران</h2>
          <p className="text-muted-foreground text-sm">افزودن و مدیریت همکاران ادمین</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:shadow-lg transition-all">
          <UserPlus className="w-4 h-4" /> افزودن همکار
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-accent rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : colleagues.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <UserPlus className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">هنوز همکاری اضافه نشده است</p>
          <button onClick={() => setShowModal(true)} className="text-primary font-bold mt-2 hover:underline">افزودن اولین همکار</button>
        </div>
      ) : (
        <div className="space-y-4">
          {colleagues.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold text-sm">
                      {(c.firstName || c.username)[0]}
                    </div>
                    <div>
                      <div className="font-bold">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-muted-foreground">@{c.username} • {c.email}</div>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                      {c.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>

                  {/* Permissions */}
                  {editingId === c.id ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {PERMISSION_LIST.map(p => (
                        <button key={p.key} onClick={() => setEditPerms(prev =>
                          prev.includes(p.key) ? prev.filter(x => x !== p.key) : [...prev, p.key],
                        )}
                          className={cn(
                            'px-2 py-1 rounded-lg text-xs font-bold transition-colors',
                            editPerms.includes(p.key)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent text-muted-foreground',
                          )}>
                          {p.label}
                        </button>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleUpdatePermissions(c.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold">
                          <Save className="w-3 h-3" /> ذخیره
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-500 text-white text-xs font-bold">
                          <X className="w-3 h-3" /> لغو
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {safePermissions(c.permissions).map(p => (
                        <span key={p} className="px-2 py-0.5 rounded-full bg-accent text-xs text-muted-foreground font-bold">
                          {PERMISSION_LIST.find(pl => pl.key === p)?.label || p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => handleToggleActive(c.id)}
                    className={cn(
                      'p-2 rounded-xl transition-colors',
                      c.isActive
                        ? 'hover:bg-red-50 text-red-500'
                        : 'hover:bg-emerald-50 text-emerald-500',
                    )}
                    title={c.isActive ? 'غیرفعال کردن اکانت' : 'فعال کردن اکانت'}>
                    {c.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setEditingId(c.id); setEditPerms([...safePermissions(c.permissions)]); }}
                    className="p-2 rounded-xl hover:bg-accent transition-colors text-blue-500" title="ویرایش دسترسی‌ها">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleRemove(c.id)}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors text-red-500" title="حذف همکار">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Colleague Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">افزودن همکار جدید</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-accent transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">نام کاربری *</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">ایمیل *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">رمز عبور *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-1 block">نام</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">نام خانوادگی</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="text-sm font-bold mb-2 block">دسترسی‌ها *</label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSION_LIST.map(p => (
                    <button key={p.key} type="button"
                      onClick={() => setForm({
                        ...form,
                        permissions: form.permissions.includes(p.key)
                          ? form.permissions.filter(x => x !== p.key)
                          : [...form.permissions, p.key],
                      })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                        form.permissions.includes(p.key)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-muted-foreground',
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg transition-all">
                <UserPlus className="w-4 h-4" /> افزودن همکار
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
