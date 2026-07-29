'use client';

import { useAddToCart } from '@/hooks/cart.hook';
/**
 * ============================================================
 * 🛒 useCart — مدیریت سبد خرید (حالت Mock / آفلاین)
 * ============================================================
 */

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
export interface CartProduct {
  id: string;
  title: string;
  image?: string;
  images?: ({ url: string } | string)[];
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  tags?: string[];
}

interface MockCartItem { productId: string; quantity: number; product: CartProduct; }

const CART_KEY = '__mock_cart';

// تلاش برای همگام‌سازی با API cart در صورت وجود
function syncFromApi() {
  if (typeof window === 'undefined') return;
  // اگر دیتای localStorage خالی باشه، از API بگیر
  const local = localStorage.getItem(CART_KEY);
  if (!local || local === '[]') {
    fetch('/api/cart', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const items = data.items
            .filter((item: any) => item.product)
            .map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              product: {
                id: item.product.id || item.productId,
                title: item.product.title || 'محصول',
                price: item.product.price || 0,
                discountPrice: item.product.discountPrice,
                image: item.product.image,
                images: item.product.images,
                rating: item.product.rating,
                reviewCount: item.product.reviewCount,
                isNew: item.product.isNew,
                tags: item.product.tags,
              },
            }));
          localStorage.setItem(CART_KEY, JSON.stringify(items));
        }
      })
      .catch(() => { });
  }
}

function loadCart(): MockCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items: MockCartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // دیسپچ event برای آپدیت همزمان همه useCart ها در یک تب
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
  // همگام‌سازی با API (آپدیت کل سبد)
  console.log(items);
  
  fetch('/api/cart/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
  }).catch(() => {});
}

/** Hook مدیریت سبد خرید در کل سایت */
export function useCart() {
  const [items, setItems] = useState<MockCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    syncFromApi();
    fetchCart();
    // گوش دادن به تغییرات localStorage از تب‌های دیگر
    const storageHandler = (e: StorageEvent) => {
      if (e.key === CART_KEY) fetchCart();
    };
    // گوش دادن به event داخلی برای آپدیت همزمان همه کامپوننت‌ها در یک تب
    const customHandler = () => fetchCart();
    window.addEventListener('storage', storageHandler);
    window.addEventListener('cart-updated', customHandler);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('cart-updated', customHandler);
    };
  }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, quantity = 1, product?: CartProduct) => {
    const current = loadCart();
    const idx = current.findIndex(i => i.productId === productId);
    if (idx > -1) {
      current[idx].quantity += quantity;
      // اگه product جدید اومده، آپدیتش کن
      if (product) current[idx].product = product;
    } else {
      current.push({
        productId, quantity, product: product || {
          id: productId,
          title: 'محصول',
          price: 0,
        }
      });
    }
    saveCart(current);
    setItems([...current]);
    toast.success('به سبد خرید اضافه شد 🛒', { position: 'top-center' });
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    const current = loadCart().filter(i => i.productId !== productId);
    saveCart(current);
    setItems(current);
    toast.success('از سبد خرید حذف شد');
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    const current = loadCart();
    const idx = current.findIndex(i => i.productId === productId);
    if (idx > -1) { current[idx].quantity = quantity; saveCart(current); setItems([...current]); }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    saveCart([]);
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => {
    const price = i.product?.discountPrice || i.product?.price || 0;
    return sum + price * i.quantity;
  }, 0);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, loading, total, count, addToCart, removeFromCart, updateQuantity, clearCart, refresh: fetchCart };
}
