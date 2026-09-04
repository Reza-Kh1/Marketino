'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, CircleAlert, Send, AlertTriangle, Clock, CircleCheck, CheckCircle, XCircle, Eye, Trash2, Check, X, MessageCircle, Star, User, ShoppingBag, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminReviews, useDeleteReview, useModerateReview, useAnswerReview, useStoreReviews } from '@/hooks/review.hook';
import { ReviewModerateStatus } from '@/services/review.service';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import DialogView from '@/components/DialogView';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import { ReviewEntity } from '@/services/review.service';
import TooltipCustom from '@/components/TooltipCustom';
import DialogDelete from '@/components/DialogDelete';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomButton from '@/components/CustomButton';
import MotionWrapper from '@/components/motion/MotionWrapper';
import InputForm from '@/components/inputs/InputForm';

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

export default function AdminReviewsPage({ isStore, storeId }: { isStore?: boolean, storeId?: string | null }) {
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
    const useReviews = isStore ? useStoreReviews : useAdminReviews;
    const { data: reviewsData, isError, isFetching } = useReviews(filters);
    const moderateReview = (id: string, status: ReviewModerateStatus) => {
        moderateMutate({ id, data: { isApproved: status } });
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
                <Link href={`/${isStore ? 'seller' : 'admin'}/products/` + row.original.product.id} className="text-xs hover:text-blue-500">
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
                    {row.original?.answerReview ? <CircleCheck className='w-5 h-5 text-green-500' /> : <CircleAlert className='text-red-500 w-5 h-5' />}
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
                <DialogContent dir="rtl" className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                                پاسخ به نظر کاربر
                            </MotionWrapper>
                        </DialogTitle>
                        <MotionWrapper classNameDiv='inline-block' className='inline-block' delay={0.3} preset='slideUpBlur'>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium border",
                                selectReview?.isApproved
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            )}>
                                {selectReview?.isApproved ? (
                                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> تایید شده</span>
                                ) : (
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> در انتظار تایید</span>
                                )}
                            </div>
                        </MotionWrapper>
                    </DialogHeader>
                    <div className=' max-h-[50vh] overflow-y-auto no-scrollbar'>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20">
                                    <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                        <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">محصول</p>
                                        <p className="text-sm font-medium text-foreground line-clamp-1">{selectReview?.product?.title || 'نامشخص'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-muted/20 border border-border/20">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn(
                                                "w-4 h-4",
                                                i < Number(selectReview?.rating)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-muted-foreground/20"
                                            )} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{selectReview?.rating}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span>{selectReview?.createdAt && new Date(selectReview?.createdAt).toLocaleDateString('fa-IR')}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide">
                                        متن نظر ارسال شده
                                    </span>
                                </div>
                                <div className="p-4 bg-linear-to-br from-muted/40 to-muted/10 border border-border/30 rounded-2xl text-sm leading-relaxed text-foreground/90 max-h-36 overflow-y-auto">
                                    {selectReview?.body || 'متنی یافت نشد.'}
                                </div>
                            </div>
                            {selectReview?.answerReview && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                                            <Send className="w-3.5 h-3.5 rotate-180" />
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
                                            پاسخ قبلی
                                        </span>
                                    </div>
                                    <div className="p-4 bg-linear-to-br from-emerald-50/50 to-emerald-50/20 dark:from-emerald-950/20 dark:to-transparent border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl text-sm leading-relaxed text-foreground/90">
                                        {selectReview?.answerReview || selectReview?.answer}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-semibold text-foreground/80 tracking-wide">
                                        پاسخ شما
                                    </span>
                                    {selectReview?.answerReview && (
                                        <Badge variant="secondary" className="text-[9px] font-normal bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                            پاسخ جدید جایگزین می‌شود
                                        </Badge>
                                    )}
                                </div>
                                <InputForm
                                    name='answer'
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="پاسخ خود را بنویسید..."
                                    type='textarea'
                                    className='resize-none'
                                    rows={7}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between! items-center w-full">
                        <CustomButton
                            onClick={submitAnswer}
                            isPending={pendingAnswer}
                            name='ارسال پاسخ'
                            color='white'
                            iconStart={<Send className="w-4 h-4 rotate-45" />}
                        />
                        <CustomButton
                            onClick={() => setModalMode(null)}
                            isPending={pendingAnswer}
                            name='انصراف'
                            color='gray'
                            iconStart={<X className="w-4 h-4" />}
                        />
                    </DialogFooter>
                </DialogContent >
            </Dialog >
            <DialogDelete
                closeModal={() => setModalMode(null)
                }
                onDelete={() => {
                    if (selectReview?.id) {
                        deleteMutate(selectReview.id, {
                            onSuccess: () => { setModalMode(null) }
                        });
                    }
                }}
                isPending={pendingDelete}
                open={modalMode === "delete"}
                helpText={< p > آیا از حذف این نظر مطمئن هستید؟</p >}
            />
        </div >
    );
}