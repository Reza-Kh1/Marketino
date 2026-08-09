'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import MotionWrapper from './motion/MotionWrapper'
import LoginForm from '@/app/[locale]/login/LoginForm'
import { DoorOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import CustomButton from './CustomButton'
import RegisterFormBuyer from '@/app/[locale]/register/buyer/RegisterFormBuyer'

type isLoginUserType = {
    open: boolean
    setOpen: (value: boolean) => void
}

export default function IsLoginUser({ open, setOpen }: isLoginUserType) {
    const [showForm, setShowForm] = useState<'login' | 'seller' | 'buyer' | null>(null)
    const t = useTranslations('auth')
    const closeModal = () => {
        setOpen(false);
        setShowForm(null);
    }
    return (
        <Dialog onOpenChange={closeModal} open={open}>
            <DialogContent
                className={cn(
                    "bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right flex flex-col justify-between max-h-[95vh] sm:max-h-[85vh]",
                    showForm ? 'max-w-7xl! w-full' : 'max-w-xl w-full'
                )}
            >
                {/* 1. بخش هدر مودال */}
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-admin-text-primary text-xl font-bold">
                        <MotionWrapper delay={0.2} preset='slideUpBlur'>
                            {showForm === 'login' ? 'ورود به حساب کاربری' : showForm === 'buyer' ? 'ثبت نام' : 'ورود به حساب کاربری'}
                        </MotionWrapper>
                    </DialogTitle>
                </DialogHeader>
                {showForm ? (
                    <div className="flex-1 overflow-y-auto my-2 px-2 no-scrollbar">
                        <div className="w-full flex flex-col items-center justify-center py-2">
                            <MotionWrapper classNameDiv='w-full flex items-center justify-center' preset='fadeUp' className="flex w-full! flex-col items-center justify-between">
                                {showForm === 'buyer' ? (
                                    <RegisterFormBuyer isModal={true} setModal={closeModal} />
                                ) : showForm === 'login' ? (
                                    <LoginForm isModal={true} setModal={closeModal} />
                                ) : null
                                }
                            </MotionWrapper>
                            <MotionWrapper staggerChildren={0.2} preset='slideUpBlur' className="mt-6 pt-4 w-full border-t border-border text-center space-y-2">
                                {showForm === 'login' ? (
                                    <div>
                                        <span className="text-muted-foreground text-sm">{t('no_account')}</span>{' '}
                                        <button type='button' onClick={() => setShowForm('buyer')} className="cursor-pointer text-primary font-bold hover:underline text-sm">{t('register_as_buyer')}</button>
                                    </div>
                                ) : showForm === 'buyer' ? (
                                    <div>
                                        <span className="text-muted-foreground text-sm">{t('have_account')}</span>{' '}
                                        <button type='button' onClick={() => setShowForm('login')} className="cursor-pointer text-primary font-bold hover:underline text-sm">{t('login_link')}</button>
                                    </div>
                                ) : null}
                            </MotionWrapper>
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <p className='text-lg font-bold'>برای ثبت دیدگاه باید وارد حساب کاربری خود شوید.</p>
                    </div>
                )}

                {/* 3. بخش فوتر مودال (ثابت در پایین) */}
                {!showForm && (
                    <DialogFooter className="shrink-0 pt-4 border-t border-border/50">
                        <MotionWrapper preset='slideUpBlur' staggerChildren={0} className='w-full flex justify-between items-center gap-2'>
                            <CustomButton
                                color='neon'
                                name='ورود به سایت'
                                onClick={() => setShowForm('login')}
                                iconStart={<DoorOpen />}
                            />
                            <CustomButton
                                onClick={closeModal}
                                color='blueLow'
                                name='انصراف'
                            />
                        </MotionWrapper>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}