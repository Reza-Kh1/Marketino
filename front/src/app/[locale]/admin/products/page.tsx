'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Star, CheckCircle, Eye, Trash2, TrendingUp, Plus, Edit3 } from 'lucide-react';
import { AllProduct, VariantType, type Product } from '@/lib/api';
import { useAdminProducts, useApproveProduct, useFeatureProduct, useDeleteAdminProduct, useAdminSellerList, } from '@/lib/react-query-hooks';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/navigation';
import ImgTag from '@/components/ImgTag';
import { useSearchParams } from 'next/navigation';
import DynamicTable from '@/components/DynamicTable';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import DialogView from '@/components/DialogView';
import { format } from 'date-fns-jalali';
import SearchBox from '@/components/admin/SearchBox';
import { useColors } from '@/hooks/color.hook';
import { useDiscountsList } from '@/hooks/discount.hook';
import { CategorysTypes } from '@/services/category.service';
import { useCategoriesAdmin, useCategoriesProducts } from '@/hooks/category.hook';
import { useBrandAdmin } from '@/hooks/brand.hook';
import { ProductEntity } from '@/services/product.service';

export default function AdminProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(null);
  const { data: discountData, isLoading: loadingDiscount } = useDiscountsList()
  const { data: dataCategory, isFetching: loadCategories } = useCategoriesProducts()
  const { data: dataBrand, isFetching: loadingBrand } = useBrandAdmin()
  const { data: dataSeller, isLoading: loadingSeller } = useAdminSellerList()
  const approveMutation = useApproveProduct();
  const featureMutation = useFeatureProduct();
  const deleteMutation = useDeleteAdminProduct();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const minPrice = Number(searchParams.get('minPrice'));
    const maxPrice = Number(searchParams.get('maxPrice'));
    return {
      limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
      page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || undefined,
      condition: searchParams.get('condition') || undefined,
      featured: searchParams.get('featured') || undefined,
      discountId: searchParams.get('discountId') || undefined,
      order: searchParams.get('order') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      sellerId: searchParams.get('sellerId') || undefined,
      brandId: searchParams.get('brandId') || undefined,
      priority: searchParams.get('priority') || undefined,
      ...((minPrice !== 0 && maxPrice !== 0) && {
        minPrice: minPrice && !isNaN(Number(minPrice)) ? Number(minPrice) : undefined,
        maxPrice: maxPrice && !isNaN(Number(maxPrice)) ? Number(maxPrice) : undefined,
      })

    };
  }, [searchParams]);

  const { data, isLoading } = useAdminProducts(filters);

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

  const formattedSellerOptions = useMemo(() => {
    return dataSeller?.map((item) => ({
      id: item.id,
      name: `${item.username}(${item.storeName})`,
    })) || [];
  }, [dataSeller]);

  const formattedDiscountOptions = useMemo(() => {
    return discountData?.map((item) => ({
      id: item.id,
      name: item.code,
    })) || [];
  }, [discountData]);

  const columns: ColumnDef<ProductEntity>[] = useMemo(() => [
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
      cell: ({ row }) => <span className="text-xs">{row.original?.store?.name || '-'}</span>
    },
    {
      accessorKey: 'price',
      id: 'price',
      header: 'قیمت',
      cell: ({ row }) => {
        const discount = row.original.discountPercent
        const price = row.original.originalPrice
        const minPrice = row.original.minPrice
        return (
          <div className="relative inline-flex flex-col gap-0.5 dir-rtl pt-2 pr-3">
            <div className='flex gap-2 items-center justify-end'>
              {Boolean(discount) && <span className="text-[11px] text-slate-500 line-through font-medium">{Number(price).toLocaleString()}</span>}
              {Boolean(discount) && <span className=" flex items-center justify-center w-5 h-5 bg-linear-to-tr from-rose-600 to-pink-500 text-white font-black text-[9px] rounded-bl-lg rounded-tr-lg shadow-sm shadow-rose-500/30 ring-1 ring-white/20">٪{discount}</span>}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-black text-cyan-600">{Number(minPrice).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">تومان</span></span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'reviewCount',
      id: 'reviewCount',
      header: 'نظرات',
      cell: ({ row }) => <span className="text-xs">{row.original.reviewCount.toLocaleString()}</span>
    }, {
      accessorKey: 'rating',
      id: 'rating',
      header: 'امتیاز',
      cell: ({ row }) => <span className="text-xs">{row.original.rating}</span>
    },
    {
      accessorKey: 'saleCount',
      id: 'saleCount',
      header: 'فروش',
      cell: ({ row }) => <span className="text-xs">{row.original.saleCount.toLocaleString()}</span>
    },
    {
      accessorKey: 'updateAt',
      id: 'updateAt',
      header: 'تاریخ',
      cell: ({ row }) => <span className="text-xs">{row.original.updatedAt && format(new Date(row.original.updatedAt), "yyyy/MM/dd")}</span>
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

  return (
    <div className='flex flex-col gap-3'>
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
      <SearchBox
        isOrder={false}
        isPrice={true}
        placeHolder='جستجو محصول'
        selects={[
          {
            children: [
              { id: 'all', name: 'همه' },
              { id: 'pending', name: 'در انتظار تایید' },
              { id: 'approved', name: 'تایید شده' },
              { id: 'inactive', name: 'تایید نشده' },
            ], label: 'وضعیت محصول', placeHolder: 'انتخاب کنید', setValue: 'status'
          },
          {
            children: [
              { id: 'all', name: 'همه' },
              { id: 'new', name: 'آکبند' },
              { id: 'used', name: 'کار کرده' },
            ], label: 'محصول', placeHolder: 'انتخاب کنید', setValue: 'condition'
          },
          {
            children: [
              { id: 'all', name: 'همه' },
              { id: 'true', name: 'فعال' },
              { id: 'false', name: 'غیر فعال' },
            ], label: 'ویژه بودن', placeHolder: 'انتخاب کنید', setValue: 'featured'
          },
          {
            children: [
              { id: 'all', name: 'همه' },
              { id: 'saleCount-up', name: 'بیش ترین فروش' },
              { id: 'saleCount-down', name: 'کم ترین فروش' },
              { id: 'rating-up', name: 'بیش ترین امتیاز' },
              { id: 'rating-down', name: 'کم ترین امتیاز' },
              { id: 'reviewCount-up', name: 'بیش ترین نظر' },
              { id: 'reviewCount-down', name: 'کم ترین نظر' },
              { id: 'updatedAt', name: 'قدیمی ترین' },
              { id: 'updatedAt-down', name: 'جدید ترین' },
            ], label: 'مرتب سازی بر اساس', placeHolder: 'انتخاب کنید', setValue: 'sort'
          },
        ]}
        autocomplete={[
          {
            label: 'دسته',
            options: dataCategory || [],
            placeholder: loadCategories ? 'صبر کنید ...' : 'انتخاب کنید',
            setValue: 'categoryId',
          },
          {
            label: 'تخفیف',
            options: formattedDiscountOptions || [],
            placeholder: loadingDiscount ? 'صبر کنید ...' : 'انتخاب کنید',
            setValue: 'discountId',
          },
          {
            label: 'برند',
            options: dataBrand || [],
            placeholder: loadingBrand ? 'صبر کنید ...' : 'انتخاب کنید',
            setValue: 'brandId',
          }, {
            options: formattedSellerOptions
            , label: 'فروشندگان', placeholder: loadingSeller ? 'صبر کنید ...' : 'انتخاب کنید', setValue: 'sellerId'
          },
        ]}
      />
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
                name: 'فروشنده ',
                value: selectedProduct?.store?.name || '-'
              },
              {
                name: 'فروشنده (انگلیسی)',
                value: selectedProduct?.store?.nameEn || '-'
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
