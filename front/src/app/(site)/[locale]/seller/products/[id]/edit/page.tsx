'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowRight, Loader2, Edit3 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { productsApi, type Product } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SellerEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const id = params.id as string;
        const data = await productsApi.getById(id);
        if (data && data.id) {
          setProduct(data);
        } else {
          setError('محصول مورد نظر یافت نشد');
        }
      } catch (err: any) {
        setError(err?.message || 'خطا در دریافت اطلاعات محصول');
        toast.error('خطا در دریافت اطلاعات محصول');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{error || 'محصول یافت نشد'}</p>
        <Link href="/seller/products" className="text-emerald-500 hover:underline mt-4 inline-block">
          بازگشت به لیست محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/seller/products"
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-emerald-500" />
            ویرایش محصول
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{product.title}</p>
        </div>
      </div>

      <ProductForm product={product} returnUrl="/seller/products" />
    </div>
  );
}
