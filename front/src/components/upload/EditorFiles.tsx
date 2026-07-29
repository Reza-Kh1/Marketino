import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog'
import { FileProgress } from './UploadMedia'

import MotionWrapper from '../motion/MotionWrapper'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import ImgTag from '../ImgTag'
import InputForm from '../inputs/InputForm'
import CustomButton from '../CustomButton'
import PendingApi from '../PendingApi'
import { Minus, Plus } from "lucide-react";

interface EditorFilesType {
    editingFile: FileProgress | null
    setEditingFile: (value: FileProgress | null) => void
    handleSaveFiles: (value: any) => void
}
export default function EditorFiles({ editingFile, setEditingFile, handleSaveFiles }: EditorFilesType) {
    const [nameFile, setNameFile] = useState<string | null>(null)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [thumbnailBtn, setThumbnailBtn] = useState<boolean>(false)
    // const [filterSearch, setFilterSearch] = useState<MediaParams>({
    //     page: 1,
    //     order: 'desc',
    //     useCase: 'THUMBNAIL'
    // })
    // const { data: mediaData, isFetching } = useMedia(filterSearch);    
    const handlerBtn = () => {
        const body = {
            thumbnailUrl: thumbnailUrl,
            name: nameFile
        }
        handleSaveFiles(body)
    }
    return (
        <Dialog
            modal={false}
            open={!!editingFile}
            onOpenChange={(open) => !open && setEditingFile(null)}
        >
            <DialogContent
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={() => setEditingFile(null)}
                className="max-w-[60vw]! w-[60vw] h-[80vh] max-h-[80vh] p-4 bg-zinc-900 border-zinc-800 overflow-hidden text-white z-50"
            >
                <DialogHeader>
                    <div className='w-1/2 flex flex-col gap-3'>
                        <MotionWrapper preset='fadeUp'>
                            <InputForm placeholder='به صورت دقیق نوشته شود' name='name' label='نام فایل' required autoComplete={false} value={nameFile || ''} onChange={({ target }) => setNameFile(target.value)} />
                        </MotionWrapper>
                        <MotionWrapper delay={0.3} preset='fadeUp'>
                            <CustomButton name='نمایش عکس پیش فرض' onClick={() => setThumbnailBtn(!thumbnailBtn)} iconEnd={thumbnailBtn ? <Minus /> : <Plus />} />,
                        </MotionWrapper>
                    </div>
                </DialogHeader>
                {/* <div className="no-scrollbar max-h-[80vh] overflow-y-auto px-1 flex flex-col gap-5 pb-3">
                    {
                        thumbnailBtn ?
                            <>
                                {isFetching && <PendingApi />}
                                <MotionWrapper delay={0.1} preset='fadeUp'>
                                    <InputForm placeholder='آدرس عکس پیش فرض فقط برای ویدئو و صوت' name='thumbnailUrl' label='عکس پیش فرض' required autoComplete={false} value={thumbnailUrl || ''} onChange={({ target }) => setThumbnailUrl(target.value)} />
                                </MotionWrapper>
                                <MotionWrapper className='grid w-full grid-cols-4 gap-2' staggerChildren={0.3} preset='fadeUp'>
                                    {mediaData?.data.map((item, key) => (
                                        <div className='relative group'>
                                            <ImgTag className='object-fill rounded-xl shadow-lg shadow-sidebar-bg-low border-pink-200 w-full h-full' src={item.key} key={key} alt={'test'} height={100} width={100} />
                                            <div className={cn(item.key === thumbnailUrl ? '' : 'group-hover:z-10 -z-10', 'flex justify-center items-center transition-all absolute w-full h-full bg-slate-800/50 top-0 left-0 rounded-xl')}>
                                                <button className='cursor-pointer' onClick={() => setThumbnailUrl(item.key === thumbnailUrl ? '' : item.key)}>
                                                    {item.key === thumbnailUrl ?
                                                        <CheckCircle2 className="w-8 h-8 transition-all text-green-700" />
                                                        :
                                                        <CheckCircle2 className="w-8 h-8 transition-all" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </MotionWrapper>
                            </>
                            :
                            null
                    }
                </div> */}
                <DialogFooter>
                    <div className='flex justify-between items-end w-full'>
                        <MotionWrapper className='' delay={0.5} preset='fadeUp'>
                            <CustomButton name='ذخیره اطلاعات' color='white' onClick={() => handlerBtn()} />
                        </MotionWrapper>
                        <MotionWrapper className='' delay={0.5} preset='fadeUp'>
                            <CustomButton name='بستن' onClick={() => setEditingFile(null)} />
                        </MotionWrapper>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}