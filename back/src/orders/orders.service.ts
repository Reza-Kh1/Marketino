/**
 * OrdersService - سرویس مدیریت سفارشات
 * ایجاد سفارش، تغییر وضعیت، مدیریت سفارشات فروشنده و ادمین
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * ایجاد سفارش جدید از سبد خرید کاربر
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    // دریافت سبد خرید (includes variant for pricing/stock)    
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { images: true } }, variant: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('سبد خرید خالی است');
    }

    // بررسی موجودی و محاسبه قیمت‌ها (از Variant)
    let subtotal = 0;
    const orderItems = cartItems.map(item => {
      const price = item.variant?.price ?? 0;
      const total = Number(price) * item.quantity;
      subtotal += total;
      return {
        title: item.product.title,
        price,
        quantity: item.quantity,
        total,
        productId: item.productId,
        sellerId: item.product.sellerId,
        sku: item.variant?.sku ?? '',
        variantName: item.variant?.name ?? 'پیش‌فرض',
        image: item.product.images?.[0]?.url || null,
        variantId: item.variantId,
      };
    });

    // بررسی موجودی از طریق Variant
    for (const item of cartItems) {
      const stock = item.variant?.quantity ?? 0;
      if (stock < item.quantity) {
        throw new BadRequestException(`موجودی "${item.product.title}" کافی نیست (موجودی فعلی: ${stock})`);
      }
    }

    // محاسبه تخفیف
    let discountAmount = 0;
    let discountId: string | null = null;

    if (dto.discountCode) {
      const discount = await this.prisma.discountCode.findUnique({ where: { code: dto.discountCode } });
      if (discount && discount.isActive && new Date() >= discount.startsAt && new Date() <= discount.endsAt) {
        if (discount.usageLimit === 0 || discount.usedCount < discount.usageLimit) {
          if (subtotal >= discount.minOrderAmount) {
            if (discount.type === 'percentage') {
              discountAmount = subtotal * (discount.value / 100);
              if (discount.maxDiscount) discountAmount = Math.min(discountAmount, discount.maxDiscount);
            } else {
              discountAmount = discount.value;
            }
            discountId = discount.id;
            await this.prisma.discountCode.update({
              where: { id: discount.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }
    }

    const shippingCost = 0; // TODO: محاسبه هزینه ارسال
    const total = subtotal - discountAmount + shippingCost;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // ایجاد سفارش + کاهش موجودی + پاک کردن سبد — همه در یک تراکنشن
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          shippingCost,
          discountAmount,
          total,
          addressId: dto.addressId || undefined,
          shippingAddress: dto.shippingAddress,
          shippingCity: dto.shippingCity,
          shippingProvince: dto.shippingProvince,
          shippingPostal: dto.shippingPostal,
          shippingPhone: dto.shippingPhone,
          shippingName: dto.shippingName,
          notes: dto.notes,
          paymentMethod: dto.paymentMethod || 'card',
          discountId,
          // items: { create: orderItems },
        },
        include: { items: true },
      });

      // کاهش موجودی Variant — اتمیک با تراکنشن
      for (const item of cartItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }
        // Update product saleCount
        await tx.product.update({
          where: { id: item.productId },
          data: { saleCount: { increment: item.quantity } },
        });
      }

      // خالی کردن سبد خرید
      await tx.cartItem.deleteMany({ where: { userId } });

      return createdOrder;
    });

    // ارسال ایمیل تأیید سفارش (خارج از تراکنشن)
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, username: true } });
      if (user?.email) {
        await this.emailService.sendOrderConfirmationEmail(user.email, {
          orderId: orderNumber,
          customerName: user.username,
          items: orderItems.map(i => ({ name: i.title, quantity: i.quantity, price: Number(i.price) })),
          total,
          orderDate: new Date().toLocaleDateString('fa-IR'),
        }, 'fa');
      }
    } catch (emailErr) {
      // Never fail the order creation due to email failure
      this.logEmailError(emailErr);
    }

    return order;
  }

  /**
   * دریافت سفارشات کاربر
   */
  async getUserOrders(userId: string, query: DefaultQueryDto) {
    const { limit, page = 1, order } = query
    const limitOrder = Number(limit || this.configService.get('limit.orders'))
    const skip = (Number(page) - 1) * limitOrder;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true },
        skip, take: limitOrder, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limitOrder) } };
  }

  /**
   * دریافت یک سفارش با شناسه
   */
  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { id: true, username: true, email: true, firstName: true, lastName: true } } },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return order;
  }

  /**
   * دریافت سفارشات فروشنده (آیتم‌هایی که محصولاتش در آنهاست)
   */
  async getSellerOrders(sellerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: { sellerId },
        include: { order: { include: { user: { select: { username: true, firstName: true, lastName: true } } } } },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.orderItem.count({ where: { sellerId } }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * دریافت تمام سفارشات - ادمین
   */
  async getAllOrders(status?: string, page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true, user: { select: { username: true, firstName: true, lastName: true } } },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * تغییر وضعیت سفارش - فروشنده یا ادمین
   */
  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(dto.status)) throw new BadRequestException('وضعیت نامعتبر');

    const data: any = { status: dto.status };
    if (dto.trackingCode) data.trackingCode = dto.trackingCode;
    if (dto.sellerNotes) data.sellerNotes = dto.sellerNotes;
    if (dto.status === 'delivered') data.deliveredAt = new Date();
    if (dto.status === 'cancelled') data.cancelledAt = new Date();

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data,
      include: { items: true, user: { select: { email: true, username: true } } },
    });

    // 📧 ارسال ایمیل تغییر وضعیت
    this.sendOrderStatusEmails(updatedOrder, dto.status).catch(err => this.logEmailError(err));

    return updatedOrder;
  }

  /**
   * لغو سفارش توسط خریدار
   */
  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    if (order.userId !== userId) throw new BadRequestException('دسترسی ندارید');
    if (!['pending', 'confirmed'].includes(order.status)) throw new BadRequestException('فقط سفارشات در انتظار قابل لغو هستند');

    // بازگرداندن موجودی Variant
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { increment: item.quantity } },
        });
      }
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { saleCount: { decrement: item.quantity } },
      });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }

  /**
   * آمار سفارشات برای ادمین
   */
  async getOrderStats() {
    const [total, pending, revenue, monthlyRevenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'pending' } }),
      this.prisma.order.aggregate({ _sum: { total: true } }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        _sum: { total: true },
      }),
    ]);
    return { total, pending, totalRevenue: revenue._sum.total || 0, monthlyRevenue: monthlyRevenue._sum.total || 0 };
  }

  /**
   * 🆕 رهگیری سفارش با شماره سفارش (عمومی)
   */
  async trackOrder(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { seller: { select: { storeName: true, id: true } }, product: { select: { id: true, images: { take: 1 } } } } },
        trackingEvents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException('سفارش یافت نشد');

    // Generate tracking timeline
    const timeline = this.buildTrackingTimeline(order);

    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingCode: order.trackingCode,
        shippingAddress: order.shippingAddress,
        shippingName: order.shippingName,
        shippingPhone: order.shippingPhone,
        shippingCity: order.shippingCity,
        total: order.total,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        items: order.items,
      },
      timeline,
    };
  }

  /**
   * 🆕 رهگیری سفارش با آیدی (کاربر لاگین شده)
   */
  async trackOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { seller: { select: { storeName: true, id: true } }, product: { select: { id: true, images: { take: 1 } } } } },
        trackingEvents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException('سفارش یافت نشد');
    // Allow both buyer and seller to track
    // Check if user is buyer or seller
    const isBuyer = order.userId === userId;
    const isSeller = order.items.some(item => item.sellerId === userId);
    if (!isBuyer && !isSeller) throw new NotFoundException('دسترسی ندارید');

    const timeline = this.buildTrackingTimeline(order);

    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingCode: order.trackingCode,
        shippingAddress: order.shippingAddress,
        shippingName: order.shippingName,
        shippingPhone: order.shippingPhone,
        shippingCity: order.shippingCity,
        total: order.total,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        items: order.items,
      },
      timeline,
    };
  }

  /**
   * ساخت تایم‌لاین رهگیری سفارش
   */
  private buildTrackingTimeline(order: any) {
    const statusSteps = [
      { key: 'pending', label: 'در انتظار تأیید', labelEn: 'Pending', icon: 'clock' },
      { key: 'confirmed', label: 'تأیید شده', labelEn: 'Confirmed', icon: 'check' },
      { key: 'processing', label: 'در حال پردازش', labelEn: 'Processing', icon: 'package' },
      { key: 'shipped', label: 'ارسال شده', labelEn: 'Shipped', icon: 'truck' },
      { key: 'in_transit', label: 'در حال حمل', labelEn: 'In Transit', icon: 'truck' },
      { key: 'delivered', label: 'تحویل داده شد', labelEn: 'Delivered', icon: 'home' },
    ];

    const orderStatusIndex = statusSteps.findIndex(s => s.key === order.status);

    const timeline = statusSteps.map((step, index) => {
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
      if (index < orderStatusIndex) status = 'completed';
      else if (index === orderStatusIndex) status = 'current';

      // Find matching tracking event
      const event = order.trackingEvents?.find((e: any) => e.status === step.key);

      return {
        ...step,
        status,
        date: event?.createdAt || (status === 'completed' ? order.createdAt : null),
        location: event?.location || null,
        description: event?.description || null,
      };
    });

    return timeline;
  }

  /**
   * 🆕 ایجاد پرداخت برای سفارش
   */
  async createPayment(orderId: string, dto: { method: string; gatewayRef?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        method: dto.method as any,
        gatewayRef: dto.gatewayRef || null,
        status: 'pending',
      },
    });

    return payment;
  }

  /**
   * 🆕 تأیید پرداخت
   */
  async confirmPayment(paymentId: string, gatewayRef?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('پرداخت یافت نشد');

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'paid',
        gatewayRef: gatewayRef || payment.gatewayRef,
        paidAt: new Date(),
      },
      include: { order: { include: { items: true } } },
    });

    // Update order payment status
    await this.prisma.order.update({
      where: { id: updated.orderId },
      data: { paymentStatus: 'paid' },
    });

    return updated;
  }

  /**
   * 🆕 دریافت پرداخت‌های سفارش
   */
  async getOrderPayments(orderId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return payments;
  }

  /**
   * 🆕 ایجاد درخواست مرجوعی
   */
  async createRefund(orderId: string, userId: string, dto: { reason: string }) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('سفارش یافت نشد یا دسترسی ندارید');

    if (order.status !== 'delivered') {
      throw new BadRequestException('فقط سفارشات تحویل داده شده قابل مرجوع هستند');
    }

    // اگر مرجوع قبلی وجود دارد
    const existingRefund = await this.prisma.refund.findUnique({ where: { orderId } });
    if (existingRefund) {
      throw new BadRequestException('این سفارش قبلاً مرجوع شده است');
    }

    const refund = await this.prisma.refund.create({
      data: {
        orderId,
        amount: order.total,
        reason: dto.reason,
        status: 'pending',
      },
      include: { order: { include: { items: true } } },
    });

    return refund;
  }

  /**
   * 🆕 تأیید/پردازش مرجوعی توسط ادمین
   */
  async processRefund(refundId: string, status: 'paid' | 'cancelled') {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: true },
    });
    if (!refund) throw new NotFoundException('درخواست مرجوعی یافت نشد');

    const updated = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status,
        processedAt: status === 'paid' ? new Date() : undefined,
      },
    });

    // اگر پرداخت شد، موجودی کیف پول کاربر اضافه شود
    if (status === 'paid') {
      await this.prisma.walletTransaction.create({
        data: {
          userId: refund.order.userId,
          type: 'refund',
          amount: refund.amount,
          balanceBefore: 0,
          balanceAfter: 0,
          description: `برگشت وجه سفارش ${refund.order.orderNumber}`,
          status: 'completed',
          reference: refund.order.orderNumber,
        },
      });
    }

    return updated;
  }

  /**
   * 🆕 لیست مرجوعی‌های کاربر
   */
  async getUserRefunds(userId: string) {
    const refunds = await this.prisma.refund.findMany({
      where: { order: { userId } },
      include: { order: { select: { orderNumber: true, total: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return refunds;
  }

  /**
   * 🆕 ارسال ایمیل‌های تغییر وضعیت سفارش
   */
  private async sendOrderStatusEmails(order: any, newStatus: string): Promise<void> {
    const userEmail = order.user?.email;
    const username = order.user?.username ?? 'کاربر';
    if (!userEmail) return;

    // Always send status update email
    await this.emailService.sendOrderStatusEmail(userEmail, order.orderNumber, username, newStatus, 'fa');

    // If shipped, also send shipping notification with tracking code
    if (newStatus === 'shipped') {
      await this.emailService.sendShippingEmail(userEmail, {
        orderId: order.orderNumber,
        customerName: username,
        trackingNumber: order.trackingCode || '-',
      }, 'fa');
    }
  }

  /** Log email failures without affecting business logic */
  private logEmailError(err: unknown): void {
    console.error('[OrdersService] ⚠ Email notification failed:', (err as Error)?.message ?? err);
  }
}
