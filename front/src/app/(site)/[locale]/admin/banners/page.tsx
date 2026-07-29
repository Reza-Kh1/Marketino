'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, X, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { bannersApi, type Banner } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const POSITION_NAMES: Record<string, string> = { hero: 'اصلی', secondary: 'فرعی' };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', ctaText: '', position: 'hero' as const, isActive: true });

  const fetchBanners = async () => {
    setLoading(true); setError(false);
    try { const res = await bannersApi.list(); setBanners(res.banners); } catch { setError(true); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) { toast.error('عنوان و تصویر الزامی است'); return; }
    setSaving(true);
    try { await bannersApi.create(form); toast.success('بنر ایجاد شد'); setShowForm(false); fetchBanners(); } catch { toast.error('خطا در ذخیره'); } finally { setSaving(false); }
  };

  const handleToggle = async (b: Banner) => {
    try { await bannersApi.update(b.id, { isActive: !b.isActive }); fetchBanners(); } catch { toast.error('خطا'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف شود؟')) return;
    try { await bannersApi.delete(id); fetchBanners(); } catch { toast.error('خطا'); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-accent rounded-2xl animate-pulse" />)}</div>;

  if (error) return (
    <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground mb-2">خطا در دریافت اطلاعات</p><button onClick={fetchBanners} className="text-primary font-bold">تلاش مجدد</button></div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black mb-1">مدیریت بنرها</h2><p className="text-muted-foreground text-sm">{banners.length} بنر</p></div>
        <button onClick={() => { setForm({ title: '', subtitle: '', image: '', link: '', ctaText: '', position: 'hero', isActive: true }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm"><Plus className="w-4 h-4" /> افزودن بنر</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-black text-lg">بنر جدید</h3><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-bold mb-1">عنوان</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full h-11 rounded-xl border border-border bg-background px-4" /></div>
              <div><label className="block text-sm font-bold mb-1">زیرعنوان</label><input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} className="w-full h-11 rounded-xl border border-border bg-background px-4" /></div>
              <div><label className="block text-sm font-bold mb-1">آدرس تصویر</label><input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="w-full h-11 rounded-xl border border-border bg-background px-4" placeholder="https://..." /></div>
              <div><label className="block text-sm font-bold mb-1">لینک</label><input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} className="w-full h-11 rounded-xl border border-border bg-background px-4" /></div>
              <div><label className="block text-sm font-bold mb-1">متن دکمه</label><input value={form.ctaText} onChange={e => setForm(p => ({ ...p, ctaText: e.target.value }))} className="w-full h-11 rounded-xl border border-border bg-background px-4" /></div>
              <div><label className="block text-sm font-bold mb-1">موقعیت</label><select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value as 'hero' }))} className="w-full h-11 rounded-xl border border-border bg-background px-4"><option value="hero">اصلی</option><option value="secondary">فرعی</option></select></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} /><span className="text-sm font-bold">فعال</span></div>
              <button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="text-center py-16"><Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">هیچ بنری وجود ندارد</p></div>
      ) : (
        <div className="space-y-4">
          {banners.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-24 bg-accent"><img src={b.image} alt={b.title} className="w-full h-full object-cover" onError={e => { (e.target as any).style.display = 'none'; }} /></div>
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-1"><h3 className="font-black">{b.title}</h3><span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', b.position === 'hero' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700')}>{POSITION_NAMES[b.position]}</span></div>
                  {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => handleToggle(b)} className="flex items-center gap-1 text-sm">{b.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}{b.isActive ? 'فعال' : 'غیرفعال'}</button>
                    <button onClick={() => handleDelete(b.id)} className="text-sm text-red-500 hover:underline">حذف</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
