/**
 * NotificationsService - سرویس اطلاع‌رسانی‌ها
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) { }

  /** دریافت اطلاع‌رسانی‌های کاربر */
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, unreadCount, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /** علامت‌گذاری یک اطلاع‌رسانی به عنوان خوانده شده */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!notification) throw new NotFoundException('اطلاع‌رسانی یافت نشد');
    return this.prisma.notification.update({ where: { id: notificationId }, data: { isRead: true, readAt: new Date() } });
  }

  /** علامت‌گذاری همه به عنوان خوانده شده */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
    return { success: true };
  }

  /** ایجاد اطلاع‌رسانی جدید */
  async createNotification(data: { userId: string; type: NotificationType; title: string; body: string; link?: string; referenceType?: string; referenceId?: string }) {
    return this.prisma.notification.create({ data });
  }

  /** تعداد اطلاع‌رسانی‌های خوانده نشده */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }
}
