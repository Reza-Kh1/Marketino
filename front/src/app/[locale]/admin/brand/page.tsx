'use client'
import CustomButton from '@/components/CustomButton';
import DialogDelete from '@/components/DialogDelete';
import DynamicTable from '@/components/DynamicTable'
import InputForm from '@/components/inputs/InputForm';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBrandAdmin, useCreateBrand, useDeleteBrand, useUpdateBrand } from '@/hooks/brand.hook'
import { BrandSchema } from '@/schemas/brand.schema';
import { BrandType } from '@/services/brand.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form';

export default function page() {
    const [brand, setBrand] = useState<BrandType | null>(null);
    const [openModal, setOpenModal] = useState<'create' | 'update' | 'delete' | null>(null)
    const { register, reset, setValue, watch, getValues, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(BrandSchema),
    });

    const { data: dataBrand, isFetching } = useBrandAdmin()
    
    const { mutate: CreateMutate, isSuccess: CreateSuccess, isPending: CreatePending } = useCreateBrand()
    const { mutate: DeleteMutate, isSuccess: DeleteSuccess, isPending: DeletePending } = useDeleteBrand()
    const { mutate: UpdateMutate, isSuccess: UpdateSuccess, isPending: UpdatePending } = useUpdateBrand()
    const closeModal = () => {
        setOpenModal(null), setBrand(null), reset({
            name: '',
            nameEn: '',
            slug: '',
            description: '',
            logo: ''
        })
    }

    useEffect(() => {
        if (CreateSuccess || DeleteSuccess || UpdateSuccess) {
            closeModal()
        }
    }, [CreateSuccess, DeleteSuccess, UpdateSuccess])

    const columns: ColumnDef<BrandType>[] = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    className="border-admin-border"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    className="border-admin-border"
                />
            )
        },
        {
            accessorKey: 'name',
            id: 'name',
            header: 'نام',
            cell: ({ row }) => <span className="text-xs">{row.original.name || ''}</span>
        },
        {
            accessorKey: 'nameEn',
            id: 'nameEn',
            header: 'نام (انگلیسی)',
            cell: ({ row }) => <span className="text-xs">{row.original.nameEn || ''}</span>
        },
        {
            accessorKey: 'product',
            id: 'product',
            header: 'تعداد محصولات',
            cell: ({ row }) => <span className="text-xs">{row.original?._count?.products || 0}</span>
        },
        {
            accessorKey: 'slug',
            id: 'slug',
            header: 'اسلاگ',
            cell: ({ row }) => <span className="text-xs">{row.original.slug || ''}</span>
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }: any) => (
                <div className="flex items-center gap-1">
                    <Button onClick={() => {
                        setOpenModal('update'), setBrand(row.original), reset({
                            description: row.original?.description,
                            logo: row.original?.logo || '',
                            name: row.original?.name,
                            nameEn: row.original?.nameEn,
                            slug: row.original?.slug,
                        })
                    }} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-admin-accent/20"><Pencil className="w-12! text-admin-accent" /></Button>
                    <Button onClick={() => { setOpenModal('delete'), setBrand(row.original) }} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-admin-destructive/20"><Trash2 className="w-12! text-admin-destructive" /></Button>
                </div>
            )
        },
    ], []);

    const onSubmit = (data: any) => {
        const body = {
            name: data.name,
            nameEn: data.nameEn,
            slug: data.slug,
            description: data.description,
            logo: data.logo
        }
        if (brand) {
            UpdateMutate({ id: brand.id, data: body })
        } else {
            CreateMutate(body)
        }
    }
    const onError = (err: any) => {
        console.log(err);
    }
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-black mb-1">مدیریت برندها</h2><p className="text-muted-foreground text-sm">{dataBrand?.length} برند</p></div>
                <button onClick={() => setOpenModal('create')} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm"><Plus className="w-4 h-4" /> افزودن</button>
            </div>
            <DynamicTable
                limitPage={1000}
                data={dataBrand || []}
                columns={columns}
                totalRows={dataBrand?.length || 0}
                isLoading={isFetching}
                onBulkDelete={() => { }}
            />
            <Dialog open={openModal === 'create' || openModal === 'update'} onOpenChange={closeModal}>
                <DialogContent className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                                {brand ? 'ویرایش برند مورد نظر' : 'افزودن برند جدید'}
                            </MotionWrapper>
                        </DialogTitle>
                    </DialogHeader>
                    <MotionWrapper preset='slideUpBlur' staggerChildren={0.5} triggerOnScroll={true} className='space-y-6 mt-4  max-h-[50vh] overflow-y-auto no-scrollbar'>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-8" id='form-category'>
                            <InputForm
                                label="نام برند (فارسی)"
                                required
                                register={register}
                                name="name"
                                type="text"
                                placeholder="مثال: پوما"
                                error={errors.name}
                            />
                            <InputForm
                                label="نام برند (انگلیسی)"
                                required
                                register={register}
                                name="nameEn"
                                type="text"
                                placeholder="مثال: puma"
                                error={errors.nameEn}
                            />
                            <InputForm
                                label="اسلاگ"
                                required
                                register={register}
                                name="slug"
                                type="text"
                                placeholder="مثال: nike"
                                error={errors.slug}
                            />
                            <InputForm
                                label="آدرس لوگو"
                                register={register}
                                name="logo"
                                type="text"
                                placeholder="https://"
                                error={errors.logo}
                            />
                            <InputForm
                                label="توضیحات"
                                register={register}
                                name="description"
                                type="textarea"
                                placeholder="توضیحات مربوطه"
                                error={errors.description}
                            />
                        </form>
                    </MotionWrapper>
                    <DialogFooter>
                        <div className="pt-4 border-t border-admin-border flex justify-between items-center w-full">
                            <MotionWrapper className='' delay={0.5} preset='slideUpBlur'>
                                <CustomButton
                                    form='form-category'
                                    color='white'
                                    onClick={handleSubmit(onSubmit, onError)}
                                    name={brand ? 'ویرایش' : 'ذخیره'}
                                    isPending={CreatePending || UpdatePending}
                                />
                            </MotionWrapper>
                            <MotionWrapper delay={0.5} preset='slideUpBlur' className=''>
                                <CustomButton
                                    iconEnd={<X className='w-4 h-4' />}
                                    name='بستن پنجره'
                                    onClick={closeModal}
                                />
                            </MotionWrapper>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <DialogDelete
                closeModal={closeModal}
                helpText={
                    <>
                        <p className='text-admin-text-muted'>
                            آیا از حذف مطمئن هستید ؟
                        </p>
                        <p className='text-xs text-red-400'>
                            توجه کنید برندی که میخواهید حذف شود نباید هیچ محصولی داشته باشد!
                        </p>
                    </>
                }
                onDelete={() => brand?.id && DeleteMutate(brand?.id)}
                open={openModal === 'delete'}
                isPending={DeletePending}
            />
        </div>
    )
}
