'use client';

import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Send,
  Clock,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Store } from '@/services/store.service';

interface StoreContactCardProps {
  store: Store;
  className?: string;
}

export default function StoreContactCard({ store, className }: StoreContactCardProps) {
  const rows = [
    store.address || store.city
      ? {
        icon: MapPin,
        label: 'آدرس',
        value: [store.address, store.city, store.province].filter(Boolean).join(' — '),
      }
      : null,
    store.phone
      ? {
        icon: Phone,
        label: 'تلفن',
        value: store.phone,
        href: `tel:${store.phone}`,
      }
      : null,
    store.email
      ? {
        icon: Mail,
        label: 'ایمیل',
        value: store.email,
        href: `mailto:${store.email}`,
      }
      : null,
    store.workingHours
      ? {
        icon: Clock,
        label: 'ساعات کاری',
        value: store.workingHours,
      }
      : null,
    store.businessType
      ? {
        icon: Building2,
        label: 'نوع کسب‌وکار',
        value: store.businessType === "company" ? 'حقوقی' : 'حقیقی',
      }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
  }>;

  return (
    <aside
      className={cn(
        'rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4',
        className
      )}
    >
      <h2 className="text-sm font-black">اطلاعات تماس و آدرس</h2>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <row.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-medium text-muted-foreground">{row.label}</div>
              {row.href ? (
                <a
                  href={row.href}
                  className="block truncate text-xs font-semibold text-foreground hover:text-cyan-600 dark:hover:text-cyan-400"
                  dir={row.label === 'ایمیل' ? 'ltr' : undefined}
                >
                  {row.value}
                </a>
              ) : (
                <p className="text-xs font-semibold leading-relaxed text-foreground">{row.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {(store.instagram || store.telegram) && (
        <div className="border-t border-border/60 pt-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            شبکه‌های اجتماعی
          </div>
          <div className="flex flex-wrap gap-2">
            {store.instagram && (
              <a
                href={`https://instagram.com/${store.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[11px] font-semibold transition-colors hover:border-pink-500/40 hover:bg-pink-500/5 hover:text-pink-600"
              >
                <Instagram className="size-3.5" />
                @{store.instagram}
                <ExternalLink className="size-3 opacity-50" />
              </a>
            )}
            {store.telegram && (
              <a
                href={`https://t.me/${store.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[11px] font-semibold transition-colors hover:border-sky-500/40 hover:bg-sky-500/5 hover:text-sky-600"
              >
                <Send className="size-3.5" />
                @{store.telegram}
                <ExternalLink className="size-3 opacity-50" />
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
