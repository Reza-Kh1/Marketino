/**
 * MessagesService - سرویس پیام‌ها و گفتگوها
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** دریافت لیست گفتگوهای کاربر */
  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        buyer: { select: { id: true, username: true, avatar: true, firstName: true, lastName: true } },
        seller: { select: { id: true, username: true, avatar: true, firstName: true, lastName: true, store: { select: { name: true } } } },
        product: { select: { id: true, title: true, slug: true, images: { take: 1 } } },
        _count: { select: { messages: { where: { isRead: false, receiverId: userId } } } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
    return { conversations };
  }

  /** شروع گفتگوی جدید یا یافتن گفتگوی موجود */
  async startConversation(buyerId: string, sellerId: string, productId?: string, message?: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: { buyerId, sellerId, productId: productId || null },
    });

    if (!conversation) {
      const product = productId ? await this.prisma.product.findUnique({ where: { id: productId } }) : null;
      conversation = await this.prisma.conversation.create({
        data: { buyerId, sellerId, productId: productId || null, subject: product?.title || null },
      });
    }

    if (message) {
      await this.prisma.message.create({
        data: { conversationId: conversation.id, senderId: buyerId, receiverId: sellerId, text: message },
      });
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessage: message, lastMessageAt: new Date() },
      });
    }

    return conversation;
  }

  /** دریافت پیام‌های یک گفتگو */
  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('گفتگو یافت نشد');
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) throw new NotFoundException('دسترسی ندارید');

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        include: { sender: { select: { id: true, username: true, avatar: true } } },
        skip, take: limit, orderBy: { createdAt: 'asc' },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    // علامت‌گذاری پیام‌ها به عنوان خوانده شده
    await this.prisma.message.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /** ارسال پیام جدید */
  async sendMessage(conversationId: string, senderId: string, text: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('گفتگو یافت نشد');

    const receiverId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, receiverId, text },
      include: { sender: { select: { id: true, username: true, avatar: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: text, lastMessageAt: new Date(), isRead: false },
    });

    return message;
  }

  /** تعداد پیام‌های خوانده نشده */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({ where: { receiverId: userId, isRead: false } });
    return { count };
  }
}
