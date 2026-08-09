"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, CheckCircle2, Pencil, X, Upload, Puzzle, Copy, Video, Music, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditorImage from "./EditorImage";
import { toast } from "sonner";
// import SelectCustom from "../admin/components/SelectCustom";
// import { useDeleteMedia, useUploadImage } from "@/hooks/media.hook";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import EditorFiles from "./EditorFiles";
// import DialogDelete from "../admin/components/DialogDelete";
import UploadNotic from "./UploadNotic";
import SelectCustom from "../inputs/SelectCustom";
import TooltipCustom from "../TooltipCustom";
import ImgTag from "../ImgTag";
import DialogDelete from "../DialogDelete";
import { useDeleteMedia } from "@/hooks/media.hook";
import { file } from "zod";
// import ImgTag from "../ImgTag/ImgTag";

export interface FileProgress {
    id: string;
    fileName: string;
    fileSize: number;
    status: "completed" | "processing" | "pending";
    originalSrc: string;
    processedBlob?: Blob | null;
    useCase?: string;
    progress?: number;
    key?: string
    type: 'image' | 'video' | 'audio' | 'application'
    thumbnailUrl?: string
    duration?: number
    width?: number
    height?: number
    edit?: boolean
}

type UploadMediaType = {
    setUrlMedias?: (url: any) => void
    type: "image" | "video" | "voice" | "application" | "all"
    title?: string
    helperText?: string
    limit?: number
    boxUploader?: boolean
    isEdit?: boolean
    valueEdit?: string[] | [] | undefined
}

