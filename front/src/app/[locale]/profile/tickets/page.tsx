'use client';

import CustomButton from "@/components/CustomButton";
import { useTickets, useMarkTicketAsRead, useCreateTicket } from "@/hooks/ticket.hook";
import { TicketStatus, TicketPriority } from "@/services/ticket.service";
import { useRouter } from "@/i18n/navigation";
import {
  MessageSquare,
  Plus,
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Circle,
  Eye,
  EyeOff,
  X,
  MinusSquare,
  Minus,
  SendHorizontal
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { CreateTicketSchema, TicketFormData } from "@/schemas/ticket.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import InputForm from "@/components/inputs/InputForm";
import SelectCustom from "@/components/inputs/SelectCustom";
import MotionWrapper from "@/components/motion/MotionWrapper";
import UploadMedia from "@/components/upload/UploadMedia";
import { useTranslations } from "next-intl";
import PaginationBar from "@/components/admin/PaginationBar";

export default function TicketsPage() {
  const router = useRouter();
  const tCommon = useTranslations('common')
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { mutate: createTicket, isPending } = useCreateTicket();
  const [images, setImages] = useState<string[] | null>(null)
  const { handleSubmit, register, reset, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(CreateTicketSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: TicketPriority.MEDIUM,
    }
  });
  const priority = watch('priority')
  const onSubmit = (data: TicketFormData) => {
    const body = {
      title: data.title,
      orderId: data.orderId || null,
      priority: data.priority,
      content: data.content,
      images: images
    } as any
    createTicket(body, {
      onSuccess: () => {
        reset();
        setImages(null)
        setShowCreateModal(false)
      },
    });
  };
  const { data: tickets, isLoading } = useTickets({});
  const { mutate: markAsRead } = useMarkTicketAsRead();
  const statusConfig = {
    [TicketStatus.PENDING]: {
      icon: Clock,
      label: "در انتظار",
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    },
    [TicketStatus.WAITING]: {
      icon: AlertCircle,
      label: "در انتظار پاسخ",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    },
    [TicketStatus.RESOLVED]: {
      icon: CheckCircle,
      label: "حل شده",
      className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
    },
    [TicketStatus.CLOSED]: {
      icon: XCircle,
      label: "بسته شده",
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
    }
  };

  // اولویت‌ها با رنگ
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-accent rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* هدر */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">تیکت‌های من</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tickets?.pagination.total || 0} تیکت
          </p>
        </div>
        <CustomButton
          color="white"
          name={showCreateModal ? "بستن تیکت" : "تیکت جدید"}
          iconEnd={showCreateModal ? <Minus className="w-5 h-5" /> : <Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(prev => !prev)}
        />
      </div>
      {showCreateModal && (
        <div className="bg-white mb-5 w-full dark:bg-accent rounded-2xl overflow-y-auto shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <MotionWrapper staggerChildren={0.1} preset="slideRight" className="gap-3 flex flex-col">
              <InputForm
                name="title"
                register={register}
                label="عنوان تیکت"
                placeholder="مشکل در پرداخت..."
                error={errors.title}
                required
              />
              <SelectCustom
                children={[
                  { id: 'LOW', name: 'کم' },
                  { id: 'MEDIUM', name: 'متوسط' },
                  { id: 'HIGH', name: 'بالا' },
                  { id: 'URGENT', name: 'فوری' },
                  { id: 'CRITICAL', name: 'بحرانی' },
                ]}
                placeHolder="انتخاب کنید"
                setValue={(res) => setValue('priority', res)}
                value={priority}
                label="اولویت"
                error={errors.priority}
              />
              <InputForm
                name="content"
                register={register}
                label="متن تیکت"
                placeholder="مشکل خود را به طور کامل توضیح دهید..."
                error={errors.content}
                required
                type="textarea"
                rows={5}
              />
              <UploadMedia
                setUrlMedias={(img: any) => setImages(img.map((i: any) => i.key) || [])}
                type="image"
                limit={2}
                helperText="عکس های مرتبط با تیکت خود را ارسال کنید"
              />
              <div className="flex gap-3 pt-4">
                <CustomButton
                  type="submit"
                  name="ارسال تیکت"
                  color="white"
                  isPending={isPending}
                  disabled={isPending}
                  className="flex-1"
                />
                <CustomButton
                  type="button"
                  name="انصراف"
                  color="gray"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
            </MotionWrapper>
          </form>
        </div>
      )}
      {/* لیست تیکت‌ها */}
      {tickets && tickets.tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.tickets.map((ticket) => {
            const StatusIcon = statusConfig[ticket.status].icon;
            return (
              <div
                key={ticket.id}
                onClick={() => router.push(`/profile/tickets/${ticket.id}`)}
                className="group bg-white dark:bg-accent rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-primary/50 transition-all cursor-pointer relative"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!ticket.isUserRead && (
                            <span className="w-2 h-2 rounded-full animate-pulse bg-green-500 " />
                          )}
                          <h3 className="text-base font-semibold line-clamp-1">
                            {ticket.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={priorityColors[ticket.priority]}
                          >
                            {priorityLabels[ticket.priority]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            #{ticket.trackingCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* پایین: اطلاعات تکمیلی */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {new Date(ticket.createdAt).toLocaleString(tCommon('lan'))}
                      </span>
                      <span className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[ticket.status].label}
                      </span>
                      {!ticket.isUserRead && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          1 پیام خوانده نشده
                        </span>
                      )}
                    </div>
                  </div>

                  {/* دکمه‌های عملیاتی */}
                  <div className="flex items-center gap-2">
                    <CustomButton
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/tickets/${ticket.id}`);
                      }}
                      color="iconBlack"
                      size="sm"
                      tooltip="مشاهده جزئیات"
                      iconEnd={<SendHorizontal className="w-4 h-4 -rotate-45" />}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // حالت خالی
        <div className="text-center py-16 bg-accent/20 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium mb-2">هیچ تیکتی ثبت نشده است</h3>
          <p className="text-muted-foreground text-sm mb-4">
            برای ثبت تیکت جدید، دکمه "تیکت جدید" را کلیک کنید
          </p>
          <CustomButton
            onClick={() => setShowCreateModal(true)}
            name="ثبت تیکت جدید"
            color="white"
          />
        </div>
      )}
      <PaginationBar pagination={tickets?.pagination} />
    </div>
  );
}