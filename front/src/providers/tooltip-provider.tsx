'use client'
import { TooltipProvider } from '@/components/ui/tooltip'
import React from 'react'

export default function TooltipProviders({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={200}>
            {children}
        </TooltipProvider>
    )
}
