'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Send, AlertTriangle, FileText, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'fake', label: 'کالای تقلبی', icon: '🛑' },
  { value: 'price', label: 'گران‌فروشی', icon: '💰' },
  { value: 'notdelivered', label: 'عدم ارسال کالا', icon: '📦' },
  { value: 'defective', label: 'کالای معیوب', icon: '🔧' },
  { value: 'wronginfo', label: 'اطلاعات نادرست', icon: '📝' },
  { value: 'misconduct', label: 'برخورد نامناسب فروشنده', icon: '😠' },
  { value: 'spam', label: 'هرزنامه یا تبلیغات', icon: '📢' },
  { value: 'other', label: 'سایر', icon: '📌' },
];

export default function ReportPage() {
  const [form, setForm] = useState({ type: '', orderNumber: '', sellerName: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) { toast.error('لطفاً نوع تخلف را انتخاب کنید'); return; }
    if (!form.description.trim()) { toast.error('لطفاً شرح تخلف را وارد کنید'); return; }
    setLoading(true);
    setTimeout(() => {
      toast.success('گزارش شما با موفقیت ثبت شد. تیم پشتیبانی بررسی خواهد کرد ✅');
      setForm({ type: '', orderNumber: '', sellerName: '', description: '' });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Flag className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6">گزارش تخلف</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              در صورت مشاهده هرگونه تخلف، مشکل یا رفتار نامناسب، از طریق این فرم گزارش دهید. هویت شما محفوظ خواهد ماند.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8">
          {/* Report Type */}
          <div className="mb-6">
            <label className="block text-sm font-black mb-3">نوع تخلف *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {REPORT_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                  className={`p-3 rounded-xl border text-sm font-bold text-center transition-all ${form.type === t.value
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'border-border hover:bg-accent'}`}>
                  <div className="text-lg mb-1">{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-1.5">شماره سفارش</label>
              <input type="text" value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="اختیاری" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">نام فروشنده</label>
              <input type="text" value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="اختیاری" />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-black mb-1.5">شرح تخلف *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="لطفاً توضیح دهید چه اتفاقی افتاده است..." />
            <p className="text-xs text-muted-foreground mt-2">توضیحات دقیق به ما کمک می‌کند سریع‌تر به مشکل رسیدگی کنیم</p>
          </div>

          {/* Upload */}
          <div className="mb-6 p-4 border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">آپلود تصویر یا اسکرین‌شات (اختیاری)</p>
            <p className="text-xs text-muted-foreground mt-1">فرمت‌های jpg, png - حداکثر ۵ مگابایت</p>
          </div>

          {/* Notice */}
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <p className="font-bold mb-1">توجه</p>
              <p>گزارش نادرست یا سوءاستفاده از این فرم پیگرد قانونی دارد. اطلاعات تماس شما برای پیگیری محفوظ می‌ماند.</p>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
            <Send className="w-4 h-4" /> {loading ? 'در حال ثبت...' : 'ثبت گزارش'}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
