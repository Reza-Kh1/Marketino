'use client';

import { useMemo, useState } from 'react';
import {
  MessageSquare, CircleAlert, Send, AlertTriangle, Clock, CircleCheck,
  CheckCircle, XCircle, Eye, Trash2, Check, X, MessageCircle, Star,
  ShoppingBag, FileText, Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useStoreReviewAdmin,
  useApproveStoreReview,
  useRejectStoreReview,
  useAnswerStoreReview,
  useDeleteStoreReview,
  useStoreReview
} from '@/hooks/store.hook'
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomButton from '@/components/CustomButton';
import MotionWrapper from '@/components/motion/MotionWrapper';
import InputForm from '@/components/inputs/InputForm';
import { StoreReview } from '@/services/store.service';

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
  },
  pending: {
    icon: Clock,
    label: "در انتظار",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  }
};

export default function AdminStoreReviewsPage({ storeId, isStore }: { storeId?: string | null, isStore?: boolean }) {
  const [modalMode, setModalMode] = useState<'view' | 'delete' | 'answer' | null>(null);
  const [selectReview, setSelectReview] = useState<StoreReview | null>(null);
  const [answerText, setAnswerText] = useState('');
  const { mutate: deleteMutate, isPending: pendingDelete } = useDeleteStoreReview();
  const { mutate: approveMutate, isPending: pendingApprove } = useApproveStoreReview();
  const { mutate: rejectMutate, isPending: pendingReject } = useRejectStoreReview();
  const { mutate: answerMutate, isPending: pendingAnswer } = useAnswerStoreReview();
  const { refresh } = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const statusParam = searchParams.get('status');
    const verifiedPurchase = searchParams.get('verifiedPurchase');
    const storeIdFilter = storeId || searchParams.get('storeId');
    return {
      limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
      page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
      ...(statusParam && statusParam !== 'All' && { status: statusParam }),
      ...(verifiedPurchase && verifiedPurchase !== 'All' && { verifiedPurchase: verifiedPurchase }),
      ...(storeIdFilter && { storeId: storeIdFilter }),
    } as any;
  }, [searchParams]);
    const { data: reviewsData, isError, isFetching, isLoading } = useStoreReviewAdmin(filters);
  



  const moderateReview = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      approveMutate(id);
    } else {
      rejectMutate(id);
    }
  };

  const submitAnswer = () => {
    if (selectReview?.id && answerText.trim()) {
      answerMutate({ reviewId: selectReview.id, answer: { answerReview: answerText } }, {
        onSuccess: () => {
          setModalMode(null);
          setAnswerText('');
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
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
  };

  const columns: ColumnDef<StoreReview>[] = useMemo(() => [
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
          <span className="font-medium">{row.original.rating}</span>
          <Star className="w-7 h-7 transition-colors fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
        </div>
      )
    },
    {
      accessorKey: 'productQuality',
      id: 'productQuality',
      header: 'محصول',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-xs">{row.original.productQuality?.toFixed(1) || '-'}</span>
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
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
      accessorKey: 'store',
      id: 'store',
      header: 'فروشگاه',
      cell: ({ row }) => (
        <div className='flex justify-center items-center text-center w-full'>
          <TooltipCustom placeHolder={row.original.store?.slug || '-'}>
            <Link
              href={`/${isStore ? 'seller' : 'admin'}/store/` + row.original.store?.slug}
              className="text-xs hover:text-blue-500 flex items-center gap-1 mx-auto"
            >
              <Store className="w-4 h-4" />
            </Link>
          </TooltipCustom>
        </div>
      )
    },
    {
      accessorKey: 'verifiedPurchase',
      id: 'verifiedPurchase',
      header: 'خرید',
      cell: ({ row }) => (
        <span className={cn(
          "text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1",
          row.original.verifiedPurchase
            ? "bg-green-500/10 text-green-600 border-green-500/20"
            : "bg-gray-500/10 text-gray-600 border-gray-500/20"
        )}>
          {row.original.verifiedPurchase ? '✓' : '✗'}
        </span>
      )
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'وضعیت',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: 'answerReview',
      id: 'answer',
      header: 'پاسخ',
      cell: ({ row }) => (
        <span className="text-xs line-clamp-1 max-w-xs">
          {row.original?.answerReview ? (
            <CircleCheck className="w-5 h-5 text-green-500" />
          ) : (
            <CircleAlert className="text-red-500 w-5 h-5" />
          )}
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
      cell: ({ row }) => {
        const status = row.original.status;
        const isPending = status === 'pending';
        const isApproved = status === 'approved';
        const isRejected = status === 'rejected';

        return (
          <div className="flex items-center gap-1">
            {/* دکمه‌های تایید/رد */}
            {isPending && (
              <>
                <TooltipCustom placeHolder="تایید">
                  <Button
                    onClick={() => moderateReview(row.original.id, 'approve')}
                    disabled={pendingApprove}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer hover:bg-green-500/20"
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                </TooltipCustom>
                <TooltipCustom placeHolder="رد">
                  <Button
                    onClick={() => moderateReview(row.original.id, 'reject')}
                    disabled={pendingReject}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </TooltipCustom>
              </>
            )}

            {isApproved && (
              <TooltipCustom placeHolder="رد">
                <Button
                  onClick={() => moderateReview(row.original.id, 'reject')}
                  disabled={pendingReject}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/20"
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </TooltipCustom>
            )}

            {isRejected && (
              <TooltipCustom placeHolder="تایید">
                <Button
                  onClick={() => moderateReview(row.original.id, 'approve')}
                  disabled={pendingApprove}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-green-500/20"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </Button>
              </TooltipCustom>
            )}

            <TooltipCustom placeHolder="پاسخ">
              <Button
                onClick={() => {
                  setSelectReview(row.original);
                  setModalMode("answer");
                  setAnswerText(row.original.answerReview || '');
                }}
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
            {!isStore && (
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
            )}
          </div>
        );
      }
    },
  ], [reviewsData, pendingApprove, pendingReject]);

  if (isError) return (
    <div className="text-center py-20">
      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
      <button onClick={refresh} className="text-primary font-bold">تلاش مجدد</button>
    </div>
  );

  if (isLoading) return <PendingApi />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black mb-1">مدیریت نظرات فروشندگان</h2>
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
            setValue: 'status',
            children: [
              { id: 'All', name: 'نمایش همه' },
              { id: 'pending', name: 'در انتظار' },
              { id: 'approved', name: 'تایید شده' },
              { id: 'rejected', name: 'رد شده' },
            ]
          }, {
            label: 'خریدار',
            placeHolder: 'انتخاب کنید',
            setValue: 'verifiedPurchase',
            children: [
              { id: 'All', name: 'نمایش همه' },
              { id: 'false', name: 'معمولی' },
              { id: 'true', name: 'خریدار' },
            ]
          },
        ]}
        inputs={
          [
            ...(!isStore ? [{ label: 'آیدی فروشگاه', name: 'storeId', placeholder: 'فیلتر بر اساس فروشگاه' }] : [])
          ]
        }
      />

      <DynamicTable
        data={reviewsData?.storesReview || []}
        columns={columns}
        totalRows={reviewsData?.pagination?.total || 0}
        isLoading={isFetching}
        onBulkDelete={() => { }}
        nextPage={reviewsData?.pagination?.nextPage}
        prevPage={reviewsData?.pagination?.prevPage}
      />

      {/* Dialog View */}
      <DialogView
        open={modalMode === 'view'}
        title="جزئیات نظر فروشگاه"
        setOpen={() => setModalMode(null)}
        options={[
          {
            head: 'اطلاعات اصلی',
            detail: [
              { name: 'شناسه', value: selectReview?.id || '-' },
              { name: 'امتیاز', value: selectReview ? '⭐'.repeat(Math.round(selectReview.rating)) : '-' },
              { name: 'کیفیت محصول', value: selectReview?.productQuality?.toFixed(1) || '-' },
              { name: 'وضعیت', value: statusConfig[selectReview?.status as keyof typeof statusConfig]?.label || selectReview?.status || '-' },
              { name: 'کاربر', value: selectReview?.user ? `${selectReview.user.firstName} ${selectReview.user.lastName}` : '-' },
              { name: 'فروشگاه', value: selectReview?.store?.name || selectReview?.storeId || '-' },
              { name: 'محصول', value: selectReview?.productName || '-' },
              { name: 'خرید تایید شده', value: selectReview?.verifiedPurchase ? 'بله' : 'خیر' },
              { name: 'تاریخ ایجاد', value: selectReview?.createdAt ? new Date(selectReview.createdAt).toLocaleDateString('fa-IR') : '-' },
            ]
          },
          {
            head: 'محتوای نظر',
            detail: [
              { name: 'متن نظر', value: selectReview?.body || '-' },
            ]
          },
          {
            head: 'پاسخ ادمین',
            detail: [
              { name: 'پاسخ', value: selectReview?.answerReview || 'بدون پاسخ' },
              { name: 'تاریخ پاسخ', value: selectReview?.answerAt ? new Date(selectReview.answerAt).toLocaleDateString('fa-IR') : '-' },
            ]
          },
        ]}
      />

      {/* Dialog Answer */}
      <Dialog open={modalMode === 'answer'} onOpenChange={() => setModalMode(null)}>
        <DialogContent dir="rtl" className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
          <DialogHeader>
            <DialogTitle className="text-admin-text-primary text-xl font-bold">
              <MotionWrapper className="" delay={0.3} preset="slideUpBlur">
                پاسخ به نظر فروشگاه
              </MotionWrapper>
            </DialogTitle>
            <MotionWrapper classNameDiv="inline-block" className="inline-block" delay={0.3} preset="slideUpBlur">
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border",
                selectReview?.status === 'approved'
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : selectReview?.status === 'pending'
                    ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              )}>
                {statusConfig[selectReview?.status as keyof typeof statusConfig]?.label || selectReview?.status}
              </div>
            </MotionWrapper>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">فروشگاه</p>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {selectReview?.store?.name || selectReview?.storeId || 'نامشخص'}
                    </p>
                  </div>
                </div>
                {selectReview?.productName && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">محصول</p>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {selectReview.productName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-muted/20 border border-border/20">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn(
                        "w-4 h-4",
                        i < Math.round(Number(selectReview?.rating) || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/20"
                      )} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{selectReview?.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">کیفیت محصول: {selectReview?.productQuality?.toFixed(1)}</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{selectReview?.createdAt && new Date(selectReview.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide">
                    متن نظر ارسال شده
                  </span>
                  {selectReview?.verifiedPurchase && (
                    <Badge variant="secondary" className="text-[9px] font-normal bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                      خرید تایید شده
                    </Badge>
                  )}
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
                    {selectReview.answerAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(selectReview.answerAt).toLocaleDateString('fa-IR')}
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-linear-to-br from-emerald-50/50 to-emerald-50/20 dark:from-emerald-950/20 dark:to-transparent border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl text-sm leading-relaxed text-foreground/90">
                    {selectReview.answerReview}
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
                  name="answer"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                  type="textarea"
                  className="resize-none"
                  rows={7}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between! items-center w-full">
            <CustomButton
              onClick={submitAnswer}
              isPending={pendingAnswer}
              name="ارسال پاسخ"
              color="white"
              iconStart={<Send className="w-4 h-4 rotate-45" />}
            />
            <CustomButton
              onClick={() => setModalMode(null)}
              isPending={pendingAnswer}
              name="انصراف"
              color="gray"
              iconStart={<X className="w-4 h-4" />}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogDelete
        closeModal={() => setModalMode(null)}
        onDelete={() => {
          if (selectReview?.id) {
            deleteMutate(selectReview.id, {
              onSuccess: () => { setModalMode(null); }
            });
          }
        }}
        isPending={pendingDelete}
        open={modalMode === "delete"}
        helpText={<p>آیا از حذف این نظر فروشگاه مطمئن هستید؟</p>}
      />
    </div>
  );
}