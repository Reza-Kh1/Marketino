'use client';

import CustomButton from "@/components/CustomButton";
import { useTicket, useAddTicketMessage, useMarkTicketAsRead, useUpdateTicket } from "@/hooks/ticket.hook";
import { useRouter } from "@/i18n/navigation";
import { TicketStatus, TicketPriority } from "@/services/ticket.service";
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    Hash,
    Tag,
    ArrowLeft,
    ArrowRight,
    AlertTriangle,
    User,
    ShieldAlert,
    Undo2
} from "lucide-react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import ChatPage from "@/components/chat/ChatPage";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import PendingApi from "@/components/PendingApi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
const priorityColors = {
    [TicketPriority.LOW]: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    [TicketPriority.MEDIUM]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    [TicketPriority.HIGH]: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    [TicketPriority.URGENT]: "bg-red-500/10 text-red-600 dark:text-red-400",
    [TicketPriority.CRITICAL]: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
};
const priorityLabels = {
    [TicketPriority.LOW]: "کم",
    [TicketPriority.MEDIUM]: "متوسط",
    [TicketPriority.HIGH]: "بالا",
    [TicketPriority.URGENT]: "فوری",
    [TicketPriority.CRITICAL]: "بحرانی"
};
const statusConfig = {
    [TicketStatus.PENDING]: { icon: Clock, label: "در انتظار", color: "text-yellow-600" },
    [TicketStatus.WAITING]: { icon: AlertCircle, label: "در انتظار پاسخ", color: "text-blue-600" },
    [TicketStatus.RESOLVED]: { icon: CheckCircle, label: "حل شده", color: "text-green-600" },
    [TicketStatus.CLOSED]: { icon: XCircle, label: "بسته شده", color: "text-gray-600" }
};

