/**
 * SellerService - سرویس پنل فروشنده
 */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingStatus } from '@prisma/client';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  /** داشبورد فروشنده - آمار کلی */
  async getDashboard(sellerId: string) {
    const [totalProducts, activeProducts, pendingProducts, orders, revenue] = await Promise.all([
      this.prisma.product.count({ where: { sellerId } }),
      this.prisma.product.count({ where: { sellerId, status: 'approved' } }),
      this.prisma.product.count({ where: { sellerId, status: 'pending' } }),
      this.prisma.orderItem.count({ where: { sellerId } }),
      this.prisma.orderItem.aggregate({ where: { sellerId }, _sum: { total: true } }),
    ]);

    // فروش ۳۰ روز اخیر
    const monthlyRevenue = await this.prisma.orderItem.aggregate({
      where: { sellerId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _sum: { total: true },
    });

    // نمودار فروش ۳۰ روز اخیر
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = await this.prisma.orderItem.findMany({
      where: { sellerId, createdAt: { gte: thirtyDaysAgo } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // گروه‌بندی بر اساس روز
    const chartData: { date: string; total: number; count: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = recentOrders.filter(o => o.createdAt.toISOString().split('T')[0] === dateStr);
      chartData.push({ date: dateStr, total: dayOrders.reduce((s, o) => s + o.total, 0), count: dayOrders.length });
    }

    return {
      totalProducts, activeProducts, pendingProducts,
      totalOrders: orders,
      totalRevenue: revenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      chartData,
    };
  }

  /** محصولات فروشنده */
  async getSellerProducts(sellerId: string, status?: string, page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;
    const where: any = { sellerId };
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: { take: 1 }, category: { select: { name: true } } },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /** سفارشات فروشنده */
  async getSellerOrders(sellerId: string, status?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: any = { sellerId };
    if (status) where.order = { status };

    const [items, total] = await Promise.all([
      this.prisma.orderItem.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { username: true, firstName: true, lastName: true } },
              trackingEvents: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
          },
          product: { select: { id: true, title: true, images: { take: 1 } } },
        },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.orderItem.count({ where }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * 🆕 به‌روزرسانی سفارش توسط فروشنده (وضعیت + کد رهگیری)
   */
  async updateSellerOrder(
    sellerId: string,
    orderId: string,
    data: {
      status?: TrackingStatus;
      trackingCode?: string;
      sellerNotes?: string;
      trackingLocation?: string;
      trackingDescription?: string;
    },
  ) {
    // Check that the order belongs to this seller
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { orderId, sellerId },
      include: { order: true },
    });

    if (!orderItem) {
      throw new NotFoundException('سفارش یافت نشد یا متعلق به شما نیست');
    }

    const updateData: any = {};

    if (data.trackingCode) {
      updateData.trackingCode = data.trackingCode;
    }
    if (data.sellerNotes) {
      updateData.sellerNotes = data.sellerNotes;
    }
    if (data.status) {
      updateData.status = data.status;

      // Set delivered date if status is delivered
      if (data.status === 'delivered') {
        updateData.deliveredAt = new Date();
      }
    }

    // Update the order
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Add tracking event if tracking info provided
    if (data.trackingCode || data.trackingLocation || data.trackingDescription) {
      const trackingStatus = data.status || 'processing';

      let description = data.trackingDescription || '';
      if (!description && data.trackingCode) {
        description = `کد رهگیری ${data.trackingCode} ثبت شد`;
      }
      if (!description) {
        const statusMap: Record<string, string> = {
          pending: 'سفارش در انتظار بررسی',
          confirmed: 'سفارش تأیید شد',
          processing: 'سفارش در حال آماده‌سازی',
          shipped: 'سفارش ارسال شد',
          delivered: 'سفارش تحویل داده شد',
          cancelled: 'سفارش لغو شد',
        };
        description = statusMap[trackingStatus] || `وضعیت: ${trackingStatus}`;
      }

      await this.prisma.trackingEvent.create({
        data: {
          orderId,
          status: trackingStatus,
          location: data.trackingLocation || null,
          description,
        },
      });
    }

    // Notify buyer about status update
    await this.prisma.notification.create({
      data: {
        userId: orderItem.order.userId,
        type: 'order',
        title: `بروزرسانی سفارش #${orderItem.order.orderNumber}`,
        body: data.status
          ? `وضعیت سفارش شما به "${data.status}" تغییر کرد`
          : `کد رهگیری برای سفارش شما ثبت شد: ${data.trackingCode || ''}`,
        link: `/orders/${orderId}`,
        referenceType: 'order',
        referenceId: orderId,
      },
    });

    return { success: true, order };
  }

  /** مدیریت موجودی فروشنده (از طریق Variant) */
  async getInventory(sellerId: string) {
    // Get products with their variants for inventory info
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      select: {
        id: true,
        title: true,
        slug: true,
        updatedAt: true,
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            quantity: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Flatten: one entry per variant
    return products.flatMap(p =>
      p.variants.map(v => ({
        productId: p.id,
        productTitle: p.title,
        productSlug: p.slug,
        variantId: v.id,
        variantName: v.name,
        sku: v.sku || '',
        price: v.price ?? 0,
        quantity: v.quantity,
        updatedAt: p.updatedAt,
      }))
    );
  }

  /** بروزرسانی موجودی یک Variant */
  async updateInventory(sellerId: string, productId: string, variantId: string, quantity: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, sellerId },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const variant = product.variants.find((v: any) => v.id === variantId);
    if (!variant) throw new NotFoundException('تنوع محصول یافت نشد');

    if (quantity < 0) throw new BadRequestException('مقدار موجودی نمی‌تواند منفی باشد');

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { quantity },
    });
  }

  /** آنالیتیکس فروشنده */
  async getAnalytics(sellerId: string, period: string = 'month') {
    let startDate: Date;
    const now = new Date();
    switch (period) {
      case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case 'month': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case 'year': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [totalRevenue, orderCount, topProducts] = await Promise.all([
      this.prisma.orderItem.aggregate({ where: { sellerId, createdAt: { gte: startDate } }, _sum: { total: true } }),
      this.prisma.orderItem.count({ where: { sellerId, createdAt: { gte: startDate } } }),
      this.prisma.orderItem.groupBy({ by: ['productId'], where: { sellerId, createdAt: { gte: startDate } }, _sum: { total: true, quantity: true }, orderBy: { _sum: { total: 'desc' } }, take: 5 }),
    ]);

    // Get product names
    const topProductsWithNames = await Promise.all(topProducts.map(async (item) => {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId }, select: { title: true, images: { take: 1 } } });
      return { productId: item.productId, title: product?.title, image: product?.images[0]?.url, totalSales: item._sum.total, quantity: item._sum.quantity };
    }));

    return {
      period,
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders: orderCount,
      topProducts: topProductsWithNames,
    };
  }

  /**
   * 🆕 دریافت رویدادهای رهگیری یک سفارش
   */
  async getTrackingEvents(sellerId: string, orderId: string) {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { orderId, sellerId },
    });

    if (!orderItem) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    const [order, events] = await Promise.all([
      this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true, orderNumber: true, status: true, trackingCode: true,
          shippingAddress: true, shippingName: true, shippingPhone: true,
          createdAt: true, deliveredAt: true,
        },
      }),
      this.prisma.trackingEvent.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { order, events };
  }
}
