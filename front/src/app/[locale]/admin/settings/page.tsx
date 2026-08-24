'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Globe, Shield, ShoppingBag, Truck, Palette, Users, ChevronDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import ShippingSettings from '@/components/settings/ShippingSettings';

const SETTING_SECTIONS = [
  {
    id: 'general',
    label: 'عمومی',
    icon: Globe,
    fields: [
      { key: 'site_name', label: 'نام سایت', type: 'text', placeholder: 'مثلاً: بازارچه', dir: 'rtl' },
      { key: 'site_description', label: 'توضیحات سایت', type: 'textarea', placeholder: 'توضیح کوتاه درباره بازارچه' },
      { key: 'contact_email', label: 'ایمیل پشتیبانی', type: 'email', placeholder: 'support@example.com', dir: 'ltr' },
      { key: 'contact_phone', label: 'تلفن پشتیبانی', type: 'text', placeholder: '۰۲۱-۱۲۳۴۵۶۷۸', dir: 'ltr' },
      { key: 'address', label: 'آدرس', type: 'textarea', placeholder: 'آدرس دفتر یا شرکت' },
    ],
  },
  {
    id: 'commerce',
    label: 'تنظیمات فروش',
    icon: ShoppingBag,
    fields: [
      { key: 'commission_rate', label: 'درصد کمیسیون (٪)', type: 'number', placeholder: 'مثلاً: ۵', step: '0.1' },
      { key: 'min_withdraw', label: 'حداقل برداشت (تومان)', type: 'number', placeholder: 'مثلاً: ۱۰۰۰۰۰' },
      { key: 'max_withdraw', label: 'حداکثر برداشت (تومان)', type: 'number', placeholder: 'مثلاً: ۵۰۰۰۰۰۰۰' },
      { key: 'buyer_protection_days', label: 'روزهای ضمانت خرید', type: 'number', placeholder: 'مثلاً: ۷' },
      { key: 'auto_approve_products', label: 'تأیید خودکار محصولات', type: 'toggle', description: 'محصولات جدید بدون بررسی تأیید شوند' },
    ],
  },
  // {
  //   id: 'shipping',
  //   label: 'تنظیمات ارسال',
  //   icon: Truck,
  //   fields: [
  //     { key: 'default_shipping_cost', label: 'نام (فارسی)', type: 'text', placeholder: '' },
  //     { key: 'default_shipping_cost', label: 'نام (انگلیسی)', type: 'text', placeholder: '' },
  //     { key: 'default_shipping_cost', label: 'هزینه ارسال پیش‌فرض (تومان)', type: 'number', placeholder: 'مثلاً: ۴۵۰۰۰' },
  //     { key: 'free_shipping_threshold', label: 'حداقل سفارش برای ارسال رایگان (تومان)', type: 'number', placeholder: 'مثلاً: ۵۰۰۰۰۰' },
  //     { key: 'max_delivery_days', label: 'حداکثر روزهای تحویل', type: 'number', placeholder: 'مثلاً: ۱۴' },
  //     { key: 'tracking_enabled', label: 'ترتیب نمایش', type: 'number', description: 'اولیت نمایش ارسال' },
  //     { key: 'tracking_enabled', label: 'فعال بودن تخفیف', type: 'toggle', description: 'فعال یا غیر فعال سازی ارسال' },
  //   ],
  // },
  {
    id: 'appearance',
    label: 'ظاهر',
    icon: Palette,
    fields: [
      { key: 'logo_url', label: 'آدرس لوگو', type: 'text', placeholder: 'https://example.com/logo.png', dir: 'ltr' },
      { key: 'favicon_url', label: 'آدرس Favicon', type: 'text', placeholder: 'https://example.com/favicon.ico', dir: 'ltr' },
      { key: 'primary_color', label: 'رنگ اصلی', type: 'text', placeholder: '#3B82F6', dir: 'ltr' },
      { key: 'hero_title', label: 'عنوان اصلی صفحه اول', type: 'text', placeholder: 'به بازارچه خوش آمدید' },
      { key: 'hero_subtitle', label: 'زیرعنوان صفحه اول', type: 'textarea', placeholder: 'بهترین بازار آنلاین خرید و فروش' },
    ],
  },
  {
    id: 'social',
    label: 'شبکه‌های اجتماعی',
    icon: Users,
    fields: [
      { key: 'instagram', label: 'اینستاگرام', type: 'text', placeholder: 'https://instagram.com/...', dir: 'ltr' },
      { key: 'telegram', label: 'تلگرام', type: 'text', placeholder: 'https://t.me/...', dir: 'ltr' },
      { key: 'twitter', label: 'توییتر (X)', type: 'text', placeholder: 'https://x.com/...', dir: 'ltr' },
      { key: 'youtube', label: 'یوتیوب', type: 'text', placeholder: 'https://youtube.com/...', dir: 'ltr' },
      { key: 'whatsapp', label: 'واتساپ', type: 'text', placeholder: 'https://wa.me/...', dir: 'ltr' },
    ],
  },
  {
    id: 'security',
    label: 'امنیت',
    icon: Shield,
    fields: [
      { key: 'max_login_attempts', label: 'حداکثر تلاش ورود ناموفق', type: 'number', placeholder: 'مثلاً: ۵' },
      { key: 'otp_expiry_minutes', label: 'مدت اعتبار کد OTP (دقیقه)', type: 'number', placeholder: 'مثلاً: ۵' },
      { key: 'require_email_verification', label: 'تأیید ایمیل اجباری', type: 'toggle', description: 'کاربران قبل از خرید باید ایمیل خود را تأیید کنند' },
      { key: 'maintenance_mode', label: 'حالت تعمیرات', type: 'toggle', description: 'سایت برای کاربران عادی غیرفعال شود' },
    ],
  },
];

