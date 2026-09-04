'use client'
import CustomButton from '@/components/CustomButton';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const SEARCH_DEBOUNCE_MS = 3000;

function useDebouncedValue<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    const [isPending, setIsPending] = useState(false);
    useEffect(() => {
        if (value === debounced) return;
        setIsPending(true);
        const t = setTimeout(() => {
            setDebounced(value);
            setIsPending(false);
        }, delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    const resetImmediately = (newValue: T) => {
        setDebounced(newValue);
        setIsPending(false);
    };
    return [debounced, isPending, resetImmediately] as const;
}

export default function SearchStore() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [valueSearch, setValueSearch] = useState<string>('');
    const [debouncedValue, isQueryPending, resetDebounced] = useDebouncedValue(valueSearch, SEARCH_DEBOUNCE_MS);
    const router = useRouter();
    const searchParams = useSearchParams();
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedValue.trim()) {
            params.set('search', debouncedValue.trim());
        } else {
            params.delete('search');
        }
        router.push(`?${params.toString()}`);
    }, [debouncedValue]);
    const handleClear = () => {
        setValueSearch('');
        resetDebounced('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        router.push(params.toString() ? `?${params.toString()}` : '?');
    };

    return (
        <div className="relative group lg:min-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-500 pointer-events-none" />
            <input ref={inputRef} type="search"
                onChange={e => { setValueSearch(e.target.value) }}
                value={valueSearch}
                placeholder="نام فروشگاه مد نظرتو بنویس ..."
                className="w-full h-13 sm:h-14 rounded-2xl border border-border/80 bg-card/95 pr-12 pl-28 text-sm shadow-md outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/15 transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                autoComplete="off"
            />
            {isQueryPending && (
                <Loader2 className="absolute left-28 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
            )}
            {valueSearch && (
                <X className="absolute left-24 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-50 cursor-pointer" onClick={handleClear} />
            )}
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <CustomButton name="جستجو" type="submit" color="blueRadinat" />
            </div>
        </div>
    );
}