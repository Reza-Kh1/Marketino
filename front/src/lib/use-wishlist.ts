'use client';

/**
 * ============================================================
 * WishlistContext - shared wishlist state across all components
 * ============================================================
 *
 * - Shared state: Navbar, ProductCard, WishlistPage
 * - Authenticated user: uses backend API
 * - Guest user: saves full product data to localStorage
 * - Uses useAuth() context for automatic auth detection
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { wishlistApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface WishlistProduct {
  id: string;
  image?: string;
  title?: string;
  price?: number;
  discountPrice?: number;
}

const LOCAL_WISHLIST_KEY = '__mock_wishlist';

// --- localStorage helpers ---

function loadLocalWishlist(): WishlistProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    // Migrate old format: ["p1", "p2"] => [{id:"p1"}, ...]
    if (typeof parsed[0] === 'string') {
      const migrated = parsed.map((id: string) => ({ id }));
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch { return []; }
}

function saveLocalWishlist(items: WishlistProduct[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
}

function extractImage(product?: any): string {
  if (!product) return '/placeholder-product.png';
  if (typeof product.image === 'string' && product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof first.url === 'string') return first.url;
  }
  return '/placeholder-product.png';
}

// --- Context types ---

interface WishlistContextType {
  items: WishlistProduct[];
  itemIds: string[];
  count: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, product?: any) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

// --- Provider ---

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch wishlist from API
  const fetchFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wishlistApi.get() as any;
      if (res && res.items) {
        const mapped = res.items.map((wi: any) => {
          const p = wi.product || wi;
          return {
            id: p.id,
            image: p.image || (p.images?.[0]?.url) || '',
            title: p.title || '',
            price: p.price ?? 0,
            discountPrice: p.discountPrice,
          };
        });
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch {
      // fallback to localStorage on API error
      setItems(loadLocalWishlist());
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh: API or localStorage based on auth state
  const refresh = useCallback(async () => {
    if (authLoading) return; // wait until auth loads
    if (isAuthenticated) {
      await fetchFromApi();
    } else {
      setItems(loadLocalWishlist());
    }
  }, [isAuthenticated, authLoading, fetchFromApi]);

  useEffect(() => { refresh(); }, [refresh]);

  const itemIds = useMemo(() => items.map(i => i.id), [items]);

  const isInWishlist = useCallback((productId: string) => {
    return itemIds.includes(productId);
  }, [itemIds]);

  const toggleWishlist = useCallback(async (productId: string, product?: any) => {
    if (isAuthenticated) {
      const currentlyIn = itemIds.includes(productId);
      try {
        if (currentlyIn) {
          await wishlistApi.remove(productId);
          setItems(prev => prev.filter(i => i.id !== productId));
          toast.success('از علاقه‌مندی‌ها حذف شد');
        } else {
          await wishlistApi.add(productId);
          const newItem: WishlistProduct = {
            id: productId,
            image: extractImage(product),
            title: product?.title || '',
            price: product?.price ?? 0,
            discountPrice: product?.discountPrice,
          };
          setItems(prev => [...prev, newItem]);
          toast.success('به علاقه‌مندی‌ها اضافه شد');
        }
      } catch {
        toast.error(currentlyIn ? 'خطا در حذف' : 'خطا در افزودن');
      }
    } else {
      const current = loadLocalWishlist();
      const exists = current.findIndex(i => i.id === productId);
      let updated: WishlistProduct[];

      if (exists >= 0) {
        updated = [...current];
        updated.splice(exists, 1);
        toast.success('از علاقه‌مندی‌ها حذف شد');
      } else {
        updated = [...current, {
          id: productId,
          image: extractImage(product),
          title: product?.title || 'محصول',
          price: product?.price ?? 0,
          discountPrice: product?.discountPrice,
        }];
        toast.success('به علاقه‌مندی‌ها اضافه شد');
      }

      saveLocalWishlist(updated);
      setItems(updated);
    }
  }, [isAuthenticated, itemIds]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (isAuthenticated) {
      try {
        await wishlistApi.remove(productId);
        setItems(prev => prev.filter(i => i.id !== productId));
        toast.success('حذف شد');
      } catch {
        toast.error('خطا در حذف');
      }
    } else {
      const updated = loadLocalWishlist().filter(i => i.id !== productId);
      saveLocalWishlist(updated);
      setItems(updated);
      toast.success('حذف شد');
    }
  }, [isAuthenticated]);

  const contextValue = useMemo(() => ({
    items, itemIds, count: items.length, loading,
    isInWishlist, toggleWishlist, removeFromWishlist, refresh,
  }), [items, itemIds, loading, isInWishlist, toggleWishlist, removeFromWishlist, refresh]);

  return React.createElement(
    WishlistContext.Provider,
    { value: contextValue },
    children,
  );
}

// --- Hook ---

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
