"use client";

import { useState } from "react";
import { Star, Send, User, Mail, MessageSquarePlus, Sparkles, ShoppingCart, X, DoorOpen } from "lucide-react";
import CustomButton from "../CustomButton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import MotionWrapper from "../motion/MotionWrapper";
import { useAuth } from "@/lib/auth-context";
import LoginForm from "@/app/[locale]/login/LoginForm";
import IsLoginUser from "../IsLoginUser";
import { toast } from "sonner";

export default function ReviewForm() {
    const { user } = useAuth()
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [opendDialog, setOpenDialog] = useState<boolean>(false)
    const [isLogin, setIsLogin] = useState(false)
    const [formData, setFormData] = useState({
        comment: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Review Submitted:", { ...formData, rating });
        toast("نظر شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.");
        setFormData({ comment: "" });
        setRating(5);
    };

    return (
        <>
            <CustomButton
                onClick={() => {
                    if (!user) {
                        setIsLogin(true)
                    } else {
                        setOpenDialog(true)
                    }
                }}
                classDiv="w-full"
                color="borderNeon"
                name="ثبت دیدگاه"
            />
            <IsLoginUser open={isLogin} setOpen={setIsLogin} />
            <Dialog onOpenChange={() => setOpenDialog(false)} open={opendDialog}>
                <DialogContent className="max-w-4xl! bg-admin-bg-sidebar backdrop-blur-xl border-admin-border text-right">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary text-xl font-bold">
                            <MotionWrapper className='' delay={0.1} preset='slideUpBlur'>
                                ثبت دیدگاه جدید
                            </MotionWrapper>
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <MotionWrapper preset='slideUpBlur' delay={0.1} className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                امتیاز شما به این محصول:
                            </label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                                    >
                                        <Star
                                            className={`w-7 h-7 transition-colors ${star <= (hoverRating || rating)
                                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                                : "text-slate-300 dark:text-slate-700"
                                                }`}
                                        />
                                    </button>
                                ))}
                                <span className="mr-3 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                                    {hoverRating || rating} از 5
                                </span>
                            </div>
                        </MotionWrapper>
                        <MotionWrapper preset='slideUpBlur' delay={0.1} className="space-y-2">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                                متن دیدگاه شما <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                required
                                placeholder="نقاط قوت، نقاط ضعف و تجربه کاربری خود را بنویسید..."
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                className="w-full p-4 resize-none text-sm rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all min-h-30"
                            />
                        </MotionWrapper>
                    </form>
                    <DialogFooter>
                        <MotionWrapper preset='slideUpBlur' delay={0.1} className="flex w-full justify-between pt-2">
                            <CustomButton
                                color="neon"
                                name="ثبت و ارسال دیدگاه"
                                iconStart={<Send className="w-4 h-4 rotate-45" />}
                            />
                            <CustomButton
                                color="blueLow"
                                iconEnd={<X className='w-4 h-4' />}
                                name='انصراف'
                                onClick={() => setOpenDialog(false)}
                            />
                        </MotionWrapper>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}