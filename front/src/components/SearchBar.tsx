import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, Camera, X, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';

export interface SearchBarProps {
  onSearch?: (query: string) => void;
  onImageUpload?: (file: File) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ onSearch, onImageUpload, placeholder = 'جستجوی محصول، برند یا دسته‌بندی...', loading, className }, ref) => {
    const [value, setValue] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { locale } = useTranslation();
    const isFa = locale === 'fa';

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) onSearch?.(value.trim());
    };

    return (
      <form onSubmit={handleSubmit} className={cn('relative w-full max-w-2xl', className)}>
        <div className="relative group">
          <Search className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            ref={ref}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 rtl:pl-12 ltr:pr-12 rtl:pr-28 ltr:pl-28 rounded-2xl bg-white dark:bg-card border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-base transition-all duration-300 shadow-sm hover:shadow-md"
          />
          <div className="absolute rtl:right-2 ltr:left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && (
              <button type="button" onClick={() => setValue('')} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {onImageUpload && (
              <>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-primary" title="جستجو با عکس">
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onImageUpload(f); }} />
              </>
            )}
            <button type="submit" disabled={!value.trim() || loading} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'جستجو'}
            </button>
          </div>
        </div>
      </form>
    );
  }
);
SearchBar.displayName = 'SearchBar';
