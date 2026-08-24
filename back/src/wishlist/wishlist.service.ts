/**
 * WishlistService - سرویس مدیریت علاقه‌مندی‌ها
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import pagination from '@/common/utils/pagination';
import { ConfigService } from '@nestjs/config';
import { productSelector } from '@/products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,

  ) { }

  /** دریافت لیست علاقه‌مندی‌های کاربر */
  async getUserWishlist(userId: string, page: number) {
    const limit = Number(this.configService.get('limit.wishlists'))
    const skip = (Number(page || 1) - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            select: productSelector,
          }
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wishlistItem.count({ where: { userId } }),
    ]);
    return {
      items: products,
      pagination: pagination(total, page || 1, limit)
    };
  }

  async getAllIds(userId: string) {
    const data = await this.prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } })
    let newArray: string[] = []
    if (data.length) {
      newArray = data.map((item) => item.productId)
    }
    return newArray
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
