"use client";

import { useState } from "react";
import { Send, X, MessageSquare, Reply } from "lucide-react";
import CustomButton from "../CustomButton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import MotionWrapper from "../motion/MotionWrapper";
import { useAuth } from "@/lib/auth-context";
import IsLoginUser from "../IsLoginUser";
import { useCreateQnA } from "@/hooks/qna.hook";

type QNAFormType = {
    minimal?: boolean;
    productId: string;
    answer?: boolean;
    parentId: string
}

export default function QNAForm({ minimal = false, productId, answer = false, parentId }: QNAFormType) {
    const { user } = useAuth();
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [isLogin, setIsLogin] = useState(false);
    const { mutate, isPending } = useCreateQnA()
    const [formData, setFormData] = useState({
        comment: "",
    });

    const titles = {
        dialogTitle: answer
            ? ("ثبت پاسخ جدید")
            : ("ثبت پرسش جدید"),

        btnName: answer
            ? ("پاسخ")
            : ("ثبت پرسش جدید"),

        label: answer
            ? ("متن پاسخ شما")
            : ("متن پرسش شما"),

        placeholder: answer
            ? ("پاسخ خود را به این پرسش به صورت دقیق و راهنما بنویسید...")
            : ("سوال یا ابهام خود را درباره ویژگی‌ها، عملکرد یا مشخصات این محصول بپرسید..."),

        submitBtn: answer
            ? ("ثبت و ارسال پاسخ")
            : ("ثبت و ارسال پرسش"),

        cancelBtn: "انصراف",

        toastSuccess: answer
            ? ("پاسخ شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.")
            : ("پرسش شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.")
    };

    const handleSubmit = (e: React.FormEvent) => {
        const body = {
            content: formData.comment,
            productId,
            ...(answer && { parentId })
        }
        mutate(body, {
            onSuccess: () => {
                setFormData({ comment: "" });
                setOpenDialog(false);
            }
        })
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
            {minimal ? (
                <button
                    onClick={handleOpenModal}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                >
                    <Reply className={`w-3.5 h-3.5 rotate-180`} />
                    <span>{titles.btnName}</span>
                </button>
            ) : (
                <CustomButton
                    onClick={handleOpenModal}
                    classDiv="w-full"
                    color="borderNeon"
                    name={titles.btnName}
                    iconStart={answer ? <Reply className={`w-4 h-4 rotate-180`} /> : <MessageSquare className="w-4 h-4" />}
                />
            )}
            <IsLoginUser open={isLogin} setOpen={setIsLogin} />
            <Dialog onOpenChange={(val) => setOpenDialog(val)} open={openDialog}>
                <DialogContent className={`max-w-2xl! w-full bg-accent backdrop-blur-xl border-admin-border text-right`}>
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper delay={0.1} preset='slideUpBlur'>
                                {titles.dialogTitle}
                            </MotionWrapper>
                        </DialogTitle>
                    </DialogHeader>
                    <div id="qna-form" onSubmit={handleSubmit} className="space-y-4 my-2">
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
                    </div>
                    <DialogFooter>
                        <MotionWrapper preset='slideUpBlur' delay={0.1} className="flex w-full justify-between pt-2 gap-2">
                            <CustomButton
                                form="qna-form"
                                color="white"
                                onClick={handleSubmit}
                                name={titles.submitBtn}
                                isPending={isPending}
                                iconStart={<Send className={`w-4 h-4 rotate-45`} />}
                            />
                            <CustomButton
                                color="blueLow"
                                iconEnd={<X className='w-4 h-4' />}
                                name={titles.cancelBtn}
                                isPending={isPending}
                                onClick={() => setOpenDialog(false)}
                            />
                        </MotionWrapper>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}