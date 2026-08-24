// stores-admin.page.tsx
'use client';

import { useMemo, useState } from 'react';
import { Store, Store as StoreIcon, ChevronDown, Edit, Eye, Trash2, Check, X, Clock, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import DialogView from '@/components/DialogView';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import TooltipCustom from '@/components/TooltipCustom';
import DialogDelete from '@/components/DialogDelete';
import { Badge } from '@/components/ui/badge';
import CustomButton from '@/components/CustomButton';
import { useDeleteStore, useStoresAdmin, useUpdateStoreStatus } from '@/hooks/store.hook';
import { StoreResponseEntity } from '@/services/store.service';
import ImgTag from '@/components/ImgTag';

const statusConfig = {
    pending: {
        icon: Clock,
        label: "در انتظار",
        className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    },
    approved: {
        icon: CheckCircle,
        label: "تایید شده",
        className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
    },
    rejected: {
        icon: XCircle,
        label: "رد شده",
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    }
};

export default function AdminStoresPage() {
    const [modalMode, setModalMode] = useState<'view' | 'delete' | null>(null);
    const [selectStore, setSelectStore] = useState<StoreResponseEntity | null>(null);
    const { mutate: deleteMutate, isPending: pendingDelete } = useDeleteStore();
    const { mutate: updateStatusMutate, isPending: pendingStatus } = useUpdateStoreStatus();
    const { refresh } = useRouter();
    const searchParams = useSearchParams();

    const closeModal = () => {
        setModalMode(null);
        setSelectStore(null);
    };

    const filters = useMemo(() => {
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');
        const orderParam = searchParams.get('order');
        const searchParam = searchParams.get('search');
        const sortByParam = searchParams.get('sortBy');
        const statusParam = searchParams.get('status');
        const isActiveParam = searchParams.get('isActive');
        const isVerifiedParam = searchParams.get('isVerified');
        return {
            limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
            order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
            page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
            ...(sortByParam && sortByParam !== 'ALL' && { sortBy: sortByParam }),
            ...(statusParam && statusParam !== 'ALL' && { status: statusParam }),
            ...(isActiveParam && isActiveParam !== 'ALL' && { isActive: isActiveParam }),
            ...(isVerifiedParam && isVerifiedParam !== 'ALL' && { isVerified: isVerifiedParam }),
            ...(searchParam && { search: searchParam }),
        };
    }, [searchParams]);

    const { data: storesData, isError, isFetching } = useStoresAdmin(filters);

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            'pending': 'در انتظار',
            'approved': 'تایید شده',
            'rejected': 'رد شده',
        };
        return map[status] || status || '-';
    };

    const updateStatus = (id: string, status: string) => {
        updateStatusMutate({ id, status });
    };

    const columns: ColumnDef<StoreResponseEntity>[] = useMemo(() => [
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
            accessorKey: 'logo',
            id: 'logo',
            header: 'لوگو',
            cell: ({ row }) => (
                row.original.logo ? (
                    <ImgTag src={row.original.logo} alt={row.original.name} className="w-10 h-10 rounded-lg object-cover border border-admin-border" />
                ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-admin-border">
                        <StoreIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                )
            )
        },
        {
            accessorKey: 'name',
            id: 'name',
            header: 'نام فروشگاه',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.nameEn || '-'}</span>
                </div>
            )
        },
        {
            accessorKey: 'owner',
            id: 'owner',
            header: 'مالک',
            cell: ({ row }) => (
                <span className="text-xs">{row.original.owner?.username || '-'}</span>
            )
        },
        {
            accessorKey: 'businessType',
            id: 'businessType',
            header: 'نوع کسب‌وکار',
            cell: ({ row }) => (
                <span className="text-xs">{row.original.businessType === 'individual' ? 'حقیقی' : row.original.businessType === 'company' ? 'حقوقی' : '-'}</span>
            )
        },
        {
            accessorKey: 'rating',
            id: 'rating',
            header: 'امتیاز',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs font-medium">{row.original.rating?.avgRating?.toFixed(1) || '-'}</span>
                    <span className="text-[10px] text-muted-foreground">{row.original.rating?.totalReviews || 0} نظر</span>
                </div>
            )
        },
        {
            accessorKey: 'commissionRate',
            id: 'commissionRate',
            header: 'کارمزد',
            cell: ({ row }) => (
                <span className="text-xs">{row.original.commissionRate}%</span>
            )
        },
        {
            accessorKey: 'status',
            id: 'status',
            header: 'وضعیت',
            cell: ({ row }) => {
                const status = row.original.status;
                const config = statusConfig[status as keyof typeof statusConfig];
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
            accessorKey: 'isActive',
            id: 'isActive',
            header: 'فعال',
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'default' : 'destructive'} className="text-[10px]">
                    {row.original.isActive ? 'فعال' : 'غیرفعال'}
                </Badge>
            )
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt',
            header: 'تاریخ ایجاد',
            cell: ({ row }) => (
                <span className="text-xs">
                    {new Date(row.original.createdAt).toLocaleDateString('fa-IR') || '-'}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {row.original.status === 'pending' && (
                        <>
                            <TooltipCustom placeHolder="تایید">
                                <Button
                                    onClick={() => updateStatus(row.original.id, 'approved')}
                                    disabled={pendingStatus}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-green-500/20"
                                >
                                    <Check className="w-4 h-4 text-green-500" />
                                </Button>
                            </TooltipCustom>
                            <TooltipCustom placeHolder="رد">
                                <Button
                                    onClick={() => updateStatus(row.original.id, 'rejected')}
                                    disabled={pendingStatus}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/20"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </TooltipCustom>
                        </>
                    )}
                    {row.original.status === 'rejected' && (
                        <TooltipCustom placeHolder="تایید">
                            <Button
                                onClick={() => updateStatus(row.original.id, 'approved')}
                                disabled={pendingStatus}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-green-500/20"
                            >
                                <Check className="w-4 h-4 text-green-500" />
                            </Button>
                        </TooltipCustom>
                    )}
                    {row.original.status === 'approved' && (
                        <TooltipCustom placeHolder="رد">
                            <Button
                                onClick={() => updateStatus(row.original.id, 'rejected')}
                                disabled={pendingStatus}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/20"
                            >
                                <X className="w-4 h-4 text-red-500" />
                            </Button>
                        </TooltipCustom>
                    )}
                    <TooltipCustom placeHolder="ویرایش">
                        <Link href={`/admin/store/${row.original.slug}`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        </Link>
                    </TooltipCustom>
                    <TooltipCustom placeHolder="مشاهده">
                        <Button
                            onClick={() => { setSelectStore(row.original); setModalMode("view"); }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </TooltipCustom>
                    <TooltipCustom placeHolder="حذف">
                        <Button
                            onClick={() => { setSelectStore(row.original); setModalMode("delete"); }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 cursor-pointer hover:bg-red-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </TooltipCustom>
                </div>
            )
        },
    ], [storesData]);

    if (isError) return (
        <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <button onClick={refresh} className="text-primary font-bold">تلاش مجدد</button>
        </div>
    );

    if (isFetching) return <PendingApi />;

    return (
        <div className='flex flex-col gap-3'>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black mb-1">مدیریت فروشگاه‌ها</h2>
                    <p className="text-muted-foreground text-sm">
                        {storesData?.pagination?.total || 0} فروشگاه
                    </p>
                </div>
                <Link href="/admin/store/create-new-store">
                    <CustomButton
                        color="white"
                        name="ایجاد فروشگاه جدید"
                        iconStart={<Plus className="w-4 h-4" />}
                    />
                </Link>
            </div>
            <SearchBox
                isOrder={false}
                selects={[
                    {
                        label: 'وضعیت',
                        placeHolder: 'انتخاب کنید',
                        setValue: 'status',
                        children: [
                            { id: 'ALL', name: 'نمایش همه' },
                            { id: 'pending', name: 'در انتظار' },
                            { id: 'approved', name: 'تایید شده' },
                            { id: 'rejected', name: 'رد شده' },
                        ]
                    },
                    {
                        label: 'فعالیت فروشگاه',
                        placeHolder: 'انتخاب کنید',
                        setValue: 'isActive',
                        children: [
                            { id: 'ALL', name: 'نمایش همه' },
                            { id: 'true', name: 'فعال' },
                            { id: 'false', name: 'غیر فعال' },
                        ]
                    },
                    {
                        label: 'تاییدیه فروشگاه',
                        placeHolder: 'انتخاب کنید',
                        setValue: 'isVerified',
                        children: [
                            { id: 'ALL', name: 'نمایش همه' },
                            { id: 'true', name: 'تایید شده' },
                            { id: 'false', name: 'تایید نشده' },
                        ]
                    },
                    {
                        label: 'مرتب سازی',
                        placeHolder: 'انتخاب کنید',
                        setValue: 'sortBy',
                        children: [
                            { name: 'قدیمی', id: 'oldest' },
                            { name: 'جدید', id: 'newest' },
                            { name: 'بیشترین فروش', id: 'best_selling' },
                            { name: 'کمترین فروش', id: 'bad_selling' },
                            { name: 'بیشترین نظر', id: 'more_reviews' },
                            { name: 'کمترین نظر', id: 'low_reviews' },
                            { name: 'بیشترین امتیاز', id: 'more_rate' },
                            { name: 'کمترین امتیاز', id: 'low_rate' },
                            { name: 'بیشترین کیفیت', id: 'more_quality' },
                            { name: 'کمترین کیفیت', id: 'low_quality' },
                            { name: 'بیشترین درصد پاسخ', id: 'more_response_rate' },
                            { name: 'کمترین درصد پاسخ', id: 'low_response_rate' },
                            { name: 'کمترین پاسخگویی', id: 'low_answered' },
                            { name: 'بیش ترین محصول', id: 'more_products' },
                            { name: 'کم ترین محصول', id: 'low_products' },
                        ]
                    }
                ]}
                inputs={[
                    { label: 'جستجو', name: 'search', placeholder: 'نام فروشگاه یا ...' },
                ]}
            />
            <DynamicTable
                data={storesData?.stores || []}
                columns={columns}
                totalRows={storesData?.pagination?.total || 0}
                isLoading={isFetching}
                onBulkDelete={() => { }}
                nextPage={storesData?.pagination?.nextPage}
                prevPage={storesData?.pagination?.prevPage}
            />

            <DialogView
                open={modalMode === 'view'}
                title='جزئیات فروشگاه'
                setOpen={() => setModalMode(null)}
                options={[
                    {
                        head: 'اطلاعات اصلی',
                        detail: [
                            { name: 'شناسه', value: selectStore?.id || '-' },
                            { name: 'لوگو', img: selectStore?.logo || '-' },
                            { name: 'نام فروشگاه', value: selectStore?.name || '-' },
                            { name: 'نام انگلیسی', value: selectStore?.nameEn || '-' },
                            { name: 'اسلاگ', value: selectStore?.slug || '-' },
                            { name: 'وضعیت', value: selectStore?.status ? getStatusLabel(selectStore.status) : '-' },
                            { name: 'دلیل وضعیت', value: selectStore?.statusReason || '-' },
                            { name: 'فعال', value: selectStore?.isActive ? 'فعال' : 'غیرفعال' },
                            { name: 'تایید شده', value: selectStore?.isVerified ? 'بله' : 'خیر' },
                            { name: 'نوع کسب‌وکار', value: selectStore?.businessType || '-' },
                            { name: 'کارمزد', value: selectStore?.commissionRate ? `${selectStore.commissionRate}%` : '-' },
                            { name: 'مالک', value: selectStore?.owner?.username || '-' },
                            { name: 'تاریخ ایجاد', value: selectStore?.createdAt ? new Date(selectStore.createdAt).toLocaleDateString('fa-IR') : '-' },
                        ]
                    },
                    {
                        head: 'اطلاعات تماس و آدرس',
                        detail: [
                            { name: 'استان', value: selectStore?.province || '-' },
                            { name: 'شهر', value: selectStore?.city || '-' },
                        ]
                    },
                    {
                        head: 'اطلاعات امتیاز',
                        detail: [
                            { name: 'میانگین امتیاز', value: selectStore?.rating?.avgRating?.toFixed(1) || '-' },
                            { name: 'تعداد نظرات', value: selectStore?.rating?.totalReviews || 0 },
                            { name: 'کیفیت محصول', value: selectStore?.rating?.productQuality?.toFixed(1) || '-' },
                            { name: 'تعداد پاسخ‌ها', value: selectStore?.rating?.answeredResponses || 0 },
                            { name: 'تعداد درخواست‌ها', value: selectStore?.rating?.totalResponseRequests || 0 },
                            { name: 'نرخ پاسخگویی', value: selectStore?.rating?.responseRate ? `${selectStore.rating.responseRate}%` : '-' },
                            { name: 'زمان پاسخگویی', value: selectStore?.rating?.responseTime ? `${selectStore.rating.responseTime} دقیقه` : '-' },
                            { name: 'تعداد فروش', value: selectStore?.rating?.saleCount || 0 },
                        ]
                    },
                ]}
            />

            <DialogDelete
                closeModal={closeModal}
                onDelete={() => {
                    if (selectStore?.id) {
                        deleteMutate(selectStore.id, {
                            onSuccess: () => {
                                closeModal();
                            }
                        });
                    }
                }}
                isPending={pendingDelete}
                open={modalMode === "delete"}
            />
        </div>
    );
}