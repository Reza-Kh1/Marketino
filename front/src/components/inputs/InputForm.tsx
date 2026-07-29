import React from 'react'
import { FieldError, Path, UseFormRegister } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CircleAlert } from 'lucide-react';

type InputFormProps<TFormValues extends Record<string, any>> = {
    name: Path<TFormValues>;
    register?: UseFormRegister<TFormValues>;
    error?: FieldError;
    type?: "text" | "email" | "password" | "phone" | "number" | "textarea";
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    onKeyDown?: (value: any) => void;
    className?: string;
    autoComplete?: boolean;
    defaultValue?: string | number;
    min?: number;
    classDiv?: string;
    max?: number;
    rows?: number;
    value?: string;
    onChange?: (str: any) => void;
    iconStart?: React.ReactNode;
    iconEnd?: React.ReactNode;
    classLabel?: string
};

export default function InputForm<TFormValues extends Record<string, any>>({
    name,
    register,
    classDiv,
    max,
    error,
    onKeyDown,
    type = "text",
    placeholder,
    rows,
    label,
    iconStart,
    iconEnd,
    required,
    classLabel,
    autoComplete,
    defaultValue,
    disabled,
    className,
    min,
    value,
    onChange
}: InputFormProps<TFormValues>) {
    const baseInputClasses = cn(
        "w-full px-4 py-3 rounded-xl border border-border bg-background",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
        iconStart && 'pl-10',
        iconEnd && 'pr-10',
        className ?? ''
    );
    return (
        <div className={cn("flex flex-col gap-1.5", classDiv)}>
            {/* لیبل */}
            {label && (
                <label
                    htmlFor={String(name)}
                    className={cn("block text-sm font-medium text-foreground", classLabel)}
                >
                    {label}
                    {required && <span className="mr-1 text-xs text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {iconStart && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        {iconStart}
                    </span>
                )}
                {type === 'textarea' ? (
                    <textarea
                        id={String(name)}
                        name={name}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete={autoComplete ? 'on' : 'off'}
                        defaultValue={defaultValue}
                        minLength={min}
                        rows={rows}
                        value={value}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={cn(baseInputClasses, "resize-y min-h-20")}
                        {...(register ? register(name) : {})}
                    />
                ) : (
                    <input
                        id={String(name)}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete={autoComplete ? 'on' : 'off'}
                        defaultValue={defaultValue}
                        min={min}
                        max={max}
                        value={value}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={baseInputClasses}
                        {...(register ?
                            type === 'number' ?
                                register(name, {
                                    setValueAs: (value) => value === '' ? undefined : Number(value),
                                })
                                :
                                register(name) : {})}
                    />
                )}
                {iconEnd && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        {iconEnd}
                    </span>
                )}
            </div>
            {error?.message && (
                <div className="flex items-center gap-1.5 mt-1 text-red-500">
                    <CircleAlert className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-medium">{error.message}</p>
                </div>
            )}
        </div>
    );
}