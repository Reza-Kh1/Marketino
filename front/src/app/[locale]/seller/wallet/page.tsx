'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Banknote,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import BankAccountsManager from './BankAccount';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { useCreateMyWallet, useMyWallet } from '@/hooks/wallet.hook';
import LoadingPage from '@/components/LoadingPage';
import CustomButton from '@/components/CustomButton';
export default function WalletManager() {
  const { data: walletData, isLoading: loadingWallet, refetch } = useMyWallet()
  const [showBankAccounts, setShowBankAccounts] = useState(false);
  const { mutate: createWallet, isPending } = useCreateMyWallet()
  return (
    <div className="space-y-8 p-1 sm:p-4 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Wallet className="w-7 h-7 text-cyan-500" />
            کیف پول من
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مدیریت دارایی‌ها، مشاهده موجودی و حساب‌های بانکی
          </p>
        </div>
        <CustomButton
          color='white'
          onClick={() => refetch && refetch()}
          isPending={loadingWallet}
          name='بروزرسانی'
          iconStart={<RefreshCw className={cn('w-4 h-4', loadingWallet && 'animate-spin')} />}
        />
      </div>
      {/* ===== WALLET CARD ===== */}
      {loadingWallet || isPending ? <LoadingPage /> :
        walletData?.id ?
          <MotionWrapper preset='slideUpBlur'
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl border border-indigo-500/30 group"
          >
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
            <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col justify-between h-full min-h-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full w-fit backdrop-blur-md">
                    <DollarSign className="w-3.5 h-3.5" />
                    کیف پول
                  </div>
                  <div className="text-3xl sm:text-5xl font-black mt-4 tracking-tight flex items-baseline gap-2 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {walletData?.balance.toLocaleString()}
                    <span className="text-sm font-normal text-slate-400">تومان</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      قابل برداشت:
                      <span className="text-emerald-400 font-bold">
                        {walletData?.balance.toLocaleString()} تومان
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                      در انتظار تسویه:
                      <span className="text-amber-400 font-bold">
                        {walletData?.pendingBalance.toLocaleString()} تومان
                      </span>
                      <span className="text-[10px] text-slate-500">(پس از پایان مهلت مرجوعی)</span>
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                      مسدود شده:
                      <span className="text-rose-400 font-bold">
                        {walletData?.frozenBalance.toLocaleString()} تومان
                      </span>
                    </p>
                    {Number(walletData?.withdrawBalance) > 0 && (
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                        در حال برداشت:
                        <span className="text-blue-400 font-bold">
                          {walletData?.withdrawBalance.toLocaleString()} تومان
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-slate-400">
                      وضعیت حساب بانکی:
                      {walletData?.bankAccountId ? (
                        <span className="text-emerald-400 font-bold mr-1">
                          متصل ✓
                        </span>
                      ) : (
                        <>
                          <span className="text-red-400 font-bold mr-1">
                            متصل نیست ✗
                          </span>
                          <span className="block text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            برای فعال‌سازی برداشت وجه، لطفاً حساب بانکی خود را ثبت و به‌عنوان حساب پیش‌فرض انتخاب کنید.
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-9 rounded-lg bg-linear-to-tr from-amber-300 via-yellow-500 to-amber-600 p-1 flex items-center justify-center shadow-md">
                  <div className="w-full h-full border border-amber-900/30 rounded flex flex-col justify-between p-0.5">
                    <div className="h-1 bg-amber-900/20 rounded-full w-1/2" />
                    <div className="h-1 bg-amber-900/20 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowBankAccounts(!showBankAccounts)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium text-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                >
                  {showBankAccounts ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      مخفی کردن حساب‌های بانکی
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      مدیریت حساب‌های بانکی
                    </>
                  )}
                </button>
              </div>
            </div>
          </MotionWrapper>
          :
          <CustomButton
            color='white'
            onClick={createWallet}
            isPending={isPending}
            name='ساخت کیف پول'
            iconStart={<Wallet />}
          />
      }
      {showBankAccounts && walletData?.id && (
        <MotionWrapper preset='slideUpBlur' className="overflow-hidden">
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <BankAccountsManager walletId={walletData?.id} />
          </div>
        </MotionWrapper>
      )}
    </div>
  );
}