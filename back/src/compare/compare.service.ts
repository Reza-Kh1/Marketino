/**
 * CompareService - سرویس مقایسه محصولات
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompareService {
  constructor(private readonly prisma: PrismaService) {}

  /** دریافت لیست مقایسه کاربر */
  async getUserCompare(userId: string) {
    const items = await this.prisma.compareItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, category: true, store: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { items, count: items.length };
  }

  /** اضافه کردن به لیست مقایسه (حداکثر ۴ محصول) */
  async addItem(userId: string, productId: string) {
    const count = await this.prisma.compareItem.count({ where: { userId } });
    if (count >= 4) throw new BadRequestException('حداکثر ۴ محصول را می‌توانید مقایسه کنید');

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const existing = await this.prisma.compareItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) return existing;

    return this.prisma.compareItem.create({ data: { userId, productId } });
  }

  /** حذف از لیست مقایسه */
  async removeItem(userId: string, productId: string) {
    const item = await this.prisma.compareItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundException('محصول در لیست مقایسه یافت نشد');
    return this.prisma.compareItem.delete({ where: { id: item.id } });
  }

  /** خالی کردن لیست مقایسه */
  async clearCompare(userId: string) {
    return this.prisma.compareItem.deleteMany({ where: { userId } });
  }
}
