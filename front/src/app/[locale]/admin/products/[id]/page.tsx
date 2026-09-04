'use client';
import { useParams } from 'next/navigation';
import { ArrowRight, Loader2, Edit3, PackagePlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { useProductSlug } from '@/hooks/product.hook';

export default function EditProductPage() {
  const params = useParams();
  if (params?.id === 'new') {
    return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <PackagePlus className="w-7 h-7 text-primary" />
            ایجاد محصول جدید
          </h1>
          <p className="text-sm text-muted-foreground mt-1">محصول جدید را با جزئیات کامل ثبت کنید</p>
        </div>
      </div>
      <ProductForm />
    </div>
  }
  const { data, isFetching, isError } = useProductSlug((params?.id)?.toString() || '')
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{isError || 'محصول یافت نشد'}</p>
        <Link href="/admin/products" className="text-primary hover:underline mt-4 inline-block">
          بازگشت به لیست محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-primary" />
            ویرایش محصول
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{data.title}</p>
        </div>
      </div>
      <ProductForm product={data} />
    </div>
  );
}
