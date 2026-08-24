'use client'
import { useCategories } from '@/hooks/category.hook';
import { useRouter } from '@/i18n/navigation';
import { Search } from 'lucide-react';
import React, { useState } from 'react'

export default function SearchBar() {
  const { data: categoryData } = useCategories({ parentId: 'true' })
  const route = useRouter()
  const [value, setValue] = useState('')
  const handlerSubmit = () => {
    if (!value.length) return
    route.push(`/search?q=${value}`)
  }
  return (
    <div className="mt-8 relative max-w-2xl mx-auto">
      <div className="relative flex items-center min-h-12 sm:h-14 md:h-16 rounded-2xl bg-white dark:bg-card border-2 border-border/60 shadow-lg shadow-black/[0.04] dark:shadow-black/20 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
        <Search className="absolute rtl:right-3 sm:rtl:right-4 ltr:left-3 sm:ltr:left-4 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        <input
          value={value}
          onChange={({ target }) => setValue(target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handlerSubmit() }}
          placeholder="جستجوی محصول، برند یا دسته‌بندی..."
          className="flex-1 h-full rtl:pr-9 sm:rtl:pr-12 rtl:pl-28 sm:rtl:pl-36 md:rtl:pl-40 ltr:pl-9 sm:ltr:pl-12 ltr:pr-28 sm:ltr:pr-36 md:ltr:pr-40 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground/50"
        />
        <div className="absolute rtl:left-1.5 sm:rtl:left-2.5 ltr:right-1.5 sm:ltr:right-2.5 flex items-center gap-1 sm:gap-1.5">
          <button onClick={handlerSubmit}
            className="h-8 sm:h-10 cursor-pointer px-3 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-md shadow-indigo-500/20">
            جستجو
          </button>
        </div>
      </div>
      {categoryData?.length ?
        <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
          {categoryData?.map(tag => (
            <button key={tag.id} onClick={() => route.push(`search?category-${tag.slug}`)}
              className="px-3.5 cursor-pointer py-2 rounded-full bg-muted/50 hover:bg-muted border border-border/30 hover:border-indigo-200 dark:hover:border-indigo-600 hover:text-indigo-400 text-xs font-medium transition-all">
              {tag.name}
            </button>
          ))}
        </div>
        : null}
    </div>
  )
}
