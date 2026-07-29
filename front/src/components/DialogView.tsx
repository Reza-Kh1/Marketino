import MotionWrapper from '@/components/motion/MotionWrapper';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import CustomButton from './CustomButton';
import ImgTag from './ImgTag';

type OptionsType = {
    head: string,
    detail?: {
        img?: string | null | undefined
        name: string
        value?: string | number | null | undefined | React.ReactNode
    }[]
    tags?: {
        img?: string | null | undefined
        name: string,
        value?: string | number | null | undefined | React.ReactNode
    }[]
}

type DialogViewType = {
    open: boolean
    onOpenChange?: (value: any) => void
    children?: React.ReactNode
    title: string
    desc?: string
    setOpen?: (value: boolean) => void
    urlEdit?: string
    options?: OptionsType[]
}

export default function DialogView({ open, onOpenChange, children, title, desc, setOpen, urlEdit, options }: DialogViewType) {
    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (onOpenChange) { onOpenChange(val) }
            if (setOpen) { setOpen(!open) }
        }}>
            <DialogContent className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
                <DialogHeader>
                    <DialogTitle className="text-admin-text-primary text-xl font-bold">
                        <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                            {title}
                        </MotionWrapper>
                    </DialogTitle>
                    <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                        {desc}
                    </MotionWrapper>
                </DialogHeader>
                <MotionWrapper preset='slideUpBlur' staggerChildren={0.5} triggerOnScroll={true} className='space-y-6 mt-4  max-h-[50vh] overflow-y-auto no-scrollbar'>
                    {options?.map((item, key) => (
                        <div className="space-y-3" key={key}>
                            {item?.head && <h3 className="text-sm font-semibold text-admin-primary border-r-2 border-admin-primary pr-2">{item.head || ''}</h3>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-admin-border/5 p-3 rounded-lg border border-admin-border/30">
                                {item.tags?.length ? item.tags?.map((detail, key2) => (
                                    <MotionWrapper preset='slideUpBlur' triggerOnScroll={true} className="md:col-span-2" key={key2}>
                                        <p className="text-xs text-admin-text-muted mb-1">{detail.name || '❌ متصل نیست'}</p>
                                        {detail?.img && <ImgTag classPlus='w-xl h-lg' width={300} height={200} src={detail.img} alt={detail.name} />}
                                        {!detail?.img && <p className="font-medium text-admin-text-primary text-xs bg-black/20 p-2 rounded dir-ltr text-right select-all">{detail.value ? detail.value : '❌ متصل نیست'}</p>}
                                    </MotionWrapper>
                                )) : null}
                                {item.detail?.length ? item.detail?.map((detail, key2) => (
                                    <MotionWrapper preset='slideUpBlur' triggerOnScroll={true} className="" key={key2}>
                                        <p className="text-xs text-admin-text-muted h-l mb-1">{detail.name || '❌ متصل نیست'}</p>
                                        {detail?.img && <ImgTag classPlus='w-xl h-lg' width={300} height={200} src={detail.img} alt={detail.name} />}
                                        {!detail?.img && <div className="font-semibold text-admin-text-primary">{detail.value ? detail.value : '❌ متصل نیست'}</div>}
                                    </MotionWrapper>
                                )) : null}
                            </div>
                        </div>
                    ))}
                    {children}
                </MotionWrapper>
                <DialogFooter>
                    <div className="pt-4 border-t border-admin-border flex justify-between items-center w-full">
                        {urlEdit &&
                            <MotionWrapper className='' delay={0.5} preset='slideUpBlur'>
                                <CustomButton
                                    className='cursor-default'
                                    color='white'
                                    children={<Link href={urlEdit} className="cursor-pointer flex items-center justify-between gap-3 w-full" >
                                        ویرایش
                                        <Pencil className="w-4 h-4 text-admin-accent" />
                                    </Link>}
                                />
                            </MotionWrapper>
                        }
                        <MotionWrapper delay={0.5} preset='slideUpBlur' className=''>
                            <CustomButton
                                iconEnd={<X className='w-4 h-4' />}
                                name='بستن پنجره'
                                onClick={(val) => {
                                    if (onOpenChange) { onOpenChange(val) }
                                    if (setOpen) { setOpen(!open) }
                                }}
                            />
                        </MotionWrapper>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}