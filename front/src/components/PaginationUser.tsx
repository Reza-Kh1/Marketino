import { Link } from '@/i18n/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginationType } from '@/lib/api'
import MotionWrapper from './motion/MotionWrapper'
import TooltipCustom from './TooltipCustom'
import { Button } from './ui/button'
type PaginationBarType = {
    pagination?: PaginationType
    limit?: number
    total?: number
    nextPage?: number
    prevPage?: number
    searchParams: { [key: string]: string | string[] | undefined }
    pathName: string
}
export default function PaginationUser({ pagination, limit = 10, searchParams, pathName }: PaginationBarType) {
    if (!pagination) return
    const { total, prevPage, nextPage } = pagination
    const { page = 1, limit: paramLimit } = searchParams
    const limitPage = Number(paramLimit) ? Number(paramLimit) : limit
    const createHref = (params: Record<string, string | number | undefined>) => ({
        pathname: pathName,
        query: {
            ...searchParams,
            ...Object.fromEntries(
                Object.entries(params).filter(([, value]) => value !== undefined)
            ),
        },
    });
    return (
        <div className='my-6'>
            <MotionWrapper duration={1} preset='fadeUp'>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-admin-text-muted">
                        {total > 0 ? (`نمایش ${((Number(page) - 1) * Number(limitPage)) + 1} تا ${Math.min(Number(page) * Number(limitPage), total)} از ${total} مورد`) : ('موردی موجود نیست')}                        </div>
                    <div className="flex items-center gap-2" style={{ direction: 'ltr' }}>
                        {prevPage ? (
                            <TooltipCustom placeHolder="صفحه قبل">
                                <span className="inline-flex">
                                    <Link
                                        href={createHref({ page: prevPage })}
                                        className="h-8 px-3 cursor-pointer border border-accent-foreground hover:bg-admin-border flex items-center justify-center rounded-3xl"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Link>
                                </span>
                            </TooltipCustom>
                        ) :
                            <Button variant="outline" size="sm" disabled className="h-8 px-3 border-accent">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        }
                        {total > 0 ?
                            <span className="text-sm text-admin-text-muted px-2" style={{ direction: 'rtl' }}> صفحه {Number(page) || 1} از {Math.ceil(total / Number(limitPage)) || 1}</span>
                            : <span className='text-xs text-admin-text-muted'>! موردی یافت نشد</span>}
                        {nextPage ? (
                            <TooltipCustom placeHolder="صفحه بعد">
                                <span className="inline-flex">
                                    <Link
                                        href={createHref({ page: nextPage })}
                                        className="h-8 px-3 cursor-pointer border border-accent-foreground hover:bg-admin-border flex items-center justify-center rounded-3xl"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </span>
                            </TooltipCustom>
                        ) :
                            <Button variant="outline" size="sm" disabled className="h-8 px-3 border-accent">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        }
                    </div>
                </div>
            </MotionWrapper>
        </div>
    )
}
