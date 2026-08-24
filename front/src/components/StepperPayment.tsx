"use client";

import { Check } from "lucide-react";
import React from "react";

type StepKey = "cart" | "shipping" | "payment" | "success";

interface StepperPaymentProps {
    // مقدار مرحله جاری را به صورت دستی وارد کنید: 'cart' | 'shipping' | 'payment' | 'success'
    currentStep: StepKey;
}

export default function StepperPayment({ currentStep }: StepperPaymentProps) {
    const steps = [
        { key: "cart", label: "سبد خرید", num: 1 },
        { key: "shipping", label: "ثبت سفارش", num: 2 },
        { key: "payment", label: "پرداخت", num: 3 },
    ];

    const stepOrder: StepKey[] = ["cart", "shipping", "payment", "success"];
    const currentIndex = stepOrder.indexOf(currentStep);

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 dir-rtl select-none">
            {steps.map((s, i) => {
                const isCompleted = currentIndex > i || currentStep === "success";
                const isActive = currentStep === s.key;

                return (
                    <React.Fragment key={s.key}>
                        <div className="flex items-center gap-2 group">
                            <div
                                className={`relative w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-black transition-all duration-300 ${isCompleted
                                    ? "bg-linear-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25 ring-1 ring-white/20"
                                    : isActive
                                        ? "bg-linear-to-bl from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/30 scale-105 ring-2 ring-indigo-200 dark:ring-indigo-900/50"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 shrink-0" />
                                ) : (
                                    <span className="leading-none select-none translate-y-[0.5px]">
                                        {s.num}
                                    </span>
                                )}
                                {isActive && (
                                    <span className="absolute -inset-0.5 rounded-full bg-indigo-500/20 animate-pulse -z-10" />
                                )}
                            </div>
                            <span
                                className={`text-xs sm:text-sm font-bold transition-colors duration-200 ${isCompleted
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : isActive
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-400 dark:text-gray-500"
                                    }`}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex-1 max-w-10 sm:max-w-15 h-0.75 mx-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-full transition-all duration-500 bg-linear-to-r from-emerald-400 to-teal-600"
                                    style={{
                                        width: isCompleted ? "100%" : "0%",
                                    }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}