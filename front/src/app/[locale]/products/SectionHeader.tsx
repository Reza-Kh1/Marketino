import { Link } from '@/i18n/navigation';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'cyan' | 'violet' | 'rose' | 'amber' | 'emerald' | 'slate';

const accentMap: Record<
  Accent,
  { border: string; bg: string; text: string; link: string }
> = {
  cyan: {
    border: 'border-cyan-500/25',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-300',
    link: 'text-cyan-600 dark:text-cyan-400',
  },
  violet: {
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-300',
    link: 'text-violet-600 dark:text-violet-400',
  },
  rose: {
    border: 'border-rose-500/25',
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    link: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    link: 'text-amber-600 dark:text-amber-400',
  },
  emerald: {
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    link: 'text-emerald-600 dark:text-emerald-400',
  },
  slate: {
    border: 'border-slate-500/25',
    bg: 'bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    link: 'text-slate-600 dark:text-slate-300',
  },
};

export default function SectionHeader({
  badge,
  title,
  subtitle,
  href,
  hrefLabel = 'مشاهده همه',
  badgeIcon: BadgeIcon,
  accent = 'cyan',
  className,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  badgeIcon?: LucideIcon;
  accent?: Accent;
  className?: string;
}) {
  const a = accentMap[accent];
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6',
        className
      )}
    >
      <div className="space-y-1.5">
        {badge && (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold',
              a.border,
              a.bg,
              a.text
            )}
          >
            {BadgeIcon ? <BadgeIcon className="w-3 h-3" /> : null}
            {badge}
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-bold hover:underline shrink-0',
            a.link
          )}
        >
          {hrefLabel}
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
