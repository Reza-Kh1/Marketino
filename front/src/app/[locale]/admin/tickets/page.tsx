'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, ChevronDown, Send, AlertTriangle, Clock, AlertCircle, CheckCircle, XCircle, Eye, SendHorizontal, Trash2 } from 'lucide-react';
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
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import DialogDelete from '@/components/DialogDelete';
import CustomButton from '@/components/CustomButton';

// وضعیت‌های تیکت با آیکون و رنگ
const statusConfig = {
  [TicketStatus.PENDING]: {
    icon: Clock,
    label: "در انتظار",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
  },
  [TicketStatus.WAITING]: {
    icon: AlertCircle,
    label: "در انتظار پاسخ",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  },
  [TicketStatus.RESOLVED]: {
    icon: CheckCircle,
    label: "حل شده",
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
  },
  [TicketStatus.CLOSED]: {
    icon: XCircle,
    label: "بسته شده",
    className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
  }
};

// اولویت‌ها با رنگ
const priorityColors = {
  [TicketPriority.LOW]: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  [TicketPriority.MEDIUM]: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  [TicketPriority.HIGH]: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  [TicketPriority.URGENT]: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  [TicketPriority.CRITICAL]: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
};

const priorityLabels = {
  [TicketPriority.LOW]: "کم",
  [TicketPriority.MEDIUM]: "متوسط",
  [TicketPriority.HIGH]: "بالا",
  [TicketPriority.URGENT]: "فوری",
  [TicketPriority.CRITICAL]: "بحرانی"
};

