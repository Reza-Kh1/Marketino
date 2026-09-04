'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, ChevronDown, Send, AlertTriangle, Clock, AlertCircle, CheckCircle, XCircle, Eye, SendHorizontal, Trash2, Check, X, Pen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminQnA, useCreateQnA, useDeleteQnA, useUpdateQnA } from '@/hooks/qna.hook';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { ColumnDef, selectRowsFn } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import DialogView from '@/components/DialogView';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import { QnAEntity, StatusQna } from '@/services/qna.service';
import TooltipCustom from '@/components/TooltipCustom';
import DialogDelete from '@/components/DialogDelete';
import { Badge } from '@/components/ui/badge';
import QNAForm from '@/components/product/QNAForm';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MotionWrapper from '@/components/motion/MotionWrapper';
import CustomButton from '@/components/CustomButton';
import { toast } from 'sonner';

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

export default function AdminQnAPage() {
    const [modalMode, setModalMode] = useState<'view' | 'delete' | 'answer' | null>(null);
    const [selectQnA, setSelectQnA] = useState<QnAEntity | null>(null);
    const [answer, setAnswer] = useState<null | string>(null)
    const { mutate: deleteMutate, isPending: pendingDelete } = useDeleteQnA();
    const { mutate: updateMutate, isPending: pendingUpdate } = useUpdateQnA()
    const { mutate: createQna, isPending: pendinCreate } = useCreateQnA()
    const { refresh } = useRouter();
    const searchParams = useSearchParams();
    const closeModal = () => {
        setModalMode(null)
        setSelectQnA(null)
        setAnswer(null)
    }
    const filters = useMemo(() => {
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');
        const orderParam = searchParams.get('order');
        const statusParam = searchParams.get('status');
        const productId = searchParams.get('productId');
        const parentId = searchParams.get('parentId');

        return {
            limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
            order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
            page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
            ...(statusParam && statusParam !== 'ALL' && { status: statusParam }),
            ...(productId && { productId: productId }),
            ...(parentId && { parentId: parentId }),
        } as any
    }, [searchParams]);

    const { data: qnaData, isError, isFetching } = useAdminQnA(filters);
    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            'PENDING': 'در انتظار',
            'APPROVED': 'تایید شده',
            'REJECTED': 'رد شده',
        };
        return map[status] || status || '-';
    };

    const getRoleLabel = (role: string) => {
        const map: Record<string, string> = {
            'USER': 'کاربر',
            'ADMIN': 'ادمین',
            'SUPER_ADMIN': 'مدیر کل',
        };
        return map[role] || role || '-';
    };

    const updateQna = (id: string, status: StatusQna) => {
        updateMutate({ id: id, data: { status } })
    }

    const columns: ColumnDef<QnAEntity>[] = useMemo(() => [
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
            accessorKey: 'content',
            id: 'content',
            header: 'متن',
            cell: ({ row }) => (
                <span className="text-xs line-clamp-2 max-w-xs">
                    {row.original?.content || '-'}
                </span>
            )
        },
        {
            accessorKey: 'product',
            id: 'product',
            header: 'محصول',
            cell: ({ row }) => (
                <Link href={'/admin/products/' + row.original.productId} className="text-xs hover:text-blue-500">{row.original.product?.title || '-'}</Link>
            )
        },
        {
            accessorKey: 'sender',
            id: 'sender',
            header: 'فرستنده',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs font-medium">
                        {row.original.sender?.firstName} {row.original.sender?.lastName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {getRoleLabel(row.original.role)}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'isReply',
            id: 'isReply',
            header: 'نوع',
            cell: ({ row }) => (
                <Badge variant={row.original.parentId ? 'secondary' : 'default'} className="text-[10px]">
                    {row.original.parentId ? 'پاسخ' : 'پرسش'}
                </Badge>
            )
        },
        {
            accessorKey: 'status',
            id: 'status',
            header: 'وضعیت',
            cell: ({ row }) => {
                const status = row.original.status
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
                    {row.original.status === StatusQna.pending && (
                        <>
                            <TooltipCustom placeHolder="تایید">
                                <Button
                                    onClick={() => updateQna(row.original.id, StatusQna.approved)}
                                    disabled={pendingUpdate}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-green-500/20"
                                >
                                    <Check className="w-4 h-4 text-green-500" />
                                </Button>
                            </TooltipCustom>
                            <TooltipCustom placeHolder="رد">
                                <Button
                                    onClick={() => updateQna(row.original.id, StatusQna.rejected)}
                                    disabled={pendingUpdate}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/20"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </TooltipCustom>
                        </>
                    )}
                    {row.original.status === StatusQna.rejected && (
                        <>
                            <TooltipCustom placeHolder="تایید">
                                <Button
                                    onClick={() => updateQna(row.original.id, StatusQna.approved)}
                                    disabled={pendingUpdate}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-green-500/20"
                                >
                                    <Check className="w-4 h-4 text-green-500" />
                                </Button>
                            </TooltipCustom>
                        </>
                    )}
                    {row.original.status === StatusQna.approved && (
                        <>
                            <TooltipCustom placeHolder="رد">
                                <Button
                                    onClick={() => updateQna(row.original.id, StatusQna.rejected)}
                                    disabled={pendingUpdate}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/20"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </TooltipCustom>
                        </>
                    )}
                    <TooltipCustom placeHolder="پاسخ">
                        <Button
                            onClick={() => { setSelectQnA(row.original); setModalMode("answer"); }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
                        >
                            <Pen className="w-4 h-4" />
                        </Button>
                    </TooltipCustom>
                    <TooltipCustom placeHolder="مشاهده">
                        <Button
                            onClick={() => { setSelectQnA(row.original); setModalMode("view"); }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </TooltipCustom>
                    <TooltipCustom placeHolder="حذف">
                        <Button
                            onClick={() => { setSelectQnA(row.original); setModalMode("delete"); }}
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
    ], [qnaData]);

    if (isError) return (
        <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <button onClick={refresh} className="text-primary font-bold">تلاش مجدد</button>
        </div>
    );
    const submitAnswer = () => {
        if (!answer || !selectQnA?.productId || !selectQnA?.id) return toast.error('پاسخ خود را ثبت کنید')
        const body = {
            content: answer,
            productId: selectQnA?.productId,
            parentId: selectQnA?.id
        }
        createQna(body, {
            onSuccess: () => {
                closeModal()
            }
        })
    }
    if (isFetching) return <PendingApi />;

    return (
        <div className='flex flex-col gap-3'>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black mb-1">مدیریت پرسش و پاسخ‌ها</h2>
                    <p className="text-muted-foreground text-sm">
                        {qnaData?.pagination?.total || 0} پرسش و پاسخ
                    </p>
                </div>
            </div>

            <SearchBox
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
                    }
                ]}
                inputs={[
                    { label: 'آیدی محصول', name: 'productId', placeholder: 'پرسش هاش مربوط به یک محصول' },
                    { label: 'آیدی پرسش', name: 'parentId', placeholder: 'پاسخ هاش مربوط به یک پرسش' },
                ]}
            />

            <DynamicTable
                data={qnaData?.qnas || []}
                columns={columns}
                totalRows={qnaData?.pagination.total || 0}
                isLoading={isFetching}
                onBulkDelete={() => { }}
                nextPage={qnaData?.pagination?.nextPage}
                prevPage={qnaData?.pagination?.prevPage}
            />
            <Dialog onOpenChange={closeModal} open={modalMode === 'answer'}>
                <DialogContent className={`max-w-2xl! w-full bg-admin-bg-sidebar backdrop-blur-xl border-admin-border`}>
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper delay={0.1} preset='slideUpBlur'>
                                ثبت پاسخ جدید
                            </MotionWrapper>
                        </DialogTitle>
                    </DialogHeader>
                    <MotionWrapper preset='slideUpBlur' delay={0.1} className="space-y-2">
                        <p>{selectQnA?.content}</p>
                    </MotionWrapper>
                    <MotionWrapper preset='slideUpBlur' delay={0.1} className="space-y-2">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                            متن پاسخ شما <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            required
                            placeholder={"پاسخ خود را به این پرسش به صورت دقیق و راهنما بنویسید..."}
                            value={answer || ''}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full p-4 resize-none text-sm rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all min-h-30"
                        />
                    </MotionWrapper>
                    <DialogFooter>
                        <MotionWrapper preset='slideUpBlur' delay={0.1} className="flex w-full justify-between pt-2 gap-2">
                            <CustomButton
                                form="qna-form"
                                color="white"
                                onClick={submitAnswer}
                                name={"ثبت و ارسال پاسخ"}
                                iconStart={<Send className={`w-4 h-4 rotate-12`} />}
                            />
                            <CustomButton
                                color="blueLow"
                                iconEnd={<X className='w-4 h-4' />}
                                name={'انصراف'}
                                onClick={closeModal}
                            />
                        </MotionWrapper>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <DialogView
                open={modalMode === 'view'}
                title='جزئیات پرسش و پاسخ'
                setOpen={() => setModalMode(null)}
                options={[
                    {
                        head: 'اطلاعات اصلی',
                        detail: [
                            { name: 'شناسه', value: selectQnA?.id || '-' },
                            { name: 'نوع', value: selectQnA?.parentId ? 'پاسخ' : 'پرسش' },
                            { name: 'وضعیت', value: selectQnA?.status ? getStatusLabel(selectQnA.status) : '-' },
                            { name: 'فرستنده', value: selectQnA?.sender ? `${selectQnA.sender.firstName} ${selectQnA.sender.lastName}` : '-' },
                            { name: 'نقش', value: selectQnA?.role ? getRoleLabel(selectQnA.role) : '-' },
                            { name: 'محصول', value: selectQnA?.product?.title || '-' },
                            { name: 'تاریخ ایجاد', value: selectQnA?.createdAt ? new Date(selectQnA.createdAt).toLocaleDateString('fa-IR') : '-' },
                        ]
                    },
                    {
                        head: 'متن',
                        detail: [
                            { name: 'متن پرسش/پاسخ', value: selectQnA?.content || '-' },
                        ]
                    },
                    ...(selectQnA?.parentId ? [{
                        head: 'پرسش اصلی',
                        detail: [
                            { name: 'متن پرسش اصلی', value: selectQnA?.parent?.content || '-' },
                        ]
                    }] : []),
                ]}
            />

            <DialogDelete
                closeModal={closeModal}
                onDelete={() => {
                    if (selectQnA?.id) {
                        deleteMutate(selectQnA.id, {
                            onSuccess: () => {
                                closeModal()
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