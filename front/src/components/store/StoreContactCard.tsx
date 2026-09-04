import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Send,
  Clock,
  Building2,
  ExternalLink,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Store } from '@/services/store.service';
import { Link } from '@/i18n/navigation';

interface StoreContactCardProps {
  store: Store & { website?: string; whatsapp?: string };
  className?: string;
}

export default function StoreContactCard({ store, className }: StoreContactCardProps) {
  const addressParts = [store.province?.name, store.city?.name, store.address].filter(Boolean);

  const rows = [
    addressParts.length > 0
      ? {
        icon: MapPin,
        label: 'آدرس فروشگاه',
        value: addressParts.join('، '),
      }
      : null,
    store.phone
      ? {
        icon: Phone,
        label: 'تلفن تماس',
        value: store.phone,
        href: `tel:${store.phone}`,
      }
      : null,
    store.email
      ? {
        icon: Mail,
        label: 'پست الکترونیک',
        value: store.email,
        href: `mailto:${store.email}`,
        isLtr: true,
      }
      : null,
    store.website
      ? {
        icon: Globe,
        label: 'وب‌سایت رسمی',
        value: store.website.replace(/^https?:\/\//, ''),
        href: store.website.startsWith('http') ? store.website : `https://${store.website}`,
        isLtr: true,
      }
      : null,
    store.workingHours
      ? {
        icon: Clock,
        label: 'ساعات پاسخ‌گویی',
        value: store.workingHours,
      }
      : null,
    store.businessType
      ? {
        icon: Building2,
        label: 'نوع فروشگاه',
        value: store.businessType === 'company' ? 'شرکت / حقوقی' : 'شخصی / حقیقی',
      }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
    isLtr?: boolean;
  }>;

  const hasSocials = Boolean(store.instagram || store.telegram || store.whatsapp);

  return (
    <aside
      className={cn(
        'rounded-3xl border border-border/70 bg-card p-5 shadow-xs space-y-5',
        className
      )}
    >
      <h3 className="text-sm font-black border-b border-border/50 pb-3">اطلاعات ارتباطی</h3>

      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <row.icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-medium text-muted-foreground">{row.label}</div>
              {row.href ? (
                <Link
                  href={row.href}
                  target={row.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={cn(
                    'block truncate text-xs font-bold text-foreground transition-colors hover:text-cyan-600 dark:hover:text-cyan-400',
                    row.isLtr && 'text-left'
                  )}
                  dir={row.isLtr ? 'ltr' : undefined}
                >
                  {row.value}
                </Link>
              ) : (
                <p className="text-xs font-semibold leading-relaxed text-foreground">{row.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasSocials && (
        <div className="border-t border-border/60 pt-4 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            شبکه‌های اجتماعی
          </div>
          <div className="flex flex-wrap gap-2">
            {store.instagram && <Link href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] font-bold transition-all hover:border-pink-500/40 hover:bg-pink-500/5">
              <Instagram className="size-3.5 text-pink-500" /><span>اینستاگرام</span>
            </Link>}
            {store.telegram && <Link href={`https://t.me/${store.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] font-bold transition-all hover:border-sky-500/40 hover:bg-sky-500/5">
              <Send className="size-3.5 text-sky-500" /><span>تلگرام</span>
            </Link>}
            {store.whatsApp && <Link href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] font-bold transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5">
              <MessageCircle className="size-3.5 text-emerald-500" /><span>واتساپ</span>
            </Link>}
            {store.bale && <Link href={`https://bale.ai/${store.bale.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] font-bold transition-all hover:border-blue-500/40 hover:bg-blue-500/5">
              <MessageCircle className="size-3.5 text-blue-500" /><span>بله</span>
            </Link>}
            {store.robika && <Link href={`https://robika.ir/${store.robika.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] font-bold transition-all hover:border-purple-500/40 hover:bg-purple-500/5">
              <MessageCircle className="size-3.5 text-purple-500" /><span>روبیکا</span>
            </Link>}
          </div>
        </div>
      )}
    </aside>
  );
}