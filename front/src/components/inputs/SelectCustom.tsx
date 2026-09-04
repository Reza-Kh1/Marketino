'use client'
import MotionWrapper from '@/components/motion/MotionWrapper'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { CircleAlert } from 'lucide-react'
import React from 'react'
import { FieldError } from 'react-hook-form'
type SelectCustomType = {
    setValue: (value: any) => void
    error?: FieldError;
    value: string | undefined
    children: { name: string, id: string | null }[]
    placeHolder: string
    label?: string
    classLabel?: string
    iconValue?: React.ReactNode
    disable?: boolean
}
export default function SelectCustom({ setValue, disable, value, placeHolder, label, children, classLabel, iconValue, error }: SelectCustomType) {
    const handleValueChange = (val: string) => {
        if (!val) return; // نادیده گرفتن مقدار کاذب داخلی Radix
        setValue(val);
    };
    return (
        <div className="flex flex-col gap-2 justify-between">
            {label &&
                <label className={cn("text-sm ml-auto text-white-p-dark " + classLabel)}>
                    {label}
                </label>
            }
            <Select disabled={disable} onValueChange={handleValueChange} value={value ?? ''} >
                <SelectTrigger className={cn('w-full dark:border-accent border-accent-foreground/20  min-h-10 cursor-pointer rounded-lg bg-background', error && "border-red-500 focus:ring-red-500/20 focus:border-red-500")}>
                    <SelectValue placeholder={placeHolder} />
                    {iconValue}
                </SelectTrigger>
                <SelectContent position='popper' className='rounded-md'>
                    <SelectGroup className='p-2'>
                        <MotionWrapper staggerChildren={0.1} preset='slideRight'>
                            {children.length ? children.map((value, id) => (
                                <SelectItem key={id} value={value?.id || ''} className='cursor-pointer py-2 px-4!'>{value.name}</SelectItem>
                            )) : 'آیتمی یافت نشد'}
                        </MotionWrapper>
                    </SelectGroup>
                </SelectContent>
            </Select>
            {error && (
                <div className="flex items-center gap-1.5 mt-1 text-red-500">
                    <CircleAlert className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-medium">{error.message}</p>
                </div>
            )}
        </div>
    )
}
