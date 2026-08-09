'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CONTACT_INFO = [
  { icon: Phone, title: 'تلفن', value: '۰۲۱-۴۱۰۰۲۰۰۰', sub: 'شنبه تا پنجشنبه ۹ صبح تا ۶ عصر' },
  { icon: Mail, title: 'ایمیل', value: 'support@bazarche.ir', sub: 'پاسخگویی در کمتر از ۲۴ ساعت' },
  { icon: MapPin, title: 'آدرس', value: 'تهران، خیابان ولیعصر، مرکز تجارت الکترونیک', sub: 'کد پستی: ۱۹۶۸۶۱۳۳۷۳' },
  { icon: Clock, title: 'ساعت کاری', value: '۹:۰۰ صبح تا ۱۸:۰۰', sub: 'شنبه تا پنجشنبه' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('لطفاً فیلدهای ضروری را پر کنید');
      return;
    }
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      toast.success('پیام شما با موفقیت ارسال شد. به زودی با شما تماس می‌گیریم ✅');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-cyan-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6">تماس با ما</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              ما همیشه آماده شنیدن نظرات، پیشنهادات و سوالات شما هستیم. از طریق راه‌های زیر با ما در ارتباط باشید.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {CONTACT_INFO.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm font-mono" dir="ltr">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Map Placeholder */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-2xl p-6">
              <div className="bg-accent rounded-xl h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <span className="text-sm">نقشه موقعیت مکانی</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-8">
            <h2 className="text-xl font-black mb-6">ارسال پیام</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">نام و نام خانوادگی *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="نام شما" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">ایمیل *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">موضوع</label>
                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="موضوع پیام" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">پیام *</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="پیام خود را بنویسید..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
                <Send className="w-4 h-4" /> {loading ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
