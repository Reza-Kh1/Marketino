import { cn } from '@/lib/utils'
import React from 'react'
import MotionWrapper from './motion/MotionWrapper'
import { useFormStatus } from 'react-dom'
import TooltipCustom from './TooltipCustom'
import { Link } from '@/i18n/navigation'

type CustomButtonType = {
    iconEnd?: React.ReactNode
    iconStart?: React.ReactNode
    name?: string,
    className?: string
    type?: "submit" | "reset" | "button"
    colorHover?: "blue" | "orange-red" | "deep-purple" | "red"
    disabled?: boolean
    onClick?: (value: any) => void
    children?: React.ReactNode
    isPending?: boolean
    color?: "gray" | "white" | "iconDelete" | "icon" | "iconBlack"
    size?: 'sx' | 'sm' | 'sl' | 'md' | 'lg' | 'xl' | 'auto'
    form?: string
    tooltip?: string
    title?: string
    link?: string
    classDiv?: string
}
const colorBtn = {
    white: 'inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50',
    gray: 'inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-accent transition-colors',
    iconDelete: 'w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors',
    icon: 'w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg hover:text-blue-600 hover:bg-blue-800/40 dark:hover:bg-white transition-all duration-200',
    iconBlack: 'w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg text-black hover:text-blue-600 hover:bg-blue-800/40 dark:hover:bg-white transition-all duration-200',
}

export default function CustomButton({
    isPending,
    color = 'gray',
    type,
    link,
    disabled,
    iconEnd,
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
        <div className="relative w-full flex justify-evenly items-center">
            <div className='flex gap-3 relative transition-all items-center duration-100'>
                {activePending ? (
                    <>
                        {(name || children) && <span>صبر کنید</span>}
                        <div className={cn('spinner', color === 'white' && 'bg-stone-950!')}></div>
                    </>
                ) : (
                    <>
                        {iconStart && (
                            <div className="relative transition-all duration-100">
                                {iconStart}
                            </div>
                        )}
                        {(name || children) && <span>{name ? name : children}</span>}
                        {iconEnd && (
                            <div className="relative transition-all duration-100">
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