"use client";

import { useState } from "react";
import { Send, X, MessageSquare, Reply } from "lucide-react";
import CustomButton from "../CustomButton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import MotionWrapper from "../motion/MotionWrapper";
import { useAuth } from "@/lib/auth-context";
import IsLoginUser from "../IsLoginUser";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

type QNAFormType = {
    minimal?: boolean;
    productId: string;
    answer?: boolean; // اگر true باشد حالت پاسخ به سوال فعال می‌شود
}

export default function QNAForm({ minimal = false, productId, answer = false }: QNAFormType) {
    const { user } = useAuth();
    const locale = useLocale(); // دریافت زبان فعلی (fa یا en)
    const isEn = locale === 'en';

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
        comment: "",
    });

    // مدیریت عناوین دوزبانه (فارسی / انگلیسی)
    const titles = {
        dialogTitle: answer 
            ? (isEn ? "Submit New Answer" : "ثبت پاسخ جدید") 
            : (isEn ? "Ask a New Question" : "ثبت پرسش جدید"),
            
        btnName: answer 
            ? (isEn ? "Answer this question" : "پاسخ") 
            : (isEn ? "Ask a Question" : "ثبت پرسش جدید"),
            
        label: answer 
            ? (isEn ? "Your Answer" : "متن پاسخ شما") 
            : (isEn ? "Your Question" : "متن پرسش شما"),
            
        placeholder: answer 
            ? (isEn ? "Write a clear and helpful answer to this question..." : "پاسخ خود را به این پرسش به صورت دقیق و راهنما بنویسید...") 
            : (isEn ? "Ask any question about specs, features, or details..." : "سوال یا ابهام خود را درباره ویژگی‌ها، عملکرد یا مشخصات این محصول بپرسید..."),
            
        submitBtn: answer 
            ? (isEn ? "Submit Answer" : "ثبت و ارسال پاسخ") 
            : (isEn ? "Submit Question" : "ثبت و ارسال پرسش"),

        cancelBtn: isEn ? "Cancel" : "انصراف",
            
        toastSuccess: answer 
            ? (isEn ? "Your answer has been submitted and will be published after review." : "پاسخ شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.") 
            : (isEn ? "Your question has been submitted and will be published after review." : "پرسش شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.")
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.comment.trim()) return;

        console.log("Q&A Submitted:", { productId, isAnswer: answer, ...formData });
        toast.success(titles.toastSuccess);
        setFormData({ comment: "" });
        setOpenDialog(false);
    };

    const handleOpenModal = () => {
        if (!user) {
            setIsLogin(true);
        } else {
            setOpenDialog(true);
        }
    };

    return (
        <>
            {/* ۱. دکمه باز کردن دیالوگ (مینیمال یا دکمه اصلی) */}
            {minimal ? (
                <button
                    onClick={handleOpenModal}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                >
                    <Reply className={`w-3.5 h-3.5 ${isEn ? '' : 'rotate-180'}`} />
                    <span>{titles.btnName}</span>
                </button>
            ) : (
                <CustomButton
                    onClick={handleOpenModal}
                    classDiv="w-full"
                    color="borderNeon"
                    name={titles.btnName}
                    iconStart={answer ? <Reply className={`w-4 h-4 ${isEn ? '' : 'rotate-180'}`} /> : <MessageSquare className="w-4 h-4" />}
                />
            )}

            {/* ۲. مودال چک کردن لاگین */}
            <IsLoginUser open={isLogin} setOpen={setIsLogin} />

            {/* ۳. دیالوگ فرم پرسش و پاسخ */}
            <Dialog onOpenChange={(val) => setOpenDialog(val)} open={openDialog}>
                <DialogContent className={`max-w-2xl! w-full bg-admin-bg-sidebar backdrop-blur-xl border-admin-border ${isEn ? 'text-left' : 'text-right'}`}>
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper delay={0.1} preset='slideUpBlur'>
                                {titles.dialogTitle}
                            </MotionWrapper>
                        </DialogTitle>
                    </DialogHeader>

                    {/* فرم اصلی */}
                    <form id="qna-form" onSubmit={handleSubmit} className="space-y-4 my-2">
                        <MotionWrapper preset='slideUpBlur' delay={0.1} className="space-y-2">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                                {titles.label} <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                required
                                placeholder={titles.placeholder}
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                className="w-full p-4 resize-none text-sm rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all min-h-30"
                            />
                        </MotionWrapper>
                    </form>

                    <DialogFooter>
                        <MotionWrapper preset='slideUpBlur' delay={0.1} className="flex w-full justify-between pt-2 gap-2">
                            <CustomButton
                                type="submit"
                                form="qna-form"
                                color="neon"
                                name={titles.submitBtn}
                                iconStart={<Send className={`w-4 h-4 ${isEn ? '-rotate-0' : 'rotate-45'}`} />}
                            />
                            <CustomButton
                                color="blueLow"
                                iconEnd={<X className='w-4 h-4' />}
                                name={titles.cancelBtn}
                                onClick={() => setOpenDialog(false)}
                            />
                        </MotionWrapper>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}