'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Eye, Trash2, CheckCircle, XCircle, AlertTriangle,
  Power, PowerOff, Wallet, Search, History, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import DialogView from '@/components/DialogView';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import TooltipCustom from '@/components/TooltipCustom';
import DialogDelete from '@/components/DialogDelete';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomButton from '@/components/CustomButton';
import { WalletTransactionEntity, TransactionSearchDto } from '@/services/wallet.service';
import { format } from 'date-fns-jalali';
import { Badge } from '@/components/ui/badge';
import { useAdminTransactions, useApproveWithdrawal, useCompleteTransaction, useDeleteTransaction, useFailTransaction, useRejectWithdrawal, useWallet } from '@/hooks/wallet.hook';

const typeDetails: Record<string, { label: string; colorClass: string; isPositive: boolean }> = {
  deposit: { label: 'واریز', colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', isPositive: true },
  withdraw: { label: 'برداشت', colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20', isPositive: false },
  commission: { label: 'کمیسیون', colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20', isPositive: false },
  tax: { label: 'مالیات', colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20', isPositive: false },
  refund: { label: 'بازگشت وجه', colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20', isPositive: true },
  purchase: { label: 'خرید', colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20', isPositive: false },
  sale_settlement: { label: 'تسویه فروش', colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20', isPositive: true },
  return_deduction: { label: 'کسر مرجوعی', colorClass: 'text-red-500 bg-red-500/10 border-red-500/20', isPositive: false },
};

const statusMap: Record<string, { label: string; className: string; icon: any }> = {
  completed: { label: 'تکمیل شده', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: CheckCircle },
  pending: { label: 'در انتظار', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: AlertTriangle },
  failed: { label: 'ناموفق', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: XCircle },
};

export default function AdminWalletTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalMode, setModalMode] = useState<'view' | 'delete' | 'wallet' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransactionEntity | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  // --- فیلترها از URL ---
  const filters = useMemo(() => {
    const limit = searchParams.get('limit') || '10';
    const page = searchParams.get('page') || '1';
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('userId') || undefined;

    return {
      limit: !isNaN(Number(limit)) ? Number(limit) : 10,
      page: !isNaN(Number(page)) ? Number(page) : 1,
      ...(search && { trackingCode: search }),
      ...(type && type !== 'ALL' && { type: type as TransactionSearchDto['type'] }),
      ...(status && status !== 'ALL' && { status: status as TransactionSearchDto['status'] }),
      ...(userId && { userId }),
    };
  }, [searchParams]);

  const { data: transactionsData, isError, isFetching, isLoading } = useAdminTransactions(filters);
  const { data: walletData, isLoading: walletLoading } = useWallet(selectedWalletId || '');
  
  const { mutate: approveMutate, isPending: isApproving } = useApproveWithdrawal();
  const { mutate: rejectMutate, isPending: isRejecting } = useRejectWithdrawal();
  const { mutate: completeMutate, isPending: isCompleting } = useCompleteTransaction();
  const { mutate: failMutate, isPending: isFailing } = useFailTransaction();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteTransaction();

  const handleApproveWithdrawal = (transaction: WalletTransactionEntity) => {
    approveMutate(
      { id: transaction.id },
      {
        onSuccess: () => {
          setModalMode(null);
        }
      }
    );
  };

  const handleRejectWithdrawal = (transaction: WalletTransactionEntity) => {
    rejectMutate(
      { id: transaction.id },
      {
        onSuccess: () => {
          setModalMode(null);
        }
      }
    );
  };

  const handleCompleteTransaction = (transaction: WalletTransactionEntity) => {
    completeMutate(
      { id: transaction.id },
      {
        onSuccess: () => {
          setModalMode(null);
        }
      }
    );
  };

  const handleFailTransaction = (transaction: WalletTransactionEntity) => {
    failMutate(
      { id: transaction.id },
      {
        onSuccess: () => {
          setModalMode(null);
        }
      }
    );
  };

  const handleDeleteTransaction = (transaction: WalletTransactionEntity) => {
    deleteMutate(transaction.id, {
      onSuccess: () => setModalMode(null)
    });
  };

  const handleViewWallet = (walletId: string) => {
    setSelectedWalletId(walletId);
    setModalMode('wallet');
  };

  const columns: ColumnDef<WalletTransactionEntity>[] = useMemo(() => [
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
      accessorKey: 'trackingCode',
      header: 'کد پیگیری',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-primary" dir="ltr">{row.original.trackingCode}</span>
      )
    },
    {
      accessorKey: 'type',
      header: 'نوع تراکنش',
      cell: ({ row }) => {
        const detail = typeDetails[row.original.type] || typeDetails.deposit;
        return (
          <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold border', detail.colorClass)}>
            {detail.label}
          </span>
        );
      }
    },
    {
      accessorKey: 'amount',
      header: 'مبلغ (تومان)',
      cell: ({ row }) => {
        const detail = typeDetails[row.original.type] || typeDetails.deposit;
        return (
          <span className={cn('font-bold text-sm', detail.isPositive ? 'text-emerald-500' : 'text-rose-500')}>
            {detail.isPositive ? '+' : '-'}{Number(row.original.amount).toLocaleString('fa-IR')}
          </span>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'وضعیت',
      cell: ({ row }) => {
        const status = statusMap[row.original.status] || statusMap.completed;
        const Icon = status.icon;
        return (
          <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1', status.className)}>
            <Icon className="w-3 h-3" />
            {status.label}
          </span>
        );
      }
    },
    {
      accessorKey: 'userId',
      header: 'کاربر',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground" dir="ltr">
          {row.original.userId.slice(0, 8)}...
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'تاریخ',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.original.createdAt), "yyyy/MM/dd - HH:mm")}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <div className="flex items-center gap-1">
            {tx.type === 'withdraw' && tx.status === 'pending' && (
              <>
                <TooltipCustom placeHolder="تأیید برداشت">
                  <Button
                    onClick={() => handleApproveWithdrawal(tx)}
                    disabled={isApproving}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer hover:bg-emerald-500/20"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </Button>
                </TooltipCustom>
                <TooltipCustom placeHolder="رد برداشت">
                  <Button
                    onClick={() => handleRejectWithdrawal(tx)}
                    disabled={isRejecting}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer hover:bg-rose-500/20"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" />
                  </Button>
                </TooltipCustom>
              </>
            )}

            {tx.type === 'purchase' && tx.status === 'pending' && (
              <>
                <TooltipCustom placeHolder="تکمیل تراکنش">
                  <Button
                    onClick={() => handleCompleteTransaction(tx)}
                    disabled={isCompleting}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer hover:bg-emerald-500/20"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </Button>
                </TooltipCustom>
                <TooltipCustom placeHolder="شکست تراکنش">
                  <Button
                    onClick={() => handleFailTransaction(tx)}
                    disabled={isFailing}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer hover:bg-rose-500/20"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" />
                  </Button>
                </TooltipCustom>
              </>
            )}

            <TooltipCustom placeHolder="مشاهده کیف پول">
              <Button
                onClick={() => handleViewWallet(tx.walletId)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer hover:bg-blue-500/20"
              >
                <Wallet className="w-4 h-4 text-blue-500" />
              </Button>
            </TooltipCustom>

            <TooltipCustom placeHolder="مشاهده جزئیات">
              <Button
                onClick={() => { setSelectedTransaction(tx); setModalMode('view'); }}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipCustom>

            <TooltipCustom placeHolder="حذف">
              <Button
                onClick={() => { setSelectedTransaction(tx); setModalMode('delete'); }}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 cursor-pointer hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipCustom>
          </div>
        );
      }
    },
  ], [isApproving, isRejecting, isCompleting, isFailing, isDeleting]);

  if (isError) return (
    <div className="text-center py-20">
      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
      <button onClick={() => router.refresh()} className="text-primary font-bold">تلاش مجدد</button>
    </div>
  );

  if (isLoading) return <PendingApi />;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black mb-1">مدیریت تراکنش‌های کیف پول</h2>
          <p className="text-muted-foreground text-sm">
            {transactionsData?.pagination?.total || 0} تراکنش
          </p>
        </div>
      </div>

      {/* SearchBox */}
      <SearchBox
        selects={[
          {
            label: 'نوع تراکنش',
            placeHolder: 'همه',
            setValue: 'type',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'deposit', name: 'واریز' },
              { id: 'withdraw', name: 'برداشت' },
              { id: 'commission', name: 'کمیسیون' },
              { id: 'tax', name: 'مالیات' },
              { id: 'refund', name: 'بازگشت وجه' },
              { id: 'purchase', name: 'خرید' },
              { id: 'sale_settlement', name: 'تسویه فروش' },
              { id: 'return_deduction', name: 'کسر مرجوعی' },
            ]
          },
          {
            label: 'وضعیت',
            placeHolder: 'همه',
            setValue: 'status',
            children: [
              { id: 'ALL', name: 'نمایش همه' },
              { id: 'completed', name: 'تکمیل شده' },
              { id: 'pending', name: 'در انتظار' },
              { id: 'failed', name: 'ناموفق' },
            ]
          }
        ]}
        inputs={[
          { label: 'کد پیگیری', name: 'search', placeholder: 'جستجو بر اساس کد پیگیری...' },
          { label: 'شناسه کاربر', name: 'userId', placeholder: 'فیلتر بر اساس کاربر' },
        ]}
      />

      {/* Table */}
      <DynamicTable
        data={transactionsData?.transaction || []}
        columns={columns}
        totalRows={transactionsData?.pagination?.total || 0}
        isLoading={isFetching}
        onBulkDelete={() => { }}
        nextPage={transactionsData?.pagination?.nextPage}
        prevPage={transactionsData?.pagination?.prevPage}
      />

      {/* Dialog View Transaction */}
      <DialogView
        open={modalMode === 'view'}
        title="جزئیات تراکنش"
        desc={selectedTransaction ? `کد پیگیری: ${selectedTransaction.trackingCode}` : ''}
        setOpen={() => setModalMode(null)}
        options={selectedTransaction ? [
          {
            head: 'اطلاعات اصلی',
            detail: [
              { name: 'شناسه تراکنش', value: selectedTransaction.id },
              { name: 'کد پیگیری', value: selectedTransaction.trackingCode },
              { name: 'نوع تراکنش', value: typeDetails[selectedTransaction.type]?.label || selectedTransaction.type },
              { name: 'وضعیت', value: statusMap[selectedTransaction.status]?.label || selectedTransaction.status },
              { name: 'مبلغ (تومان)', value: Number(selectedTransaction.amount).toLocaleString('fa-IR') },
              { name: 'توضیحات', value: selectedTransaction.description || 'بدون توضیحات' },
            ]
          },
          {
            head: 'اطلاعات مرتبط',
            detail: [
              { name: 'شناسه کاربر', value: selectedTransaction.userId },
              { name: 'شناسه کیف پول', value: selectedTransaction.walletId },
              { name: 'شناسه سفارش', value: selectedTransaction.orderId || 'مربوط به سفارش خاصی نیست' },
              { name: 'شناسه درخواست مرجوعی', value: selectedTransaction.returnRequestId || 'مرتبط با مرجوعی نیست' },
              { name: 'تاریخ تسویه', value: selectedTransaction.SettlementDate ? format(new Date(selectedTransaction.SettlementDate), "yyyy/MM/dd - HH:mm") : 'تعیین نشده' },
            ]
          },
          {
            head: 'تاریخ‌ها',
            detail: [
              { name: 'تاریخ ایجاد', value: format(new Date(selectedTransaction.createdAt), "yyyy/MM/dd - HH:mm") },
              { name: 'آخرین بروزرسانی', value: format(new Date(selectedTransaction.updatedAt), "yyyy/MM/dd - HH:mm") },
            ]
          }
        ] : []}
      />

      {/* Dialog View Wallet */}
      <Dialog open={modalMode === 'wallet'} onOpenChange={() => setModalMode(null)}>
        <DialogContent dir="rtl" className="max-w-2xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
          <DialogHeader>
            <DialogTitle className="text-admin-text-primary text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              جزئیات کیف پول
            </DialogTitle>
          </DialogHeader>

          {walletLoading ? (
            <div className="py-10 flex items-center justify-center">
              <PendingApi />
            </div>
          ) : walletData ? (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground mb-1">موجودی قابل برداشت</p>
                  <p className="text-lg font-bold text-emerald-500">
                    {Number(walletData.balance).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground mb-1">موجودی در انتظار</p>
                  <p className="text-lg font-bold text-amber-500">
                    {Number(walletData.pendingBalance).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-muted-foreground mb-1">در حال برداشت</p>
                  <p className="text-lg font-bold text-blue-500">
                    {Number(walletData.withdrawBalance).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-muted-foreground mb-1">موجودی مسدود</p>
                  <p className="text-lg font-bold text-purple-500">
                    {Number(walletData.frozenBalance).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-admin-border/5 p-4 rounded-xl border border-admin-border/30">
                <h3 className="text-sm font-semibold text-admin-primary border-r-2 border-admin-primary pr-2">اطلاعات حساب</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">شناسه کیف پول</p>
                    <p className="font-mono text-xs" dir="ltr">{walletData.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">شناسه کاربر</p>
                    <p className="font-mono text-xs" dir="ltr">{walletData.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">تاریخ ایجاد</p>
                    <p className="text-xs">{format(new Date(walletData.createdAt), "yyyy/MM/dd - HH:mm")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">آخرین بروزرسانی</p>
                    <p className="text-xs">{format(new Date(walletData.updatedAt), "yyyy/MM/dd - HH:mm")}</p>
                  </div>
                </div>
              </div>

              {walletData.bankAccount && (
                <div className="space-y-3 bg-admin-border/5 p-4 rounded-xl border border-admin-border/30">
                  <h3 className="text-sm font-semibold text-admin-primary border-r-2 border-admin-primary pr-2">اطلاعات بانکی</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-admin-text-muted mb-1">شماره شبا</p>
                      <p className="font-mono text-xs" dir="ltr">{walletData.bankAccount.iban}</p>
                    </div>
                    <div>
                      <p className="text-xs text-admin-text-muted mb-1">نام بانک</p>
                      <p className="text-xs">{walletData.bankAccount.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-admin-text-muted mb-1">شماره کارت</p>
                      <p className="font-mono text-xs" dir="ltr">{walletData.bankAccount.cardNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-admin-text-muted mb-1">نام صاحب حساب</p>
                      <p className="text-xs">{walletData.bankAccount.accountHolder}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              کیف پول یافت نشد
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-admin-border">
            <CustomButton
              onClick={() => setModalMode(null)}
              name="بستن"
              color="gray"
              iconStart={<XCircle className="w-4 h-4" />}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <DialogDelete
        closeModal={() => setModalMode(null)}
        onDelete={() => {
          if (selectedTransaction?.id) {
            handleDeleteTransaction(selectedTransaction);
          }
        }}
        isPending={isDeleting}
        open={modalMode === 'delete'}
        helpText={
          <p>
            آیا از حذف تراکنش با کد پیگیری{' '}
            <span className="font-bold">{selectedTransaction?.trackingCode}</span>{' '}
            مطمئن هستید؟
          </p>
        }
      />
    </div>
  );
}