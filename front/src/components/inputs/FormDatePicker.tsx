'use client'

import React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import DatePicker, { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import TimePicker from 'react-multi-date-picker/plugins/time_picker'
import 'react-multi-date-picker/styles/colors/purple.css' // تم رنگی بنفش
import { cn } from '@/lib/utils'

type JalaliPickerProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  label?: string
  placeholder?: string
  includeTime?: boolean // قابلیت انتخاب ساعت/دقیقه
  disabled?: boolean
  classLabel?: string
}

export default function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'انتخاب تاریخ...',
  includeTime = false,
  disabled = false,
  classLabel,
}: JalaliPickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const dateValue = value ? new DateObject(new Date(value)) : null

        return (
          <div className="flex flex-col gap-1.5 w-full dir-rtl">
            {label && (
              <label className={cn('block text-sm font-medium text-foreground', classLabel)}>
                {label}
              </label>
            )}

            <div className="relative w-full">
              <DatePicker
                value={dateValue}
                onChange={(date: DateObject | null) => {
                  if (!date) {
                    onChange(null)
                    return
                  }
                  onChange(date.toDate().toISOString())
                  console.log(date.toDate().toISOString());
                  
                }}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                placeholder={placeholder}
                disabled={disabled}
                format={includeTime ? 'YYYY/MM/DD - HH:mm' : 'YYYY/MM/DD'}
                className="blue" // رنگ تم
                plugins={includeTime ? [<TimePicker position="bottom" key="time" />] : []}
                inputClass={cn(
                  "w-full px-2 py-2 rounded-xl z-1000 border border-border text-slate-950 bg-background",
                  "focus:outline-none focus:ring-1 focus:ring-primary/20 dark:text-white! focus:border-primary/50",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  error && 'border-red-500'
                )}
                containerClassName="w-full"
              />

              {/* دکمه پاک کردن تاریخ */}
              {value && !disabled && (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </div>
            {error && (
              <span className="text-xs text-red-500 mr-1">
                {error.message}
              </span>
            )}
          </div>
        )
      }}
    />
  )
}