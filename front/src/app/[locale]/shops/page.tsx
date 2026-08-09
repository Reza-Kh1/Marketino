'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Search, Star, Store, TrendingUp } from 'lucide-react';
import { shopsApi, type User } from '@/lib/api';
import ShopCard from '@/components/ShopCard';
import { cn } from '@/lib/utils';

type ShopItem = User & { totalProducts: number; avgRating: number; totalSales: number };

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await shopsApi.list({ sort });
        setShops(res.shops);
      } catch {
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [sort]);

  const filtered = shops.filter(
    s => !search || s.storeName?.includes(search) || (s.businessType || '').includes(search),
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">فروشگاه‌های بازارچه</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3">معتبرترین فروشندگان ایران در یکجا</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1 relative">
            <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجوی فروشگاه یا صنف..."
              className="w-full h-10 sm:h-12 rtl:pr-9 sm:rtl:pr-10 rtl:pl-4 ltr:pl-9 sm:ltr:pl-10 ltr:pr-4 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="h-10 sm:h-12 px-3 sm:px-4 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base">
            <option value="popular">محبوب‌ترین</option>
            <option value="rating">بیشترین امتیاز</option>
            <option value="products">بیشترین محصولات</option>
          </select>
        </div>

        {/* Shops Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-accent rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Store className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-base sm:text-lg">فروشگاهی با این مشخصات یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((shop, i) => (
              <motion.div key={shop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ShopCard shop={shop} rank={i < 3 ? i + 1 : undefined} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
