'use client'
import { useStore } from '@/hooks/store.hook';
import { Link, usePathname } from '@/i18n/navigation';
import { ArrowRight, Edit3, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import StorForm from './StoreForm';

export default function page() {
    const params = useParams()
    if (params?.slug === 'create-new-store') {
        return (
            <StorForm />
        )
    }
    const { isFetching, isError, data } = useStore((params?.slug)?.toString() || '')
    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
    if (isError || !data) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">{isError || 'فروشگاه یافت نشد'}</p>
                <Link href="/admin/store" className="text-primary hover:underline mt-4 inline-block">
                    بازگشت به لیست فروشندگان
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/store"
                    className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <Edit3 className="w-7 h-7 text-primary" />
                        فروشگاه
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{data.name}</p>
                </div>
            </div>
            <StorForm store={data} />
        </div>
    )
}
