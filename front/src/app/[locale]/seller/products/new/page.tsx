'use client';

import { ProductForm } from '@/components/admin/product-form';
import { ArrowRight, PackagePlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function SellerNewProductPage() {
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
            <PackagePlus className="w-7 h-7 text-emerald-500" />
            ایجاد محصول جدید
          </h1>
          <p className="text-sm text-muted-foreground mt-1">محصول جدید خود را با جزئیات کامل ثبت کنید</p>
        </div>
      </div>

      <ProductForm returnUrl="/seller/products" />
    </div>
  );
}