export default function page() {
    const router = useRouter();
    const { id }: { id: string } = useParams()

    const { data: ticket, isFetching, isError } = useTicket(id);
    const { mutate: addMessage, isPending } = useAddTicketMessage();
    const { mutate: updateTicket, isPending: pendingTicket } = useUpdateTicket();
    const tCommon = useTranslations('common')
    const onSubmit = (data: any) => {    
        addMessage({
            id,
            data: {
                content: data.message,
                images: data.images || []
            }
        })
    }
    if (isError) return <div className="text-center py-20"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><button onClick={router.refresh} className="text-primary font-bold">تلاش مجدد</button></div>;
    if (!ticket) return <PendingApi />
    const StatusIcon = statusConfig[ticket.status].icon;
    const handleStatusTicket = (newStatus: TicketStatus) => {
        updateTicket({ id, data: { status: newStatus } });
    };
    return (
        <div className="flex flex-col sticky top-20">
            <div className="bg-white dark:bg-accent rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-sky-400 flex items-center justify-center shadow-inner cursor-pointer transition-transform active:scale-95 hover:brightness-110 focus:outline-none">
                                <User className="w-5 h-5 text-white" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-72 dark:bg-[#1c2833] border-slate-700/50 text-[#f5f5f5] rounded-xl p-1.5 shadow-2xl"
                        >
                            <DropdownMenuLabel className="px-3 py-2 text-right">
                                <p className="text-[10px] text-slate-400 font-normal">اطلاعات کاربر</p>
                                <p className="text-sm font-semibold dark:text-white mt-0.5 truncate">{ticket.user?.firstName + " " + ticket.user?.lastName}</p>
                                <p className="text-sm font-semibold dark:text-white mt-0.5 truncate">نام کاربر : {ticket.user?.username}</p>
                                <p className="text-sm font-semibold dark:text-white mt-0.5 truncate">نقش : {ticket.user?.role === "buyer" ? "خریدار" : ticket.user?.role === "admin" ? "ادمین" : "فروشنده"}</p>
                                <p className="text-sm font-semibold dark:text-white mt-0.5 truncate">شماره تلفن : {ticket.user?.phone || '-'}</p>
                                <p className="text-sm font-semibold dark:text-white mt-0.5 truncate">وضعیت : {!ticket.isUserRead ? 'خوانده نشده' : 'خوانده شده'}</p>
                                <p className="text-sm font-semibold dark:text-white mt-0.5 truncate">آیدی : {ticket.userId}</p>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-slate-700/50 my-1" />

                            <div className="px-3 py-1.5">
                                <p className="text-[10px] text-slate-400 font-normal text-right">وضعیت فعلی</p>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "mt-1 w-full justify-center text-xs py-3",
                                        ticket?.status === 'PENDING' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
                                        ticket?.status === 'WAITING' && "bg-blue-500/10 text-blue-500 border-blue-500/30",
                                        ticket?.status === 'RESOLVED' && "bg-green-500/10 text-green-500 border-green-500/30",
                                        ticket?.status === 'CLOSED' && "bg-gray-500/10 text-gray-500 border-gray-500/30"
                                    )}
                                >
                                    {ticket?.status === 'PENDING' && 'در انتظار'}
                                    {ticket?.status === 'WAITING' && 'در انتظار پاسخ'}
                                    {ticket?.status === 'RESOLVED' && 'حل شده'}
                                    {ticket?.status === 'CLOSED' && 'بسته شده'}
                                </Badge>
                            </div>

                            <DropdownMenuSeparator className="bg-slate-700/50 my-1" />

                            {/* گزینه‌های تغییر وضعیت */}
                            {ticket?.status === 'PENDING' && (
                                <DropdownMenuItem
                                    onClick={() => handleStatusTicket(TicketStatus.WAITING)}
                                    className="flex items-center justify-between text-right px-3 py-2 text-xs rounded-lg hover:bg-blue-500/10 focus:bg-blue-500/15 text-blue-400 focus:text-blue-300 cursor-pointer transition-colors"
                                >
                                    <span className="font-medium">انتقال به در انتظار پاسخ</span>
                                    <Clock className="w-4 h-4" />
                                </DropdownMenuItem>
                            )}

                            {ticket?.status === 'WAITING' && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusTicket(TicketStatus.RESOLVED)}
                                        className="flex items-center justify-between text-right px-3 py-2 text-xs rounded-lg hover:bg-green-500/10 focus:bg-green-500/15 text-green-400 focus:text-green-300 cursor-pointer transition-colors"
                                    >
                                        <span className="font-medium">حل کردن تیکت</span>
                                        <CheckCircle className="w-4 h-4" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusTicket(TicketStatus.CLOSED)}
                                        className="flex items-center justify-between text-right px-3 py-2 text-xs rounded-lg hover:bg-rose-500/10 focus:bg-rose-500/15 text-rose-400 focus:text-rose-300 cursor-pointer transition-colors"
                                    >
                                        <span className="font-medium">بستن تیکت</span>
                                        <XCircle className="w-4 h-4" />
                                    </DropdownMenuItem>
                                </>
                            )}

                            {ticket?.status === 'RESOLVED' && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusTicket(TicketStatus.CLOSED)}
                                        className="flex items-center justify-between text-right px-3 py-2 text-xs rounded-lg hover:bg-rose-500/10 focus:bg-rose-500/15 text-rose-400 focus:text-rose-300 cursor-pointer transition-colors"
                                    >
                                        <span className="font-medium">بستن تیکت</span>
                                        <XCircle className="w-4 h-4" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusTicket(TicketStatus.WAITING)}
                                        className="flex items-center justify-between text-right px-3 py-2 text-xs rounded-lg hover:bg-blue-500/10 focus:bg-blue-500/15 text-blue-400 focus:text-blue-300 cursor-pointer transition-colors"
                                    >
                                        <span className="font-medium">بازگشت به در انتظار پاسخ</span>
                                        <Undo2 className="w-4 h-4" />
                                    </DropdownMenuItem>
                                </>
                            )}

                            {ticket?.status === 'CLOSED' && (
                                <DropdownMenuItem
                                    onClick={() => handleStatusTicket(TicketStatus.WAITING)}
                                    className="flex items-center justify-between text-right px-3 py-2 text-xs rounded-lg hover:bg-blue-500/10 focus:bg-blue-500/15 text-blue-400 focus:text-blue-300 cursor-pointer transition-colors"
                                >
                                    <span className="font-medium">باز کردن مجدد تیکت</span>
                                    <Undo2 className="w-4 h-4" />
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold line-clamp-1">{ticket.title}</h2>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {ticket.trackingCode}
                            </span>
                            <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                <Badge
                                    variant="outline"
                                    className={priorityColors[ticket.priority]}
                                >
                                    {priorityLabels[ticket.priority]}
                                </Badge>
                            </span>
                            <span className={`flex items-center gap-1 ${statusConfig[ticket.status].color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig[ticket.status].label}
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleString(tCommon('lan'))}
                    </div>
                    <CustomButton
                        onClick={() => router.back()}
                        color="icon"
                        size="sm"
                        iconEnd={<ArrowLeft className="w-4 h-4" />}
                        tooltip="بازگشت"
                    />
                </div>
            </div>
            <ChatPage isMe="admin" onSubmit={onSubmit} openChat={true} isPending={isFetching} pendinBtn={isPending} ticketData={ticket.ticketMessages} />
        </div>
    )
}
