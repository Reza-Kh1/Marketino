import MotionWrapper from '@/components/motion/MotionWrapper';
import { Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomButton from './CustomButton';
interface DialogDeleteType {
    onDelete: () => void
    closeModal: () => void
    open: boolean
    isPending?: boolean
    helpText?: React.ReactNode
}
export default function DialogDelete({ closeModal, onDelete, open, isPending, helpText }: DialogDeleteType) {
    return (
        <Dialog open={open} onOpenChange={closeModal}>
            <DialogContent showCloseButton={false} className="max-w-md bg-(--admin-bg-sidebar) backdrop-blur-xl border-(--admin-destructive)/20">
                <DialogHeader>
                    <MotionWrapper delay={0.2} preset='fadeUp' className=''>
                        <DialogTitle className="text-admin-text-primary">تأیید حذف</DialogTitle>
                    </MotionWrapper>
                    <MotionWrapper delay={0.2} preset='fadeUp' className='' staggerChildren={0.2}>
                        {helpText ?
                            helpText :
                            <p className='text-admin-text-muted'>
                                آیا از حذف مطمئن هستید ؟
                            </p>
                        }
                    </MotionWrapper>
                </DialogHeader>
                <DialogFooter className='flex items-center justify-between!'>
                    <MotionWrapper delay={0.3} preset='fadeUp' className=''>
                        <CustomButton isPending={isPending} iconEnd={<Trash2 className='w-4 h-4' />} size='sm' colorHover='red' name='حذف' onClick={onDelete} />
                    </MotionWrapper>
                    <MotionWrapper delay={0.3} preset='fadeUp' className=''>
                        <CustomButton name='بستن' size='sm' onClick={closeModal} iconEnd={<X className='w-4 h-4' />} />
                    </MotionWrapper>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
