'use client';

import CustomButton from "@/components/CustomButton";
import InputForm from "@/components/inputs/InputForm";
import { useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress, useUpdateAddress } from "@/hooks/address.hook";
import { useRouter } from "@/i18n/navigation";
import { AddressSchema, FormAddressSchema } from "@/schemas/address.schema";
import { AddressType } from "@/services/address.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function AddressesPage() {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Queries
  const { data: addresses, isLoading, error, refetch } = useAddresses();

  // Mutations
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefaultAddress, isPending: isSettingDefault } = useSetDefaultAddress();

  // Form
  const { handleSubmit, register, reset, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      title: "",
      fullName: "",
      phone: "",
      province: "",
      city: "",
      address: "",
      postalCode: "",
      isDefault: false,
    }
  });

  // پر کردن فرم با داده‌های آدرس برای ویرایش
  useEffect(() => {
    if (editingId && addresses) {
      const address = addresses.find((addr) => addr.id === editingId);
      if (address) {
        setValue("title", address.title || "");
        setValue("fullName", address.fullName);
        setValue("phone", address.phone);
        setValue("province", address.province);
        setValue("city", address.city);
        setValue("address", address.address);
        setValue("postalCode", address.postalCode || "");
        setValue("isDefault", address.isDefault);
      }
    }
  }, [editingId, addresses, setValue]);

  // ریست فرم و بستن حالت ویرایش
  const resetForm = () => {
    reset({
      title: "",
      fullName: "",
      phone: "",
      province: "",
      city: "",
      address: "",
      postalCode: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ثبت یا ویرایش آدرس
  const onSubmit = (data: FormAddressSchema) => {
    if (editingId) {
      // ویرایش آدرس
      updateAddress(
        { id: editingId, data },
        {
          onSuccess: () => {
            resetForm();
          },
        }
      );
    } else {
      // ایجاد آدرس جدید
      createAddress(data, {
        onSuccess: () => {
          resetForm();
        },
      });
    }
  };

  // حذف آدرس
  const handleDelete = (id: string) => {
    if (window.confirm("آیا از حذف این آدرس اطمینان دارید؟")) {
      deleteAddress(id);
    }
  };

  // ست کردن آدرس پیش‌فرض
  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
  };

  // شروع ویرایش
  const handleEdit = (address: AddressType) => {
    setEditingId(address.id);
    setShowForm(true);
    // اسکرول به فرم
    document.getElementById("address-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // لغو ویرایش
  const handleCancelEdit = () => {
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-accent rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // خطا
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground mb-4">خطا در بارگذاری آدرس‌ها</p>
        <button onClick={() => refetch()} className="text-primary font-bold">
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* عنوان صفحه */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">آدرس‌های من</h1>
        {!showForm && (
          <CustomButton
            onClick={() => setShowForm(true)}
            name="افزودن آدرس جدید"
            color="white"
            iconEnd={<Plus className="w-4 h-4" />}
          />
        )}
      </div>

      {/* فرم ثبت/ویرایش آدرس */}
      {(showForm || editingId) && (
        <div id="address-form" className="bg-white dark:bg-accent p-6 rounded-2xl shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "ویرایش آدرس" : "آدرس جدید"}
            </h2>
            <button
              onClick={handleCancelEdit}
              className="text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* عنوان */}
            <InputForm
              name="title"
              register={register}
              label="عنوان (اختیاری)"
              placeholder="مثال: خانه، محل کار"
              error={errors.title}
            />

            {/* نام کامل */}
            <InputForm
              name="fullName"
              register={register}
              label="نام کامل"
              placeholder="نام و نام خانوادگی"
              error={errors.fullName}
              required
            />

            {/* شماره تلفن */}
            <InputForm
              name="phone"
              register={register}
              label="شماره تلفن"
              placeholder="09123456789"
              error={errors.phone}
              required
            />

            {/* استان و شهر */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm
                name="province"
                register={register}
                label="استان"
                placeholder="استان"
                error={errors.province}
                required
              />
              <InputForm
                name="city"
                register={register}
                label="شهر"
                placeholder="شهر"
                error={errors.city}
                required
              />
            </div>

            {/* آدرس */}
            <InputForm
              name="address"
              register={register}
              label="آدرس"
              placeholder="خیابان، پلاک، واحد"
              error={errors.address}
              required
              type="textarea"
              rows={3}
            />

            {/* کد پستی */}
            <InputForm
              name="postalCode"
              register={register}
              label="کد پستی (اختیاری)"
              placeholder="کد پستی ۱۰ رقمی"
              error={errors.postalCode}
            />

            {/* آدرس پیش‌فرض */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                {...register("isDefault")}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                این آدرس به عنوان پیش‌فرض انتخاب شود
              </label>
            </div>

            {/* دکمه‌های فرم */}
            <div className="flex gap-3 pt-4">
              <CustomButton
                type="submit"
                name={editingId ? "بروزرسانی آدرس" : "ثبت آدرس"}
                color="white"
                isPending={isCreating || isUpdating}
                disabled={isCreating || isUpdating}
                className="flex-1"
              />
              <CustomButton
                type="button"
                name="انصراف"
                color="gray"
                onClick={handleCancelEdit}
              />
            </div>
          </form>
        </div>
      )}

      {/* لیست آدرس‌ها */}
      {addresses && addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white dark:bg-accent p-5 rounded-2xl border transition-all ${address.isDefault
                ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700"
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* اطلاعات آدرس */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold">
                      {address.title || "آدرس"}
                    </h3>
                    {address.isDefault && (
                      <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        پیش‌فرض
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {address.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground dir-ltr">
                    {address.phone}
                  </p>
                  <p className="text-sm">
                    {address.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.province}، {address.city}
                  </p>
                  {address.postalCode && (
                    <p className="text-sm text-muted-foreground dir-ltr">
                      کد پستی: {address.postalCode}
                    </p>
                  )}
                </div>

                {/* دکمه‌های عملیاتی */}
                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
                  {!address.isDefault && (
                    <CustomButton
                      onClick={() => handleSetDefault(address.id)}
                      color="icon"

                      size="sm"
                      tooltip="به عنوان پیش فرض"
                      className="border-accent-foreground border text-xs"
                      isPending={isSettingDefault}
                      disabled={isSettingDefault}
                      iconEnd={<Check className="w-3 h-3" />}
                    />
                  )}
                  <CustomButton
                    onClick={() => handleEdit(address)}
                    color="iconBlack"
                    className="border-accent-foreground border"
                    size="sm"
                    tooltip="ویرایش آدرس"
                    iconEnd={<Edit className="w-3 h-3" />}
                  />
                  <CustomButton
                    onClick={() => handleDelete(address.id)}
                    color="iconDelete"
                    size="sm"
                    tooltip="حذف آدرس"
                    className="border-accent-foreground border"
                    isPending={isDeleting}
                    disabled={isDeleting}
                    iconEnd={<Trash2 className="w-3 h-3" />}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // حالت خالی
        <div className="text-center py-16 bg-accent/20 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium mb-2">هیچ آدرسی ثبت نشده است</h3>
          <p className="text-muted-foreground text-sm mb-4">
            برای ثبت آدرس جدید، دکمه "افزودن آدرس جدید" را کلیک کنید
          </p>
          <CustomButton
            onClick={() => setShowForm(true)}
            name="افزودن آدرس جدید"
            color="white"
          />
        </div>
      )}
    </div>
  );
}