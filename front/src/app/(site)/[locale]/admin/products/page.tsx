'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Star, CheckCircle, Eye, Trash2, TrendingUp, Plus, Edit3 } from 'lucide-react';
import { AllProduct, ProductType, VariantType, type Product } from '@/lib/api';
import {
  useAdminProducts, useApproveProduct, useFeatureProduct, useDeleteAdminProduct,
} from '@/lib/react-query-hooks';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/navigation';
import ImgTag from '@/components/ImgTag';
import PaginationBar from '@/components/admin/PaginationBar';
import { useSearchParams } from 'next/navigation';
import DynamicTable from '@/components/DynamicTable';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import DialogView from '@/components/DialogView';
import { format } from 'date-fns-jalali';

export default function AdminProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const page = useSearchParams().get('page')
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { data, isLoading } = useAdminProducts({ page, status: statusFilter || undefined, q: search || undefined });
  const approveMutation = useApproveProduct();
  const featureMutation = useFeatureProduct();
  const deleteMutation = useDeleteAdminProduct();

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success('محصول تأیید شد'),
      onError: (err: any) => toast.error(err?.message || 'خطا'),
    });
  };
  const handleFeature = (id: string) => {
    featureMutation.mutate(id, {
      onSuccess: () => toast.success('وضعیت ویژه تغییر کرد'),
      onError: (err: any) => toast.error(err?.message || 'خطا'),
    });
  };
  const handleDelete = (id: string) => {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('محصول حذف شد'),
      onError: (err: any) => toast.error(err?.message || 'خطا'),
    });
  };
  function calculateFinalPrice(variant: VariantType): {
    finalPrice: number
    originalPrice: number
    discountAmount: number
    discountText: string
    isDiscounted: boolean
  } {
    const originalPrice = variant.price

    // بررسی وجود تخفیف معتبر
    const discount = variant.discount
    const hasValidDiscount = variant.discountId && discount && discount.isActive !== false

    if (!hasValidDiscount) {
      return {
        finalPrice: originalPrice,
        originalPrice: originalPrice,
        discountAmount: 0,
        discountText: '',
        isDiscounted: false
      }
    }

    let finalPrice = originalPrice
    let discountAmount = 0
    let discountText = ''

    // محاسبه بر اساس نوع تخفیف
    if (discount.type === 'percentage') {
      discountAmount = (originalPrice * discount.value) / 100
      finalPrice = originalPrice - discountAmount
      discountText = `${discount.value}%`
    } else if (discount.type === 'fixed' || discount.type === 'flat') {
      discountAmount = discount.value
      finalPrice = originalPrice - discountAmount
      discountText = `${discount.value.toLocaleString()} تومان`
    } else {
      // نوع تخفیف نامشخص
      finalPrice = originalPrice
      discountText = 'نامشخص'
    }

    // اطمینان از اینکه قیمت نهایی منفی نشود
    finalPrice = Math.max(0, finalPrice)

    return {
      finalPrice: Math.round(finalPrice),
      originalPrice,
      discountAmount: Math.round(discountAmount),
      discountText,
      isDiscounted: true
    }
  }
  const columns: ColumnDef<ProductType>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          className="border-admin-border"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          className="border-admin-border"
        />
      )
    },
    {
      accessorKey: 'isFeatured',
      id: 'isFeatured',
      header: 'تصویر',
      cell: ({ row }) => row.original.images.length ? <ImgTag alt={row.original.images[0].alt || '-'} src={row.original.images[0].url || '-'} className="w-10 h-10 rounded-lg object-cover" /> : '---'
    },
    {
      accessorKey: 'title',
      id: 'title',
      header: 'نام',
      cell: ({ row }) => <span className="text-xs">{row.original.title || '-'}</span>
    },
    {
      accessorKey: 'sellerId',
      id: 'sellerId',
      header: 'فروشنده',
      cell: ({ row }) => <span className="text-xs">{row.original?.seller?.storeName || '-'}</span>
    },
    {
      accessorKey: 'rating',
      id: 'rating',
      header: 'قیمت',
      cell: ({ row }) => {
        const variants = row.original?.variants
        if (!variants?.length) return <span className="text-xs">-</span>

        const firstVariant = variants[0]
        const priceInfo = calculateFinalPrice(firstVariant)

        if (priceInfo.isDiscounted) {
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-600">
                  {priceInfo.finalPrice.toLocaleString()} تومان
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                  {priceInfo.discountText}-
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground line-through">
                {priceInfo.originalPrice.toLocaleString()} تومان
              </span>
            </div>
          )
        }

        return (
          <span className="text-xs">
            {priceInfo.finalPrice.toLocaleString()} تومان
          </span>
        )
      }
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'وضعیت',
      cell: ({ row }) => <div className="flex flex-col gap-1">
        {row.original.isFeatured && <span className="px-2 text-center py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">ویژه</span>}
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold text-center',
          row.original.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
            row.original.status === 'pending' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700')}>
          {row.original.status === 'approved' ? 'تأیید شده' : row.original.status === 'pending' ? 'در انتظار' : 'غیرفعال'}
        </span>
      </div>
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            {row.original.status !== 'approved' && (
              <button onClick={() => handleApprove(row.original.id)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors" title="تأیید">
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => handleFeature(row.original.id)}
              className={cn('p-2 rounded-lg transition-colors', row.original.isFeatured ? 'text-violet-500 hover:bg-violet-50' : 'text-muted-foreground hover:bg-accent')} title="ویژه">
              <TrendingUp className="w-4 h-4" />
            </button>
            <Link href={`/admin/products/${row.original.id}/edit`}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="ویرایش">
              <Edit3 className="w-4 h-4" />
            </Link>
            <button onClick={() => setSelectedProduct(row.original)} className="p-2 rounded-lg hover:bg-accent transition-colors" title="مشاهده">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(row.original.id)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="حذف">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    },
  ], []);
  console.log(data);
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black">مدیریت محصولات</h2>
          <p className="text-muted-foreground text-sm">تأیید، ویرایش و مدیریت محصولات ({data?.pagination?.total})</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          محصول جدید
        </Link>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="جستجوی محصول..." className="w-full h-10 pr-9 pl-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value) }}
          className="h-10 px-3 rounded-xl border border-border bg-background text-sm">
          <option value="">همه</option>
          <option value="pending">در انتظار تأیید</option>
          <option value="approved">تأیید شده</option>
          <option value="featured">ویژه</option>
        </select>
      </div>
      <DynamicTable
        limitPage={10}
        data={data?.data || []}
        columns={columns}
        totalRows={data?.pagination.total || 0}
        nextPage={data?.pagination.nextPage}
        prevPage={data?.pagination.prevPage}
        isLoading={isLoading}
        onBulkDelete={() => { }}
      />
      <DialogView
        open={selectedProduct?.id ? true : false}
        onOpenChange={() => setSelectedProduct(null)}
        title='مشاهده جزئیات محصول'
        desc='اطلاعات کامل محصول و واریانت‌های آن'
        options={[
          {
            head: 'اطلاعات اصلی محصول',
            tags: [
              {
                name: 'شناسه محصول',
                value: selectedProduct?.id
              },
              {
                name: 'تصویر محصول',
                img: selectedProduct?.images?.[0]?.url || '/placeholder-image.jpg'
              },
              {
                name: 'وضعیت',
                value: (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    selectedProduct?.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      selectedProduct?.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        selectedProduct?.status === 'inactive' ? 'bg-violet-100 text-violet-700' :
                          'bg-red-100 text-red-700'
                  )}>
                    {selectedProduct?.status === 'approved' ? 'تأیید شده' :
                      selectedProduct?.status === 'pending' ? 'در انتظار' :
                        selectedProduct?.status === 'inactive' ? 'ویژه' :
                          'غیرفعال'}
                  </span>
                )
              },
              {
                name: 'ویژه',
                value: selectedProduct?.isFeatured ? '✅ بله' : '❌ خیر'
              },
              {
                name: 'شرایط',
                value: selectedProduct?.condition === 'new' ? '🆕 نو' : '🔄 دست دوم'
              }
            ],
            detail: [
              {
                name: 'نام محصول (فارسی)',
                value: selectedProduct?.title
              },
              {
                name: 'نام محصول (انگلیسی)',
                value: selectedProduct?.titleEn || '-'
              },
              {
                name: 'اسلاگ (فارسی)',
                value: selectedProduct?.slug
              },
              {
                name: 'اسلاگ (انگلیسی)',
                value: selectedProduct?.slugEn || '-'
              },
              {
                name: 'دسته‌بندی',
                value: selectedProduct?.category?.name || '-'
              },
              {
                name: 'فروشنده',
                value: selectedProduct?.seller?.storeName || '-'
              },
              {
                name: 'توضیحات (فارسی)',
                value: selectedProduct?.description || '-'
              },
              {
                name: 'توضیحات (انگلیسی)',
                value: selectedProduct?.descriptionEn || '-'
              }
            ]
          },
          {
            head: 'آمار و عملکرد',
            detail: [
              {
                name: 'تعداد بازدید',
                value: selectedProduct?.viewCount?.toLocaleString() || '0'
              },
              {
                name: 'تعداد فروش',
                value: selectedProduct?.saleCount?.toLocaleString() || '0'
              },
              {
                name: 'امتیاز',
                value: selectedProduct?.rating ? `${selectedProduct.rating.toFixed(1)} از 5` : 'بدون امتیاز'
              },
              {
                name: 'تعداد نظرات',
                value: selectedProduct?.reviewCount?.toLocaleString() || '0'
              },
              {
                name: 'تاریخ ایجاد',
                value: selectedProduct?.createdAt &&
                  format(new Date(selectedProduct.createdAt), "dd MMMM yyyy ساعت HH:mm")
              },
              {
                name: 'آخرین بروزرسانی',
                value: selectedProduct?.updatedAt &&
                  format(new Date(selectedProduct.updatedAt), "dd MMMM yyyy ساعت HH:mm")
              }
            ]
          },
          {
            head: 'واریانت‌ها (Variants)',
            detail: selectedProduct && selectedProduct?.variants.length > 0 ?
              selectedProduct.variants.map((variant: any, index: number) => ({
                name: `واریانت ${index + 1}: ${variant.name || 'پیش‌فرض'}`,
                value: (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-mono">{variant.sku}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">قیمت:</span>
                      <span className="font-bold text-emerald-600">
                        {Number(variant.price).toLocaleString()} تومان
                      </span>
                      {variant.discountId && variant.discount && (
                        <span className="text-xs text-muted-foreground line-through">
                          {Number(variant.price + variant.discount.value).toLocaleString()} تومان
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">موجودی:</span>
                      <span className={cn(
                        'font-medium',
                        variant.quantity > 10 ? 'text-emerald-600' :
                          variant.quantity > 0 ? 'text-amber-600' :
                            'text-red-600'
                      )}>
                        {variant.quantity > 0 ? `${variant.quantity} عدد` : 'ناموجود'}
                      </span>
                    </div>
                    {variant.discountId && variant.discount && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">تخفیف:</span>
                        <span className="text-sm text-emerald-600">
                          {Number(variant.discount.value).toLocaleString()} تومان
                        </span>
                      </div>
                    )}
                  </div>
                )
              })) :
              [{
                name: 'واریانت',
                value: 'هیچ واریانتی برای این محصول ثبت نشده است'
              }]
          },
          {
            head: 'تصاویر محصول',
            detail: selectedProduct && selectedProduct?.images.length > 0 ?
              [{
                name: 'گالری تصاویر',
                value: (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selectedProduct.images.map((image: any, index: number) => (
                      <ImgTag
                        key={index}
                        src={image.url}
                        alt={image.alt || selectedProduct.title}
                        className="w-16 h-16 rounded-lg object-cover border hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                )
              }] :
              [{
                name: 'تصاویر',
                value: 'هیچ تصویری برای این محصول ثبت نشده است'
              }]
          }
        ]}
      />
    </div>
  );
}
