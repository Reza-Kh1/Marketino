'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, ChevronDown, Send, AlertTriangle, Clock, AlertCircle, CheckCircle, XCircle, Eye, SendHorizontal, Trash2, Check, X, MessageCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminReviews, useDeleteReview, useModerateReview, useAnswerReview } from '@/hooks/review.hook';
import { ReviewModerateStatus } from '@/services/review.service';
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
import { ReviewEntity } from '@/services/review.service';
import TooltipCustom from '@/components/TooltipCustom';
import DialogDelete from '@/components/DialogDelete';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomButton from '@/components/CustomButton';

const statusConfig = {
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

export default function AdminReviewsPage() {
    const [modalMode, setModalMode] = useState<'view' | 'delete' | 'answer' | null>(null);
    const [selectReview, setSelectReview] = useState<ReviewEntity | null>(null);
    const [answerText, setAnswerText] = useState('');
    const { mutate: deleteMutate, isPending: pendingDelete } = useDeleteReview();
    const { mutate: moderateMutate, isPending: pendingModerate } = useModerateReview();
    const { mutate: answerMutate, isPending: pendingAnswer } = useAnswerReview();
    const { refresh } = useRouter();
    const searchParams = useSearchParams();

    const filters = useMemo(() => {
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');
        const orderParam = searchParams.get('order');
        const isApprovedParam = searchParams.get('isApproved');
        const productId = searchParams.get('productId');

        return {
            limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
            order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
            page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
            ...(isApprovedParam && isApprovedParam !== 'ALL' && { isApproved: isApprovedParam === 'true' }),
            ...(productId && { productId: productId }),
        } as any
    }, [searchParams]);

    const { data: reviewsData, isError, isFetching } = useAdminReviews(filters);

    const getRoleLabel = (role: string) => {
        const map: Record<string, string> = {
            'USER': 'کاربر',
            'ADMIN': 'ادمین',
            'SUPER_ADMIN': 'مدیر کل',
        };
        return map[role] || role || '-';
    };

    const moderateReview = (id: string, status: ReviewModerateStatus) => {
        moderateMutate({ id, data: { status } });
    };

    const submitAnswer = () => {
        if (selectReview?.id && answerText.trim()) {
            answerMutate({ id: selectReview.id, data: { answer: answerText } }, {
                onSuccess: () => {
                    setModalMode(null);
                    setAnswerText('');
                }
            });
        }
    };

    const columns: ColumnDef<ReviewEntity>[] = useMemo(() => [
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
            accessorKey: 'rating',
            id: 'rating',
            header: 'امتیاز',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className=''>
                        {row.original.rating}
                    </span>
                    <Star
                        className={'w-7 h-7 transition-colors fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'}
                    />
                </div>
            )
        },
        {
            accessorKey: 'body',
            id: 'body',
            header: 'متن نظر',
            cell: ({ row }) => (
                <span className="text-xs line-clamp-2 max-w-xs">
                    {row.original?.body || '-'}
                </span>
            )
        },
        {
            accessorKey: 'product',
            id: 'product',
            header: 'محصول',
            cell: ({ row }) => (
                <Link href={'/admin/products/' + row.original.product.id + '/edit'} className="text-xs hover:text-blue-500">
                    {row.original.product?.title || '-'}
                </Link>
            )
        },
        {
            accessorKey: 'user',
            id: 'user',
            header: 'کاربر',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs font-medium">
                        {row.original.user?.firstName} {row.original.user?.lastName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        @{row.original.user?.username}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'isApproved',
            id: 'status',
            header: 'وضعیت',
            cell: ({ row }) => {
                const status = row.original.isApproved ? 'approved' : 'rejected';
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
            accessorKey: 'answer',
            id: 'answer',
            header: 'پاسخ',
            cell: ({ row }) => (
                <span className="text-xs line-clamp-1 max-w-xs">
                    {row.original?.answer || 'بدون پاسخ'}
                </span>
            )
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt',
            header: 'تاریخ',
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
                    {!row.original.isApproved ? (
                        <TooltipCustom placeHolder="تایید">
                            <Button
                                onClick={() => moderateReview(row.original.id, ReviewModerateStatus.approve)}
                                disabled={pendingModerate}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-green-500/20"
                            >
                                <Check className="w-4 h-4 text-green-500" />
                            </Button>
                        </TooltipCustom>
                    ) : (
                        <TooltipCustom placeHolder="رد">
                            <Button
                                onClick={() => moderateReview(row.original.id, ReviewModerateStatus.reject)}
                                disabled={pendingModerate}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/20"
                            >
                                <X className="w-4 h-4 text-red-500" />
                            </Button>
                        </TooltipCustom>
                    )}
                    <TooltipCustom placeHolder="پاسخ">
                        <Button
                            onClick={() => { setSelectReview(row.original); setModalMode("answer"); setAnswerText(row.original.answer || ''); }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-pointer hover:bg-blue-500/20"
                        >
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                        </Button>
                    </TooltipCustom>
                    <TooltipCustom placeHolder="مشاهده">
                        <Button
                            onClick={() => { setSelectReview(row.original); setModalMode("view"); }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </TooltipCustom>
                    <TooltipCustom placeHolder="حذف">
                        <Button
                            onClick={() => { setSelectReview(row.original); setModalMode("delete"); }}
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
    ], [reviewsData, pendingModerate]);

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
                    <h2 className="text-2xl font-black mb-1">مدیریت نظرات</h2>
                    <p className="text-muted-foreground text-sm">
                        {reviewsData?.pagination?.total || 0} نظر
                    </p>
                </div>
            </div>

            <SearchBox
                selects={[
                    {
                        label: 'وضعیت',
                        placeHolder: 'انتخاب کنید',
                        setValue: 'isApproved',
                        children: [
                            { id: 'ALL', name: 'نمایش همه' },
                            { id: 'true', name: 'تایید شده' },
                            { id: 'false', name: 'رد شده' },
                        ]
                    }
                ]}
                inputs={[
                    { label: 'آیدی محصول', name: 'productId', placeholder: 'فیلتر بر اساس محصول' },
                ]}
            />

            <DynamicTable
                data={reviewsData?.reviews || []}
                columns={columns}
                totalRows={reviewsData?.pagination.total || 0}
                isLoading={isFetching}
                onBulkDelete={() => { }}
                nextPage={reviewsData?.pagination?.nextPage}
                prevPage={reviewsData?.pagination?.prevPage}
            />
            {/* Dialog View */}
            <DialogView
                open={modalMode === 'view'}
                title='جزئیات نظر'
                setOpen={() => setModalMode(null)}
                options={[
                    {
                        head: 'اطلاعات اصلی',
                        detail: [
                            { name: 'شناسه', value: selectReview?.id || '-' },
                            { name: 'امتیاز', value: selectReview ? '⭐'.repeat(selectReview.rating) : '-' },
                            { name: 'وضعیت', value: selectReview?.isApproved ? 'تایید شده' : 'رد شده' },
                            { name: 'کاربر', value: selectReview?.user ? `${selectReview.user.firstName} ${selectReview.user.lastName}` : '-' },
                            { name: 'نام کاربری', value: `@${selectReview?.user?.username}` },
                            { name: 'محصول', value: selectReview?.product?.title || '-' },
                            { name: 'تاریخ ایجاد', value: selectReview?.createdAt ? new Date(selectReview.createdAt).toLocaleDateString('fa-IR') : '-' },
                        ]
                    },
                    {
                        head: 'محتوای نظر',
                        detail: [
                            { name: 'عنوان', value: selectReview?.title || '-' },
                            { name: 'متن نظر', value: selectReview?.body || '-' },
                        ]
                    },
                    {
                        head: 'پاسخ ادمین',
                        detail: [
                            { name: 'پاسخ', value: selectReview?.answer || 'بدون پاسخ' },
                        ]
                    },
                ]}
            />

            {/* Dialog Answer */}
            <Dialog open={modalMode === 'answer'} onOpenChange={() => setModalMode(null)}>
                <DialogContent className="max-w-lg bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
                    <DialogHeader>
                        <DialogTitle>پاسخ به نظر</DialogTitle>
                        <DialogDescription>
                            نظر کاربر: {selectReview?.user?.firstName} {selectReview?.user?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">متن نظر:</p>
                            <div className="p-3 bg-muted rounded-md text-sm dir-rtl">
                                {selectReview?.body}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">پاسخ شما</label>
                            <Textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="پاسخ خود را وارد کنید..."
                                className="min-h-[120px] dir-rtl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <CustomButton
                            name="ارسال پاسخ"
                            iconEnd={<Send className="w-4 h-4" />}
                            onClick={submitAnswer}
                            isPending={pendingAnswer}
                        />
                        <CustomButton
                            name="انصراف"
                            onClick={() => setModalMode(null)}
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Delete */}
            <DialogDelete
                closeModal={() => setModalMode(null)}
                onDelete={() => {
                    if (selectReview?.id) {
                        deleteMutate(selectReview.id, {
                            onSuccess: () => {
                                setModalMode(null);
                            }
                        });
                    }
                }}
                isPending={pendingDelete}
                open={modalMode === "delete"}
                helpText={<p>آیا از حذف این نظر مطمئن هستید؟</p>}
            />
        </div>
    );
}