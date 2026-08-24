import { PaginationType, SearchDefualtType } from "@/lib/api";
import { ticketService, Ticket, TicketMessage, TicketStats, TicketStatus, TicketPriority, CreateTicketDto, UpdateTicketDto, AddMessageDto, AllTickets } from "@/services/ticket.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const TICKET_KEYS = {
  all: ["tickets"] as const,
  lists: () => [...TICKET_KEYS.all, "list"] as const,
  listWithFilters: (filters: Record<string, any>) => [...TICKET_KEYS.lists(), filters] as const,
  details: () => [...TICKET_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TICKET_KEYS.details(), id] as const,
  messages: (id: string) => [...TICKET_KEYS.detail(id), "messages"] as const,
  admin: () => [...TICKET_KEYS.all, "admin"] as const,
  adminFilters: (filters: Record<string, any>) => [...TICKET_KEYS.admin(), filters] as const,
  stats: () => [...TICKET_KEYS.admin(), "stats"] as const,
} as const;

// ============ هوک‌های کاربر ============

export function useTickets(pages: SearchDefualtType) {
  return useQuery<AllTickets>({
    queryKey: TICKET_KEYS.listWithFilters(pages),
    queryFn: () => ticketService.getAll(pages),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTicket(id: string) {
  return useQuery<Ticket>({
    queryKey: TICKET_KEYS.detail(id),
    queryFn: () => ticketService.getOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============ هوک‌های ادمین ============

export function useAdminTickets(filters?: any) {
  return useQuery<AllTickets>({
    queryKey: TICKET_KEYS.adminFilters(filters || {}),
    queryFn: () => ticketService.adminGetAll(filters),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAdminStats() {
  return useQuery<AllTickets>({
    queryKey: TICKET_KEYS.stats(),
    queryFn: () => ticketService.adminGetStats(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============ هوک‌های Mutation ============

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketDto) => ticketService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      toast.success("تیکت با موفقیت ایجاد شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد تیکت"];
      list.forEach((msg: string) => {
        toast.error(msg, { position: "top-center" });
      });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      toast.success("تیکت با موفقیت حذف شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ایجاد تیکت"];
      list.forEach((msg: string) => {
        toast.error(msg, { position: "top-center" });
      });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketDto }) =>
      ticketService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.lists() });
      toast.success("تیکت با موفقیت ویرایش شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ویرایش تیکت"];
      list.forEach((msg: string) => {
        toast.error(msg, { position: "top-center" });
      });
    },
  });
}

export function useMarkTicketAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.lists() });
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در برچسب‌گذاری"];
      list.forEach((msg: string) => {
        toast.error(msg, { position: "top-center" });
      });
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddMessageDto }) =>
      ticketService.addMessage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.messages(variables.id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.lists() });
      toast.success("پیام با موفقیت ارسال شد");
    },
    onError: (error: any) => {
      const messages = error?.response?.data?.message;
      const list = Array.isArray(messages) ? messages : [messages ?? "خطا در ارسال پیام"];
      list.forEach((msg: string) => {
        toast.error(msg, { position: "top-center" });
      });
    },
  });
}