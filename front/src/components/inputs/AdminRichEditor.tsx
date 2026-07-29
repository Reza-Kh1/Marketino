'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import YouTube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import ResizeImage from 'tiptap-extension-resize-image'; // 🟢 اکستنشن جدید تغییر سایز عکس

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    ListTodo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    X,
    Check,
    Type,
    Video,
    Minus,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Highlighter,
    Undo,
    Redo,
    Code as CodeIcon,
    Quote,
    Maximize2,
    Minimize2, CloudUpload,
    PlusIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import UploadMedia, { FileProgress } from '@/components/upload/UploadMedia';
import CustomButton from '../CustomButton';
import { Label } from '../ui/label';
interface AdminRichEditorProps {
    content?: any | null;
    onChange?: (content: any) => void;
    placeholder?: string;
    height?: string;
    editable?: boolean;
}

export default function AdminRichEditor({
    content,
    onChange,
    placeholder = 'محتوای خود را اینجا بنویسید...',
    height = 'min-h-[400px]',
    editable = true,
}: AdminRichEditorProps) {
    const [linkUrl, setLinkUrl] = useState('');
    const [showTableDialog, setShowTableDialog] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [currentHighlight, setCurrentHighlight] = useState('#fef08a');
    const [headerCols, setHeaderCols] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showUploader, setShowUploader] = useState(false)
    const [uploaderData, setUploaderData] = useState<FileProgress | null>(null)
    const colors = ['#000000', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff', '#7f1d1d', '#991b1b', '#dc2626', '#ef4444', '#f87171', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#92400e', '#ca8a04', '#eab308', '#facc15', '#4d7c0f', '#65a30d', '#16a34a', '#22c55e', '#4ade80', '#059669', '#10b981', '#14b8a6', '#0d9488', '#0891b2', '#06b6d4', '#0ea5e9', '#38bdf8', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#4338ca', '#4f46e5', '#6366f1', '#6d28d9', '#7c3aed', '#8b5cf6', '#a855f7', '#be185d', '#db2777', '#ec4899', '#f472b6', '#be123c', '#e11d48', '#f43f5e',];
    const highlightColors = ['#fef08a', '#fde047', '#facc15', '#fdba74', '#fb923c', '#fca5a5', '#f87171', '#f9a8d4', '#f0abfc', '#ddd6fe', '#c4b5fd', '#bfdbfe', '#93c5fd', '#a5f3fc', '#bbf7d0', '#86efac', '#d9f99d', '#e5e7eb', '#cbd5e1', '#94a3b8',];
    // 🟢 تابع اصلی آپلود عکس به API شما
    const handleImageUpload = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file); // نام فیلد بر اساس بک‌اند شما (مثلا file یا image)

            const response = await fetch('YOUR_API_URL/upload', { // 👈 آدرس API خودت را اینجا بگذار
                method: 'POST',
                body: formData,
                // headers: { 'Authorization': `Bearer ${token}` } // در صورت نیاز به توکن فعال کنید
            });

            if (!response.ok) throw new Error('آپلوود ناموفق بود');
            const data = await response.json();
            return data.url; // 👈 آدرس بازگشتی عکس از بک‌اند شما
        } catch (error) {
            console.error('خطا در آپلود عکس:', error);
            alert('آپلوود تصویر با خطا مواجه شد.');
            return null;
        }
    };

    // ✅ جلوگیری از فراخوانی onChange هنگام رندر اولیه (رفع ارور: Cannot update ProductForm while rendering AdminRichEditor)
    const isEditorReady = useRef(false);

    const editor = useEditor({
        immediatelyRender: false, // ✅ تغییر به false تا editor کاملاً آماده شود
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
                code: { HTMLAttributes: { class: 'rounded-xl border bg-admin-primary/10 px-1.5 py-1 font-mono text-sm' } },
                dropcursor: { width: 2, class: 'dropcursor border-blue-500' },
                horizontalRule: {},
            }),
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'right' }),
            ResizeImage.configure({
                HTMLAttributes: {
                    class: 'mx-auto rounded-lg max-w-full my-4 cursor-pointer',
                },
            }),
            YouTube,
            Table.configure({ resizable: true }),
            TableCell,
            TableHeader,
            TableRow,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Subscript,
            Superscript,
            CharacterCount.configure({ limit: undefined }),
        ],
        content: content &&
            typeof content === "object" &&
            content.type === "doc"
            ? content
            : {
                type: "doc",
                content: [],
            },
        editable,
        onUpdate: ({ editor }) => {
            // ✅ فقط وقتی ادیتور آماده است و محتوای کاربر تغییر کرده، onChange را صدا بزن
            if (isEditorReady.current) {
                const json = editor.getJSON();
                onChange?.(json);
            }
        },
        editorProps: {
            attributes: { class: 'tiptap prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] px-4 py-6 max-w-none dir-rtl' },
            // 🟢 مدیریت کشیدن و رها کردن (Drag & Drop) تصاویر
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        handleImageUpload(file).then((url) => {
                            if (url) {
                                const { schema } = view.state;
                                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
                                view.dispatch(transaction);
                            }
                        });
                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') === 0) {
                            const file = items[i].getAsFile();
                            if (file) {
                                handleImageUpload(file).then((url) => {
                                    if (url) {
                                        const { schema } = view.state;
                                        const node = schema.nodes.image.create({ src: url });
                                        const transaction = view.state.tr.replaceSelectionWith(node);
                                        view.dispatch(transaction);
                                    }
                                });
                            }
                            return true;
                        }
                    }
                }
                return false;
            }
        },
    });


    const initialized = useRef(false);

    useEffect(() => {
        if (!editor) return;
        if (initialized.current) return;

        if (content) {
            editor.commands.setContent(content, {
                emitUpdate: false,
            });

            // ✅ بعد از تنظیم محتوای اولیه، ادیتور را آماده اعلام کن
            isEditorReady.current = true;
            initialized.current = true;
        } else {
            // ✅ اگر محتوایی نیست، بلافاصله آماده اعلام کن
            isEditorReady.current = true;
            initialized.current = true;
        }
    }, [editor, content]);


    if (!editor) {
        return <div className={`border border-admin-border rounded-xl bg-admin-bg-sidebar ${height} flex items-center justify-center`}><div className="animate-spin w-6 h-6 border-2 border-admin-primary border-t-transparent rounded-full" /></div>;
    }

    return (
        <div className={cn(
            "border mt-4 border-admin-border rounded-xl overflow-hidden bg-admin-bg-sidebar transition-all duration-200 flex flex-col",
            isFullscreen && "fixed inset-0 z-20 overflow-hidden w-screen h-screen rounded-none bg-white dark:bg-background" // 🟢 استایل تمام صفحه
        )}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-admin-border bg-admin-bg-sidebar z-10">
                <Popover>
                    <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-8 px-2 text-xs"><Type className="h-4 w-4 mr-1" /><span className="hidden sm:inline">سرتیتر</span></Button></PopoverTrigger>
                    <PopoverContent className="w-48" align="start">
                        {[{ l: 'پاراگراف', v: 'normal' }, { l: 'سرتیتر ۱', v: 'h1' }, { l: 'سرتیتر ۲', v: 'h2' }, { l: 'سرتیتر ۳', v: 'h3' }, { l: 'سرتیتر ۴', v: 'h4' }, { l: 'سرتیتر ۵', v: 'h5' }, { l: 'سرتیتر ۶', v: 'h6' }].map((item) => (
                            <Button key={item.v} variant="ghost" size="sm" className={cn('w-full justify-start', editor.isActive(item.v === 'normal' ? 'paragraph' : 'heading', { level: parseInt(item.v.slice(1)) || 1 }) && 'bg-admin-primary/20')} onClick={() => item.v === 'normal' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({ level: parseInt(item.v.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run()}><span className={item.v === 'h1' ? 'text-xl font-bold' : item.v === 'h2' ? 'text-lg font-semibold' : 'text-sm'}>{item.l}</span></Button>
                        ))}
                    </PopoverContent>
                </Popover>

                <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                    <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><span className="flex flex-col items-center pointer-events-none"><span className="text-xs font-bold">A</span><span className="h-0.5 w-4" style={{ backgroundColor: currentColor }} /></span></Button></PopoverTrigger>
                    <PopoverContent className="w-48" align="start">
                        <div className="space-y-2"><Label>رنگ متن</Label><div className="grid grid-cols-5 gap-1">{colors.map((c) => (<button key={c} type="button" className="w-8 h-8 rounded border" style={{ backgroundColor: c }} onClick={() => { editor.chain().focus().setColor(c).run(); setCurrentColor(c); setShowColorPicker(false); }} />))}</div><Input type="color" value={currentColor} onChange={(e) => { editor.chain().focus().setColor(e.target.value).run(); setCurrentColor(e.target.value); }} className="mt-2" /></div>
                    </PopoverContent>
                </Popover>
                <Popover open={showHighlightPicker} onOpenChange={setShowHighlightPicker}>
                    <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Highlighter className="h-4 w-4" style={{ color: currentHighlight }} /> </Button></PopoverTrigger>
                    <PopoverContent className="w-48" align="start">
                        <div className="space-y-3">
                            <Label>هایلایت</Label> <div className="grid grid-cols-5 gap-1"> {highlightColors.map((c) => (<button key={c} type="button" className="h-8 w-8 rounded border" style={{ backgroundColor: c }} onClick={() => { editor.chain().focus().setHighlight({ color: c }).run(); setCurrentHighlight(c); setShowHighlightPicker(false); }} />))} </div> <Input type="color" value={currentHighlight} onChange={(e) => { const color = e.target.value; editor.chain().focus().setHighlight({ color }).run(); setCurrentHighlight(color); }} /> <Button variant="outline" size="sm"
                                className="w-full text-xs"
                                onClick={() => {
                                    editor.chain().focus().unsetHighlight().run();
                                    setCurrentHighlight("#fef08a");
                                    setShowHighlightPicker(false);
                                }}
                            >
                                حذف هایلایت
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'right' }) && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'center' }) && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'left' }) && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'justify' }) && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify className="h-4 w-4" /></Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('strike') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('subscript') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleSubscript().run()}><SubscriptIcon className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('superscript') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleSuperscript().run()}><SuperscriptIcon className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleCode().run()}><CodeIcon className="h-4 w-4" /></Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('taskList') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleTaskList().run()}><ListTodo className="h-4 w-4" /></Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('blockquote') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className={cn('h-8 w-8 p-0', editor.isActive('codeBlock') && 'bg-admin-primary/20')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><CodeIcon className="h-4 w-4" /></Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {editor.isActive('link') ? (
                    <div className="flex items-center gap-1">
                        <Input value={linkUrl || editor.getAttributes('link').href} onChange={(e) => setLinkUrl(e.target.value)} className="h-7 w-36 text-xs" readOnly />
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkUrl(''); }}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                ) : (
                    <Popover>
                        <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><LinkIcon className="h-4 w-4" /></Button></PopoverTrigger>
                        <PopoverContent className="w-64" align="start">
                            <div className="space-y-2"><Label>لینک</Label><div className="flex gap-2"><Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 text-xs" /><Button size="sm" onClick={() => { editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run(); setLinkUrl(''); }}><Check className="h-4 w-4" /></Button></div></div>
                        </PopoverContent>
                    </Popover>
                )}

                <Button type='button' variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowImageDialog(true)}><ImageIcon className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowYoutubeDialog(true)}><Video className="h-4 w-4" /></Button>
                <Button type='button' variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Popover>
                    <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><TableIcon className="h-4 w-4" /></Button></PopoverTrigger>
                    <PopoverContent className="w-48" align="start">
                        <div className="space-y-2">
                            <Label>تنظیمات جدول فعال</Label>
                            <div className="grid grid-cols-2 gap-1">
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.isActive('table')}>ستون بعد</Button>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.isActive('table')}>ردیف بعد</Button>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.isActive('table')}>حذف ستون</Button>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.isActive('table')}>حذف ردیف</Button>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-xs text-red-400" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.isActive('table')}>حذف جدول</Button>
                            <Separator />
                            <Button size="sm" className="w-full" onClick={() => setShowTableDialog(true)}>جدول جدید</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button variant="ghost" size="sm" type='button' className="h-8 w-8 p-0" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" type='button' className="h-8 w-8 p-0" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" type='button' className="h-8 w-8 p-0" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><X className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" type='button' className="h-8 w-8 p-0" onClick={() => { setShowUploader(!showUploader) }}><CloudUpload className="h-4 w-4" /></Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-8 w-8 p-0 mr-auto", isFullscreen && "bg-admin-primary/20 text-admin-primary")}
                    onClick={() => { setIsFullscreen(!isFullscreen), !isFullscreen ? document.body.classList.add('overflow-hidden') : document.body.classList.remove('overflow-hidden') }}
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
            </div>

            {/* Editor */}
            <div className={cn("overflow-auto flex-1 bg-white dark:bg-background", isFullscreen ? "h-full" : height)}>
                <EditorContent editor={editor} />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-admin-border text-xs text-admin-text-muted bg-admin-bg-sidebar">
                <span>{editor.storage.characterCount.words()} کلمه | {editor.storage.characterCount.characters()} کاراکتر</span>
                {isFullscreen && <span className=" text-blue/50">حالت تمام صفحه فعال است</span>}
            </div>
            <Dialog modal={false} open={showUploader} onOpenChange={setShowUploader}>
                <DialogContent className='max-w-3xl!'>
                    <DialogHeader>
                        <DialogTitle>آپلود فایل</DialogTitle>
                    </DialogHeader>
                    <UploadMedia type='all' limit={1} setUrlMedias={(res: FileProgress[]) => setUploaderData(res[0])} />
                    <div className="space-y-2">
                        <DialogFooter className='flex items-center justify-between! w-full'>
                            <CustomButton type='button' iconEnd={<PlusIcon />} color='white' onClick={() => {
                                if (!uploaderData?.key) {
                                    return
                                }
                                editor.chain().focus().setImage({ src: process.env.NEXT_PUBLIC_MEDIA_DOMAIN + uploaderData?.key, alt: uploaderData?.fileName }).run()
                                setShowUploader(false)
                                setUploaderData(null)
                            }}>افزودن</CustomButton>
                            <CustomButton type='button' iconEnd={<X />} onClick={() => { setShowUploader(false), setUploaderData(null) }}>بستن</CustomButton>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Dialogs */}
            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogContent><DialogHeader><DialogTitle>تصویر</DialogTitle></DialogHeader><div className="space-y-2"><Input placeholder="لینک تصویر" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /><Input placeholder="متن جایگزین" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} /><DialogFooter><Button onClick={() => { editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run(); setImageUrl(''); setImageAlt(''); setShowImageDialog(false); }}>افزودن</Button></DialogFooter></div></DialogContent>
            </Dialog>

            <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
                <DialogContent><DialogHeader><DialogTitle>ویدیو یوتیوب</DialogTitle></DialogHeader><div className="space-y-2"><Input placeholder="لینک یوتیوب" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} /><DialogFooter><Button onClick={() => { editor.chain().focus().setYoutubeVideo({ src: youtubeUrl, width: 640, height: 360 }).run(); setYoutubeUrl(''); setShowYoutubeDialog(false); }}>افزودن</Button></DialogFooter></div></DialogContent>
            </Dialog>

            <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
                <DialogContent><DialogHeader><DialogTitle>جدول جدید</DialogTitle></DialogHeader><div className="space-y-3"><div className="grid grid-cols-2 gap-3"><div><Label>ردیف</Label><Input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value) || 1)} /></div><div><Label>ستون</Label><Input type="number" min={1} max={10} value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value) || 1)} /></div></div><div><Label>ستون هدر</Label><div className="flex gap-2 mt-1">{[0, 1, 2, 3].map((n) => (<Button key={n} type="button" variant={headerCols === n ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => setHeaderCols(n)}>{n === 0 ? 'بدون' : n}</Button>))}</div></div><DialogFooter><Button onClick={() => { editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: headerCols > 0 }).run(); setShowTableDialog(false); }}>ایجاد</Button></DialogFooter></div></DialogContent>
            </Dialog>
        </div >
    );
}