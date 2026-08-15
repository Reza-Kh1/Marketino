"use client"
import MotionWrapper from '@/components/motion/MotionWrapper'
import { Button } from '@/components/ui/button'
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import SelectCustom from '../inputs/SelectCustom'
import AutocompleteCustom from '../inputs/AutoCompleteCustom'
import InputForm from '../inputs/InputForm'
import CustomButton from '../CustomButton'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, DollarSign, Search, X } from 'lucide-react'

type SearchBoxType = {
    placeHolder?: string
    selects?: {
        label: string,
        placeHolder: string,
        setValue: string,
        value?: string,
        children: { name: string, id: string | null }[]
    }[]
    autocomplete?: {
        label: string,
        placeholder: string,
        setValue: string,
        value?: string,
        multiple?: boolean
        emptyText?: string
        className?: string
        options: { name: string, id: string }[]
    }[]
    isOrder?: boolean
    inputs?: { name: string, placeholder: string, label: string, type?: string }[]
    isPrice?: boolean
}

export default function SearchBox({
    placeHolder,
    inputs,
    selects,
    isOrder = true,
    autocomplete,
    isPrice = false
}: SearchBoxType) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const defaultValues = useMemo(() => {
        const params: Record<string, any> = {
            search: searchParams.get('search') || '',
            limit: searchParams.get('limit') || '',
            order: searchParams.get('order') || 'desc',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
        };

        inputs?.forEach(input => {
            params[input.name] = searchParams.get(input.name) || '';
        });

        selects?.forEach(select => {
            params[select.setValue] = searchParams.get(select.setValue) || '';
        });

        autocomplete?.forEach(auto => {
            const rawValue = searchParams.get(auto.setValue);
            if (auto.multiple) {
                params[auto.setValue] = rawValue ? rawValue.split(',') : [];
            } else {
                params[auto.setValue] = rawValue || '';
            }
        });
        return params;
    }, [searchParams, inputs, selects, autocomplete]);

    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues
    });

    const orderValue = watch('order');
    const searchValue = watch('search');
    const minPrice = watch('minPrice');
    const maxPrice = watch('maxPrice');
    const allFormValues = watch();
    const MAX_LIMIT = 500000000;
    const minPercent = (minPrice / MAX_LIMIT) * 100;
    const maxPercent = (maxPrice / MAX_LIMIT) * 100;
    const handleSearchSubmit = (data: any) => {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'minPrice' || key === 'maxPrice') {
                const numVal = Number(value);
                if (!numVal || numVal <= 0) {
                    return;
                }
            }
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    params.set(key, value.join(','));
                }
                return;
            }
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'limit' && Number(value) <= 0) {
                    return;
                }
                params.set(key, String(value));
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchValue) {
            e.preventDefault();
            handleSubmit(handleSearchSubmit)();
        }
    };
    return (
        <MotionWrapper preset='slideUpBlur' delay={0.3}>
            <div className='custom-box'>
                <div className='flex items-center justify-between gap-4'>
                    {placeHolder && (
                        <div className='relative'>
                            <InputForm
                                name='search'
                                register={register}
                                onKeyDown={handleKeyDown}
                                placeholder={placeHolder}
                                classLabel='text-md'
                                className='w-sm placeholder:text-sm'
                            />
                            {searchValue &&
                                <MotionWrapper preset='fadeIn' duration={0.5}>
                                    <X onClick={() => { setValue('search', ''), handleSubmit(handleSearchSubmit)() }} className='cursor-pointer hover:text-white-h-dark transition-all absolute left-2 top-1/2 -translate-y-1/2 text-white-low' />
                                </MotionWrapper>
                            }
                        </div>
                    )}
                    <Button
                        onClick={() => setOpen(!open)}
                        variant="outline"
                        size="sm"
                        className="h-10 cursor-pointer border-admin-border gap-2 flex items-center select-none"
                    >
                        <span>فیلتر پیشرفته</span>
                        {open ? <ArrowUpNarrowWide className="w-4 h-4" /> : <ArrowDownWideNarrow className="w-4 h-4" />}
                    </Button>
                </div>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className='overflow-hidden w-full px-1'
                        >
                            <form
                                onSubmit={handleSubmit(handleSearchSubmit)}
                                className='border-t border-admin-border w-full mt-4 pt-4 grid grid-cols-4 gap-4'
                            >
                                {inputs && inputs.map((input, key) => (
                                    <MotionWrapper delay={0.2} duration={0.8} preset='slideUpBlur' className='' key={key}>
                                        <InputForm
                                            key={key}
                                            label={input.label}
                                            name={input.name}
                                            type={input.type as any || 'text'}
                                            register={register}
                                            placeholder={input.placeholder}
                                            classLabel='text-sm'
                                            className='placeholder:text-sm'
                                        />
                                    </MotionWrapper>
                                ))}
                                {selects && selects.map((select, key) => (
                                    <MotionWrapper delay={0.2} duration={0.8} preset='slideUpBlur' key={key}>
                                        <SelectCustom
                                            label={select.label}
                                            placeHolder={select.placeHolder}
                                            setValue={(val: string) => setValue(select.setValue, val)}
                                            value={allFormValues[select.setValue] || ''}
                                            children={select.children}
                                        />
                                    </MotionWrapper>
                                ))}
                                {autocomplete && autocomplete.map((autocomplete, key) => (
                                    <MotionWrapper delay={0.2} duration={0.8} preset='slideUpBlur' key={key}>
                                        <AutocompleteCustom
                                            options={autocomplete.options}
                                            onChange={(val: string) => setValue(autocomplete.setValue, val)}
                                            label={autocomplete.label}
                                            value={allFormValues[autocomplete.setValue] || (autocomplete.multiple ? [] : '')}
                                            placeholder={autocomplete.placeholder}
                                            multiple={autocomplete.multiple}
                                            emptyText={autocomplete.emptyText}
                                            className={autocomplete.className}
                                        />
                                    </MotionWrapper>
                                ))}
                                <MotionWrapper delay={0.2} duration={0.8} preset='slideUpBlur' className=''>
                                    <InputForm
                                        classLabel='text-sm'
                                        className='placeholder:text-xs'
                                        label='تعداد نمایش در جدول'
                                        name='limit'
                                        type='number'
                                        min={1}
                                        max={50}
                                        register={register}
                                        placeholder='به صورت پیش فرض 10 است'
                                        classDiv=''
                                    />
                                </MotionWrapper>
                                {isOrder && (
                                    <MotionWrapper delay={0.2} duration={0.8} preset='slideUpBlur'>
                                        <SelectCustom
                                            label='مرتب سازی'
                                            placeHolder='جدید ترین'
                                            setValue={(val: string) => setValue('order', val)}
                                            value={orderValue}
                                            children={[
                                                { name: 'قدیمی ترین', id: 'asc' },
                                                { name: 'جدید ترین', id: 'desc' },
                                            ]}
                                        />
                                    </MotionWrapper>
                                )}
                                {isPrice &&
                                    <MotionWrapper delay={0.2} duration={0.8} preset='slideUpBlur' className='col-span-2'>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <InputForm
                                                name="up-price"
                                                label="از قیمت"
                                                max={MAX_LIMIT}
                                                value={minPrice.toLocaleString('en-US')}
                                                iconEnd={<DollarSign />}
                                                onChange={({ target }) => {
                                                    let value = target.value.replace(/[^0-9]/g, '');
                                                    if (value !== '') {
                                                        const num = Number(value);
                                                        setValue('minPrice', num === 0 ? 0 : num);
                                                    } else {
                                                        setValue('minPrice', 0);
                                                    }
                                                }}
                                            />
                                            <InputForm
                                                name="up-price"
                                                label="تا قیمت"
                                                max={MAX_LIMIT}
                                                value={maxPrice.toLocaleString('en-US')}
                                                iconEnd={<DollarSign />}
                                                onChange={({ target }) => {
                                                    let value = target.value.replace(/[^0-9]/g, '');
                                                    if (value !== '') {
                                                        const num = Number(value);
                                                        setValue('maxPrice', num === 0 ? 0 : num);
                                                    } else {
                                                        setValue('maxPrice', 0);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="relative w-full pt-4 pb-2">
                                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-slate-800 rounded-lg"></div>
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 h-2 bg-linear-to-r from-cyan-700 to-blue-800 rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                                                style={{
                                                    insetInlineStart: `${minPercent}%`,
                                                    insetInlineEnd: `${100 - maxPercent}%`,
                                                }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max={MAX_LIMIT}
                                                value={minPrice}
                                                onChange={(e) => {
                                                    const value = Math.min(Number(e.target.value), maxPrice - 100);
                                                    setValue('minPrice', Math.max(0, value));
                                                }}
                                                className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#06b6d4] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max={MAX_LIMIT}
                                                value={maxPrice}
                                                onChange={(e) => {
                                                    const value = Math.max(Number(e.target.value), minPrice + 100);
                                                    setValue('maxPrice', Math.min(MAX_LIMIT, value));
                                                }}
                                                className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#3b82f6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                                            />
                                        </div>
                                    </MotionWrapper>
                                }
                                <div className='w-full mt-2 col-span-4'>
                                    <MotionWrapper delay={0.5} preset='scale' className=''>
                                        <CustomButton
                                            type="submit"
                                            color='white'
                                            name='جستجو'
                                            iconEnd={<Search />}
                                        />
                                    </MotionWrapper>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MotionWrapper>
    )
}