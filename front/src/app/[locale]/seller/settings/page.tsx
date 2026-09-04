'use client'
import StorForm from '../../admin/store/[slug]/StoreForm';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Edit3, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/hooks/store.hook';

export default function page() {
  const { storeSlug } = useAuth()
  const { isFetching, isError, data } = useStore((storeSlug)?.toString() || '')
  if (isFetching || !storeSlug) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/seller"
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-primary" />
            فروشگاه
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{data?.name}</p>
        </div>
      </div>
      <StorForm store={data} isStore={true} />
    </div>
  )
}

