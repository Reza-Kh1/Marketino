"use client"
import SearchBox from '@/components/admin/SearchBox';
import CustomButton from '@/components/CustomButton';
import DialogDelete from '@/components/DialogDelete';
import DynamicTable from '@/components/DynamicTable';
import AutocompleteCustom from '@/components/inputs/AutoCompleteCustom';
import InputForm from '@/components/inputs/InputForm';
import SelectCustom from '@/components/inputs/SelectCustom';
import MotionWrapper from '@/components/motion/MotionWrapper';
import PendingApi from '@/components/PendingApi';
import TooltipCustom from '@/components/TooltipCustom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCategoriesAdmin } from '@/hooks/category.hook';
import { useAttributeDefinitions, useCreateAttributeDefinition, useDeleteAttributeDefinition, useUpdateAttributeDefinition } from '@/hooks/variant.hook';
import { useRouter } from '@/i18n/navigation';
import { CreateAttributeDefinitionFormData, CreateAttributeDefinitionSchema } from '@/schemas/variant.schema';
import { CategorysTypes } from '@/services/category.service';
import { AttributeDefinition } from '@/services/variant.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Pen, Plus, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form';

export default function page() {
    const { refresh } = useRouter();
    const searchParams = useSearchParams();
    const { mutate: deleteMutate, isPending: pendingDeleet } = useDeleteAttributeDefinition()
    const { mutate: createMutate, isPending: loadCreate } = useCreateAttributeDefinition()
    const { mutate: updateMutate, isPending: loadUpdate } = useUpdateAttributeDefinition()
    const [selectAtt, setSelectAtt] = useState<AttributeDefinition | null>(null)
    const [openModal, setOpenModal] = useState<'create' | 'delete' | 'edit' | null>(null)
    const closeModal = () => { setOpenModal(null), setSelectAtt(null) }
    const { data: dataCategory, isFetching: loadCategories } = useCategoriesAdmin()
    const { register, reset, setValue, watch, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(CreateAttributeDefinitionSchema),
    });
    const filters = useMemo(() => {
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');
        const orderParam = searchParams.get('order');
        const categoryId = searchParams.get('categoryId');
        const search = searchParams.get('search');
        return {
            limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
            order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
            page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
            ...(search && { search }),
            ...(categoryId && { categoryId }),
        } as any
    }, [searchParams]);
    const { data: attData, isLoading, isError } = useAttributeDefinitions(filters)
    const categoryIds = watch('categoryIds')

    const onSubmit = (data: CreateAttributeDefinitionFormData) => {
        const body: CreateAttributeDefinitionFormData = {
            categoryIds: data.categoryIds,
            key: data.key,
            label: data.label
        }
        if (openModal === 'edit') {
            if (!selectAtt?.id) return
            updateMutate({ data: body, id: selectAtt?.id }, {
                onSuccess: () => {
                    closeModal()
                    reset()
                }
            })
        } else {
            createMutate(body, {
                onSuccess: () => {
                    closeModal()
                    reset()
                }
            })
        }

    }

    const onError = (err: any) => {
        console.log(err);
    }

    const columns: ColumnDef<AttributeDefinition>[] = useMemo(() => [
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
            accessorKey: 'content',
            id: 'content',
            header: 'نام (انگلیسی)',
            cell: ({ row }) => (
                <span className="text-xs line-clamp-2 max-w-xs">
                    {row.original?.key || '-'}
                </span>
            )
        },
        {
            accessorKey: 'label',
            id: 'label',
            header: 'نام (فارسی)',
            cell: ({ row }) => (
                <span className="text-xs line-clamp-2 max-w-xs">
                    {row.original?.label || '-'}
                </span>
            )
        }, {
            accessorKey: 'category',
            id: 'category',
            header: 'دسته ها',
            cell: ({ row }) => (
                <div className="line-clamp-2 max-w-xs flex gap-1 items-center">
                    {row.original.category?.map((i, key) => (
                        <span className='text-xs bg-blue-300/40 p-2 rounded-lg shadow' key={key}>{i.name}</span>
                    ))}
                </div>
            )
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <TooltipCustom placeHolder="حذف">
                        <Button
                            onClick={() => { setSelectAtt(row.original), setOpenModal('delete') }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 cursor-pointer hover:bg-red-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </TooltipCustom>
                    <TooltipCustom placeHolder="ویرایش">
                        <Button
                            onClick={() => {
                                setSelectAtt(row.original), setOpenModal('edit')
                                reset({
                                    categoryIds: row.original.category.map((i) => i.id) || [],
                                    key: row.original.key,
                                    label: row.original.label
                                })
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-500 cursor-pointer hover:bg-red-500/20"
                        >
                            <Pen className="w-4 h-4" />
                        </Button>
                    </TooltipCustom>
                </div>
            )
        },
    ], [attData]);

    function formatCategories(categories: CategorysTypes[] | [] | undefined) {
        if (!categories?.length) return
        const result = [] as CategorysTypes[];
        function traverse(catss: CategorysTypes[]) {
            for (const cat of catss) {
                result.push(cat);
                if (cat.children && cat.children.length > 0) {
                    traverse(cat.children);
                }
            }
        }
        traverse(categories);
        return result;
    }
    if (isError) return (
        <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <button onClick={refresh} className="text-primary font-bold">تلاش مجدد</button>
        </div>
    );    
    if (isLoading) return <PendingApi />;
    return (
        <div className='flex flex-col gap-3'>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black mb-1">مدیریت تنوع محصول</h2>
                    <p className="text-muted-foreground text-sm">
                        {attData?.data.length || 0} تنوع
                    </p>
                </div>
                <CustomButton
                    onClick={() => setOpenModal('create')}
                    color='white'
                    name='افزودن'
                    iconEnd={<Plus className="w-4 h-4" />}
                />
            </div>
            <SearchBox
                autocomplete={[
                    {
                        label: 'انتخاب دسته',
                        options: formatCategories(dataCategory || []) || [],
                        placeholder: 'انتخاب کنید',
                        setValue: 'categoryId',
                        multiple: true,
                    }
                ]}
                placeHolder='جستجو در key و label'
            />
            <Dialog modal={false} open={openModal === 'create' || openModal === 'edit'} onOpenChange={closeModal}>
                <DialogContent className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                                افزودن تنوع جدید
                            </MotionWrapper>
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className=" space-y-6 mt-4 max-h-[80vh] overflow-y-auto no-scrollbar" id='form-category'>
                        <MotionWrapper preset='slideUpBlur' staggerChildren={0.1} triggerOnScroll={true} className='grid grid-cols-2 gap-8'>
                            <InputForm
                                label="نام دسته‌بندی (فارسی)"
                                required
                                register={register}
                                name="label"
                                type="text"
                                placeholder="مثال: سایز"
                                error={errors.label}
                            />
                            <InputForm
                                label="نام دسته‌بندی (انگلیسی)"
                                required
                                register={register}
                                name="key"
                                type="text"
                                placeholder="مثال: size"
                                error={errors.key}
                            />
                            <AutocompleteCustom
                                options={!loadCategories ? formatCategories(dataCategory || []) || [] : []}
                                multiple
                                placeholder={loadCategories ? 'صبر کنید ...' : 'انتخاب کنید'}
                                value={categoryIds}
                                label='تمام دسته ها'
                                className='col-span-2 w-full'
                                onChange={(val) => setValue('categoryIds', val)}
                            />

                        </MotionWrapper>
                    </form>
                    <DialogFooter>
                        <div className="pt-4 border-t border-admin-border flex justify-between items-center w-full">
                            <MotionWrapper className='' delay={0.5} preset='slideUpBlur'>
                                <CustomButton
                                    form='form-category'
                                    color='white'
                                    onClick={handleSubmit(onSubmit, onError)}
                                    name={'ذخیره'}
                                    isPending={loadCreate || loadUpdate}
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
            <DynamicTable
                data={attData?.data || []}
                columns={columns}
                totalRows={attData?.data.length || 0}
                isLoading={isLoading}
                onBulkDelete={() => { }}
            />
            <DialogDelete
                closeModal={closeModal}
                onDelete={() => {
                    if (selectAtt?.id) {
                        deleteMutate(selectAtt.id, {
                            onSuccess: closeModal
                        });
                    }
                }}
                isPending={pendingDeleet}
                open={openModal === 'delete'}
            />
        </div>
    );
}
