'use client'
import { cn } from '@/lib/utils'
import React from 'react'
import MotionWrapper from './motion/MotionWrapper'
import { useFormStatus } from 'react-dom'
import TooltipCustom from './TooltipCustom'
import { Link } from '@/i18n/navigation'

type CustomButtonType = {
    dataVariantId?: string
    dataQuantity?: string
    iconEnd?: React.ReactNode
    iconStart?: React.ReactNode
    name?: string
    className?: string
    type?: "submit" | "reset" | "button"
    colorHover?: "blue" | "orange-red" | "deep-purple" | "red"
    disabled?: boolean
    onClick?: (value: any) => void
    children?: React.ReactNode
    isPending?: boolean
    color?: "gray" | "white" | "iconDelete" | "icon" | "iconBlack" | "neon" | "borderNeon" | "blueLow" | "blueRadinat"
    size?: 'sx' | 'sm' | 'sl' | 'md' | 'lg' | 'xl' | 'auto'
    form?: string
    tooltip?: string
    title?: string
    link?: string
    classDiv?: string
}

/* کلاس پایه یکسان برای تمام دکمه‌های متنی جهت هماهنگی اندازه در موبایل و دسکتاپ */
const baseTextBtn = "inline-flex cursor-pointer items-center justify-center gap-2 sm:gap-2.5 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"

const colorBtn = {
    white: `${baseTextBtn} bg-primary text-primary-foreground hover:bg-primary/90`,
    gray: `${baseTextBtn} bg-muted text-muted-foreground hover:bg-accent`,
    blueLow: `${baseTextBtn} bg-white border border-slate-200 text-muted-foreground dark:border-slate-800 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900`,
    neon: `${baseTextBtn} sm:w-full cursor-pointer py-2.5 sm:py-4 px-4 sm:px-0 rounded-lg sm:rounded-2xl bg-linear-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 sm:gap-3 shadow-md shadow-cyan-500/20 sm:shadow-[0_0_15px_rgba(6,182,212,0.35)] sm:hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-95 sm:active:scale-[0.99] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0 sm:shrink`, borderNeon: `${baseTextBtn} w-full text-slate-900 dark:text-white border-2 border-cyan-500 shadow-[0_0_15px_rgba(147,51,234,0.25)] hover:shadow-[0_0_20px_rgba(147,51,234,0.45)] hover:scale-[1.01] active:scale-[0.99]`,
    blueRadinat: `${baseTextBtn} w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer`,
    iconDelete: 'w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors',
    icon: 'w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg hover:text-blue-600 hover:bg-blue-800/40 dark:hover:bg-white transition-all duration-200',
    iconBlack: 'w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg text-black hover:text-blue-600 hover:bg-blue-800/40 dark:hover:bg-white transition-all duration-200',
}

export default function CustomButton({
    isPending,
    color = 'gray',
    type,
    link,
    disabled, dataVariantId,
    iconEnd, dataQuantity,
    iconStart,
    name,
    className = '',
    onClick,
    children,
    form,
    title,
    tooltip,
    classDiv
}: CustomButtonType) {
    const { pending } = useFormStatus()
    const activePending = isPending || pending
    const buttonClassName = cn(
        colorBtn[color],
        (disabled || activePending) && 'cursor-default opacity-60 pointer-events-none',
        className
    )

    const content = (
        <div className="relative w-full flex justify-center items-center">
            <div className='flex gap-2 sm:gap-2.5 relative transition-all items-center duration-100'>
                {activePending ? (
                    <>
                        {(name || children) && <span>صبر کنید</span>}
                        <div className={cn('spinner')}></div>
                    </>
                ) : (
                    <>
                        {iconStart && (
                            <div className="relative transition-all duration-100 shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-4.5 sm:[&>svg]:h-4.5">
                                {iconStart}
                            </div>
                        )}
                        {(name || children) && <span>{name ? name : children}</span>}
                        {iconEnd && (
                            <div className="relative transition-all duration-100 shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-4.5 sm:[&>svg]:h-4.5">
                                {iconEnd}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )

    const trigger = link && !disabled && !activePending ? (
        <Link
            href={link}
            title={title}
            aria-labelledby={name}
            className={buttonClassName}
        >
            {content}
        </Link>
    ) : (
        <button
            title={title}
            form={form}
            data-variant-id={dataVariantId}
            data-quantity={dataQuantity}
            aria-labelledby={name}
            onClick={onClick}
            disabled={activePending || disabled}
            type={type || "button"}
            className={buttonClassName}
        >
            {content}
        </button>
    )

    return (
        <MotionWrapper duration={1} preset='fadeIn' className={cn(classDiv || 'inline-block')}>
            {tooltip ? <TooltipCustom placeHolder={tooltip}>{trigger}</TooltipCustom> : trigger}
        </MotionWrapper>
    )
}