'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, AlertTriangle, Package, DollarSign, Search, Edit, Save } from 'lucide-react';
import { sellerApi, type Product } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

interface InventoryProduct {
  id: string; title: string; image: string; price: number;
  stock: number; status: 'high' | 'medium' | 'low' | 'out';
  lastUpdated: string;
}

const STATUS_COLORS: Record<string, string> = {
  high: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  low: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  out: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_NAMES: Record<string, string> = {
  high: 'موجود', medium: 'متوسط', low: 'کم', out: 'ناموجود',
};

export default function SellerInventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await sellerApi.inventory();
        if (data && data.products) {
          const mapped: InventoryProduct[] = data.products.map((p: any) => ({
            id: p.id, title: p.title, image: p.image || '',
            price: p.discountPrice || p.price || 0,
            stock: p.quantity || 0,
            status: (p.quantity || 0) > 20 ? 'high' : (p.quantity || 0) > 5 ? 'medium' : (p.quantity || 0) > 0 ? 'low' : 'out',
            lastUpdated: p.updatedAt || '---',
          }));
          setProducts(mapped);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const summary = {
    total: products.length,
    inStock: products.filter(p => p.status !== 'out').length,
    lowStock: products.filter(p => p.status === 'low').length,
    outOfStock: products.filter(p => p.status === 'out').length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  const filtered = products.filter(p =>
    !search || p.title.includes(search)
  );

  const startEdit = (product: InventoryProduct) => {
    setEditingId(product.id);
    setEditQty(product.stock);
  };

  const saveEdit = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const newStock = editQty;
      const newStatus: InventoryProduct['status'] = newStock > 20 ? 'high' : newStock > 5 ? 'medium' : newStock > 0 ? 'low' : 'out';
      return { ...p, stock: newStock, status: newStatus, lastUpdated: 'امروز' };
    }));
    setEditingId(null);
    toast.success('موجودی بروزرسانی شد');
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black">انبارداری و موجودی</h2>
        <p className="text-muted-foreground text-sm">مدیریت موجودی محصولات و گردش انبار</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'کل محصولات', value: summary.total, icon: Boxes, color: 'from-violet-500 to-purple-500' },
          { label: 'موجود', value: summary.inStock, icon: Package, color: 'from-emerald-500 to-green-500' },
          { label: 'کم', value: summary.lowStock, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
          { label: 'ناموجود', value: summary.outOfStock, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
          { label: 'ارزش کل', value: summary.totalValue.toLocaleString() + ' ت', icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-4">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2', card.color)}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-black">{card.value}{i === 4 ? '' : ''}</div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی محصول..." className="w-full h-10 pr-9 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/50">
              <tr>
                <th className="text-right py-3 px-4 font-bold">محصول</th>
                <th className="text-right py-3 px-4 font-bold">قیمت</th>
                <th className="text-right py-3 px-4 font-bold">موجودی</th>
                <th className="text-right py-3 px-4 font-bold">وضعیت</th>
                <th className="text-right py-3 px-4 font-bold">ارزش کل</th>
                <th className="text-right py-3 px-4 font-bold">آخرین بروزرسانی</th>
                <th className="text-right py-3 px-4 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium truncate max-w-[180px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold">{p.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {editingId === p.id ? (
                      <input type="number" value={editQty} onChange={e => setEditQty(Number(e.target.value))} className="w-20 h-9 px-2 rounded-lg border border-border text-center" min={0} />
                    ) : (
                      <span>{p.stock}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', STATUS_COLORS[p.status])}>{STATUS_NAMES[p.status]}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-muted-foreground">{(p.price * p.stock).toLocaleString()}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{p.lastUpdated}</td>
                  <td className="py-3 px-4">
                    {editingId === p.id ? (
                      <button onClick={() => saveEdit(p.id)} className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Boxes className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">محصولی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
