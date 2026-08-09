'use client';

import CustomButton from "@/components/CustomButton";
import { useTicket, useAddTicketMessage, useMarkTicketAsRead } from "@/hooks/ticket.hook";
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
    ArrowRight
} from "lucide-react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import ChatPage from "@/components/chat/ChatPage";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
    const { data: ticket, isLoading: ticketLoading } = useTicket(id);
    const { mutate: addMessage, isPending: isSending } = useAddTicketMessage();
    const { mutate: markAsRead } = useMarkTicketAsRead();
    const tCommon = useTranslations('common')
    useEffect(() => {        
        if (!ticket?.isUserRead) {    

            markAsRead(id);
        }
    }, [ticket]);
    const onSubmit = (data: any) => {
        addMessage({
            id,
            data: {
                content: data.message,
                images: data.images || []
            }
        });
    };

    if (ticketLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="h-96 bg-accent rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">تیکت یافت نشد</p>
            </div>
        );
    }

    const StatusIcon = statusConfig[ticket.status].icon;
    return (
        <div className="max-w-4xl pt-3 mx-auto h-[calc(100vh-80px)] flex flex-col">
            {/* هدر چت */}
            <div className="bg-white dark:bg-accent rounded-2xl border border-gray-200 dark:border-gray-700 p-3 mb-3 shadow-sm">
                <div className="flex items-center gap-3">
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
            <ChatPage isMe="buyer" pendinBtn={isSending} onSubmit={onSubmit} openChat={ticket.status === TicketStatus.WAITING} isPending={ticketLoading} ticketData={ticket.ticketMessages} />
        </div>
    );
}