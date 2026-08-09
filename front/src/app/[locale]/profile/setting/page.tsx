'use client'
import React, { useEffect } from 'react'
import LoadingPage from '../../shops/[id]/loading'
import { useProfileUser, useUpdateUser } from '@/hooks/user.hook'
import InputForm from '@/components/inputs/InputForm'
import { useForm } from 'react-hook-form'
import CustomButton from '@/components/CustomButton'
import MotionWrapper from '@/components/motion/MotionWrapper'
import { useAuth } from '@/lib/auth-context'
import { Link } from '@/i18n/navigation'
import { ArrowRight, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
    firstName: z.string().min(3, { message: "نام نباید خالی باشد" }),
    lastName: z.string().min(3, { message: "نام خانوادگی نباید خالی باشد" }),
    phone: z.string()
        .optional()
        .refine(
            (val) => !val || /^09[0-9]{9}$/.test(val),
            { message: "شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود" }
        ),
    avatar: z.string().optional(),
});
export default function page() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            avatar: "",
        }
    })
    const { user, isSeller } = useAuth();

    const { data, isFetching } = useProfileUser()
    const { mutate, isPending } = useUpdateUser()

    useEffect(() => {
        reset({
            firstName: data?.firstName || '',
            lastName: data?.lastName || '',
            phone: data?.phone || '',
        })
    }, [data])
    if (isFetching) {
        return <LoadingPage />
    }

    const onSubmit = (dto: any) => {
        if (!data?.id) return
        const body = {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            avatar: "",
        }
        mutate(body)
    }
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <MotionWrapper preset='slideUpBlur'
                className="bg-card border border-border rounded-3xl p-6 md:p-10 mb-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-lg">
                        {(user?.firstName || user?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h1 className="text-2xl font-black">{user?.firstName} {user?.lastName}</h1>
                            <span className={cn('px-3 py-0.5 rounded-full text-xs font-bold',
                                user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                                    user?.role === 'seller' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                            )}>
                                {user?.role === 'admin' ? 'مدیر' : user?.role === 'seller' ? 'فروشنده' : 'خریدار'}
                            </span>
                        </div>
                        <p className="text-muted-foreground">@{user?.username} | {user?.email}</p>
                        {isSeller && user?.storeName && (
                            <Link href={`/shops/${user.id}`} className="inline-flex items-center gap-1 mt-2 text-sm text-primary font-bold hover:underline">
                                <Store className="w-4 h-4" /> {user.storeName}
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                </div>
            </MotionWrapper>
            <form onSubmit={handleSubmit(onSubmit)} >
                <MotionWrapper preset='slideUpBlur' className='grid grid-cols-1 lg:grid-cols-3 gap-6' staggerChildren={0.2}>
                    <InputForm
                        name='firstName'
                        label='نام'
                        register={register}
                        error={errors.firstName}
                    />
                    <InputForm
                        name='lastName'
                        label='نام خانوادگی'
                        register={register}
                        error={errors.lastName}
                    />
                    <InputForm
                        name='phone'
                        label='شماره تلفن'
                        register={register}
                        placeholder='وارد نشده!'
                        error={errors.phone}
                    />
                    <div className='col-span-1 lg:col-span-3'>
                        <CustomButton
                            isPending={isPending}
                            color='white'
                            type='submit'
                            name='ویرایش حساب'
                        />
                    </div>
                </MotionWrapper>
            </form>
        </div>
    )
}