export default function AdminTicketsPage() {
  const [selectTicket, setSelectTicket] = useState<Ticket | null>(null)
  const [isModal, setModal] = useState<'delete' | 'view' | null>(null)
  const { refresh } = useRouter()
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams();
  const limitPage = Number(searchParams.get('limit')) || 10
  const { mutate: deleteMutate, isPending } = useDeleteTicket()
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'در انتظار',
      'WAITING': 'در انتظار پاسخ',
      'RESOLVED': 'حل شده',
      'CLOSED': 'بسته شده',
      'ESCALATED': 'ارجاع شده'
    };
    return map[status] || status || '-';
  };

  const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = {
      'LOW': 'کم',
      'MEDIUM': 'متوسط',
      'HIGH': 'بالا',
      'URGENT': 'فوری',
      'CRITICAL': 'بحرانی'
    };
    return map[priority] || priority || '-';
  };
  const columns: ColumnDef<Ticket>[] = useMemo(() => [
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
      accessorKey: 'title',
      id: 'title',
      header: 'عنوان',
      cell: ({ row }) => <span className="text-xs">{row.original.title || '-'}</span>
    },
    {
      accessorKey: 'trackingCode',
      id: 'trackingCode',
      header: 'کد تیکت',
      cell: ({ row }) => <span className="text-xs text-admin-text-muted">{row.original.trackingCode || '-'}</span>
    },
    {
      accessorKey: 'priority',
      id: 'priority',
      header: 'اولویت',
      cell: ({ row }) => {
        const priority = row.original.priority;
        return (
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border",
            priorityColors[priority] || "bg-gray-500/10 text-gray-600 dark:text-gray-400"
          )}>
            {priorityLabels[priority] || priority || '-'}
          </span>
        );
      }
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'وضعیت',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status];
        const Icon = config?.icon;
        return (
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1",
            config?.className || "bg-gray-500/10 text-gray-600 dark:text-gray-400"
          )}>
            {Icon && <Icon className="w-3 h-3" />}
            {config?.label || status || '-'}
          </span>
        );
      }
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
          <Button onClick={() => { setSelectTicket(row.original), setModal("view") }} variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-admin-destructive/20">
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-admin-destructive/20">
            <Link href={"/admin/tickets/" + row.original.id}>
              <SendHorizontal className="w-4 h-4 -rotate-45" />
            </Link>
          </Button>
          <Button onClick={() => {
            setSelectTicket(row.original)
            setModal("delete")
          }} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  ], [tCommon]);
  const filters = useMemo(() => {
    const pageParam = searchParams.get('page');
    const orderParam = searchParams.get('order');
    return {
      limit: limitPage && !isNaN(Number(limitPage)) ? Number(limitPage) : undefined,
      order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
      page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
    };
  }, [searchParams]);
  const { data: ticketData, isError, isFetching } = useAdminTickets(filters)

  if (isError) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={refresh} className="text-primary font-bold">تلاش مجدد</button></div>;
  if (isFetching) return <PendingApi />
  return (
    <div className='flex flex-col gap-3'>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black mb-1">مدیریت تیکت ها</h2>
          <p className="text-muted-foreground text-sm">{ticketData?.pagination.total} تیکت</p>
        </div>
      </div>
      <SearchBox
        selects={[
          {
            label: 'وضعیت تیکت',
            placeHolder: 'انتخاب کنید',
            setValue: 'status',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'PENDING', name: 'در انتظار' },
              { id: 'WAITING', name: 'در انتظار پاسخ' },
              { id: 'RESOLVED', name: 'حل شده' },
              { id: 'CLOSED', name: 'بسته شده' },
            ]
          }, {
            label: 'اولویت',
            placeHolder: 'انتخاب کنید',
            setValue: 'priority',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'LOW', name: 'کم' },
              { id: 'MEDIUM', name: 'متوسط' },
              { id: 'HIGH', name: 'بالا' },
              { id: 'URGENT', name: 'قوری' },
              { id: 'CRITICAL', name: 'بحرانی' },
            ]
          }
        ]}
        placeHolder='سرچ برای کد تیکت'
      />
      <DynamicTable
        data={ticketData?.tickets || []}
        columns={columns}
        totalRows={ticketData?.pagination.total || 0}
        isLoading={isFetching}
        onBulkDelete={() => { }}
        nextPage={ticketData?.pagination.nextPage}
        prevPage={ticketData?.pagination.prevPage}
      />
      <DialogView
        open={isModal === "view"}
        title='اطلاعات تیکت'
        setOpen={() => setModal(null)}
        options={[
          {
            head: 'اطلاعات کاربر',
            tags: [
              { name: 'شناسه کاربر', value: selectTicket?.user?.id || '-' },
              { name: 'نام کاربری', value: selectTicket?.user?.username || '-' },
              { name: 'نام', value: selectTicket?.user?.firstName || '-' },
              { name: 'نام خانوادگی', value: selectTicket?.user?.lastName || '-' },
              { name: 'نام فروشگاه', value: selectTicket?.user?.storeName || '-' },
            ]
          },
          {
            head: 'اطلاعات تیکت',
            detail: [
              { name: 'شناسه تیکت', value: selectTicket?.id || '-' },
              { name: 'کد رهگیری', value: selectTicket?.trackingCode || '-' },
              { name: 'عنوان', value: selectTicket?.title || '-' },
              { name: 'وضعیت', value: selectTicket?.status && getStatusLabel(selectTicket?.status) },
              { name: 'اولویت', value: selectTicket?.priority && getPriorityLabel(selectTicket?.priority) },
              { name: 'تاریخ ایجاد', value: selectTicket?.createdAt ? new Date(selectTicket?.createdAt).toLocaleDateString('fa-IR') : '-' },
              { name: 'آخرین بروزرسانی', value: selectTicket?.updatedAt ? new Date(selectTicket?.updatedAt).toLocaleDateString('fa-IR') : '-' },
              { name: 'خوانده شده توسط کاربر', value: selectTicket?.isUserRead ? 'بله' : 'خیر' },
              { name: 'سفارش مرتبط', value: selectTicket?.orderId || 'ندارد' },
            ]
          }
        ]}
      />
      <DialogDelete
        closeModal={() => setModal(null)}
        onDelete={() => {
          if (selectTicket?.id) {
            deleteMutate(selectTicket?.id, {
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