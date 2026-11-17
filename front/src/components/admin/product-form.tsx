'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import InputForm from '../inputs/InputForm';
import CustomButton from '../CustomButton';
import SelectCustom from '../inputs/SelectCustom';
import AdminRichEditor from '../inputs/AdminRichEditor';
import UploadMedia from '../upload/UploadMedia';
import { ProductEntity } from '@/services/product.service';
import { ProductFormData, productSchema } from '@/schemas/product.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProduct, useUpdateProduct } from '@/hooks/product.hook';
import ProductTable, { TableData } from '../inputs/ProductTable';
import { useBrands } from '@/hooks/brand.hook';
import ProductVariantsManager from '../product/ProductVariantsManager';
import { useCategoriesProducts } from '@/hooks/category.hook';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useSellerList } from '@/hooks/user.hook';
interface ProductFormProps {
  product?: ProductEntity | null;
  isStore?: boolean
}

export function ProductForm({ product, isStore = false }: ProductFormProps) {
  const { storeId } = useAuth()
  const [tableValue, setTableValue] = useState<TableData | null>()
  const { data: sellerList, isPending: pendingSeller } = useSellerList()
  const { register, reset, setValue, watch, getValues, handleSubmit } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema), defaultValues: { status: 'pending' }
  });
  const categoryId = watch('categoryId')
  const isDigital = watch('isDigital')
  const isFeatured = watch('isFeatured')
  const brandId = watch('brandId')
  const status = watch('status')
  const storeIds = watch('storeId')
  const condition = watch('condition')
  const router = useRouter();
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const { data: dataCategory } = useCategoriesProducts()
  const { mutate: createProduct, isPending: pendingCreate } = useCreateProduct()
  const { mutate: updateProduct, isPending: pendingUpdate } = useUpdateProduct()
  const { data: brandsData } = useBrands()

  useEffect(() => {
    if (product) {
      reset({
        isDigital: String(product.isDigital) || 'false',
        isFeatured: String(product.isFeatured) || 'false',
        categoryId: product.categoryId,
        status: product.status,
        condition: product.condition,
        title: product.title || '',
        description: product.description || '',
        brandId: product.brandId || '',
        metaTitle: product.metaTitle || '',
        content: product.content ? JSON.parse(product.content) : '',
        images: product?.images.map((i) => i.url) || [],
        storeId: isStore && storeId ? storeId : product.storeId,
        slug: product.slug
      });
      setTableValue(product.productTable)
    } else {
      if (isStore && storeId) {
        reset({
          storeId
        })
      }
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const body = {
        ...(!product?.id && { storeId: storeId || null, }),
        isDigital: data.isDigital === 'false' ? false : true,
        isFeatured: data.isFeatured === 'false' ? false : true,
        status: data.status,
        condition: data.condition,
        title: data.title || null,
        description: data.description || null,
        brandId: data.brandId || null,
        categoryId: data.categoryId,
        metaTitle: data.metaTitle || null,
        content: data.content ? JSON.stringify(data.content) : null,
        images: data?.images || [],
        productTable: tableValue || null,
        storeId: storeId ? storeId : storeIds,
        slug: data.slug
      } as any
      if (isEdit && product?.id) {
        updateProduct({ id: product?.id, data: body })
      } else {
        createProduct(body, {
          onSuccess: () => {
            router.refresh()
          }
        })
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ذخیره محصول');
    } finally {
      setSaving(false);
    }
  };

  const onError = (err: any) => {
    console.log(err);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{isEdit ? 'ویرایش محصول' : 'ایجاد محصول جدید'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit ? 'اطلاعات محصول را ویرایش کنید' : 'اطلاعات محصول جدید را وارد کنید'}
          </p>
        </div>
        <CustomButton
          color='white'
          type='submit'
          isPending={pendingCreate || pendingUpdate}
          name={saving ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی محصول' : 'ایجاد محصول'}
          iconStart={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          disabled={saving}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-4 space-y-4">
            <InputForm
              label='نام محصول'
              name='title'
              placeholder="مثال: گوشی هوشمند X1 Pro 5G"
              register={register}
            />
            <InputForm
              label='عنوان معرفی محصول (نمایش بالای صفحه)'
              name='metaTitle'
              placeholder="مثال: گوشی هوشمند X1 Pro 5G"
              register={register}
            />
            <InputForm
              label='توضیحات محصول'
              name='description'
              type='textarea'
              max={6}
              min={6}
              placeholder="مثال: گوشی هوشمند X1 Pro 5G"
              register={register}
            />
          </div>
          <div className="card p-4 space-y-4">
            <label className="block text-sm font-medium">توضیحات محصول</label>
            <AdminRichEditor
              content={product?.content ? JSON.parse(product?.content) : null}
              onChange={val => setValue('content', val)}
              placeholder="توضیحات کامل محصول را اینجا بنویسید..."
            />
          </div>
          <div className="card p-4">
            <UploadMedia
              boxUploader
              type='image'
              limit={10}
              valueEdit={getValues('images') || []}
              setUrlMedias={(url) => {
                const newUrl = url?.map((item: any) => item.key)
                setValue('images', newUrl)
              }}
              helperText="تصویر محصول با اندازه 600*800 باید باشد و حجم آن بیش از 200kb نباشد."
            />
          </div>
          <ProductVariantsManager categoryId={categoryId} productId={product?.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SelectCustom
            children={[
              { id: 'pending', name: 'در انتظار' },
              { id: 'inactive', name: 'غیرفعال' },
              { id: 'approved', name: 'تایید شده' }
            ]}
            placeHolder='انتخاب کنید'
            setValue={e => {
              if (isStore) {
                if ((product?.status !== 'approved' && e !== 'approved') || product?.status === 'approved') {
                  setValue('status', e)
                } else {
                  toast.error('شما مجاز به تایید محصولات نیستید')
                }
              } else {
                setValue('status', e)
              }
            }}
            value={status}
            label='وضعیت'
          />
          <SelectCustom
            children={[
              { id: 'new', name: 'آکبند' },
              { id: 'used', name: 'استفاده شده' },
            ]}
            placeHolder='انتخاب کنید'
            setValue={e => setValue('condition', e)}
            value={condition}
            label='وضعیت استفاده'
          />
          <SelectCustom
            children={dataCategory || []}
            placeHolder='انتخاب کنید'
            setValue={e => setValue('categoryId', e)}
            value={categoryId}
            label='دسته‌بندی'
          />
          <div className="card p-4 space-y-4">
            <SelectCustom
              children={brandsData || []}
              placeHolder='انتخاب کنید'
              setValue={e => setValue('brandId', e)}
              value={brandId}
              label='برند'
            />
            <InputForm
              label='اسلاگ'
              name='slug'
              register={register}
              placeholder='tset-slug'
            />
            <SelectCustom
              disable={pendingSeller || isStore || isEdit}
              children={
                sellerList?.length
                  ? sellerList.map((item) => ({
                    id: item.id,
                    name: item.storeName,
                  }))
                  : []
              }
              placeHolder='انتخاب کنید'
              setValue={e => {

                if (isStore && storeId) {
                  setValue('storeId', storeId)
                } else {
                  setValue('storeId', e)
                }
              }}
              value={storeIds}
              label='فروشنده'
            />
          </div>
          <div className="card p-4 space-y-4">
            {!isStore && (
              <SelectCustom
                children={[
                  { id: 'true', name: 'بله' },
                  { id: 'false', name: 'خیر' },
                ]}
                placeHolder='انتخاب کنید'
                setValue={e => setValue('isFeatured', e)}
                value={isFeatured}
                label='آیا محصول ویژه است'
              />
            )}
            <SelectCustom
              children={[
                { id: 'true', name: 'بله' },
                { id: 'false', name: 'خیر' },
              ]}
              placeHolder='انتخاب کنید'
              setValue={e => setValue('isDigital', e)}
              value={isDigital}
              label='آیا محصول دیجیتال است'
            />
          </div>
        </div>
      </div>
      <ProductTable
        value={tableValue}
        onChange={(newValue) => setTableValue(newValue)}
      />

      {/* Bottom Actions */}
      < div className="flex items-center gap-4 pt-4 border-t border-border" >
        <CustomButton
          color='white'
          type='submit'
          isPending={pendingCreate || pendingUpdate}
          name={saving ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی محصول' : 'ایجاد محصول'}
          iconStart={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          disabled={saving}
        />
        <CustomButton
          type='button'
          color='gray'
          name={'انصراف'}
          iconEnd={<ArrowLeft className="w-5 h-5" />}
        />
      </div >
    </form >
  );
}
