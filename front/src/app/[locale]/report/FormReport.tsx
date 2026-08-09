'use client'
import InputForm from '@/components/inputs/InputForm';
import UploadMedia from '@/components/upload/UploadMedia';
import { useCreateReport } from '@/hooks/report.hook';
import { CreateReportFormDTO, getReportSchema } from '@/schemas/report.schema';
import { CreateReportDTO } from '@/services/report.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CircleAlert, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form';

export default function FormReport() {
    const tReport = useTranslations("report");
    const [images, setImages] = useState<string[] | []>([])
    const { mutate, isPending } = useCreateReport();

    const reportSchema = getReportSchema(tReport);

    const {
        register,
        reset,
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            title: "",
            nameSeller: "",
            orderCode: "",
            content: "",
        },
    });

    const REPORT_TYPES = [
        { value: tReport('reportType.fake.name'), label: tReport('reportType.fake.label'), icon: '🛑' },
        { value: tReport('reportType.price.name'), label: tReport('reportType.price.label'), icon: '💰' },
        { value: tReport('reportType.notdelivered.name'), label: tReport('reportType.notdelivered.label'), icon: '📦' },
        { value: tReport('reportType.defective.name'), label: tReport('reportType.defective.label'), icon: '🔧' },
        { value: tReport('reportType.wronginfo.name'), label: tReport('reportType.wronginfo.label'), icon: '📝' },
        { value: tReport('reportType.misconduct.name'), label: tReport('reportType.misconduct.label'), icon: '😠' },
        { value: tReport('reportType.spam.name'), label: tReport('reportType.spam.label'), icon: '📢' },
        { value: tReport('reportType.other.name'), label: tReport('reportType.other.label'), icon: '📌' },
    ];

    const selectedType = watch('title')

    const onSubmit = (data: CreateReportDTO) => {
        const body = {
            images: images,
            nameSeller: data.nameSeller,
            content: data.content,
            title: data.title,
            orderCode: data.orderCode,
        }
        mutate(body);
    }

    const onError = (err: any) => {
        console.log(err);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="bg-card border border-border rounded-2xl p-8">
            <div className="mb-6">
                <label className="block text-sm font-black mb-3">{tReport('reportTypeName')}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {REPORT_TYPES.map(t => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setValue('title', t.value)}
                            className={`p-3 rounded-xl border text-sm font-bold text-center transition-all ${selectedType === t.value
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                : 'border-border hover:bg-accent'
                                }`}>
                            <div className="text-lg mb-1">{t.icon}</div>
                            {t.label}
                        </button>
                    ))}
                </div>
                {errors?.title && (
                    <div className="flex items-center mt-3 gap-1.5 text-red-500">
                        <CircleAlert className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-medium">{errors.title.message}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <InputForm
                    error={errors.orderCode}
                    label={tReport('inputs.orderCode.label')}
                    name='orderCode'
                    placeholder={tReport('inputs.orderCode.placeHolder')}
                    register={register}
                />
                <InputForm
                    error={errors.nameSeller}
                    label={tReport('inputs.nameSeller.label')}
                    name='nameSeller'
                    placeholder={tReport('inputs.nameSeller.placeHolder')}
                    register={register}
                />
            </div>

            <InputForm
                error={errors.content}
                label={tReport('inputs.content.label')}
                name='content'
                type='textarea'
                rows={7}
                register={register}
                placeholder={tReport('inputs.content.placeHolder')}
            />
            <p className="text-xs text-muted-foreground mt-2">{tReport('inputs.content.helpText')}</p>

            <UploadMedia
                isEdit={false}
                type='image'
                limit={2}
                setUrlMedias={(img: any) => setImages(img.map((i: any) => i.key) || [])}
                helperText={tReport('inputs.image.placeHolder')}
                title={tReport('inputs.image.label')}
            />

            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-400">
                    <p className="font-bold mb-1">{tReport('alertDiv.title')}</p>
                    <p>{tReport('alertDiv.text')}</p>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-linear-to-r from-red-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
                {isPending ? <div className='spinner'></div> : <Send className="w-4 h-4" />}
                {isPending ? tReport('button.loading') : tReport('button.name')}
            </button>
        </form>
    )
}