export default function UploadMedia({ type, limit = 1, setUrlMedias, title, helperText, boxUploader = false, valueEdit, isEdit = true }: UploadMediaType) {
    const [files, setFiles] = useState<FileProgress[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [editingFile, setEditingFile] = useState<FileProgress | null>(null);
    const [typeFile, setTypeFile] = useState<'image' | 'files' | null>(null);
    const [checkLimit, setCheckLimit] = useState(false)
    const [deleteModal, setDeleteModal] = useState({ open: false, key: '', fileId: '' })
    const { mutate: useMutetDeleteMedia, isPending: isPendingDelete } = useDeleteMedia({ onSuccess: () => removeFile(deleteModal.fileId) });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    var typeInput = '';
    switch (type) {
        case 'image':
            typeInput = "image/*";
            break;
        case 'video':
            typeInput = "video/*";
            break;
        case 'voice':
            typeInput = "audio/*";
            break;
        case 'application':
            typeInput = "application/zip";
            break;
        case 'all':
        default:
            typeInput = "image/*,video/*,audio/*,application/pdf,application/zip";
            break;
    }
    const removeFile = (id: string) => {
        setFiles(prev => {
            const updated = prev.filter(f => f.id !== id);
            setUrlMedias?.(
                updated.filter(f => f.status === "completed")
            );
            setCheckLimit(
                updated.filter(f => f.status === "completed").length >= limit
            );
            return updated;
        });
        setDeleteModal({
            fileId: '',
            key: '',
            open: false
        })
    };

    const handleEmergencyDelete = (e: React.MouseEvent, id?: string) => {
        if (e.shiftKey) {
            const confirmDelete = window.confirm("⚠️ هشدار اضطراری: آیا از حذف این رسانه به صورت لوکال مطمئن هستید؟");
            if (confirmDelete && id) {
                removeFile(id)
            }
        }
    };

    const handleSaveImage = (editedImageObject: any) => {
        if (!editingFile) return;
        const imageExtension = editedImageObject.extension || "png";
        const mimeType = editedImageObject.mimeType || `image/${imageExtension}`;
        const base64Data = editedImageObject.imageBase64.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const newProcessedSrc = URL.createObjectURL(blob);
        const rawNewName = editedImageObject.name || editingFile.fileName;
        const cleanName = rawNewName.replace(/\.[^/.]+$/, "");
        const finalFileName = `${cleanName}.${imageExtension}`;
        setFiles((prev: FileProgress[]) =>
            prev.map((f) =>
                f.id === editingFile.id
                    ? {
                        ...f,
                        originalSrc: newProcessedSrc,
                        processedBlob: blob,
                        fileSize: blob.size,
                        fileName: finalFileName
                    }
                    : f
            )
        );
        setEditingFile(null);
        toast.success("عکس با موفقیت ویرایش شد.");
    };

    const handleSaveFiles = (options: { name: string, thumbnailUrl?: string }) => {
        if (!editingFile) return;
        const ext = editingFile.fileName.split('.').pop();
        const cleanName = options.name.replace(/\.[^/.]+$/, "");
        const finalFileName = `${cleanName}.${ext}`;
        setFiles((prev) =>
            prev.map((f) =>
                f.id === editingFile.id
                    ? {
                        ...f,
                        fileName: finalFileName,
                        thumbnailUrl: options.thumbnailUrl ?? f.thumbnailUrl, // 👈 این
                    }
                    : f
            )
        );
        setEditingFile(null);
        setTypeFile(null);
        toast.success("اطلاعات فایل با موفقیت ذخیره شد.");
    };

    const handleFiles = (incomingFiles: FileList) => {
        const fileArray = Array.from(incomingFiles);
        fileArray.forEach((file) => {
            if (file.size > 50 * 1024 * 1024) return toast.error('حجم فایل بیش از 50 مگابایت است.')
            const id = Math.random().toString(36).substring(7);
            const objectUrl = URL.createObjectURL(file);
            let fileType: "image" | "video" | "audio" | "application" = "application";
            let previewSrc = "/file-placeholder.png";
            if (file.type.startsWith("image/")) {
                fileType = "image";
                previewSrc = objectUrl;
            } else if (file.type.startsWith("video/")) {
                fileType = "video";
                previewSrc = "/video-placeholder.png";
            } else if (file.type.startsWith("audio/")) {
                fileType = "audio";
                previewSrc = "/audio-placeholder.png";
            }
            setFiles((prev) => [
                ...prev,
                {
                    id,
                    fileName: file.name,
                    fileSize: file.size,
                    status: "pending",
                    type: fileType,
                    originalSrc: previewSrc,
                    processedBlob: file.type.startsWith("image/") ? undefined : file
                },
            ]);
        });
    };

    const getMediaMeta = (file: File): Promise<{ duration?: number; width?: number; height?: number }> => {
        return new Promise((resolve) => {
            const objectUrl = URL.createObjectURL(file);
            if (file.type.startsWith('audio/')) {
                const audio = document.createElement('audio');
                audio.preload = 'metadata';
                audio.onloadedmetadata = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({ duration: audio.duration });
                };
                audio.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({});
                };
                audio.src = objectUrl;
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({
                        duration: video.duration,
                        width: video.videoWidth,
                        height: video.videoHeight,
                    });
                };
                video.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({});
                };
                video.src = objectUrl;

            } else {
                resolve({});
            }
        });
    };

    const uploadHandler = async (id: string) => {
        if (limit && checkLimit) return toast.error(`شما مجاز به آپلود بیش از ${limit} فایل نیستید`)
        const targetFile = files.find((f) => f.id === id);
        if (!targetFile) return;
        let fakeProgressInterval: NodeJS.Timeout | null = null;
        let startTime = Date.now();
        const isImage = targetFile.processedBlob
            ? targetFile.processedBlob.type.startsWith("image/")
            : targetFile.fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i);
        const apiUrl = isImage
            ? `${process.env.NEXT_PUBLIC_URL_API}/media`
            : `${process.env.NEXT_PUBLIC_URL_API}/media`;
        try {
            setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status: "processing", progress: 0 } : f));
            const formData = new FormData();
            if (targetFile.processedBlob) {
                const fileToUpload = new File([targetFile.processedBlob], targetFile.fileName, {
                    type: targetFile.processedBlob.type || "image/png",
                });
                if (!isImage) {
                    const meta = await getMediaMeta(fileToUpload);
                    if (meta.duration) formData.append('duration', meta.duration.toString());
                    if (meta.width) formData.append('width', meta.width.toString());
                    if (meta.height) formData.append('height', meta.height.toString());
                }
                formData.append("file", fileToUpload);
            } else {
                const response = await fetch(targetFile.originalSrc);
                const blob = await response.blob();
                const fileToUpload = new File([blob], targetFile.fileName, {
                    type: blob.type || "image/png",
                });
                if (!isImage) {
                    const meta = await getMediaMeta(fileToUpload);
                    if (meta.duration) formData.append('duration', meta.duration.toString());
                    if (meta.width) formData.append('width', meta.width.toString());
                    if (meta.height) formData.append('height', meta.height.toString());
                }
                formData.append("file", fileToUpload);
            }
            formData.append("alt", 'test alt');
            formData.append("sortOrder", '0');
            formData.append("isMain", 'false');
            // formData.append("productId", 0);

            if (targetFile.thumbnailUrl) {
                formData.append("thumbnailUrl", targetFile.thumbnailUrl);
            }
            const res = await axios.post(apiUrl, formData, {
                withCredentials: true,
                timeout: 120000,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const realPercentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        const mappedProgress = Math.round((realPercentage * 70) / 100);

                        if (!fakeProgressInterval) {
                            setFiles((prev) =>
                                prev.map((f) => (f.id === id ? { ...f, progress: mappedProgress } : f))
                            );
                        }

                        if (realPercentage >= 100 && !fakeProgressInterval) {
                            const durationOfFront = Date.now() - startTime;
                            const totalSteps = 29;
                            const stepInterval = Math.max(durationOfFront / totalSteps, 200);

                            fakeProgressInterval = setInterval(() => {
                                setFiles((prev) =>
                                    prev.map((f) => {
                                        if (f.id === id) {
                                            const nextProgress = f.progress && f.progress < 99 ? f.progress + 1 : f.progress;
                                            return { ...f, progress: nextProgress };
                                        }
                                        return f;
                                    })
                                );
                            }, stepInterval);
                        }
                    }
                },
            })
            const newFiles = files.map((f) => f.id === id ? { ...f, status: "completed", key: res.data?.url, progress: 100 } : f)
            setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status: "completed", key: res.data?.url, progress: 100 } : f));
            if (limit) {
                setCheckLimit((newFiles.filter((i) => i.status === "completed").length) >= limit)
            }
            if (setUrlMedias) {
                setUrlMedias(newFiles.filter((i) => i.status === "completed"))
            }
            if (fakeProgressInterval) clearInterval(fakeProgressInterval);
            toast.success(`فایل ${targetFile.fileName} با موفقیت آپلود شد.`);
            queryClient.invalidateQueries({ queryKey: ['media'] });
        } catch (error: any) {
            if (fakeProgressInterval) clearInterval(fakeProgressInterval);
            setFiles((prev: any) => prev.map((f: any) => f.id === id ? { ...f, status: "failed" } : f));
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    toast.error("زمان درخواست بیش از حد طولانی شد (تایم‌اوت سرور)");
                } else {
                    toast.error(error.response?.data?.message || "خطا در آپلود فایل؛ لطفاً دوباره تلاش کنید.");
                }
            } else {
                toast.error("خطا در آپلود فایل؛ لطفاً دوباره تلاش کنید.");
            }
        }
    };

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        if (!valueEdit?.length) return;
        initialized.current = true;
        const getMediaType = (url: string): "image" | "video" | "voice" | "application" | "all" => {
            const ext = url?.split('.').pop()?.toLowerCase() || '';

            const types: Record<string, "image" | "video" | "voice"> = {
                png: "image", jpg: "image", jpeg: "image", webp: "image", gif: "image",
                mp4: "video", mkv: "video", mov: "video",
                mp3: "voice", wav: "voice", ogg: "voice"
            };

            return types[ext] || "application";
        };
        const newValue: FileProgress[] = valueEdit.map((item) => {
            return {
                id: item,
                fileName: item?.split('/').at(-1)?.replace(/\.[^/.]+$/, "") || '',
                fileSize: 0,
                status: "completed" as const,
                originalSrc: item,
                key: item,
                type: getMediaType(item),
                edit: true,
                processedBlob: null,
                useCase: '',
                progress: 0,
                thumbnailUrl: '',
                duration: 0,
                width: 300,
                height: 300,
            };
        }) as any

        setFiles(newValue);
        setCheckLimit(newValue.length >= limit);
    }, [valueEdit, limit]);

    return (
        <div className="w-full my-2" dir="rtl">
            <h2 className="text-lg font-bold text-admin-low-white mb-1">{title || 'مدیریت رسانه هوشمند'}</h2>
            <h2 className="text-sm font-bold text-admin-low-white mb-1">{helperText}</h2>
            <UploadNotic />
            {!checkLimit ?
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragActive(true);
                    }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                        e.dataTransfer.files && handleFiles(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors dark:bg-zinc-900/20 ${isDragActive ? "border-blue-500 bg-zinc-900/60" : "border-zinc-800"
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={typeInput}
                        className="hidden"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />
                    <UploadCloud className="w-7 h-7 text-zinc-500 mb-2" />
                    <p className="text-xs text-zinc-800 dark:text-zinc-300">انتخاب یا رها کردن</p>
                </div>
                :
                <p className="text-admin-secondary/80 font-bold">
                    کاربر گرامی، حداکثر تعداد فایل‌های مجاز بارگذاری شده است. جهت بارگذاری فایل جدید، نسبت به حذف موارد قبلی اقدام فرمایید
                </p>
            }

            <div className="mt-5 space-y-2.5">
                <AnimatePresence>
                    {files.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-2.5 bg-zinc-900 relative border border-zinc-850 rounded-xl flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
                                    {item.type === "image" ? item.edit ? <ImgTag alt={item.originalSrc} src={item.originalSrc} className="w-full h-full object-cover" /> : <img className="w-full h-full object-cover" src={item.originalSrc} /> :
                                        item.type === "application" ? <FileText className="w-5 h-5 text-blue-400" /> :
                                            item.type === "audio" ? <Music className="w-5 h-5 text-blue-400" /> :
                                                <Video className="w-5 h-5 text-blue-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-zinc-200 truncate dir-ltr text-right">{item.fileName}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono">{(item.fileSize / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            {item.status === "processing" ? (
                                <div className="flex w-2/3 items-center gap-1.5 ">
                                    <div className="w-full space-y-2 mt-2 animate-fade-in">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[11px] font-semibold text-zinc-400">در حال ارسال...</span>
                                            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                {item.progress || 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800/80 shadow-inner">
                                            <motion.div
                                                className="h-full rounded-full bg-linear-to-l from-blue-500 via-indigo-500 to-purple-600 relative"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.progress || 0}%` }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                            >
                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-size-[16px_16px] animate-[progress-bar-stripes_1s_linear_infinite]" />
                                                <div className="absolute inset-0 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.6)]" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            ) :
                                <div className="flex items-center gap-2 ">
                                    {item.status === 'completed' ?
                                        <>
                                            <TooltipCustom placeHolder="کپی لینک فایل">
                                                <Copy onClick={async () => {
                                                    if (item?.key) {
                                                        await navigator.clipboard.writeText(item?.key);
                                                        toast.success('لینک با موفقیت کپی شد')
                                                    } else {
                                                        toast.error('لینک مورد نظر یافت نشد')
                                                    }
                                                }} className="w-4.5 h-4.5 text-blue cursor-pointer transition-all hover:text-slate-700" />
                                            </TooltipCustom>
                                            <TooltipCustom placeHolder="با موفقیت آپلود شد">
                                                <CheckCircle2 className="w-4.5 h-4.5 hover:text-emerald-700 transition-all text-emerald-400" />
                                            </TooltipCustom>
                                            <TooltipCustom placeHolder={'حذف از دیتابیس'}>
                                                <Trash2 onClick={() => setDeleteModal({ key: item.key || '', open: true, fileId: item.id })} className=" text-admin-destructive w-4.5 h-4.5 cursor-pointer transition-all hover:text-slate-700" />
                                            </TooltipCustom>
                                        </>
                                        : <>
                                            {isEdit && <>
                                                <SelectCustom
                                                    children={[
                                                        { name: 'آواتار', id: 'AVATAR' },
                                                        { name: 'پروژه', id: 'PROJECT' },
                                                        { name: 'پست', id: 'POST' },
                                                        { name: 'اسناد', id: 'ATTACHMENT' },
                                                        { name: 'پیش نمایش ویدئو', id: 'THUMBNAIL' },
                                                        { name: 'لوگو', id: 'WATERMARK' },
                                                    ]}
                                                    setValue={(selectedId: string) => {
                                                        setFiles((prev) =>
                                                            prev.map((f) => (f.id === item.id ? { ...f, useCase: selectedId } : f))
                                                        );
                                                    }}
                                                    placeHolder="انتخاب نوع"
                                                    value={item.useCase || "ATTACHMENT"}
                                                />
                                                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 cursor-pointer text-zinc-400 hover:text-orange-300" onClick={() => { setEditingFile(item), setTypeFile(item.type === 'image' ? 'image' : 'files') }}>
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                            </>}
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-zinc-500 hover:text-red-400 cursor-pointer"
                                                onClick={() => setFiles((prev) => prev.filter((f) => f.id !== item.id))}
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                            {!checkLimit &&
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-zinc-500 hover:text-blue-500 cursor-pointer"
                                                    onClick={() => uploadHandler(item.id)}
                                                >
                                                    <Upload className="w-4 h-4" />
                                                </Button>
                                            }
                                        </>}
                                </div>
                            }
                            <button
                                type="button"
                                onClick={(e) => handleEmergencyDelete(e, item.key)}
                                className="absolute bottom-0 right-0 w-6 h-6 z-50 bg-rose-600/10 opacity-0 active:opacity-100 transition-opacity cursor-default"
                                title=""
                            >
                                <span className="sr-only">Panic Button</span>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {boxUploader &&
                <div className="mt-5 space-y-2.5 grid grid-cols-4 gap-5">
                    <AnimatePresence>
                        {files.filter((file) => file.status === "completed").map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="relative">
                                    <ImgTag alt={item.id} width={300} height={300} classPlus=" w-full h-40" src={item.key} />
                                    <button type="button" onClick={() => setDeleteModal({ key: item.key || '', open: true, fileId: item.id })} className="absolute top-2 right-2 bg-bg-admin-dark/80 rounded-full p-2 cursor-pointer hover:bg-bg-admin-dark transition-all">
                                        <TooltipCustom placeHolder={'حذف از دیتابیس'}>
                                            <Trash2 className="w-6 h-6 text-admin-destructive" />
                                        </TooltipCustom>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            }

            {typeFile === 'image' ?
                <EditorImage editingFile={editingFile} handleSaveImage={handleSaveImage} setEditingFile={setEditingFile} />
                :
                <EditorFiles editingFile={editingFile} handleSaveFiles={handleSaveFiles} setEditingFile={setEditingFile} />
            }
            <DialogDelete
                open={deleteModal.open}
                closeModal={() => setDeleteModal({ ...deleteModal, open: false })}
                isPending={isPendingDelete}
                onDelete={() => {
                    useMutetDeleteMedia(deleteModal.key.replaceAll('/', '%2F'))
                    console.log(deleteModal);
                }}
            />
        </div>
    );
}
