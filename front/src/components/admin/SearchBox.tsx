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
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search, X } from 'lucide-react'

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
    isCity?: boolean
    inputs?: { name: string, placeholder: string, label: string, type?: string }[]
}

export default function SearchBox({
    placeHolder,
    inputs,
    selects,
    isCity = false,
    autocomplete
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
    const allFormValues = watch();
    const handleSearchSubmit = (data: any) => {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
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