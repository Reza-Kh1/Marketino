'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Plus, X, AlertTriangle, Edit, Trash2, SortAsc, SortDesc, FolderMinus, FolderPlus, Eye, Pencil, Check } from 'lucide-react';
import { adminCategoriesApi, type Category } from '@/lib/api';
import toast from 'react-hot-toast';
import { useCategories, useCategoriesAdmin, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/category.hook';
import { CategorysTypes } from '@/services/category.service';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicTable from '@/components/DynamicTable';
import DialogDelete from '@/components/DialogDelete';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MotionWrapper from '@/components/motion/MotionWrapper';
import CustomButton from '@/components/CustomButton';
import InputForm from '@/components/inputs/InputForm';
import { useForm } from 'react-hook-form';
import { CategoryFormValues, categoryFormSchema } from '@/schemas/category.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import SelectCustom from '@/components/inputs/SelectCustom';

export default function AdminCategoriesPage() {
  const [editing, setEditing] = useState<CategorysTypes | null>(null);
  const [openModal, setOpenModal] = useState<'create' | 'update' | 'delete' | null>(null)
  const { register, reset, setValue, watch, getValues, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(categoryFormSchema),
  });

  const parentId = watch('parentId')
  const isActive = watch('isActive')
  const { data: dataCategory, isFetching: loadCategories } = useCategoriesAdmin()
  const { mutate: deleteMutate, isPending: loadDelete, isSuccess: successDelete } = useDeleteCategory()
  const { mutate: updateMutate, isPending: loadUpdate, isSuccess: successUpdate } = useUpdateCategory()
  const { mutate: createMutate, isPending: loadCreate, isSuccess: successCreate } = useCreateCategory()

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

  useEffect(() => {
    if (successDelete || successUpdate || successCreate) {
      closeModal()
    }
  }, [successDelete, successUpdate, successCreate])

  const closeModal = () => {
    setOpenModal(null), setEditing(null), reset({
      name: '',
      nameEn: '',
      slug: '',
      slugEn: '',
      description: '',
      descriptionEn: '',
      icon: '',
      image: '',
      parentId: '',
      isActive: 'true',
      sortOrder: '0',
    })
  }

  const columns: ColumnDef<CategorysTypes>[] = useMemo(() => [
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
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-1 hover:text-foreground">
          نام دسته
          {column.getIsSorted() === 'asc' && <SortAsc className="w-3 h-3" />}
          {column.getIsSorted() === 'desc' && <SortDesc className="w-3 h-3" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2" style={{ paddingRight: `${row.depth * 1.5}rem` }}>
          {row.getCanExpand() ? (
            <button onClick={row.getToggleExpandedHandler()} className="cursor-pointer p-0.5 hover:bg-muted rounded">
              {row.getIsExpanded() ? <FolderMinus className="w-4 h-4 text-amber-500" /> : <FolderPlus className="w-4 h-4 text-admin-primary" />}
            </button>
          ) : (
            row.depth > 0 && <span className="w-4 h-px bg-muted-foreground/30 inline-block" />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'count',
      id: 'count',
      header: 'تعداد محصولات',
      cell: ({ row }) => <span className="text-xs">{row.original?._count?.products || 0}</span>
    },
    {
      accessorKey: 'isActive',
      id: 'isActive',
      header: 'وضعیت دسته',
      cell: ({ row }) => <span className="text-xs">{row.original?.isActive ?
        <Check className='text-green-500' />
        : <X className='text-red-500'/>}</span>
    },
    {
      accessorKey: 'sortOrder',
      id: 'sortOrder',
      header: 'اولویت بندی',
      cell: ({ row }) => <span className="text-xs">{row.original.sortOrder}</span>
    },
    {
      accessorKey: 'icon',
      id: 'icon',
      header: 'آیکون',
      cell: ({ row }) => <span className="text-xs">{row.original.icon}</span>
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Button onClick={() => {
            setOpenModal('update'), setEditing(row.original), reset({
              description: row.original?.description,
              descriptionEn: row.original?.descriptionEn,
              icon: row.original?.icon,
              image: row.original?.image || '',
              isActive: row.original?.isActive === true ? 'true' : 'false',
              name: row.original?.name,
              nameEn: row.original?.nameEn,
              parentId: row.original?.parentId || '',
              slug: row.original?.slug,
              slugEn: row.original?.slugEn,
              sortOrder: String(row.original?.sortOrder)
            })
          }} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-admin-accent/20"><Pencil className="w-12! text-admin-accent" /></Button>
          <Button onClick={() => { setOpenModal('delete'), setEditing(row.original) }} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-admin-destructive/20"><Trash2 className="w-12! text-admin-destructive" /></Button>
        </div>
      )
    },
  ], []);

  const onSubmit = (data: any) => {
    const body = {
      description: data.description,
      descriptionEn: data.descriptionEn,
      icon: data.icon,
      image: data.image,
      isActive: data.isActive === 'true' ? true : false,
      name: data.name,
      nameEn: data.nameEn,
      parentId: data.parentId || null,
      sortOrder: Number(data.sortOrder),
    }
    console.log(body);
    if (editing) {
      updateMutate({ id: editing.id, data: body })
    } else {
      createMutate(body)
    }
  }
  const onError = (err: any) => {
    console.log(err);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black mb-1">مدیریت دسته‌بندی‌ها</h2><p className="text-muted-foreground text-sm">{formatCategories(dataCategory)?.length} دسته‌بندی</p></div>
        <button onClick={() => setOpenModal('create')} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm"><Plus className="w-4 h-4" /> افزودن</button>
      </div>

      <DynamicTable
        limitPage={1000}
        data={dataCategory || []}
        columns={columns}
        totalRows={formatCategories(dataCategory)?.length || 0}
        subRowsKey="children" // فیلد کلید درختی دیتای شما
        isLoading={loadCategories}
        onBulkDelete={() => { }}
      />
      <Dialog open={openModal === 'create' || openModal === 'update'} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
          <DialogHeader>
            <DialogTitle className="text-admin-text-primary text-xl font-bold">
              <MotionWrapper className='' delay={0.3} preset='slideUpBlur'>
                {editing ? 'ویرایش دسته مورد نظر' : 'افزودن دسته جدید'}
              </MotionWrapper>
            </DialogTitle>
          </DialogHeader>
          <MotionWrapper preset='slideUpBlur' staggerChildren={0.5} triggerOnScroll={true} className='space-y-6 mt-4  max-h-[50vh] overflow-y-auto no-scrollbar'>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-8" id='form-category'>
              {/* 1. نام دسته‌بندی (فارسی) */}
              <InputForm
                label="نام دسته‌بندی (فارسی)"
                required
                register={register}
                name="name"
                type="text"
                placeholder="مثال: موبایل و لوازم جانبی"
                error={errors.name}
              />

              {/* 2. نام دسته‌بندی (انگلیسی) */}
              <InputForm
                label="نام دسته‌بندی (انگلیسی)"
                required
                register={register}
                name="nameEn"
                type="text"
                placeholder="مثال: Mobile & Accessories"
                error={errors.nameEn}
              />
              {editing && (
                <>
                  <InputForm
                    disabled
                    label="اسلاگ / شناسه آدرس"
                    required
                    register={register}
                    name="slug"
                    type="text"
                    placeholder="مثال: mobile-accessories"
                    error={errors.slug}
                  />
                  <InputForm
                    disabled
                    label="اسلاگ انگلیسی"
                    register={register}
                    name="slugEn"
                    type="text"
                    placeholder="مثال: mobile-accessories"
                    error={errors.slugEn}
                  />
                </>
              )}
              {/* 5. آیکون */}
              <InputForm
                label="آیکون (نام آیکون یا لینک)"
                register={register}
                name="icon"
                type="text"
                placeholder="مثال: lucide:smartphone یا https://..."
                error={errors.icon}
              />

              {/* 6. تصویر */}
              <InputForm
                label="آدرس تصویر (Image URL)"
                register={register}
                name="image"
                type="text"
                placeholder="مثال: https://example.com/images/mobile.jpg"
                error={errors.image}
              />
              <SelectCustom
                children={formatCategories(dataCategory || []) || []}
                placeHolder='انتخاب کنید'
                setValue={e => setValue('parentId', e)}
                value={parentId}
                label='دسته مادر'
              />

              <SelectCustom
                children={[
                  { name: 'فعال', id: 'true' },
                  { name: 'غیر فعال', id: 'false' },
                ]}
                placeHolder='انتخاب کنید'
                setValue={e => setValue('isActive', e)}
                value={isActive}
                label='وضعیت دسته'
              />

              {/* 8. ترتیب نمایش */}
              <InputForm
                label="ترتیب نمایش (Sort Order)"
                register={register}
                name="sortOrder"
                type="text"
                placeholder="مثال: 0"
                error={errors.sortOrder}
              />

              {/* 9. توضیحات فارسی */}
              <InputForm
                label="توضیحات (فارسی)"
                register={register}
                name="description"
                type="text"
                placeholder="توضیحات مختصری درباره این دسته‌بندی بنویسید..."
                error={errors.description}
              />

              {/* 10. توضیحات انگلیسی */}
              <InputForm
                label="توضیحات (انگلیسی)"
                register={register}
                name="descriptionEn"
                type="text"
                placeholder="Write a brief description for this category..."
                error={errors.descriptionEn}
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
                  name={editing ? 'ویرایش' : 'ذخیره'}
                  isPending={loadUpdate || loadCreate}
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
              توجه کنید دسته ای که میخواهید حذف شود نباید هیچ محصولی داشته باشد!
            </p>
          </>
        }
        onDelete={() => editing?.id && deleteMutate(editing?.id)}
        open={openModal === 'delete'}
        isPending={loadDelete}
      />
    </div>
  );
}
