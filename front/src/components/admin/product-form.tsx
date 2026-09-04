'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Save, Loader2, Trash2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import InputForm from '../inputs/InputForm';
import CustomButton from '../CustomButton';
import SelectCustom from '../inputs/SelectCustom';
import MotionWrapper from '../motion/MotionWrapper';
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
interface ProductFormProps {
  product?: ProductEntity | null;
  isStore?: boolean
}

export function ProductForm({ product, isStore = false }: ProductFormProps) {
  const { storeId } = useAuth()
  const [openEn, setOpenEn] = useState(false)
  const [tableValue, setTableValue] = useState<TableData | null>()
  const [tableValueEn, setTableValueEn] = useState<TableData | null>()
  const { register, reset, setValue, watch, getValues, handleSubmit } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema), defaultValues: { status: 'pending' }
  });
  const categoryId = watch('categoryId')
  const isDigital = watch('isDigital')
  const isFeatured = watch('isFeatured')
  const brandId = watch('brandId')
  const status = watch('status')
  const condition = watch('condition')
  const router = useRouter();
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const { data: dataCategory } = useCategoriesProducts()
  const { mutate: createProduct } = useCreateProduct()
  const { mutate: updateProduct } = useUpdateProduct()
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
        titleEn: product.titleEn || '',
        description: product.description || '',
        descriptionEn: product.descriptionEn || '',
        brandId: product.brandId || '',
        metaTitle: product.metaTitle || '',
        metaTitleEn: product.metaTitleEn || '',
        content: product.content ? JSON.parse(product.content) : '',
        contentEn: product.contentEn ? JSON.parse(product.contentEn) : '',
        images: product?.images.map((i) => i.url) || []
      });
      setTableValue(product.productTable)
      setTableValueEn(product.productTableEn)
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
        titleEn: data.titleEn || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        brandId: data.brandId || null,
        categoryId: data.categoryId,
        metaTitle: data.metaTitle || null,
        metaTitleEn: data.metaTitleEn || null,
        content: data.content ? JSON.stringify(data.content) : null,
        contentEn: data.contentEn ? JSON.stringify(data.contentEn) : null,
        images: data?.images || [],
        productTable: tableValue || null,
        productTableEn: tableValueEn || null
      } as any
      if (isEdit && product?.id) {
        updateProduct({ id: product?.id, data: body })
      } else {
        if (!storeId) return
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
          name={saving ? 'در حال ذخیره...' : 'ذخیره محصول'}
          disabled={saving}
          type="submit"
          iconStart={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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
            {
              product?.slug && (
                <InputForm
                  label='اسلاگ'
                  name='slug'
                  value={product?.slug}
                  disabled
                />
              )
            }
            {
              product?.store?.name && (
                <InputForm
                  label='نام فروشنده'
                  name='storeName'
                  value={product?.store?.name}
                  disabled
                />
              )
            }
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
      {/* English form */}
      <div className='w-full'>
        <CustomButton
          color='white'
          className='min-w-sm'
          onClick={() => setOpenEn(prev => !prev)}
          name={openEn ? "بستن" : "نمایش فرم های زبان انگلیسی"}
          iconEnd={openEn ? <ChevronUp /> : <ChevronDown />}
        />
        {openEn &&
          <div className='card p-4 space-y-4 mt-6'>
            <MotionWrapper preset='fadeUp' duration={2}>
              <div className='w-full grid grid-cols-1 gap-4'>
                <InputForm
                  label='نام محصول (انگلیسی)'
                  name='titleEn'
                  placeholder="مثال: گوشی هوشمند X1 Pro 5G"
                  register={register}
                />
                <InputForm
                  label='عنوان معرفی محصول (نمایش بالای صفحه) (انگلیسی)'
                  name='metaTitleEn'
                  placeholder="مثال: گوشی هوشمند X1 Pro 5G"
                  register={register}
                />
                <InputForm
                  label='توضیحات محصول (انگلیسی)'
                  name='descriptionEn'
                  type='textarea'
                  max={6}
                  min={6}
                  placeholder="مثال: گوشی هوشمند X1 Pro 5G"
                  register={register}
                />
                <div>
                  <label className="block text-sm font-medium">توضیحات محصول</label>
                  <AdminRichEditor
                    content={product?.contentEn ? JSON.parse(product?.contentEn) : null}
                    onChange={val => setValue('contentEn', val)}
                    placeholder="توضیحات کامل محصول را اینجا بنویسید..."
                  />
                </div>
              </div>
            </MotionWrapper>
            <ProductTable
              english
              value={tableValueEn}
              onChange={(newValue) => setTableValueEn(newValue)}
            />
          </div>
        }
      </div >

      {/* Bottom Actions */}
      < div className="flex items-center gap-4 pt-4 border-t border-border" >
        <CustomButton
          color='white'
          type='submit'
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
