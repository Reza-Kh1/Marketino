'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import MotionWrapper from '../motion/MotionWrapper'
import { BookOpenCheck, Dot } from 'lucide-react'
import CustomButton from '../CustomButton'
type ReapetNoticType = {
    head: string
    desc: string[]
}
export default function UploadNotic() {
    const [open, setOpen] = useState(false)
    const ReapetNotic = ({ head, desc }: ReapetNoticType) => {
        return (
            <div>
                <MotionWrapper preset='fadeUp' className=''>
                    <h3 className='text-admin-low-white '>{head}</h3>
                </MotionWrapper>
                <MotionWrapper preset='slideUpBlur' className='' staggerChildren={0.1}>
                    {desc.map((val, key) => (
                        <p key={key} className='text-admin-low-white/60 flex items-center gap-1'><Dot />{val}</p>
                    ))}
                </MotionWrapper>
            </div>
        )
    }
    return (
        <>
            <button type="button" onClick={() => setOpen(!open)} className="text-xs mb-2 hover:text-blue transition-all cursor-pointer">پیش از بارگذاری هرگونه رسانه، قوانین و ضوابط ارسال فایل را مطالعه فرمایید.</button>
            <Dialog open={open} onOpenChange={() => setOpen(!open)}>
                <DialogContent showCloseButton={false} className="max-w-2xl! bg-(--admin-bg-sidebar) backdrop-blur-xl border-(--admin-destructive)/20">
                    <DialogHeader>
                        <MotionWrapper preset='fadeUp'>
                            <DialogTitle className="text-admin-text-primary">قوانین و ضوابط ارسال فایل</DialogTitle>
                        </MotionWrapper>
                    </DialogHeader>
                    <ReapetNotic desc={[
                        'تصاویر (IMAGE): فقط فرمت‌های JPG، PNG و WebP (حداکثر ابعاد ۱۹۲۰ در ۱۰۸۰ پیکسل).',
                        'ویدیوها (VIDEO): فقط فرمت MP4 (کدک H.264 یا H.265).',
                        'صوت (AUDIO): فرمت‌های MP3 و M4A با حداکثر بیت‌ریت ۱۹۲kbps.',
                        'اسناد و فایل‌ها (APPLICATION): فرمت‌های PDF، ZIP و RAR.',
                    ]} head='1. پسوندها و فرمت‌های مجاز' />
                    <ReapetNotic head='2. محدودیت حجم فایل‌ها'
                        desc={[
                            'حداکثر حجم مجاز برای تصاویر ۵ مگابایت است.',
                            'حداکثر حجم مجاز برای ویدیوها و پادکست‌ها ۵۰ مگابایت است.',
                            'برای فایل‌های حجیم‌تر، لطفاً ابتدا با ابزارهای معرفی‌شده (مثل HandBrake یا AudioLab) حجم فایل را بهینه‌سازی کنید.',
                        ]}
                    />
                    <ReapetNotic head='3. ابزارهای رایگان پیشنهاد شده برای کاهش حجم'
                        desc={[
                            'در ویندوز و مک (کامپیوتر): برای ویدیوها از برنامه بسیار قدرتمند و رایگان HandBrake و برای فایلهای صوتی از نرم‌افزار Audacity استفاده کنید.',
                            'در موبایل (اندروید): می‌توانید اپلیکیشن‌های رایگان و بدون تبلیغات Video Transcoder یا برنامه محبوب Panda Compressor را از گوگل‌پلی دانلود و استفاده کنید.',
                        ]} />
                    <ReapetNotic head='4. قوانین محتوایی و کپی‌رایت'
                        desc={[
                            'مسئولیت حقوقی تمام رسانه‌های آپلود شده در بخش پروژه ها (PROJECT) و پست‌ها (POST) بر عهده کاربر است.',
                            'کلیه فایل‌های ارسالی در بخش پیوست‌ها و تیکت‌ها توسط آنتی‌ویروس سرور اسکن می‌شوند؛ از آپلود فایل‌های مخرب یا اسکریپت‌ها خودداری کنید.'
                        ]}
                    />
                    <DialogFooter className='flex items-center justify-between!'>
                        <MotionWrapper delay={0.3} preset='fadeUp' className=''>
                            <CustomButton iconEnd={<BookOpenCheck className='w-4 h-4' />} name='مطالعه کردم' size='sm' onClick={() => setOpen(!open)} />
                        </MotionWrapper>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
