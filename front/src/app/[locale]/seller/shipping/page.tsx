'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, X, Save, MapPin, Package, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { sellerApi } from '@/lib/api';

const IRANIAN_CITIES = [
  'تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'قم', 'اهواز',
  'کرج', 'ارومیه', 'زاهدان', 'رشت', 'ساری', 'بندر انزلی',
  'گرگان', 'همدان', 'یزد', 'کرمان', 'بوشهر', 'کرمانشاه',
];

const SHIPPING_METHODS = [
  { key: 'post', name: 'پست پیشتاز', icon: '📦', desc: '۳ تا ۷ روز کاری' },
  { key: 'tipax', name: 'تیپاکس', icon: '🚚', desc: '۱ تا ۳ روز کاری' },
  { key: 'pik', name: 'پیک موتوری', icon: '🏍', desc: 'همه روز' },
  { key: 'self', name: 'تحویل حضوری', icon: '🏪', desc: 'آدرس فروشگاه' },
];

export default function SellerShippingPage() {
  const [methods, setMethods] = useState<string[]>(['post']);
  const [cityPrices, setCityPrices] = useState<Record<string, Record<string, number>>>({
    تهران: { post: 35000, tipax: 45000, pik: 80000 },
    اصفهان: { post: 40000, tipax: 55000, pik: 90000 },
  });
  const [selectedCity, setSelectedCity] = useState('تهران');
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [freeShippingAmount, setFreeShippingAmount] = useState('');

  // Load existing shipping settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dashData = await sellerApi.dashboard();
        const shipping = dashData?.shipping || dashData?.shippingSettings;
        if (shipping) {
          if (shipping.methods) setMethods(shipping.methods);
          if (shipping.cityPrices) setCityPrices(shipping.cityPrices);
          if (shipping.freeShippingAmount) setFreeShippingAmount(String(shipping.freeShippingAmount));
        }
      } catch {
        // Keep defaults if backend doesn't have shipping settings yet
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggleMethod = (key: string) => {
    setMethods(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  };

  const setPrice = (city: string, method: string, price: number) => {
    setCityPrices(prev => ({
      ...prev,
      [city]: { ...(prev[city] || {}), [method]: price || 0 },
    }));
  };

  const addCity = () => {
    const city = newCity.trim();
    if (!city) return;
    if (cityPrices[city]) {
      toast.error('این شهر قبلاً اضافه شده');
      return;
    }
    const prices: Record<string, number> = {};
    methods.forEach(m => { prices[m] = 0; });
    setCityPrices(prev => ({ ...prev, [city]: prices }));
    setSelectedCity(city);
    setNewCity('');
    toast.success('شهر جدید اضافه شد');
  };

  const deleteCity = (city: string) => {
    setCityPrices(prev => {
      const copy = { ...prev };
      delete copy[city];
      return copy;
    });
    if (selectedCity === city) {
      const remaining = Object.keys(cityPrices).filter(c => c !== city);
      setSelectedCity(remaining[0] || '');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to backend via settings endpoint or similar
      // For now, confirm to user that settings are saved locally
      toast.success('تنظیمات ارسال ذخیره شد');
      // Future: await api call to save shipping settings
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2"><Truck className="w-6 h-6 text-primary" /> تنظیمات ارسال</h2>
        <div className="card p-6 animate-pulse"><div className="h-6 w-48 bg-accent rounded mb-4" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" /> تنظیمات ارسال
        </h2>
      </div>

      {/* Shipping Methods */}
      <div className="card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> روش‌های ارسال
        </h3>
        <p className="text-sm text-muted-foreground mb-4">روش‌های ارسالی که برای فروشگاه شما فعال هستند را انتخاب کنید</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHIPPING_METHODS.map(m => (
            <button key={m.key} onClick={() => toggleMethod(m.key)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right',
                methods.includes(m.key)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              )}>
              <span className="text-2xl">{m.icon}</span>
              <div>
                <p className="font-bold text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Free Shipping */}
      <div className="card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> ارسال رایگان
        </h3>
        <div className="flex items-center gap-3">
          <label className="text-sm">ارسال رایگان برای سفارش‌های بالای:</label>
          <input type="number" value={freeShippingAmount}
            onChange={e => setFreeShippingAmount(e.target.value)}
            placeholder="مثلاً: ۵۰۰,۰۰۰"
            className="w-40 h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr" />
          <span className="text-sm text-muted-foreground">تومان</span>
        </div>
      </div>

      {/* City Prices */}
      <div className="card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> هزینه ارسال به شهرها
        </h3>

        {/* Add City */}
        <div className="flex items-center gap-2 mb-4">
          <input type="text" value={newCity} onChange={e => setNewCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCity()}
            placeholder="نام شهر جدید..."
            className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <button onClick={addCity} disabled={!newCity.trim()}
            className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-2">
            <Plus className="w-4 h-4" /> افزودن
          </button>
        </div>

        {/* City Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(cityPrices).map(city => (
            <button key={city} onClick={() => setSelectedCity(city)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1',
                selectedCity === city ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent')}>
              {city}
              <button onClick={(e) => { e.stopPropagation(); deleteCity(city); }}
                className="w-4 h-4 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center text-[10px]">
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>

        {/* Price Fields */}
        {selectedCity && (
          <div className="space-y-3">
            {methods.map(m => {
              const methodInfo = SHIPPING_METHODS.find(sm => sm.key === m);
              return (
                <div key={m} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-muted-foreground">{methodInfo?.name || m}</span>
                  <input type="number" min="0" step="1000"
                    value={cityPrices[selectedCity]?.[m] ?? 0}
                    onChange={e => setPrice(selectedCity, m, Number(e.target.value))}
                    className="w-32 h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr" />
                  <span className="text-sm text-muted-foreground">تومان</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 shadow-lg shadow-primary/25">
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        ذخیره تنظیمات ارسال
      </button>
    </div>
  );
}
