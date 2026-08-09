'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, ChevronDown, Send, AlertTriangle, Clock, AlertCircle, CheckCircle, XCircle, Eye, SendHorizontal, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaginationBar from '@/components/admin/PaginationBar';
import { useAdminTickets, useDeleteTicket, useTickets } from '@/hooks/ticket.hook';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Ticket } from '@/services/ticket.service';
import { Checkbox } from '@/components/ui/checkbox';
import { TicketStatus, TicketPriority } from "@/services/ticket.service";
import { useTranslations } from 'next-intl';
import DialogView from '@/components/DialogView';
import { SearchBar } from '@/components/SearchBar';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import DialogDelete from '@/components/DialogDelete';
import CustomButton from '@/components/CustomButton';
import { ProductImage } from '@/lib/api';
import { useDeleteMedia, useMedias } from '@/hooks/media.hook';
import ImgTag from '@/components/ImgTag';
import { MediaUseCase } from '@/services/media.service';
const getUseCaseLabel = (useCase: MediaUseCase): string => {
  const labels: Record<MediaUseCase, string> = {
    [MediaUseCase.AVATAR]: 'آواتار',
    [MediaUseCase.PRODUCT]: 'تصویر محصول',
    [MediaUseCase.POST]: 'تصویر پست',
    [MediaUseCase.ATTACHMENT]: 'پیوست',
    [MediaUseCase.THUMBNAIL]: 'بندانگشتی',
    [MediaUseCase.WATERMARK]: 'واترمارک',
    [MediaUseCase.REPORTS]: 'گزارش',
    [MediaUseCase.MAINS]: 'تصویر اصلی'
  };
  return labels[useCase] || useCase;
};
export default function MediaPage() {
  const [selectMedia, setSelectMedia] = useState<ProductImage | null>(null)
  const [isModal, setModal] = useState<'delete' | 'view' | null>(null)
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams();
  const { mutate: deleteMutate, isPending } = useDeleteMedia()
  const { refresh } = useRouter()

  const columns: ColumnDef<ProductImage>[] = useMemo(() => [
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
      cell: ({ row }) => row.original.url ? <ImgTag alt={row.original.alt || '-'} src={row.original.url || '-'} className="w-10 h-10 rounded-lg object-cover" /> : '---'
    },
    {
      accessorKey: 'alt',
      id: 'alt',
      header: 'عنوان تصویر',
      cell: ({ row }) => <span className="text-xs text-admin-text-muted">{row.original.alt || '-'}</span>
    },
    {
      accessorKey: 'isMain',
      id: 'isMain',
      header: 'به عنوان بنر',
      cell: ({ row }) => <span className="text-xs text-admin-text-muted">{row.original.isMain ? <Check className='text-blue-500' /> : <X className='text-blue-500' />}</span>
    },
    {
      accessorKey: 'useCase',
      id: 'useCase',
      header: 'کاربرد',
      cell: ({ row }) => <span className="text-xs text-admin-text-muted">{row.original?.useCase ? getUseCaseLabel(row.original.useCase) : '-'}</span>
    },
    {
      accessorKey: 'time',
      id: 'time',
      header: 'تاریخ',
      cell: ({ row }) => <span className="text-xs">{new Date(row.original.createdAt).toLocaleDateString(tCommon('lan')) || '-'}</span>
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Button onClick={() => { setSelectMedia(row.original), setModal("view") }} variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-admin-destructive/20">
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
          <Button onClick={() => {
            setSelectMedia(row.original)
            setModal("delete")
          }} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  ], [tCommon]);
  const filters = useMemo(() => {
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const orderParam = searchParams.get('order');
    return {
      limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
      order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
      page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
      isMain: searchParams.get('isMain') || undefined,
      useCase: searchParams.get('useCase') || undefined,
      productId: searchParams.get('productId') || undefined,
      url: searchParams.get('url') || undefined,
    }
  }, [searchParams]);

  const { data: mediaData, isError, isFetching } = useMedias(filters as any)
  if (isError) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={refresh} className="text-primary font-bold">تلاش مجدد</button></div>;
  if (isFetching) return <PendingApi />
  return (
    <div className='flex flex-col gap-3'>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black mb-1">مدیریت تیکت ها</h2>
          <p className="text-muted-foreground text-sm">{mediaData?.pagination?.total || 0} تیکت</p>
        </div>
      </div>
      <SearchBox
        inputs={[
          { label: 'آدرس عکس', name: 'url', placeholder: 'آدرس تصویری ...', type: 'text' },
          { label: 'آیدی محصول', name: 'productId', placeholder: 'آیدی محصول مورد نظر', type: 'text' },
        ]}
        selects={[
          {
            label: 'وضعیت استفاده',
            placeHolder: 'انتخاب کنید',
            setValue: 'useCase',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'AVATAR', name: 'آواتار' },
              { id: 'PRODUCT', name: 'محصولات' },
              { id: 'POST', name: 'پست ها' },
              { id: 'ATTACHMENT', name: 'پیوست و چت ها' },
              { id: 'THUMBNAIL', name: 'پیش نمایش فیلم' },
              { id: 'WATERMARK', name: 'واترمارک' },
              { id: 'REPORTS', name: 'تخلف' },
              { id: 'MAINS', name: 'بنر ها' },
            ]
          },
          {
            label: 'به عنوان بنر',
            placeHolder: 'انتخاب کنید',
            setValue: 'isMain',
            children: [
              { id: 'All', name: 'نمایش همه' },
              { id: 'true', name: 'نمایش داده شود' },
              { id: 'false', name: 'نمایش داده نشود' },
            ]
          }
        ]}
      />
      <DynamicTable
        data={mediaData?.data || []}
        columns={columns}
        totalRows={mediaData?.pagination.total || 0}
        isLoading={isFetching}
        onBulkDelete={() => { }}
        nextPage={mediaData?.pagination.nextPage}
        prevPage={mediaData?.pagination.prevPage}
      />
      <DialogView
        open={isModal === "view"}
        title='اطلاعات رسانه (عکس)'
        setOpen={() => setModal(null)}
        options={[
          {
            head: 'اطلاعات اصلی',
            tags: [
              { name: 'شناسه', value: selectMedia?.id || '-' },
              { name: 'عکس', img: selectMedia?.url || '-' },
              { name: 'آدرس (URL)', value: selectMedia?.url || '-' },
              { name: 'متن جایگزین (Alt)', value: selectMedia?.alt || '-' },
              {
                name: 'کاربرد',
                value: selectMedia?.useCase ? getUseCaseLabel(selectMedia.useCase) : '-'
              },
              { name: 'ترتیب نمایش', value: selectMedia?.sortOrder?.toString() || '-' },
              { name: 'تصویر اصلی', value: selectMedia?.isMain ? 'بله' : 'خیر' },
              { name: 'تاریخ ایجاد', value: selectMedia?.createdAt ? new Date(selectMedia?.createdAt).toLocaleDateString('fa-IR') : '-' },
            ]
          },
          {
            head: 'اطلاعات ارتباطی',
            detail: [
              { name: 'محصول مرتبط', value: selectMedia?.productId || 'ندارد' },
              { name: 'گزارش مرتبط', value: selectMedia?.reportsId || 'ندارد' },
              { name: 'پیام تیکت مرتبط', value: selectMedia?.ticketMessageId || 'ندارد' },
            ]
          }
        ]}
      />
      <DialogDelete
        closeModal={() => setModal(null)}
        onDelete={() => {
          if (selectMedia?.id) {
            deleteMutate(selectMedia?.id, {
              onSuccess: () => {
                setModal(null)
              }
            })
          }
        }}
        isPending={isPending}
        open={isModal === "delete"}
      />
    </div>
  );
}