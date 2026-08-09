'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Store, MapPin, Phone, Mail, Globe, Save, Upload, X, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BUSINESS_TYPES } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SellerSettingsPage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    storeName: user?.storeName || '',
    storeDescription: user?.storeDescription || '',
    businessType: user?.businessType || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
  });

  const [storeLogo, setStoreLogo] = useState<string | null>(user?.storeLogo || null);
  const [storeBanner, setStoreBanner] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
      return;
    }
    setLogoFile(file);
    setStoreLogo(URL.createObjectURL(file));
    toast.success('لوگو آپلود شد. پس از ذخیره تغییرات ثبت می‌شود');
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد');
      return;
    }
    setBannerFile(file);
    setStoreBanner(URL.createObjectURL(file));
    toast.success('بنر آپلود شد');
  };

  const handleSave = async () => {
    if (!form.storeName.trim()) {
      toast.error('نام فروشگاه الزامی است');
      return;
    }
    setSaving(true);
    try {
      // In real app: upload images first, then update store info via API
      // const logoUrl = logoFile ? (await uploadApi.image(logoFile)).url : storeLogo;
      // const bannerUrl = bannerFile ? (await uploadApi.image(bannerFile)).url : storeBanner;

      toast.success('تنظیمات فروشگاه با موفقیت ذخیره شد ✅');

      // Update local user state
      if (user) {
        updateUser({ ...user, storeName: form.storeName, storeDescription: form.storeDescription, businessType: form.businessType, storeLogo: storeLogo || undefined });
      }
    } catch {
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-1">تنظیمات فروشگاه</h2>
        <p className="text-muted-foreground text-sm">مدیریت اطلاعات، تصاویر و جزئیات فروشگاه</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Banner */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl overflow-hidden">
            <div
              className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => bannerInputRef.current?.click()}
              style={storeBanner ? { backgroundImage: `url(${storeBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!storeBanner && (
                <div className="text-center">
                  <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">کلیک کنید و بنر فروشگاه را آپلود کنید</span>
                  <p className="text-xs text-muted-foreground mt-1">سایز پیشنهادی: ۱۲۰۰ × ۴۰۰ پیکسل</p>
                </div>
              )}
              <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </div>
          </motion.div>

          {/* Store Info Form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> اطلاعات فروشگاه
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">نام فروشگاه *</label>
                <input type="text" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="نام فروشگاه خود را وارد کنید" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">حرفه / صنف</label>
                <select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">انتخاب کنید...</option>
                  {BUSINESS_TYPES.map(bt => (
                    <option key={bt.value} value={bt.value}>{bt.icon} {bt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">توضیحات فروشگاه</label>
                <textarea value={form.storeDescription} onChange={e => setForm({ ...form, storeDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="درباره فروشگاه خود توضیح دهید..." />
                <p className="text-xs text-muted-foreground mt-1">حداکثر ۵۰۰ کاراکتر</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    <Phone className="w-4 h-4 inline ml-1" /> تلفن تماس
                  </label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    <Mail className="w-4 h-4 inline ml-1" /> ایمیل
                  </label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="email@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">
                  <MapPin className="w-4 h-4 inline ml-1" /> آدرس فروشگاه
                </label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="آدرس فیزیکی فروشگاه (اختیاری)" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </motion.div>
        </div>

        {/* Sidebar - Logo Upload */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6 text-center">
            <h3 className="font-black text-lg mb-4">لوگوی فروشگاه</h3>

            {/* Logo Preview */}
            <div
              className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-accent cursor-pointer group mb-4 border-2 border-dashed border-border hover:border-emerald-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {storeLogo ? (
                <>
                  <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Store className="w-10 h-10 text-muted-foreground mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">آپلود لوگو</span>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>

            <p className="text-xs text-muted-foreground mb-4">سایز پیشنهادی: ۵۰۰ × ۵۰۰ پیکسل</p>

            {storeLogo && (
              <button onClick={() => { setStoreLogo(null); setLogoFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-xs text-red-500 hover:underline flex items-center gap-1 mx-auto">
                <X className="w-3 h-3" /> حذف لوگو
              </button>
            )}
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-black text-sm mb-4">راهنمای سریع</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                لوگوی باکیفیت باعث افزایش اعتماد خریداران می‌شود
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                توضیحات کامل فروشگاه به بهبود سئو کمک می‌کند
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                اطلاعات تماس دقیق، ارتباط با مشتریان را آسان‌تر می‌کند
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                بنر فروشگاه اولین چیزیست که خریداران می‌بینند
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
