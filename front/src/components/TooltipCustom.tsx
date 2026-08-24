'use client'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import React from 'react'
type TooltipCustomType = {
    side?: 'bottom' | 'left' | 'right' | 'top'
    children: React.ReactNode
    placeHolder: React.ReactNode
}
export default function TooltipCustom({ children, placeHolder, side }: TooltipCustomType) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent side={side} color='red'>
                {placeHolder}
            </TooltipContent>
        </Tooltip>
    )
}
