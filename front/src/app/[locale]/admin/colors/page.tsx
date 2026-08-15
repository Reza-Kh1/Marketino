'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import CustomButton from '@/components/CustomButton';
import DialogDelete from '@/components/DialogDelete';
import DynamicTable from '@/components/DynamicTable';
import InputForm from '@/components/inputs/InputForm';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useColorsAdmin, useCreateColor, useDeleteColor, useUpdateColor } from '@/hooks/color.hook';
import { ColorSchema } from '@/schemas/color.schema';
import { ColorEntity } from '@/services/color.service';
import SearchBox from '@/components/admin/SearchBox';
import { useSearchParams } from 'next/navigation';
export default function ColorsPage() {
    const [color, setColor] = useState<ColorEntity | null>(null);
    const [openModal, setOpenModal] = useState<'create' | 'update' | 'delete' | null>(null);
    const { register, reset, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: zodResolver(ColorSchema),
        defaultValues: {
            name: '',
            nameEn: '',
            hexCode: '',
            slug: '',
        }
    });
    const hexCode = watch('hexCode')
    const { mutate: createMutate, isSuccess: createSuccess, isPending: createPending } = useCreateColor();
    const { mutate: updateMutate, isSuccess: updateSuccess, isPending: updatePending } = useUpdateColor();
    const { mutate: deleteMutate, isSuccess: deleteSuccess, isPending: deletePending } = useDeleteColor();
    const searchParams = useSearchParams();

    const filters = useMemo(() => {
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');
        const orderParam = searchParams.get('order');
        const search = searchParams.get('search');
        return {
            limit: limitParam && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined,
            order: (orderParam === 'asc' || orderParam === 'desc') ? (orderParam as 'asc' | 'desc') : undefined,
            page: pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : undefined,
            ...(search && { search }),

        } as any
    }, [searchParams]);
    const { data: colorsData, isFetching } = useColorsAdmin(filters);
    const closeModal = () => {
        setOpenModal(null);
        setColor(null);
        reset({ name: '', nameEn: '', hexCode: '', slug: '' });
    };

    useMemo(() => {
        if (createSuccess || updateSuccess || deleteSuccess) {
            closeModal();
        }
    }, [createSuccess, updateSuccess, deleteSuccess]);

    const columns: ColumnDef<ColorEntity>[] = useMemo(() => [
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
            cell: ({ row }) => <span className="text-xs">{row.original.name || '-'}</span>
        },
        {
            accessorKey: 'nameEn',
            id: 'nameEn',
            header: 'نام (انگلیسی)',
            cell: ({ row }) => <span className="text-xs">{row.original.nameEn || '-'}</span>
        },
        {
            accessorKey: 'hexCode',
            id: 'hexCode',
            header: 'کد رنگ',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: `#${row.original.hexCode}` }}
                    />
                    <span className="text-xs">#{row.original.hexCode}</span>
                </div>
            )
        },
        {
            accessorKey: 'slug',
            id: 'slug',
            header: 'اسلاگ',
            cell: ({ row }) => <span className="text-xs">{row.original.slug || '-'}</span>
        },
        {
            accessorKey: '_count',
            id: 'productVariants',
            header: 'تعداد واریانت',
            cell: ({ row }) => <span className="text-xs">{row.original._count?.productVariants || 0}</span>
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt',
            header: 'تاریخ ایجاد',
            cell: ({ row }) => (
                <span className="text-xs">
                    {new Date(row.original.createdAt).toLocaleDateString('fa-IR') || '-'}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }: any) => (
                <div className="flex items-center gap-1">
                    <Button
                        onClick={() => {
                            setOpenModal('update');
                            setColor(row.original);
                            reset({
                                name: row.original?.name,
                                nameEn: row.original?.nameEn,
                                hexCode: row.original?.hexCode,
                                slug: row.original?.slug,
                            });
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-admin-accent/20"
                    >
                        <Pencil className="w-4 h-4 text-admin-accent" />
                    </Button>
                    <Button
                        onClick={() => { setOpenModal('delete'); setColor(row.original); }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-admin-destructive/20"
                    >
                        <Trash2 className="w-4 h-4 text-admin-destructive" />
                    </Button>
                </div>
            )
        },
    ], []);

    const onSubmit = (data: any) => {
        const body = {
            name: data.name,
            nameEn: data.nameEn,
            hexCode: data.hexCode.replace('#', ''),
            slug: data.slug,
        };
        if (color) {
            updateMutate({ id: color.id, data: body });
        } else {
            createMutate(body);
        }
    };    
    const isValidHex = (code: string) => /^#([A-Fa-f0-9]{6})$/.test(code);
    return (
        <div className='flex flex-col gap-3'>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black mb-1">مدیریت رنگ‌ها</h2>
                    <p className="text-muted-foreground text-sm">
                        {colorsData?.pagination?.total || 0} رنگ
                    </p>
                </div>
                <CustomButton
                    color='white'
                    onClick={() => setOpenModal('create')}
                    iconEnd={<Plus className="w-4 h-4" />}
                    name='افزودن'
                />
            </div>
            <SearchBox
                placeHolder='اسم رنگ'
            />
            <DynamicTable
                data={colorsData?.colors || []}
                columns={columns}
                totalRows={colorsData?.pagination.total || 0}
                isLoading={isFetching}
                onBulkDelete={() => { }}
                nextPage={colorsData?.pagination.nextPage}
                prevPage={colorsData?.pagination.prevPage}
            />

            {/* Dialog Create/Update */}
            <Dialog open={openModal === 'create' || openModal === 'update'} onOpenChange={closeModal}>
                <DialogContent className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                                {color ? 'ویرایش رنگ مورد نظر' : 'افزودن رنگ جدید'}
                            </MotionWrapper>
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} id='form-color'>
                        <MotionWrapper preset='slideUpBlur' staggerChildren={0.1} className='grid grid-cols-2 gap-8'>
                            <InputForm
                                label="نام رنگ (فارسی)"
                                required
                                register={register}
                                name="name"
                                type="text"
                                placeholder="مثال: قرمز"
                                error={errors.name}
                            />
                            <InputForm
                                label="نام رنگ (انگلیسی)"
                                required
                                register={register}
                                name="nameEn"
                                type="text"
                                placeholder="مثال: Red"
                                error={errors.nameEn}
                            />
                            <InputForm
                                label="اسلاگ"
                                required
                                register={register}
                                name="slug"
                                type="text"
                                placeholder="مثال: red"
                                error={errors.slug}
                            />
                            <InputForm
                                label="کد رنگ (HEX)"
                                required
                                register={register}
                                name="hexCode"
                                type="text"
                                placeholder="مثال: FF0000"
                                error={errors.hexCode}
                            />
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-inner shrink-0 cursor-pointer">
                                <input
                                    type="color"
                                    value={isValidHex(hexCode) ? hexCode : '#000000'}
                                    onChange={(e) => setValue('hexCode', e.target.value.toUpperCase())}
                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0 z-10"
                                />
                                <div
                                    className="w-full h-full transition-all duration-200"
                                    style={{ backgroundColor: isValidHex(hexCode) ? hexCode : 'transparent' }}
                                />
                            </div>
                        </MotionWrapper>
                    </form>
                    <DialogFooter>
                        <div className="pt-4 border-t border-admin-border flex justify-between items-center w-full">
                            <MotionWrapper className='' delay={0.5} preset='slideUpBlur'>
                                <CustomButton
                                    form='form-color'
                                    color='white'
                                    iconEnd={<Plus className='w-4 h-4' />}
                                    onClick={handleSubmit(onSubmit)}
                                    name={color ? 'ویرایش' : 'ذخیره'}
                                    isPending={createPending || updatePending}
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

            {/* Dialog Delete */}
            <DialogDelete
                closeModal={closeModal}
                helpText={
                    <>
                        <p className='text-admin-text-muted'>
                            آیا از حذف این رنگ مطمئن هستید؟
                        </p>
                        <p className='text-xs text-red-400'>
                            توجه کنید رنگی که واریانت محصول دارد نمی‌تواند حذف شود.
                        </p>
                    </>
                }
                onDelete={() => color?.id && deleteMutate(color.id)}
                open={openModal === 'delete'}
                isPending={deletePending}
            />
        </div>
    );
}