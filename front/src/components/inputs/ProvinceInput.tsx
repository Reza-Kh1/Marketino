import React, { useState } from 'react'
import AutocompleteCustom from './AutoCompleteCustom'
import { cn } from '@/lib/utils'
import { useCity, useProvinces } from '@/hooks/province.hook'
import { FieldError } from 'react-hook-form'

type ProvinceInputTypes = {
    changeCity: (value: any) => void
    changeProvince: (value: any) => void
    valueCity: string | undefined
    valueProvince: string | undefined
    classDiv?: string
    errorCity?: FieldError
    errorProvince?: FieldError
}

export default function ProvinceInput({ changeCity, changeProvince, valueCity, valueProvince, classDiv, errorCity, errorProvince }: ProvinceInputTypes) {
    const { data: provincesData } = useProvinces();
    const { data: citiesData } = useCity(valueProvince ?? '');
    return (
        <div className={cn('grid grid-cols-1 w-full md:grid-cols-2 gap-4 ' + classDiv)}>
            <AutocompleteCustom
                emptyText='هیچ استانی یافت نشد !'
                label='استان'
                onChange={changeProvince}
                options={provincesData || []}
                placeholder='استان خود را انتخاب کنید'
                value={valueProvince}
                error={errorProvince}
            />
            <AutocompleteCustom
                emptyText='هیچ شهری یافت نشد !'
                label='شهر'
                onChange={changeCity}
                options={citiesData || []}
                placeholder='شهر خود را انتخاب کنید'
                value={valueCity}
                error={errorCity}
            />
        </div>
    )
}
