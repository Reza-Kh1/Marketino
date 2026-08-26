'use client'
import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type TooltipCustomType = {
    side?: 'bottom' | 'left' | 'right' | 'top'
    children: React.ReactElement // تغییر داده شد به ReactElement
    placeHolder: React.ReactNode
}

export default function TooltipCustom({ children, placeHolder, side }: TooltipCustomType) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div>
                    {children}
                </div>
            </TooltipTrigger>
            <TooltipContent side={side}>
                {placeHolder}
            </TooltipContent>
        </Tooltip>
    )
}