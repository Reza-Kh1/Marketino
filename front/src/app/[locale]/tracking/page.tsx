'use client';
/**
 * 🆕 صفحه رهگیری سفارش
 * Buyer can track orders with tracking code
 */
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, Home, CheckCircle, Clock, MapPin, ArrowLeft, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/navigation';

interface TrackingData {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    trackingCode: string;
    shippingAddress?: string;
    shippingName?: string;
    shippingPhone?: string;
    shippingCity?: string;
    total: number;
    createdAt: string;
    deliveredAt?: string;
  };
  timeline: {
    key: string;
    label: string;
    labelEn: string;
    icon: string;
    status: 'completed' | 'current' | 'upcoming';
    date: string | null;
    location: string | null;
    description: string | null;
  }[];
}

const statusIcons: Record<string, React.ReactNode> = {
  clock: <Clock className="w-5 h-5" />,
  check: <CheckCircle className="w-5 h-5" />,
  package: <Package className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
  home: <Home className="w-5 h-5" />,
};

function formatDate(dateStr: string | null, isRTL: boolean) {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isRTL) {
      return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function formatPrice(price: number) {
  return price.toLocaleString('fa-IR');
}

export default function TrackingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isRTL = t.direction === 'rtl';

  const [searchType, setSearchType] = useState<'orderNumber' | 'trackingCode'>('orderNumber');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error(isRTL ? 'شماره سفارش را وارد کنید' : 'Please enter order number');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const data = await ordersApi.track(searchValue.trim());
      setTrackingData(data as unknown as TrackingData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isRTL ? 'سفارش یافت نشد' : 'Order not found');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> {t.common.back}
          </button>
          <h1 className="text-3xl font-black">{isRTL ? 'رهگیری سفارش' : 'Order Tracking'}</h1>
          <p className="text-muted-foreground mt-2">
            {isRTL ? 'شماره سفارش یا کد رهگیری خود را وارد کنید' : 'Enter your order number or tracking code'}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex gap-2 mb-4 bg-muted rounded-xl p-1">
            <button
              onClick={() => { setSearchType('orderNumber'); setSearchValue(''); setTrackingData(null); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${searchType === 'orderNumber' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              {isRTL ? 'شماره سفارش' : 'Order Number'}
            </button>
            <button
              onClick={() => { setSearchType('trackingCode'); setSearchValue(''); setTrackingData(null); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${searchType === 'trackingCode' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              {t.orders.tracking_code || 'Tracking Code'}
            </button>
          </div>

          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder={searchType === 'orderNumber'
                  ? (isRTL ? 'مثلاً: ORD-12345' : 'e.g. ORD-12345')
                  : (isRTL ? 'کد رهگیری را وارد کنید' : 'Enter tracking code')
                }
                className={`w-full h-12 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-base`}
              />
            </div>
            <button type="submit" disabled={loading}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? (isRTL ? 'در حال جستجو...' : 'Searching...') : (isRTL ? 'رهگیری' : 'Track')}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {trackingData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Order Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.orders.order_number}</p>
                  <p className="text-xl font-black">{trackingData.order.orderNumber}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  trackingData.order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  trackingData.order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  trackingData.order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {(t.orders as Record<string, string>)[`status_${trackingData.order.status}`] || trackingData.order.status}
                </div>
              </div>

              {trackingData.order.trackingCode && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{t.orders.tracking_code}:</span>
                  <span className="font-mono font-bold">{trackingData.order.trackingCode}</span>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-bold text-lg mb-4">{isRTL ? 'روند سفارش' : 'Order Progress'}</h3>
                <div className="relative">
                  {trackingData.timeline.map((step, index) => (
                    <div key={step.key} className="flex gap-4 pb-6 relative">
                      {/* Line */}
                      {index < trackingData.timeline.length - 1 && (
                        <div className={`absolute ${isRTL ? 'right-[19px]' : 'left-[19px]'} top-10 w-0.5 h-full ${
                          step.status === 'completed' ? 'bg-green-400' : 'bg-border'
                        }`} />
                      )}

                      {/* Icon */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        step.status === 'current' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-4 ring-blue-100 dark:ring-blue-900/20' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {statusIcons[step.icon] || <Package className="w-5 h-5" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-2">
                        <h4 className={`font-bold text-sm ${
                          step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {isRTL ? step.label : step.labelEn}
                        </h4>
                        {step.date && (
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(step.date, isRTL)}</p>
                        )}
                        {step.location && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {step.location}
                          </p>
                        )}
                        {step.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              {trackingData.order.shippingAddress && (
                <div className="p-4 bg-muted rounded-xl">
                  <h4 className="font-bold text-sm mb-2">{t.orders.shipping_info}</h4>
                  <p className="text-sm text-muted-foreground">
                    {trackingData.order.shippingName} - {trackingData.order.shippingPhone}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{trackingData.order.shippingAddress}</p>
                </div>
              )}

              {/* View Order Detail */}
              {isAuthenticated && (
                <Link href={`/orders`}
                  className="block text-center py-3 rounded-xl bg-muted hover:bg-muted/80 font-bold text-sm transition-colors">
                  {t.orders.order_detail} <ExternalLink className="inline w-4 h-4" />
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!trackingData && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {isRTL ? 'برای رهگیری، شماره سفارش خود را وارد کنید' : 'Enter your order number to track'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
