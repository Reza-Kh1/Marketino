'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, ChevronDown, Send, AlertTriangle, Clock, AlertCircle, CheckCircle, XCircle, Eye, SendHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminTickets, useTickets } from '@/hooks/ticket.hook';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Ticket } from '@/services/ticket.service';
import { Checkbox } from '@/components/ui/checkbox';
import { TicketStatus } from "@/services/ticket.service";
import { useTranslations } from 'next-intl';
import DialogView from '@/components/DialogView';
import { SearchBar } from '@/components/SearchBar';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import { ReportType } from '@/services/report.service';
import { useDeleteReport, useReport, useReportsAdmin, useUpdateReportStatus } from '@/hooks/report.hook';
import TooltipCustom from '@/components/TooltipCustom';
import DialogDelete from '@/components/DialogDelete';

const statusConfig = {
    [TicketStatus.PENDING]: {
        icon: Clock,
        label: "در انتظار",
        className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
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

export default function AdminTicketsPage() {
    const [modalMode, setModalMode] = useState<'view' | 'delete' | null>(null)
    const [selectReport, setSelectReport] = useState<ReportType | null>(null)
    const { mutate: deleteMutate, isPending: pendingDelete } = useDeleteReport()
    const { refresh } = useRouter()
    const tReport = useTranslations('report')
    const REPORT_TYPES = [
        { value: tReport('reportType.fake.name'), label: tReport('reportType.fake.label'), icon: '🛑' },
        { value: tReport('reportType.price.name'), label: tReport('reportType.price.label'), icon: '💰' },
        { value: tReport('reportType.notdelivered.name'), label: tReport('reportType.notdelivered.label'), icon: '📦' },
        { value: tReport('reportType.defective.name'), label: tReport('reportType.defective.label'), icon: '🔧' },
        { value: tReport('reportType.wronginfo.name'), label: tReport('reportType.wronginfo.label'), icon: '📝' },
        { value: tReport('reportType.misconduct.name'), label: tReport('reportType.misconduct.label'), icon: '😠' },
        { value: tReport('reportType.spam.name'), label: tReport('reportType.spam.label'), icon: '📢' },
        { value: tReport('reportType.other.name'), label: tReport('reportType.other.label'), icon: '📌' },
    ];
    const tCommon = useTranslations('common')
    const searchParams = useSearchParams();
    const filters = useMemo(() => {
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');
        const orderParam = searchParams.get('order');
        return {
            limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
            order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
            page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
            search: searchParams.get('search') || undefined,
            status: searchParams.get('status') || undefined,
            priority: searchParams.get('priority') || undefined,
        };
    }, [searchParams]);
    const { data: reportData, isError, isFetching } = useReportsAdmin(filters)
    const { mutate, isPending } = useUpdateReportStatus()


    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            'PENDING': 'در انتظار',
            'RESOLVED': 'حل شده',
            'CLOSED': 'بسته شده',
        };
        return map[status] || status || '-';
    };
    const changeReport = (id: string, status: "PENDING" | "RESOLVED" | "CLOSED") => {
        mutate({ id, data: { status } })
    }
    const columns: ColumnDef<ReportType>[] = useMemo(() => [
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
            header: 'شماره سفارش',
            cell: ({ row }) => <span className="text-xs text-admin-text-muted font-mono">{row.original.orderCode || '-'}</span>
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
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {row.original.status === 'CLOSED' ?
                        <>
                            <TooltipCustom placeHolder="حل شده">
                                <Button onClick={() => {
                                    changeReport(row.original.id, 'RESOLVED')
                                }} disabled={isPending} variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-admin-destructive/20">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                </Button>
                            </TooltipCustom>
                            <TooltipCustom placeHolder="در انتظار">
                                <Button onClick={() => {
                                    changeReport(row.original.id, 'PENDING')
                                }} disabled={isPending} variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-admin-destructive/20">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                </Button>
                            </TooltipCustom>
                        </>
                        : row.original.status === 'PENDING' ?
                            <>
                                <TooltipCustom placeHolder="حل شده">
                                    <Button onClick={() => {
                                        changeReport(row.original.id, 'RESOLVED')
                                    }} disabled={isPending} variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-admin-destructive/20">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </Button>
                                </TooltipCustom>
                                <TooltipCustom placeHolder="بستن گزارش">
                                    <Button onClick={() => {
                                        changeReport(row.original.id, 'CLOSED')
                                    }} disabled={isPending} variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-admin-destructive/20">
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    </Button>
                                </TooltipCustom>
                            </>
                            :
                            <>
                                <TooltipCustom placeHolder="در انتظار">
                                    <Button onClick={() => {
                                        changeReport(row.original.id, 'PENDING')
                                    }} disabled={isPending} variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-admin-destructive/20">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                    </Button>
                                </TooltipCustom>
                            </>
                    }
                    <Button onClick={() => { setSelectReport(row.original), setModalMode("view") }} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-admin-destructive/20">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => {
                        setSelectReport(row.original)
                        setModalMode("delete")
                    }} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        },
    ], [tCommon]);
    const getReportTypeLabel = (type?: string) => {
        const found = REPORT_TYPES.find(t => t.value === type);
        return found?.label || type || '-';
    };
    if (isError) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={refresh} className="text-primary font-bold">تلاش مجدد</button></div>;
    if (isFetching) return <PendingApi />
    return (
        <div className='flex flex-col gap-3'>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black mb-1">مدیریت گزارش ها</h2>
                    <p className="text-muted-foreground text-sm">{reportData?.pagination.total} تیکت</p>
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
                            { id: 'RESOLVED', name: 'حل شده' },
                            { id: 'CLOSED', name: 'بسته شده' },
                        ]
                    }
                ]}
                placeHolder='سرچ برای شماره سفارش'
            />
            <DynamicTable
                limitPage={1000}
                data={reportData?.reports || []}
                columns={columns}
                totalRows={reportData?.pagination.total || 0}
                isLoading={isFetching}
                onBulkDelete={() => { }}
            />
            <DialogView
                open={modalMode === 'view'}
                title='جزئیات گزارش تخلف'
                setOpen={() => setModalMode(null)}
                options={[
                    {
                        head: 'اطلاعات گزارش',
                        tags: [
                            { name: 'شناسه گزارش', value: selectReport?.id || '-' },
                            { name: 'نوع تخلف', value: getReportTypeLabel(selectReport?.title) || '' },
                            { name: 'وضعیت', value: selectReport?.status ? getStatusLabel(selectReport.status) : '-' },
                            { name: 'تاریخ ایجاد', value: selectReport?.createdAt ? new Date(selectReport.createdAt).toLocaleDateString('fa-IR') : '-' },
                            { name: 'آخرین بروزرسانی', value: selectReport?.updatedAt ? new Date(selectReport.updatedAt).toLocaleDateString('fa-IR') : '-' },
                        ]
                    },
                    {
                        head: 'اطلاعات فروشنده و سفارش',
                        tags: [
                            { name: 'نام فروشنده', value: selectReport?.nameSeller || '-' },
                            { name: 'شماره سفارش', value: selectReport?.orderCode || '-' },
                        ]
                    },
                    {
                        head: 'شرح تخلف',
                        detail: [
                            { name: 'متن گزارش', value: selectReport?.content || '-' },
                        ]
                    },
                    {
                        head: 'تصاویر ارسالی',
                        tags: selectReport?.images?.length
                            ? selectReport.images.map((i) => ({
                                name: 'عکس گزارش',
                                img: i.url
                            }))
                            : [{ name: 'عکس گزارش', value: "هیچ عکسی ارسال نشده" }]
                    }
                ]}
            />
            <DialogDelete
                closeModal={() => setModalMode(null)}
                onDelete={() => {
                    if (selectReport?.id) {
                        deleteMutate(selectReport?.id, {
                            onSuccess: () => {
                                setModalMode(null)
                            }
                        })
                    }
                }}
                isPending={isPending}
                open={modalMode === "delete"}
            />
        </div>
    );
}