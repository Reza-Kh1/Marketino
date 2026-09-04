'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Store,
  ChevronLeft,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PendingApi from '@/components/PendingApi';
import DynamicTable from '@/components/DynamicTable';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import DialogView from '@/components/DialogView';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { WalletEntity } from '@/services/wallet.service';
import { format } from 'date-fns-jalali';
import { Button } from '@/components/ui/button';
import TooltipCustom from '@/components/TooltipCustom';
import { useAdminWallets, useCreateMyWallet, useMyWallet } from '@/hooks/wallet.hook';
import CustomButton from '@/components/CustomButton';

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('fa-IR').format(Number(value));
};

export default function AdminWalletPage() {
  const searchParams = useSearchParams();
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletEntity | null>(null);
  const [modalMode, setModalMode] = useState<'view' | null>(null);
  const { mutate: createWallet, isPending } = useCreateMyWallet()

  const filters = {
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    ...(searchParams.get('userId') && { userId: searchParams.get('userId')! }),
  };

  const { data: myWallet, isLoading: myWalletLoading, isError: myWalletError, refetch: refetchMyWallet } = useMyWallet();
  const { data: allWalletsData, isLoading: allWalletsLoading, isFetching: allWalletsFetching, isError: allWalletsError } = useAdminWallets(filters, showAllWallets);
  const handleViewWallet = (wallet: WalletEntity) => {
    setSelectedWallet(wallet);
    setModalMode('view');
  };

  const buildWalletDialogOptions = (wallet: WalletEntity) => {
    const options = [
      {
        head: 'اطلاعات کیف پول',
        detail: [
          { name: 'شناسه کیف پول', value: wallet.id },
          { name: 'شناسه کاربر', value: wallet.userId },
          { name: 'وضعیت', value: wallet.isPlatform ? 'کیف پول پلتفرم' : 'کیف پول فروشنده' },
          { name: 'تاریخ ایجاد', value: format(new Date(wallet.createdAt), "yyyy/MM/dd - HH:mm") },
          { name: 'آخرین بروزرسانی', value: format(new Date(wallet.updatedAt), "yyyy/MM/dd - HH:mm") },
        ],
      },
      {
        head: 'موجودی‌ها',
        detail: [
          { name: 'موجودی قابل برداشت', value: `${formatCurrency(wallet.balance)} تومان` },
          { name: 'موجودی در انتظار', value: `${formatCurrency(wallet.pendingBalance)} تومان` },
          { name: 'در حال برداشت', value: `${formatCurrency(wallet.withdrawBalance)} تومان` },
          { name: 'موجودی مسدود', value: `${formatCurrency(wallet.frozenBalance)} تومان` },
        ],
      },
      {
        head: 'اطلاعات فردی',
        detail: [
          { name: 'نام', value: `${wallet.user?.firstName}` },
          { name: 'نام خانوادگی', value: `${wallet.user?.lastName}` },
          { name: 'نام کاربری', value: `${wallet.user?.username}` },
          { name: 'شماره تلفن', value: `${wallet.user?.phone}` },
        ],
      },
      {
        head: 'اطلاعات فروشگاه',
        detail: [
          { name: 'نام فروشگاه (فارسی)', value: `${wallet.user?.store.name}` },
          { name: 'نام فروشگاه (انگلیسی)', value: `${wallet.user?.store.nameEn}` },
          { name: 'شماره فروشگاه', value: `${wallet.user?.store.phone}` },
        ],
      },
    ];
    if (wallet.bankAccounts?.length) {
      wallet.bankAccounts.forEach((item) => {
        options.push({
          head: `🏦 ${item.bankName || 'بانک'}`,
          detail: [
            { name: 'نام بانک', value: item.bankName || '-' },
            { name: 'نام صاحب حساب', value: item.accountHolder || '-' },
            { name: 'شماره شبا', value: item.iban || '-' },
            { name: 'شماره کارت', value: item.cardNumber || '-' },
          ],
        });
      });
    }
    return options;
  };

  const columns: ColumnDef<WalletEntity>[] = [
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
      accessorKey: 'userId',
      header: 'شناسه کاربر',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground" dir="ltr">
          {row.original.userId.slice(0, 12)}...
        </span>
      )
    },
    {
      accessorKey: 'balance',
      header: 'موجودی قابل برداشت',
      cell: ({ row }) => (
        <span className="font-bold text-emerald-500 text-sm">
          {formatCurrency(row.original.balance)}
        </span>
      )
    },
    {
      accessorKey: 'pendingBalance',
      header: 'در انتظار',
      cell: ({ row }) => (
        <span className="font-bold text-amber-500 text-sm">
          {formatCurrency(row.original.pendingBalance)}
        </span>
      )
    },
    {
      accessorKey: 'withdrawBalance',
      header: 'در حال برداشت',
      cell: ({ row }) => (
        <span className="font-bold text-blue-500 text-sm">
          {formatCurrency(row.original.withdrawBalance)}
        </span>
      )
    },
    {
      accessorKey: 'frozenBalance',
      header: 'مسدود',
      cell: ({ row }) => (
        <span className="font-bold text-purple-500 text-sm">
          {formatCurrency(row.original.frozenBalance)}
        </span>
      )
    },
    {
      accessorKey: 'isPlatform',
      header: 'نوع',
      cell: ({ row }) => (
        <span className={cn(
          'px-2 py-1 rounded-full text-[10px] font-bold border',
          row.original.isPlatform
            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
        )}>
          {row.original.isPlatform ? 'پلتفرم' : 'فروشنده'}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'تاریخ ایجاد',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.original.createdAt), "yyyy/MM/dd")}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }) => (
        <TooltipCustom placeHolder="مشاهده جزئیات">
          <Button
            onClick={() => handleViewWallet(row.original)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer hover:bg-blue-500/20"
          >
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
        </TooltipCustom>
      )
    },
  ];

  if (myWalletLoading) return <PendingApi />;

  if (myWalletError) {
    return (
      <MotionWrapper preset="fadeUp" duration={0.6}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Wallet className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">خطا در دریافت اطلاعات کیف پول</p>
          <Button onClick={() => refetchMyWallet()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
        </div>
      </MotionWrapper>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Main Wallet Card */}
      {!myWallet ?
        <CustomButton
          color='white'
          onClick={createWallet}
          isPending={isPending}
          name='ساخت کیف پول'
          iconStart={<Wallet />}
        />
        :
        <MotionWrapper preset="slideUpBlur" duration={0.7}>
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10 dark:opacity-20">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative p-6 sm:p-8">
              {/* Header */}
              <MotionWrapper preset="fadeDown" delay={0.2} duration={0.5}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-600/30">
                      <Wallet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white">کیف پول پلتفرم</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">مدیریت مالی و موجودی حساب</p>
                    </div>
                  </div>

                  <button
                    onClick={() => refetchMyWallet()}
                    className="flexc items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    بروزرسانی
                  </button>
                </div>
              </MotionWrapper>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MotionWrapper preset="fadeUp" delay={0.3} duration={0.5}>
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">موجودی قابل برداشت</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(myWallet?.balance || 0)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تومان</p>
                  </div>
                </MotionWrapper>

                <MotionWrapper preset="fadeUp" delay={0.4} duration={0.5}>
                  <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">در انتظار</span>
                    </div>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(myWallet?.pendingBalance || 0)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تومان</p>
                  </div>
                </MotionWrapper>

                <MotionWrapper preset="fadeUp" delay={0.5} duration={0.5}>
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-blue-700 dark:text-blue-400 font-bold">در حال برداشت</span>
                    </div>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {formatCurrency(myWallet?.withdrawBalance || 0)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تومان</p>
                  </div>
                </MotionWrapper>

                <MotionWrapper preset="fadeUp" delay={0.6} duration={0.5}>
                  <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDownLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-700 dark:text-purple-400 font-bold">مسدود</span>
                    </div>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      {formatCurrency(myWallet?.frozenBalance || 0)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تومان</p>
                  </div>
                </MotionWrapper>
              </div>
            </div>
          </div>
        </MotionWrapper>
      }
      {/* Toggle Button for All Wallets */}
      <MotionWrapper preset="pop" delay={0.8} duration={0.6}>
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowAllWallets(prev => !prev)}
            className="group cursor-pointer relative overflow-hidden px-8 py-4 rounded-2xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
          >
            <Users className="w-5 h-5" />
            {showAllWallets ? 'پنهان کردن کیف پول فروشنده‌ها' : 'نمایش کیف پول فروشنده‌ها'}
            <motion.span
              animate={{ rotate: showAllWallets ? 180 : 0 }}
              className="inline-block"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.span>
          </button>
        </div>
      </MotionWrapper>

      {/* All Wallets Section */}
      <AnimatePresence>
        {showAllWallets && (
          <MotionWrapper preset="slideUpBlur" duration={0.6}>
            <div className="flex flex-col gap-3 pt-4">
              {/* Header */}
              <MotionWrapper preset="fadeDown" delay={0.2} duration={0.5}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-700">
                      <Store className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">کیف پول فروشنده‌ها</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {allWalletsData?.pagination?.total || 0} کیف پول ثبت شده
                      </p>
                    </div>
                  </div>
                </div>
              </MotionWrapper>

              {/* SearchBox */}
              <MotionWrapper preset="fadeUp" delay={0.3} duration={0.5}>
                <SearchBox
                  inputs={[
                    { label: 'شناسه کاربر', name: 'userId', placeholder: 'جستجو بر اساس شناسه کاربر...' },
                  ]}
                />
              </MotionWrapper>

              {/* Table */}
              {allWalletsLoading ? (
                <PendingApi />
              ) : allWalletsError ? (
                <MotionWrapper preset="fadeUp" duration={0.5}>
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Inbox className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">خطا در دریافت اطلاعات</p>
                  </div>
                </MotionWrapper>
              ) : (
                <MotionWrapper preset="fadeUp" delay={0.4} duration={0.6}>
                  <DynamicTable
                    data={allWalletsData?.wallet || []}
                    columns={columns}
                    totalRows={allWalletsData?.pagination?.total || 0}
                    isLoading={allWalletsFetching}
                    onBulkDelete={() => { }}
                    nextPage={allWalletsData?.pagination?.nextPage}
                    prevPage={allWalletsData?.pagination?.prevPage}
                  />
                </MotionWrapper>
              )}
            </div>
          </MotionWrapper>
        )}
      </AnimatePresence>

      {/* Dialog View Wallet */}
      <DialogView
        open={modalMode === 'view'}
        title="جزئیات کیف پول"
        desc={selectedWallet?.isPlatform ? 'کیف پول پلتفرم' : 'کیف پول فروشنده'}
        setOpen={() => setModalMode(null)}
        options={selectedWallet ? buildWalletDialogOptions(selectedWallet) : []}
      />
    </div>
  );
}