'use client';

import { useMemo, useState } from 'react';
import {
  MapPin,
  Package,
  Truck,
  CreditCard,
  CalendarDays,
  Hash,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  CircleDot,
  XCircle,
  RotateCcw,
  Eye,
  Store,
  Phone,
  Copy,
  Check,
  ReceiptText,
  Percent,
  TrendingUp,
  Receipt,
  User,
  Building2,
  Coins,
  Ticket,
  Info,
  StickyNote,
  BadgePercent,
  Undo2,
  Headset,
  Download,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import DialogView from '@/components/DialogView';
import { Button } from '@/components/ui/button';
import { CheckoutsType, OrderItemType } from '@/services/order.service';
import { useRouter } from '@/i18n/navigation';
import CustomButton from '@/components/CustomButton';

type Props = {
  data: CheckoutsType;
  isAdmin?: boolean;
};

const formatPrice = (value: string | number) => {
  return Number(value || 0).toLocaleString('fa-IR');
};

const formatDate = (date?: string | null) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

const formatDateOnly = (date?: string | null) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
  }).format(new Date(date));
};

const getOrderStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'در انتظار پردازش',
        icon: Clock3,
        className:
          'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'processing':
      return {
        label: 'در حال آماده‌سازی',
        icon: Package,
        className:
          'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      };
    case 'shipped':
      return {
        label: 'تحویل به پست',
        icon: Truck,
        className:
          'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      };
    case 'delivered':
      return {
        label: 'تحویل داده شده',
        icon: CheckCircle2,
        className:
          'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      };
    case 'cancelled':
      return {
        label: 'لغو شده',
        icon: XCircle,
        className:
          'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      };
    case 'returned':
      return {
        label: 'مرجوع شده',
        icon: RotateCcw,
        className:
          'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      };
    default:
      return {
        label: 'نامشخص',
        icon: CircleDot,
        className: 'bg-muted text-muted-foreground border-border',
      };
  }
};

const getPaymentStatus = (status: string) => {
  switch (status) {
    case 'paid':
      return {
        label: 'پرداخت شده',
        className:
          'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20',
      };
    case 'pending':
      return {
        label: 'در انتظار پرداخت',
        className:
          'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      };
    case 'failed':
      return {
        label: 'پرداخت ناموفق',
        className:
          'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
      };
    default:
      return {
        label: 'نامشخص',
        className: 'text-muted-foreground bg-muted border-border',
      };
  }
};

const formatCheckoutNumber = (value: string | number) => {
  return String(value)
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1-');
};

export default function OrderDetailsPage({ data, isAdmin = false }: Props) {
  const [selectedItem, setSelectedItem] = useState<OrderItemType | null>(null);
  const [fullInfoOrder, setFullInfoOrder] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const paymentStatus = getPaymentStatus(data.paymentStatus);

  const totalProducts = useMemo(() => {
    return data.orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
  }, [data.orders]);

  const totalShipping = useMemo(() => {
    return data.orders.reduce(
      (sum, order) => sum + Number(order.shippingCost || 0),
      0,
    );
  }, [data.orders]);

  const copyOrderNumber = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // intentionally ignored
    }
  };

  return (
    <div dir="rtl" className="w-full space-y-4 pb-10 sm:space-y-5">
      <div className='text-left'>
        <CustomButton
          name='بازگشت'
          color='white'
          iconEnd={<Undo2 />}
          onClick={() => router.back()}
        />
      </div>
      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-xl sm:p-5">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Right: Title + meta */}
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span>جزئیات سفارش</span>
              {isAdmin && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                  نمای ادمین
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-lg font-black tracking-tight sm:text-xl lg:text-2xl">
                سفارش شما
              </h1>

              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-[11px]',
                  getOrderStatus(data.status).className,
                )}
              >
                {(() => {
                  const Icon = getOrderStatus(data.status).icon;
                  return <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
                })()}
                {getOrderStatus(data.status).label}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <span className="flex min-w-0 items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 shrink-0" />
                <span className="shrink-0">شماره سفارش:</span>
                <strong className="truncate font-mono text-foreground text-[11px] sm:text-xs">
                  {formatCheckoutNumber(data.checkoutNumber)}
                </strong>
                <button
                  type="button"
                  onClick={() => copyOrderNumber(data.checkoutNumber)}
                  className="mr-1 shrink-0 rounded-md p-1 transition hover:bg-muted active:scale-95"
                  title="کپی شماره سفارش"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{formatDate(data.createdAt)}</span>
              </span>
            </div>
          </div>

          {/* Left: Amounts (2 cols on mobile) */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="text-[10px] text-muted-foreground">
                مبلغ پرداختی
              </div>
              <div className="mt-1 text-sm font-black sm:text-lg">
                {formatPrice(data.totalAmount)}
                <span className="mr-1 text-[10px] font-normal text-muted-foreground">
                  تومان
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="text-[10px] text-muted-foreground">
                تعداد کالا
              </div>
              <div className="mt-1 text-sm font-black sm:text-lg">
                {totalProducts.toLocaleString('fa-IR')}
                <span className="mr-1 text-[10px] font-normal text-muted-foreground">
                  کالا
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ADMIN FINANCIAL SUMMARY ================= */}
      {isAdmin && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-transparent to-violet-500/5 p-4 backdrop-blur-xl sm:p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Coins className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold">خلاصه مالی (ادمین)</h2>
                <p className="text-[10px] text-muted-foreground">
                  اطلاعات مالی محرمانه سفارش
                </p>
              </div>
            </div>

            {/* 2 cols on mobile, 3 on sm, 5 on lg */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
              <AdminStatCard
                label="کمیسیون کل"
                value={`${formatPrice(data.commissionAmount)} تومان`}
                icon={<Percent className="h-3.5 w-3.5" />}
                tone="violet"
              />
              <AdminStatCard
                label="سود فروش"
                value={`${formatPrice(data.salesProfit)} تومان`}
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                tone="green"
              />
              <AdminStatCard
                label="مالیات"
                value={`${formatPrice(data.taxAmount)} تومان`}
                icon={<Receipt className="h-3.5 w-3.5" />}
                tone="amber"
              />
              <AdminStatCard
                label="تخفیف"
                value={
                  Number(data.discountAmount) > 0
                    ? `${formatPrice(data.discountAmount)} تومان`
                    : 'بدون تخفیف'
                }
                icon={<Ticket className="h-3.5 w-3.5" />}
                tone="blue"
              />
              <AdminStatCard
                label="هزینه ارسال کل"
                value={
                  totalShipping === 0
                    ? 'رایگان'
                    : `${formatPrice(totalShipping)} تومان`
                }
                icon={<Truck className="h-3.5 w-3.5" />}
                tone="primary"
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Address */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold">آدرس تحویل</h2>
              <p className="text-[10px] text-muted-foreground">
                مقصد سفارش شما
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold">{data.shippingName}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span dir="ltr" className="font-mono">
                {data.shippingPhone}
              </span>
            </div>

            <p className="leading-6 text-muted-foreground whitespace-pre-line wrap-break-word">
              {data.shippingAddress}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-muted px-2 py-1 text-[11px]">
                {data.shippingProvince}
              </span>
              <span className="rounded-lg bg-muted px-2 py-1 text-[11px]">
                {data.shippingCity}
              </span>
              <span className="rounded-lg bg-muted px-2 py-1 font-mono text-[11px]">
                {data.shippingPostal}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold">پرداخت</h2>
              <p className="text-[10px] text-muted-foreground">
                وضعیت پرداخت سفارش
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold',
                paymentStatus.className,
              )}
            >
              {paymentStatus.label}
            </span>

            {data.paymentRef && (
              <div className="text-xs text-muted-foreground break-all">
                کد پیگیری پرداخت:
                <span className="mr-1 font-mono text-foreground">
                  {data.paymentRef}
                </span>
              </div>
            )}

            {isAdmin && data.paymentMethod && (
              <div className="text-xs text-muted-foreground">
                روش پرداخت:
                <span className="mr-1 text-foreground">
                  {data.paymentMethod}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border/50 pt-3">
              <span className="text-xs text-muted-foreground">
                مبلغ نهایی
              </span>
              <span className="text-sm font-black sm:text-base">
                {formatPrice(data.totalAmount)}
                <span className="mr-1 text-[10px] font-normal text-muted-foreground">
                  تومان
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick summary */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl sm:p-5 md:col-span-2 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <ReceiptText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold">خلاصه سفارش</h2>
              <p className="text-[10px] text-muted-foreground">
                اطلاعات کلی خرید
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">تعداد فروشگاه</span>
              <span className="font-bold">
                {data.orders.length.toLocaleString('fa-IR')}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">هزینه ارسال</span>
              <span className="font-bold">
                {totalShipping === 0
                  ? 'رایگان'
                  : `${formatPrice(totalShipping)} تومان`}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">تخفیف</span>
              <span className="font-bold text-green-500">
                {Number(data.discountAmount) > 0
                  ? `${formatPrice(data.discountAmount)}- تومان`
                  : 'بدون تخفیف'}
              </span>
            </div>

            {isAdmin && (
              <>
                <div className="flex justify-between gap-2 border-t border-border/40 pt-3">
                  <span className="text-muted-foreground">مالیات</span>
                  <span className="font-bold text-amber-500">
                    {formatPrice(data.taxAmount)} تومان
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">وضعیت تخفیف</span>
                  <span className="font-bold break-all text-left">
                    {data.discountStatus || 'ندارد'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= STORES ================= */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <h2 className="text-base font-black sm:text-lg">
              فروشگاه‌ها و کالاهای سفارش
            </h2>
            <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
              هر فروشگاه سفارش و وضعیت ارسال مستقل خود را دارد.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full border border-border bg-muted/40 px-3 py-1 text-[10px] text-muted-foreground sm:block">
            {data.orders.length.toLocaleString('fa-IR')} فروشگاه
          </span>
        </div>

        {data.orders.map((order) => {
          const status = getOrderStatus(order.status);
          const StatusIcon = status.icon;
          const hasOrderDiscount = Number(order.discountAmount) > 0;

          return (
            <div
              key={order.id}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition group-hover:bg-primary/10" />

              {/* Store Header */}
              <div className="relative flex flex-col gap-3 border-b border-border/50 p-3 sm:gap-4 sm:p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary sm:h-11 sm:w-11">
                    <Store className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="truncate text-sm font-black sm:text-base">
                        {order.storeName}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        {order.storeNameEn}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Hash className="h-3 w-3 shrink-0" />
                      <span className="shrink-0">سفارش فروشگاه:</span>
                      <span className="truncate font-mono text-foreground">
                        {formatCheckoutNumber(order.orderNumber)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold',
                      status.className,
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>

                  {order.trackingCode && (
                    <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px]">
                      کد رهگیری:
                      <strong className="mr-1 font-mono">
                        {order.trackingCode}
                      </strong>
                    </span>
                  )}

                  {/* ✅ Admin full info - full width on mobile */}
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFullInfoOrder(order)}
                      className="h-7 w-full gap-1.5 rounded-full border-primary/30 bg-primary/5 px-3 text-[10px] text-primary hover:bg-primary/10 sm:w-auto"
                    >
                      <Info className="h-3.5 w-3.5" />
                      اطلاعات کامل
                    </Button>
                  )}
                </div>
              </div>

              {/* Shipping */}
              <div className="border-b border-border/50 bg-muted/20 px-3 py-3 sm:px-5">
                <div className="flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Truck className="h-4 w-4 shrink-0 text-primary" />
                    <span className="shrink-0 text-muted-foreground">
                      روش ارسال:
                    </span>
                    <strong className="truncate">{order.shippingName}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">هزینه ارسال:</span>
                    <strong>
                      {Number(order.shippingCost) === 0
                        ? 'رایگان'
                        : `${formatPrice(order.shippingCost)} تومان`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="divide-y divide-border/40">
                {order.items.map((item) => (
                  <div
                    key={item.sku}
                    className="flex gap-3 p-3 sm:p-5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 sm:h-16 sm:w-16">
                      <Package className="h-5 w-5 text-muted-foreground/60 sm:h-6 sm:w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="line-clamp-2 text-xs font-bold leading-5 sm:text-sm sm:leading-6">
                            {item.name}
                          </h4>
                          <div className="mt-1 flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="shrink-0">SKU:</span>
                            <span className="truncate font-mono">
                              {item.sku}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-xs font-black sm:text-sm">
                            {formatPrice(item.total)}
                            <span className="mr-1 text-[9px] font-normal text-muted-foreground">
                              تومان
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {formatPrice(item.price)} ×{' '}
                            {item.quantity.toLocaleString('fa-IR')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {item.colorName && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2 py-1 text-[10px]">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full border border-border"
                              style={{
                                backgroundColor: item.colorHex || '#999',
                              }}
                            />
                            {item.colorName}
                          </span>
                        )}

                        <span className="rounded-lg border border-border bg-background/50 px-2 py-1 text-[10px]">
                          تعداد: {item.quantity.toLocaleString('fa-IR')}
                        </span>

                        {item.returnedQty > 0 && (
                          <span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[10px] text-orange-500">
                            مرجوع شده:{' '}
                            {item.returnedQty.toLocaleString('fa-IR')}
                          </span>
                        )}

                        {item.attributes?.length ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                            className="h-7 gap-1 rounded-lg px-2 text-[10px]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            مشخصات کالا
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order note */}
              {order.note && (
                <div className="border-t border-border/50 bg-amber-500/5 px-3 py-3 sm:px-5">
                  <div className="flex items-start gap-2 text-xs">
                    <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <span className="text-muted-foreground">یادداشت: </span>
                      <span className="whitespace-pre-line wrap-break-word text-foreground">
                        {order.note}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Store Footer */}
              <div className="flex flex-col gap-3 border-t border-border/50 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="text-[11px] text-muted-foreground sm:text-xs">
                  {order.items.length.toLocaleString('fa-IR')} نوع کالا
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  {/* Order discount */}
                  {hasOrderDiscount && (
                    <div className="flex items-center justify-between gap-2 text-xs sm:justify-start">
                      <span className="flex items-center gap-1.5">
                        <BadgePercent className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-muted-foreground">تخفیف:</span>
                      </span>
                      <strong className="text-green-500">
                        {formatPrice(order.discountAmount)}- تومان
                      </strong>
                    </div>
                  )}

                  {/* Admin only */}
                  {isAdmin && (
                    <>
                      <div className="flex items-center justify-between gap-2 text-xs sm:justify-start">
                        <span className="text-muted-foreground">کمیسیون:</span>
                        <strong className="text-violet-500">
                          {formatPrice(order.commissionAmount)} تومان
                        </strong>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs sm:justify-start">
                        <span className="text-muted-foreground">مالیات:</span>
                        <strong className="text-violet-500">
                          {formatPrice(order.taxAmount)} تومان
                        </strong>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs sm:justify-start">
                        <span className="text-muted-foreground">واریزی:</span>
                        <strong className="text-violet-500">
                          {formatPrice(Number(order.totalPrice) - Number(order.taxAmount) - Number(order.commissionAmount))} تومان
                        </strong>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs sm:justify-start">
                        <span className="text-muted-foreground">
                          قیمت محصولات :
                        </span>
                        <strong>{formatPrice(order.subtotal)}</strong>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2 sm:justify-start sm:border-0 sm:pt-0">
                    <span className="text-xs text-muted-foreground">
                      مبلغ کل فروشگاه:
                    </span>
                    <strong className="text-sm">
                      {formatPrice(order.totalPrice)}
                      <span className="mr-1 text-[9px] font-normal text-muted-foreground">
                        تومان
                      </span>
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FINAL SUMMARY ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">مبلغ نهایی سفارش</p>
            <p className="mt-1 text-lg font-black sm:text-xl">
              {formatPrice(data.totalAmount)}
              <span className="mr-1 text-xs font-normal text-muted-foreground">
                تومان
              </span>
            </p>
          </div>

          <div className="text-right sm:text-left">
            <p className="text-[10px] text-muted-foreground">
              شماره پیگیری سفارش
            </p>
            <p className="mt-1 font-mono text-xs font-bold sm:text-sm">
              {formatCheckoutNumber(data.checkoutNumber)}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="relative mt-4 grid grid-cols-1 gap-3 border-t border-primary/10 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">شناسه سفارش</p>
              <p className="mt-1 break-all font-mono text-[10px] text-foreground">
                {data.id}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">شناسه کاربر</p>
              <p className="mt-1 break-all font-mono text-[10px] text-foreground">
                {data.userId}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">شناسه آدرس</p>
              <p className="mt-1 break-all font-mono text-[10px] text-foreground">
                {data.addressId}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">شناسه تخفیف</p>
              <p className="mt-1 break-all font-mono text-[10px] text-foreground">
                {data.discountId || 'ندارد'}
              </p>
            </div>
          </div>
        )}
      </div>
      {
        !isAdmin &&
        <div className='flex justify-between'>
          <CustomButton
            name='دانلود فاکتور'
            color='blueRadinat'
            iconEnd={<Download />}
            onClick={() => router.back()}
          />
          <CustomButton
            name='ثبت تیکت پشتیبانی'
            color='blueRadinat'
            iconEnd={<Headset />}
            onClick={() => router.back()}
          />
          <CustomButton
            name='بازگشت'
            color='white'
            iconEnd={<Undo2 />}
            onClick={() => router.back()}
          />
        </div>
      }
      {/* ================= PRODUCT DIALOG ================= */}
      <DialogView
        open={!!selectedItem}
        title="مشخصات کالا"
        setOpen={() => setSelectedItem(null)}
        options={[
          {
            head: 'اطلاعات محصول',
            detail: [
              { name: 'نام محصول', value: selectedItem?.name || '-' },
              { name: 'نام انگلیسی', value: selectedItem?.nameEn || '-' },
              { name: 'SKU', value: selectedItem?.sku || '-' },
              {
                name: 'تعداد',
                value: selectedItem?.quantity?.toLocaleString('fa-IR') || '-',
              },
              {
                name: 'قیمت واحد',
                value: selectedItem
                  ? `${formatPrice(selectedItem.price)} تومان`
                  : '-',
              },
              {
                name: 'مبلغ کل',
                value: selectedItem
                  ? `${formatPrice(selectedItem.total)} تومان`
                  : '-',
              },
              { name: 'رنگ', value: selectedItem?.colorName || 'بدون رنگ' },
              ...(isAdmin
                ? [
                  {
                    name: 'قیمت اصلی',
                    value: selectedItem
                      ? `${formatPrice(selectedItem.originalPrice)} تومان`
                      : '-',
                  },
                  {
                    name: 'تعداد مرجوعی',
                    value:
                      selectedItem?.returnedQty?.toLocaleString('fa-IR') ||
                      '0',
                  },
                  {
                    name: 'شناسه محصول',
                    value: (
                      <span className="break-all font-mono text-[10px]">
                        {selectedItem?.productId || '-'}
                      </span>
                    ),
                  },
                ]
                : []),
            ],
          },

          ...(selectedItem?.attributes?.length
            ? [
              {
                head: 'مشخصات فنی',
                detail: selectedItem.attributes.map((attribute) => ({
                  name: attribute.label,
                  value: attribute.value,
                })),
              },
            ]
            : []),
        ]}
      />

      {/* ================= ADMIN FULL INFO DIALOG ================= */}
      <DialogView
        open={!!fullInfoOrder}
        title={`اطلاعات کامل سفارش — ${fullInfoOrder?.storeName || ''}`}
        setOpen={() => setFullInfoOrder(null)}
        options={
          fullInfoOrder
            ? [
              {
                head: 'اطلاعات فروشگاه',
                detail: [
                  {
                    name: 'نام فروشگاه',
                    value: fullInfoOrder.storeName || '-',
                  },
                  {
                    name: 'نام انگلیسی',
                    value: fullInfoOrder.storeNameEn || '-',
                  },
                  {
                    name: 'شناسه فروشگاه',
                    value: (
                      <span className="break-all font-mono text-[10px]">
                        {fullInfoOrder.storeId || '-'}
                      </span>
                    ),
                  },
                  {
                    name: 'شناسه کاربر فروشگاه',
                    value: (
                      <span className="break-all font-mono text-[10px]">
                        {fullInfoOrder.userId || '-'}
                      </span>
                    ),
                  },
                ],
              },
              {
                head: 'اطلاعات سفارش',
                detail: [
                  {
                    name: 'شناسه سفارش',
                    value: (
                      <span className="break-all font-mono text-[10px]">
                        {fullInfoOrder.id || '-'}
                      </span>
                    ),
                  },
                  {
                    name: 'شماره سفارش',
                    value: (
                      <span className="font-mono font-bold text-primary">
                        {formatCheckoutNumber(fullInfoOrder.orderNumber)}
                      </span>
                    ),
                  },
                  {
                    name: 'شناسه Checkout والد',
                    value: (
                      <span className="break-all font-mono text-[10px]">
                        {fullInfoOrder.checkoutId || '-'}
                      </span>
                    ),
                  },
                  {
                    name: 'وضعیت',
                    value: getOrderStatus(fullInfoOrder.status).label,
                  },
                ],
              },
              {
                head: 'اطلاعات مالی',
                detail: [
                  {
                    name: 'زیرمجموع (subtotal)',
                    value: `${formatPrice(fullInfoOrder.subtotal)} تومان`,
                  },
                  {
                    name: 'هزینه ارسال',
                    value:
                      Number(fullInfoOrder.shippingCost) === 0
                        ? 'رایگان'
                        : `${formatPrice(fullInfoOrder.shippingCost)} تومان`,
                  },
                  {
                    name: 'تخفیف',
                    value:
                      Number(fullInfoOrder.discountAmount) > 0
                        ? `${formatPrice(fullInfoOrder.discountAmount)}- تومان`
                        : 'بدون تخفیف',
                  },
                  {
                    name: 'مبلغ کل',
                    value: `${formatPrice(fullInfoOrder.totalPrice)} تومان`,
                  },
                  {
                    name: 'درصد کمیسیون',
                    value: fullInfoOrder.commission
                      ? `${fullInfoOrder.commission}%`
                      : '-',
                  },
                  {
                    name: 'مبلغ کمیسیون',
                    value: `${formatPrice(
                      fullInfoOrder.commissionAmount,
                    )} تومان`,
                  },
                ],
              },
              {
                head: 'اطلاعات ارسال',
                detail: [
                  {
                    name: 'روش ارسال',
                    value: fullInfoOrder.shippingName || '-',
                  },
                  {
                    name: 'شناسه روش ارسال فروشگاه',
                    value: (
                      <span className="break-all font-mono text-[10px]">
                        {fullInfoOrder.storeShippingMethodId || '-'}
                      </span>
                    ),
                  },
                  {
                    name: 'کد رهگیری',
                    value: fullInfoOrder.trackingCode || 'ندارد',
                  },
                ],
              },
              {
                head: 'تخفیف و کدها',
                detail: [
                  {
                    name: 'شناسه کد تخفیف',
                    value: (
                      <span className="break-all font-mono text-[10px]">
                        {fullInfoOrder.discountCodeId || 'ندارد'}
                      </span>
                    ),
                  },
                ],
              },
              {
                head: 'یادداشت',
                detail: [
                  {
                    name: 'یادداشت فروشگاه',
                    value: fullInfoOrder.note || 'بدون یادداشت',
                  },
                ],
              },
              {
                head: 'تاریخ‌ها',
                detail: [
                  {
                    name: 'تاریخ ایجاد',
                    value: formatDate(fullInfoOrder.createdAt),
                  },
                  {
                    name: 'آخرین بروزرسانی',
                    value: formatDate(fullInfoOrder.updatedAt),
                  },
                  {
                    name: 'تاریخ تحویل',
                    value: formatDate(fullInfoOrder.deliveredAt),
                  },
                  {
                    name: 'تاریخ لغو',
                    value: formatDate(fullInfoOrder.cancelledAt),
                  },
                  {
                    name: 'مهلت مرجوعی',
                    value: formatDateOnly(fullInfoOrder.returnDeadline),
                  },
                ],
              },
            ]
            : []
        }
      />
    </div>
  );
}

/* ================= Admin Stat Card ================= */
function AdminStatCard({
  label,
  value,
  icon,
  tone = 'primary',
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'primary' | 'violet' | 'green' | 'amber' | 'blue';
  className?: string;
}) {
  const toneMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-background/50 p-2.5 sm:p-3',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border',
            toneMap[tone],
          )}
        >
          {icon}
        </div>
        <span className="truncate text-[10px] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 wrap-break-word text-xs font-black">{value}</div>
    </div>
  );
}