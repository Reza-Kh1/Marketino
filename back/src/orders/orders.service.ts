/**
 * OrdersService - سرویس مدیریت سفارشات
 * ایجاد سفارش، تغییر وضعیت، مدیریت سفارشات فروشنده و ادمین
 */
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { Prisma } from '@prisma/client';

export function calculateShippingCost(subtotal: number, method: Prisma.ShippingMethodWhereInput): number {
  if (Number(method.freeThreshold) === 0) return Number(method.cost)
  if (subtotal >= Number(method.freeThreshold)) return 0;
  return Number(method.cost);
}

interface VariantDiscount {
  isActive: boolean;
  value: number;
  type: string; // 'percentage' | 'fixed' | 'amount'
  startsAt?: Date | null;
  endsAt?: Date | null;
  maxDiscount?: number | null;
}

export function getVariantFinalPrice(rawPrice: number, discount: VariantDiscount | null | undefined) {
  const originalPrice = rawPrice;

  if (!discount) {
    return { finalPrice: originalPrice, originalPrice, hasDiscount: false };
  }

  const now = new Date();
  const isValid =
    discount.isActive &&
    (!discount.startsAt || now >= discount.startsAt) &&
    (!discount.endsAt || now <= discount.endsAt);

  if (!isValid) {
    return { finalPrice: originalPrice, originalPrice, hasDiscount: false };
  }

  let finalPrice = originalPrice;
  if (discount.type === 'percentage') {
    const cut = originalPrice * (discount.value / 100);
    finalPrice = originalPrice - (discount.maxDiscount ? Math.min(cut, discount.maxDiscount) : cut);
  } else {
    finalPrice = Math.max(0, originalPrice - discount.value);
  }

  return { finalPrice, originalPrice, hasDiscount: true };
}

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
    const shippingOrder = await this.prisma.shippingMethod.findUnique({ where: { id: dto.shippingMethod } })
    if (!shippingOrder) {
      throw new ForbiddenException('روش ارسال معتبر نیست')
    }
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: { include: { images: true } },
        variant: {
          include: {
            color: true,
            discount: true,
            attributes: { include: { attribute: true } },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('سبد خرید خالی است');
    }

    // ---------------------------------------------------------
    // ۲. آدرس: اگه addressId اومده، باید مالِ همین کاربر باشه —
    //    و منبع حقیقتِ فیلدهای آدرس، خودِ رکورد ذخیره‌شده‌ست نه چیزی که فرانت فرستاده
    // ---------------------------------------------------------
    let resolvedAddress: {
      name: string;
      phone: string;
      city: string;
      province: string;
      address: string;
      postal: string | null;
    };

    if (dto.addressId) {
      const address = await this.prisma.address.findFirst({
        where: { id: dto.addressId, userId },
      });
      if (!address) {
        throw new ForbiddenException('آدرس انتخاب‌شده معتبر نیست');
      }
      resolvedAddress = {
        name: address.fullName,
        phone: address.phone,
        city: address.city,
        province: address.province,
        address: address.address,
        postal: address.postalCode,
      };
    } else {
      resolvedAddress = {
        name: dto.shippingName!,
        phone: dto.shippingPhone!,
        city: dto.shippingCity!,
        province: dto.shippingProvince!,
        address: dto.shippingAddress!,
        postal: dto.shippingPostal ?? null,
      };
    }

    // ---------------------------------------------------------
    // ۳. ساخت snapshot هر آیتم (قیمت، تخفیف variant، رنگ، attributeها)
    // ---------------------------------------------------------
    let subtotal = 0;
    const orderItems = cartItems.map(item => {
      const rawPrice = Number(item.variant?.price ?? 0);
      if (!item.variant?.price) {
        throw new BadRequestException(`قیمت "${item.product.title}" نامعتبر است`);
      }

      const { finalPrice, originalPrice, hasDiscount } = getVariantFinalPrice(rawPrice, item.variant.discount);
      const total = finalPrice * item.quantity;
      subtotal += total;

      return {
        title: item.product.title,
        price: finalPrice,
        originalPrice: hasDiscount ? originalPrice : null,
        quantity: item.quantity,
        total,
        productId: item.productId,
        sellerId: item.product.storeId || '',
        sku: item.variant.sku ?? '',
        variantName: item.variant.name ?? 'پیش‌فرض',
        variantId: item.variantId,
        image: item.product.images?.[0]?.url || null,
        colorName: item.variant.color?.name ?? null,
        colorHex: item.variant.color?.hexCode ?? null,
        attributes: item.variant.attributes.map(a => ({
          key: a.attribute.key,
          label: a.attribute.label,
          value: a.value,
        })),
      };
    });

    // بررسی موجودی — یه پیش‌چک سریع برای UX خوب (خطای زودهنگام قبل از رفتن به تراکنش)
    // منبع حقیقتِ نهایی، چک اتمیک داخل تراکنشه (پایین‌تر)
    for (const item of cartItems) {
      const stock = item.variant?.quantity ?? 0;
      if (stock < item.quantity) {
        throw new BadRequestException(`موجودی "${item.product.title}" کافی نیست (موجودی فعلی: ${stock})`);
      }
    }

    // ---------------------------------------------------------
    // ۴. هزینه ارسال — همیشه سمت سرور حساب می‌شه، به فرانت اعتماد نمی‌کنیم
    // ---------------------------------------------------------
    const shippingCost = calculateShippingCost(subtotal, shippingOrder);

    // ---------------------------------------------------------
    // ۵. اعتبارسنجی کد تخفیف (بدون اعمال هنوز — اعمال اتمیک داخل تراکنش انجام می‌شه)
    // ---------------------------------------------------------
    let discountAmount = 0;
    let discountId: string | null = null;

    if (dto.discountCode) {
      const discount = await this.prisma.discountCode.findUnique({ where: { code: dto.discountCode } });
      const now = new Date();
      const isUsable =
        discount &&
        discount.isActive &&
        now >= discount.startsAt &&
        now <= discount.endsAt &&
        subtotal >= discount.minOrderAmount &&
        (discount.usageLimit === 0 || discount.usedCount < discount.usageLimit);

      if (!isUsable) {
        throw new BadRequestException('کد تخفیف نامعتبر یا منقضی‌شده است');
      }

      discountAmount = discount.type === 'percentage'
        ? Math.min((subtotal * discount.value) / 100, discount.maxDiscount || Infinity)
        : Math.min(discount.value, subtotal);
      discountId = discount.id;
    }

    const total = subtotal - discountAmount + shippingCost;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // ---------------------------------------------------------
    // ۶. تراکنش اصلی — همه‌چیز اتمیک: موجودی، مصرف کد تخفیف، ساخت سفارش، خالی‌کردن سبد
    // ---------------------------------------------------------
    const order = await this.prisma.$transaction(async tx => {
      // کاهش موجودی به‌صورت شرطی و اتمیک — جلوگیری از over-selling در همزمانی
      for (const item of cartItems) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.variantId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new BadRequestException(`موجودی "${item.product.title}" هم‌زمان توسط کاربر دیگری تمام شد`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { saleCount: { increment: item.quantity } },
        });
      }

      // مصرف کد تخفیف — شرطی و اتمیک با raw SQL، چون updateMany نمی‌تونه دو ستون
      // (used_count < usage_limit) رو مستقیم با هم مقایسه کنه
      if (discountId) {
        const updatedRows: number = await tx.$executeRaw`
          UPDATE discount_codes
          SET used_count = used_count + 1
          WHERE id = ${discountId}
            AND (usage_limit = 0 OR used_count < usage_limit)
        `;
        if (updatedRows === 0) {
          throw new BadRequestException('ظرفیت استفاده از این کد تخفیف هم‌زمان تکمیل شد');
        }
      }
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          shippingCost,
          shippingMethodId: shippingOrder.id,
          discountAmount,
          total,
          addressId: dto.addressId || undefined,
          shippingAddress: resolvedAddress.address,
          shippingCity: resolvedAddress.city,
          shippingProvince: resolvedAddress.province,
          shippingPostal: resolvedAddress.postal || undefined,
          shippingPhone: resolvedAddress.phone,
          shippingName: resolvedAddress.name,
          notes: dto.notes,
          paymentMethod: dto.paymentMethod as any,
          discountId,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return createdOrder;
    }, {
      timeout: 10_000,
      maxWait: 5_000,
    });

    // ---------------------------------------------------------
    // ۷. ایمیل تأیید — خارج از تراکنش، هیچ‌وقت سفارش رو fail نمی‌کنه
    // ---------------------------------------------------------
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, username: true } });
      if (user?.email) {
        await this.emailService.sendOrderConfirmationEmail(user.email, {
          orderId: orderNumber,
          customerName: user.username,
          items: orderItems.map(i => ({ name: i.title, quantity: i.quantity, price: i.price })),
          total,
          orderDate: new Date().toLocaleDateString('fa-IR'),
        }, 'fa');
      }
    } catch (emailErr) {
      this.logEmailError(emailErr);
    }

    return order;
  }

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
        items: { include: { product: { select: { id: true, storeId: true, images: { take: 1 } }, include: { store: { select: { name: true, id: true } } } } } },
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
        items: { include: { product: { select: { id: true, storeId: true, images: { take: 1 } }, include: { store: { select: { name: true, id: true } } } } } },
        trackingEvents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException('سفارش یافت نشد');
    // Allow both buyer and seller to track
    // Check if user is buyer or seller
    const isBuyer = order.userId === userId;
    const isSeller = order.items?.some(item => item.sellerId === userId);
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