type FieldType = { key: string; label: string; type: string; placeholder?: string; step?: string; dir?: string; description?: string };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general']));
  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (err: any) {
      toast.error('خطا در بارگذاری تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Debounce auto-save (1.5s after last change)
    if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
    const timer = setTimeout(() => autoSave(key, String(value)), 1500);
    setDebounceTimers(prev => ({ ...prev, [key]: timer }));
  };

  const autoSave = async (key: string, value: string) => {
    try {
      await adminApi.updateSettings({ [key]: value });
      setSavedKeys(prev => new Set(prev).add(key));
      setTimeout(() => {
        setSavedKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 2000);
    } catch (err: any) {
      toast.error(`خطا در ذخیره "${key}"`);
    }
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(settings)) {
        payload[k] = String(v);
      }
      await adminApi.updateSettings(payload);
      toast.success('تمام تنظیمات با موفقیت ذخیره شد');
    } catch (err: any) {
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FieldType) => {
    const value = settings[field.key];

    if (field.type === 'toggle') {
      return (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">{field.label}</span>
            {field.description && <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>}
          </div>
          <button
            onClick={() => handleChange(field.key, !value)}
            className={cn(
              'relative w-12 h-7 rounded-full transition-colors duration-200',
              value ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600',
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200',
              value ? 'right-0.5' : 'right-[calc(100%-1.625rem)]',
            )} />
          </button>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">{field.label}</label>
          <textarea
            value={value ?? ''}
            onChange={e => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            dir={field.dir || 'rtl'}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium mb-2">{field.label}</label>
        <input
          type={field.type}
          value={field.type === 'number' ? (value ?? '') : (value ?? '')}
          onChange={e => {
            const val = field.type === 'number' ? e.target.value : e.target.value;
            handleChange(field.key, val);
          }}
          placeholder={field.placeholder}
          step={field.step}
          dir={field.dir || 'rtl'}
          className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black">تنظیمات سایت</h2>
          <p className="text-muted-foreground text-sm">مدیریت تنظیمات عمومی، فروش، ارسال و امنیت</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'در حال ذخیره...' : 'ذخیره همه تغییرات'}
        </button>
      </div>

      <div className="space-y-4">
        {SETTING_SECTIONS.map((section, si) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-bold">{section.label}</span>
                <span className="text-xs text-muted-foreground">({section.fields.length} تنظیم)</span>
              </div>
              <ChevronDown className={cn(
                'w-5 h-5 text-muted-foreground transition-transform duration-200',
                expandedSections.has(section.id) && 'rotate-180',
              )} />
            </button>

            {expandedSections.has(section.id) && (
              <div className="px-5 pb-5">
                <div className="grid gap-5">
                  {section.fields.map(field => (
                    <div key={field.key} className="relative">
                      {renderField(field)}
                      {savedKeys.has(field.key) && (
                        <span className="absolute -top-1 left-2 inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> ذخیره شد
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <ShippingSettings />
      {/* Bottom save button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-primary/25"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'در حال ذخیره...' : 'ذخیره تمام تنظیمات'}
        </button>
      </div>
    </div>
  );
}
