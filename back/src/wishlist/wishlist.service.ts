/**
 * WishlistService - سرویس مدیریت علاقه‌مندی‌ها
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /** دریافت لیست علاقه‌مندی‌های کاربر */
  async getUserWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, seller: { select: { storeName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { items, count: items.length };
  }

  /** اضافه کردن به علاقه‌مندی‌ها */
  async addItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) return existing;

    return this.prisma.wishlistItem.create({ data: { userId, productId } });
  }

  /** حذف از علاقه‌مندی‌ها */
  async removeItem(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundException('محصول در علاقه‌مندی‌ها یافت نشد');
    return this.prisma.wishlistItem.delete({ where: { id: item.id } });
  }

  /** بررسی وجود محصول در علاقه‌مندی‌ها */
  async checkItem(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { isWishlisted: !!item };
  }
}
