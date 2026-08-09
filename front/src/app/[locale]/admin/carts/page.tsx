'use client'
import DialogView from "@/components/DialogView";
import DynamicTable from "@/components/DynamicTable"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AllCartsType, CartsType } from "@/lib/api";
import { useAllCarts } from "@/lib/react-query-hooks"
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from 'date-fns-jalali';
import DialogDelete from "@/components/DialogDelete";

export default function page() {
  const searchParams = useSearchParams();
  const [modalMode, setModalMode] = useState<'view' | 'delete' | null>(null)
  const [selectedCartItem, setSelectedCartItem] = useState<CartsType>()
  const filters = useMemo(() => {
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const orderParam = searchParams.get('order');
    return {
      limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
      order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
      page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
    };
  }, [searchParams]);
  const { data: cartData, isPending } = useAllCarts(filters)
  const columns: ColumnDef<CartsType>[] = useMemo(() => [
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

    // نام محصول
    {
      accessorKey: 'product.title',
      id: 'productTitle',
      header: 'نام محصول',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-admin-text">
            {row.original.product.title}
          </span>
          <span className="text-xs text-admin-text-muted">
            {row.original.product.titleEn}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'variant.price',
      id: 'price',
      header: 'قیمت (تومان)',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-admin-text">
          {row.original.variant.price.toLocaleString()}
        </span>
      )
    },
    // جمع کل (قیمت * تعداد)
    {
      id: 'total',
      header: 'جمع کل',
      cell: ({ row }) => {
        const total = row.original.variant.price * row.original.quantity;
        return (
          <span className="text-sm font-bold text-admin-primary">
            {total.toLocaleString()}
          </span>
        );
      }
    },
    // تاریخ اضافه شدن
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      header: 'تاریخ اضافه شدن',
      cell: ({ row }) => (
        <span className="text-xs text-admin-text-muted">
          {new Date(row.original.createdAt).toLocaleDateString('fa-IR')}
        </span>
      )
    },

    // موجودی انبار
    {
      accessorKey: 'variant.quantity',
      id: 'stock',
      header: 'موجودی',
      cell: ({ row }) => {
        const stock = row.original.variant.quantity;
        return (
          <span className={`text-xs font-medium ${stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {stock}
          </span>
        );
      }
    },

    // عملیات (Actions)
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            onClick={() => {
              if (row.original) {
                setSelectedCartItem(row.original)
                setModalMode('view')
              }
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-admin-blue/20"
          >
            <Eye className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            onClick={() => {
              setSelectedCartItem(row.original)
              setModalMode('delete')
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ], []);
  console.log(cartData);

  return (
    <div>
      <DynamicTable
        limitPage={1000}
        data={cartData?.data || []}
        columns={columns}
        totalRows={cartData?.pagination.total || 0}
        isLoading={isPending}
        onBulkDelete={() => { }}
      />
      <DialogView
        open={modalMode === 'view'}
        onOpenChange={() => { setModalMode(null), setSelectedCartItem(undefined) }}
        title='مشاهده جزئیات سبد خرید'
        desc='اطلاعات کامل آیتم‌های موجود در سبد خرید'
        options={[
          {
            head: 'اطلاعات محصول',
            tags: [
              {
                name: 'شناسه محصول',
                value: selectedCartItem?.product?.id
              },
              {
                name: 'تصویر محصول',
                img: selectedCartItem?.variant?.image || '/placeholder-image.jpg'
              },
            ],
            detail: [
              {
                name: 'نام محصول (فارسی)',
                value: selectedCartItem?.product?.title
              },
              {
                name: 'نام محصول (انگلیسی)',
                value: selectedCartItem?.product?.titleEn
              },
              {
                name: 'اسلاگ (فارسی)',
                value: selectedCartItem?.product?.slug
              },
              {
                name: 'اسلاگ (انگلیسی)',
                value: selectedCartItem?.product?.slugEn
              },
            ]
          },
          {
            head: 'اطلاعات تنوع (Variant)',
            detail: [
              {
                name: 'شناسه تنوع',
                value: selectedCartItem?.variant?.id
              },
              {
                name: 'کد SKU',
                value: selectedCartItem?.variant?.sku
              },
              {
                name: 'قیمت واحد',
                value: `${Number(selectedCartItem?.variant?.price).toLocaleString()} تومان`
              },
              {
                name: 'موجودی انبار',
                value: selectedCartItem?.variant?.quantity
              },
              {
                name: 'آخرین بروزرسانی موجودی',
                value: selectedCartItem?.variant?.updatedAt &&
                  format(new Date(selectedCartItem.variant.updatedAt), "dd MMMM yyyy ساعت HH:mm")
              },
            ]
          },
          {
            head: 'اطلاعات خریدار',
            detail: [
              {
                name: 'شناسه کاربر',
                value: selectedCartItem?.user?.id
              },
              {
                name: 'نام کامل',
                value: `${selectedCartItem?.user?.firstName} ${selectedCartItem?.user?.lastName}`
              },
              {
                name: 'ایمیل',
                value: selectedCartItem?.user?.email
              },
              {
                name: 'شماره تلفن',
                value: selectedCartItem?.user?.phone || 'ثبت نشده'
              },
              {
                name: 'نقش کاربر',
                value: selectedCartItem?.user?.role === 'buyer' ? 'خریدار' :
                  selectedCartItem?.user?.role === 'seller' ? 'فروشنده' :
                    selectedCartItem?.user?.role === 'admin' ? 'مدیر' : 'نامشخص'
              },
              {
                name: 'وضعیت احراز هویت',
                value: selectedCartItem?.user?.isVerified ? 'تایید شده ✅' : 'تایید نشده ❌'
              },
              {
                name: 'وضعیت حساب کاربری',
                value: selectedCartItem?.user?.isActive ? 'فعال ✅' : 'غیرفعال ❌'
              },
              {
                name: 'نوع کسب و کار',
                value: selectedCartItem?.user?.businessType || 'ثبت نشده'
              },
            ]
          },
          {
            head: 'اطلاعات سبد خرید',
            detail: [
              {
                name: 'شناسه آیتم سبد خرید',
                value: selectedCartItem?.id
              },
              {
                name: 'تعداد درخواستی',
                value: selectedCartItem?.quantity
              },
              {
                name: 'جمع کل (قیمت × تعداد)',
                value: selectedCartItem?.variant?.price !== undefined &&
                  selectedCartItem?.variant?.price !== null &&
                  selectedCartItem?.quantity !== undefined &&
                  selectedCartItem?.quantity !== null
                  ? `${Number(selectedCartItem.variant.price * selectedCartItem.quantity).toLocaleString()} تومان`
                  : 'نامشخص'
              },
              {
                name: 'تاریخ اضافه شدن به سبد',
                value: selectedCartItem?.createdAt &&
                  format(new Date(selectedCartItem.createdAt), "dd MMMM yyyy ساعت HH:mm")
              },
            ]
          }
        ]}
      />
      <DialogDelete
        open={modalMode === 'delete'}
        onDelete={() => { }}
        closeModal={() => { setModalMode(null), setSelectedCartItem(undefined) }}
      />
    </div>
  )
}
