'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { History, Search, Eye, ArrowDownLeft, ArrowUpRight, Zap, RefreshCw, Layers, ChevronRight, ChevronLeft, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import DialogView from '@/components/DialogView';
import type { WalletTransactionEntity, TransactionSearchDto } from '@/services/wallet.service';
import { useMyTransactions } from '@/hooks/wallet.hook';

const typeDetails: Record<string, { label: string; icon: any; colorClass: string; isPositive: boolean }> = {
  deposit: { label: 'واریز', icon: ArrowDownLeft, colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', isPositive: true },
  withdraw: { label: 'برداشت', icon: ArrowUpRight, colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20', isPositive: false },
  commission: { label: 'کمیسیون', icon: Zap, colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20', isPositive: false },
  tax: { label: 'مالیات', icon: Layers, colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20', isPositive: false },
  refund: { label: 'بازگشت وجه', icon: RefreshCw, colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20', isPositive: true },
  purchase: { label: 'خرید', icon: Zap, colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20', isPositive: false },
  sale_settlement: { label: 'تسویه فروش', icon: Layers, colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20', isPositive: true },
  return_deduction: { label: 'کسر مرجوعی', icon: RefreshCw, colorClass: 'text-red-500 bg-red-500/10 border-red-500/20', isPositive: false },
};

const statusMap: Record<string, { label: string; className: string }> = {
  completed: { label: 'تکمیل شده', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  pending: { label: 'در انتظار', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse' },
  failed: { label: 'ناموفق', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
};

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('fa-IR').format(Number(value));
};

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export default function SellerWalletTransactionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read query params
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const trackingCode = searchParams.get('trackingCode') || undefined;
  const type = (searchParams.get('type') as TransactionSearchDto['type']) || undefined;
  const status = (searchParams.get('status') as TransactionSearchDto['status']) || undefined;

  // Local state
  const [searchQuery, setSearchQuery] = useState(trackingCode || '');
  const [selectedType, setSelectedType] = useState<string>(type || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(status || 'all');
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransactionEntity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Build query params object
  const queryParams: TransactionSearchDto = {
    page,
    limit,
    ...(selectedType !== 'all' && { type: selectedType as TransactionSearchDto['type'] }),
    ...(selectedStatus !== 'all' && { status: selectedStatus as TransactionSearchDto['status'] }),
    ...(searchQuery && { trackingCode: searchQuery }),
  };

  const { data, isLoading, isFetching, isError, refetch } = useMyTransactions(queryParams);

  const transactions = data?.transaction || [];
  const pagination = data?.pagination;

  // Update URL query params
  const updateQueryParams = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handlers
  const handleSearch = () => {
    updateQueryParams({ trackingCode: searchQuery, page: 1 });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    updateQueryParams({ type: value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    updateQueryParams({ status: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (transaction: WalletTransactionEntity) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  // Build dialog options
  const buildDialogOptions = (tx: WalletTransactionEntity) => {
    const detail = typeDetails[tx.type] || typeDetails.deposit;

    return [
      {
        head: 'اطلاعات تراکنش',
        detail: [
          { name: 'نوع تراکنش', value: detail.label },
          { name: 'وضعیت', value: statusMap[tx.status]?.label || tx.status },
          { name: 'مبلغ (تومان)', value: `${formatCurrency(tx.amount)} تومان` },
          { name: 'کد پیگیری', value: tx.trackingCode },
          { name: 'کد مرجع', value: tx.id },
          { name: 'تاریخ ایجاد', value: formatDate(tx.createdAt) },
          { name: 'آخرین بروزرسانی', value: formatDate(tx.updatedAt) },
          { name: 'توضیحات', value: tx.description || 'بدون توضیحات' },
        ],
      },
      {
        head: 'جزئیات مرتبط',
        detail: [
          { name: 'شناسه سفارش', value: tx.orderId || 'مربوط به سفارش خاصی نیست' },
          { name: 'شناسه درخواست مرجوعی', value: tx.returnRequestId || 'مرتبط با مرجوعی نیست' },
          { name: 'تاریخ تسویه', value: tx.SettlementDate ? formatDate(tx.SettlementDate) : 'تعیین نشده' },
        ],
      },
    ];
  };

  const totalPages = pagination ? Math.ceil(pagination.total / limit) : 1;
  const startItem = pagination ? ((page - 1) * limit) + 1 : 0;
  const endItem = pagination ? Math.min(page * limit, pagination.total) : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center shadow-lg border border-slate-600/30">
            <History className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">تاریخچه تراکنش‌ها</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pagination ? `${formatCurrency(pagination.total)} تراکنش ثبت شده` : 'مدیریت تراکنش‌های مالی'}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
          بروزرسانی
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو با کد پیگیری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pr-9 pl-24 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-slate-500 dark:focus:border-slate-600 transition-all shadow-sm"
          />
          <button
            onClick={handleSearch}
            className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          >
            جستجو
          </button>
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="flex-1 lg:flex-none px-3 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-slate-500 dark:focus:border-slate-600 cursor-pointer shadow-sm"
          >
            <option value="all">همه انواع</option>
            <option value="deposit">واریز</option>
            <option value="withdraw">برداشت</option>
            <option value="commission">کمیسیون</option>
            <option value="tax">مالیات</option>
            <option value="refund">بازگشت وجه</option>
            <option value="purchase">خرید</option>
            <option value="sale_settlement">تسویه فروش</option>
            <option value="return_deduction">کسر مرجوعی</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex-1 lg:flex-none px-3 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-slate-500 dark:focus:border-slate-600 cursor-pointer shadow-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="completed">تکمیل شده</option>
            <option value="pending">در انتظار</option>
            <option value="failed">ناموفق</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Inbox className="w-12 h-12 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">خطا در دریافت اطلاعات</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Inbox className="w-12 h-12 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">تراکنشی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="py-4 px-4">نوع تراکنش</th>
                  <th className="py-4 px-4">کد پیگیری</th>
                  <th className="py-4 px-4">توضیحات</th>
                  <th className="py-4 px-4">مبلغ (تومان)</th>
                  <th className="py-4 px-4">وضعیت</th>
                  <th className="py-4 px-4 hidden lg:table-cell">تاریخ</th>
                  <th className="py-4 px-4 text-center">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {transactions.map((tx: any) => {
                  const detail = typeDetails[tx.type] || typeDetails.deposit;
                  const status = statusMap[tx.status] || statusMap.completed;
                  const Icon = detail.icon;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', detail.colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{detail.label}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400" dir="ltr">
                        {tx.trackingCode}
                      </td>
                      <td className="py-4 px-4 max-w-50">
                        <p className="text-slate-700 dark:text-slate-300 truncate">{tx.description || 'بدون توضیحات'}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={cn('font-black text-sm', detail.isPositive ? 'text-emerald-500' : 'text-rose-500')}>
                          {detail.isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold border', status.className)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-slate-400 text-[11px] hidden lg:table-cell">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleViewDetails(tx)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/30">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              نمایش {startItem} تا {endItem} از {formatCurrency(pagination.total)} تراکنش
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.prevPage || page === 1}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        'w-8 h-8 rounded-xl text-xs font-bold transition-all',
                        page === pageNum
                          ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === page - 2 || pageNum === page + 2) {
                  return <span key={pageNum} className="text-slate-400 text-xs">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.nextPage || page === totalPages}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <DialogView
        open={dialogOpen}
        setOpen={setDialogOpen}
        title="جزئیات تراکنش"
        desc={selectedTransaction ? `کد پیگیری: ${selectedTransaction.trackingCode}` : ''}
        options={selectedTransaction ? buildDialogOptions(selectedTransaction) : []}
      />
    </div>
  );
}