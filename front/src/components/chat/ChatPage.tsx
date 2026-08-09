'use client';

import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import {
    Check,
    CheckCheck,
    Paperclip,
    SendHorizontal,
    ShieldAlert,
    User,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketMessage } from '@/services/ticket.service';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';
import ImgTag from '../ImgTag';
import { useDeleteMedia } from '@/hooks/media.hook';
import TooltipCustom from '../TooltipCustom';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '../ui/dialog';

type ChatUploadFile = {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';
    url: string;
    uploadStartTime?: number;
    fakeProgress?: number;
};

type ChatPageType = {
    ticketData: TicketMessage[];
    isPending: boolean;
    openChat: boolean;
    onSubmit: (value: any) => void;
    pendinBtn: boolean
    isMe: 'admin' | 'buyer' | 'seller'
};

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FAKE_PROGRESS_DURATION = 10000; // 10 ثانیه برای Progress ساختگی
const REAL_PROGRESS_THRESHOLD = 60; // تا 60% واقعی

export default function ChatPage({ ticketData, pendinBtn, isPending, openChat, onSubmit, isMe }: ChatPageType) {
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<ChatUploadFile[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadControllers = useRef<Record<string, AbortController>>({});
    const fakeProgressTimers = useRef<Record<string, NodeJS.Timeout>>({});
    const tCommon = useTranslations('common');
    const { mutate: useMutetDeleteMedia, isPending: isPendingDelete } = useDeleteMedia();
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const [showImg, setShowImg] = useState<string | null>(null)
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [ticketData]);
    useEffect(() => {
        return () => {
            Object.values(fakeProgressTimers.current).forEach(timer => clearInterval(timer));
        };
    }, []);
    const formatChatDate = (dateString: string) => {
        const messageDate = new Date(dateString);
        const now = new Date();
        const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

        if (messageDay.getTime() === today.getTime()) return 'امروز';
        if (messageDay.getTime() === yesterday.getTime()) return 'دیروز';
        return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(messageDate);
    };

    const getChatDateSeparator = (messages: TicketMessage[], index: number) => {
        const currentMsg = messages[index];
        const currentDate = formatChatDate(currentMsg.createdAt);
        if (index === 0) return currentDate;
        const previousMsg = messages[index - 1];
        const previousDate = formatChatDate(previousMsg.createdAt);
        return currentDate !== previousDate ? currentDate : null;
    };

    // شروع Progress ساختگی
    const startFakeProgress = (fileId: string) => {
        // پاک کردن timer قبلی
        if (fakeProgressTimers.current[fileId]) {
            clearInterval(fakeProgressTimers.current[fileId]);
        }

        let progress = REAL_PROGRESS_THRESHOLD;
        const startTime = Date.now();

        fakeProgressTimers.current[fileId] = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progressIncrement = (elapsed / FAKE_PROGRESS_DURATION) * 35; // 60% تا 95%
            const newProgress = Math.min(REAL_PROGRESS_THRESHOLD + progressIncrement, 95);

            setSelectedFiles(prev =>
                prev.map(file =>
                    file.id === fileId
                        ? { ...file, progress: Math.round(newProgress) }
                        : file
                )
            );

            // اگر به 95% رسیدیم، timer رو متوقف کن
            if (newProgress >= 95) {
                clearInterval(fakeProgressTimers.current[fileId]);
                delete fakeProgressTimers.current[fileId];
            }
        }, 100);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const remainingSlots = MAX_FILES - selectedFiles.length;
        if (remainingSlots <= 0) {
            toast.error('حداکثر ۵ عکس مجاز است')
            e.target.value = '';
            return;
        }

        const newFiles: ChatUploadFile[] = [];
        for (const file of files.slice(0, remainingSlots)) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} فایل تصویری نیست`)
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} بیشتر از ۵ مگابایت است`)
                continue;
            }

            newFiles.push({
                id: crypto.randomUUID(),
                file,
                preview: URL.createObjectURL(file),
                progress: 0,
                status: 'pending',
                url: '',
                uploadStartTime: Date.now(),
            });
        }

        if (!newFiles.length) {
            e.target.value = '';
            return;
        }

        setSelectedFiles(prev => [...prev, ...newFiles]);
        newFiles.forEach(file => uploadChatFile(file));
        e.target.value = '';
    };

    const uploadChatFile = async (targetFile: ChatUploadFile) => {
        const controller = new AbortController();
        uploadControllers.current[targetFile.id] = controller;

        // شروع Progress ساختگی
        startFakeProgress(targetFile.id);

        setSelectedFiles(prev =>
            prev.map(file =>
                file.id === targetFile.id
                    ? { ...file, status: 'uploading', progress: 0, uploadStartTime: Date.now() }
                    : file
            )
        );

        try {
            const formData = new FormData();
            formData.append('file', targetFile.file);

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/media`,
                formData,
                {
                    withCredentials: true,
                    timeout: 120000,
                    signal: controller.signal,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (!progressEvent.total) return;
                        // محاسبه Progress واقعی تا 60%
                        const realProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        const cappedProgress = Math.min(realProgress, REAL_PROGRESS_THRESHOLD);

                        setSelectedFiles(prev =>
                            prev.map(file =>
                                file.id === targetFile.id
                                    ? { ...file, progress: cappedProgress }
                                    : file
                            )
                        );
                    },
                }
            );

            // آپلود کامل شد - Progress رو به 100% ببر
            const uploadedUrl = res.data?.url;
            if (!uploadedUrl) throw new Error('URL فایل از سرور دریافت نشد');

            // پاک کردن timer ساختگی
            if (fakeProgressTimers.current[targetFile.id]) {
                clearInterval(fakeProgressTimers.current[targetFile.id]);
                delete fakeProgressTimers.current[targetFile.id];
            }

            // تنظیم Progress به 100%
            setSelectedFiles(prev =>
                prev.map(file =>
                    file.id === targetFile.id
                        ? {
                            ...file,
                            status: 'completed',
                            progress: 100,
                            url: uploadedUrl,
                        }
                        : file
                )
            );

        } catch (error: any) {
            // پاک کردن timer ساختگی
            if (fakeProgressTimers.current[targetFile.id]) {
                clearInterval(fakeProgressTimers.current[targetFile.id]);
                delete fakeProgressTimers.current[targetFile.id];
            }

            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                setSelectedFiles(prev =>
                    prev.map(file =>
                        file.id === targetFile.id ? { ...file, status: 'cancelled' } : file
                    )
                );
                return;
            }

            setSelectedFiles(prev =>
                prev.map(file =>
                    file.id === targetFile.id ? { ...file, status: 'failed' } : file
                )
            );
            console.error('Upload error:', error);
        } finally {
            delete uploadControllers.current[targetFile.id];
        }
    };

    const cancelUpload = (id: string) => {
        if (fakeProgressTimers.current[id]) {
            clearInterval(fakeProgressTimers.current[id]);
            delete fakeProgressTimers.current[id];
        }
        uploadControllers.current[id]?.abort();
    };

    const removeFile = (id: string, url: string) => {
        // پاک کردن timer ساختگی
        if (fakeProgressTimers.current[id]) {
            clearInterval(fakeProgressTimers.current[id]);
            delete fakeProgressTimers.current[id];
        }

        if (url) {
            useMutetDeleteMedia(url.replaceAll('/', '%2F'), {
                onSuccess: () => {
                    const targetFile = selectedFiles.find(file => file.id === id);
                    if (!targetFile) return;

                    if (targetFile.status === 'uploading') {
                        uploadControllers.current[id]?.abort();
                    }

                    URL.revokeObjectURL(targetFile.preview);
                    setSelectedFiles(prev => prev.filter(file => file.id !== id));
                }
            });
        } else {
            const targetFile = selectedFiles.find(file => file.id === id);
            if (!targetFile) return;
            if (targetFile.status === 'uploading') {
                uploadControllers.current[id]?.abort();
            }
            URL.revokeObjectURL(targetFile.preview);
            setSelectedFiles(prev => prev.filter(file => file.id !== id));
        }
    };

    const submitBtn = () => {
        if (!message.trim() && selectedFiles.length === 0) {
            toast.warning('لطفاً پیام یا تصویری وارد کنید');
            return;
        }

        const uploadedImages = selectedFiles
            .filter(file => file.status === 'completed' && !!file.url)
            .map(file => file.url);
        const payload = {
            message: message.trim(),
            images: uploadedImages
        };

        try {
            onSubmit(payload);
            setMessage('');
            setSelectedFiles([]);
        } catch (error) {
            console.error('Error in onSubmit:', error);
            toast.error('خطا در ارسال پیام');
        }
    };

    const isUploading = selectedFiles.some(file => file.status === 'uploading');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isPending && !isUploading) {
                submitBtn();
            }
        }
    };

    return (
        <div className="flex sticky left-0 top-3 flex-col h-[calc(100vh-190px)] gap-3 font-sans antialiased selection:bg-blue-500/30">
            <main className="flex-1 overflow-y-auto bg-white shadow-sm dark:bg-accent rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col justify-end min-h-full">
                    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full">
                        {ticketData?.map((message, index) => {
                            const dateSeparator = getChatDateSeparator(ticketData, index);
                            const isAdmin = message.sender?.role === isMe;
                            const isLastMessage = index === ticketData.length - 1;
                            return (
                                <div ref={isLastMessage ? lastMessageRef : null} key={message.id} className="flex flex-col w-full">
                                    {dateSeparator && (
                                        <div className="flex justify-center my-4 sticky top-2 z-10">
                                            <p className='dark:bg-[#0a0a0a] pb-2 bg-[#1c2833]/70 text-white rounded-full px-3 shadow-md'>
                                                {dateSeparator}

                                            </p>
                                        </div>
                                    )}
                                    <div className={cn(
                                        'flex items-end gap-2 max-w-[80%]',
                                        isAdmin ? 'self-start' : 'self-end flex-row-reverse'
                                    )}>
                                        <div className="w-8 h-8 rounded-full bg-[#2f6ea5]/80 flex items-center justify-center shrink-0 shadow-md">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {message.images?.length ? (
                                                <div className="flex flex-col gap-2">
                                                    {message.images.map((i, key) => (
                                                        <ImgTag
                                                            onClick={() => setShowImg(i.url)}
                                                            key={key}
                                                            alt={i.url}
                                                            classPlus="shadow-lg max-w-86 min-w-32 min-h-24 max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
                                                            src={i.url}
                                                        />
                                                    ))}
                                                </div>
                                            ) : null}
                                            <div className={cn(
                                                'flex',
                                                isAdmin ? 'justify-start' : 'justify-end'
                                            )}>
                                                <div className={cn(
                                                    'relative inline-block bg-[#2f6ea5]/80 p-2 rounded-2xl shadow-lg text-sm leading-relaxed text-white',
                                                    isAdmin ? 'rounded-br-none' : 'rounded-bl-none'
                                                )}>
                                                    <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                                                        {message.content}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[10px] text-sky-200/70 mt-1">
                                                        {new Date(message.createdAt).toLocaleTimeString(
                                                            tCommon('lan'),
                                                            { hour: '2-digit', minute: '2-digit' }
                                                        )}
                                                        <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            {openChat && (
                <footer className="z-10 bg-white shadow-sm dark:bg-accent rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-2 rounded-xl p-2 shadow-inner">
                        {selectedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-1">
                                {selectedFiles.map(item => {
                                    const displayProgress = item.status === 'completed' ? 100 : item.progress;
                                    return (
                                        <div
                                            key={item.id}
                                            className="relative group w-28  h-28 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                        >
                                            <img
                                                src={item.preview}
                                                alt={item.file.name}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Progress Overlay */}
                                            {(item.status === 'uploading' || item.status === 'pending') && (
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                                    <div className="relative w-14 h-14">
                                                        <svg className="w-full h-full -rotate-90">
                                                            <circle
                                                                cx="28"
                                                                cy="28"
                                                                r="22"
                                                                fill="none"
                                                                stroke="rgba(255,255,255,0.2)"
                                                                strokeWidth="4"
                                                            />
                                                            <circle
                                                                cx="28"
                                                                cy="28"
                                                                r="22"
                                                                fill="none"
                                                                stroke="#3b82f6"
                                                                strokeWidth="4"
                                                                strokeDasharray={`${2 * Math.PI * 22}`}
                                                                strokeDashoffset={`${2 * Math.PI * 22 * (1 - displayProgress / 100)}`}
                                                                className="transition-all duration-300"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-white text-sm font-bold">
                                                                {displayProgress}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {item.status === 'uploading' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => cancelUpload(item.id)}
                                                            className="absolute top-1 cursor-pointer right-1 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {item.status === 'completed' && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center shadow-lg">
                                                        <Check className="w-7 h-7 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {item.status === 'failed' && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-red-500/50 flex items-center justify-center">
                                                        <ShieldAlert className="w-7 h-7 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {item.status === 'cancelled' && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-600/50 flex items-center justify-center">
                                                        <X className="w-7 h-7 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {item.status !== 'uploading' && item.status !== 'pending' && (
                                                <TooltipCustom placeHolder="حذف فایل">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(item.id, item.url)}
                                                        className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </TooltipCustom>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={submitBtn}
                                disabled={isPending || isUploading}
                                className={cn(
                                    'bg-[#2f6ea5]/80 hover:bg-[#3889cf] text-white p-2.5 rounded-xl shadow-md transition-all mb-0.5 flex items-center justify-center group',
                                    (isPending || isUploading)
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'cursor-pointer active:scale-95'
                                )}
                            >
                                {isPendingDelete || isPending || pendinBtn ? (
                                    <div className="spinner w-5! h-5!" />
                                ) : isUploading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <SendHorizontal className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" />
                                )}
                            </button>

                            <textarea
                                onKeyDown={handleKeyDown}
                                ref={textareaRef}
                                rows={1}
                                value={message}
                                onChange={e => {
                                    setMessage(e.target.value);
                                    if (textareaRef.current) {
                                        textareaRef.current.style.height = 'auto';
                                        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
                                    }
                                }}
                                placeholder="پیام خود را بنویسید..."
                                className="flex-1 bg-transparent text-sm dark:text-[#f5f5f5] placeholder-[#708499] py-1 outline-none px-1 resize-none max-h-56 custom-scrollbar leading-4"
                                style={{ height: '36px' }}
                            />

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                                multiple
                            />

                            <button
                                type="button"
                                disabled={selectedFiles.length >= MAX_FILES}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    'text-[#708499] hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-[#1c2833]/10 hover:dark:bg-[#1c2833] mb-0.5',
                                    selectedFiles.length >= MAX_FILES
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'cursor-pointer'
                                )}
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </footer>
            )}
            <Dialog open={!!showImg} onOpenChange={() => setShowImg(null)}>
                <DialogContent className="max-w-[90vw]! max-h-[90vh]! p-0 border-none shadow-2xl overflow-auto">
                    {showImg && (
                        <div className="flex items-center justify-center min-h-[50vh] p-4">
                            <ImgTag
                                classPlus="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                src={showImg}
                                alt={showImg}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}