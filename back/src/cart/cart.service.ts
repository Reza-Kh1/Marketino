/**
 * CartService - سرویس مدیریت سبد خرید
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * دریافت سبد خرید کاربر
   */
  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: {
            title: true,
            titleEn: true,
            id: true,
            images: { take: 1, orderBy: { sortOrder: 'asc' } }, seller: { select: { storeName: true } }
          },
        },
        variant: {
          select: {
            discount: { select: { id: true, type: true, value: true, } },
            id: true,
            discountId: true,
            image: true,
            name: true,
            nameEn: true,
            price: true,
            sku: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
      const price = item.variant?.price ?? 0;
      return sum + Number(price) * item.quantity;
    }, 0);

    return { carts: items, totalItems, totalPrice };
  }

  /**
   * اضافه کردن محصول به سبد خرید
   */
  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.status !== 'approved') throw new NotFoundException('محصول یافت نشد');

    // Get default variant for stock check
    const variant = await this.prisma.productVariant.findFirst({
      where: { productId: dto.productId },
      orderBy: { createdAt: 'asc' },
    });
    if (!variant) throw new NotFoundException('محصول تنوع ندارد');
    if (variant.quantity < 1) throw new BadRequestException('محصول ناموجود است');

    const addQty = dto.quantity || 1;

    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });

    if (existing) {
      const newTotal = existing.quantity + addQty;
      if (newTotal > variant.quantity) {
        throw new BadRequestException(`موجودی کافی نیست. موجود فعلی: ${variant.quantity}`);
      }
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newTotal },
        include: { product: { include: { images: { take: 1 } } } },
      });
    }

    if (addQty > variant.quantity) {
      throw new BadRequestException(`موجودی کافی نیست. موجود فعلی: ${variant.quantity}`);
    }

    return this.prisma.cartItem.create({
      data: { userId, productId: dto.productId, variantId: variant.id, quantity: addQty },
      include: { product: { include: { images: { take: 1 } } } },
    });
  }

  /**
   * به‌روزرسانی تعداد یک آیتم (با productId)
   */
  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
      include: { product: true, variant: true },
    });
    if (!item) throw new NotFoundException('آیتم در سبد خرید یافت نشد');

    // Guard against negative quantities
    if (dto.quantity < 0) throw new BadRequestException('تعداد نمی‌تواند منفی باشد');

    if (dto.quantity === 0) {
      return this.prisma.cartItem.delete({ where: { id: item.id } });
    }

    // Check stock limit via variant
    if (dto.quantity > item.variant.quantity) {
      throw new BadRequestException(`موجودی کافی نیست. موجود فعلی: ${item.variant.quantity}`);
    }

    return this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity: dto.quantity } });
  }

  /**
   * حذف یک آیتم از سبد خرید (با productId)
   */
  async removeItem(userId: string, productId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId } } });
    if (!item) throw new NotFoundException('آیتم در سبد خرید یافت نشد');
    return this.prisma.cartItem.delete({ where: { id: item.id } });
  }

  /**
   * خالی کردن کامل سبد خرید
   */
  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }

  /**
   * تعداد آیتم‌های سبد خرید (برای badge)
   */
  async getCartCount(userId: string) {
    const result = await this.prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });
    return { count: result._sum.quantity || 0 };
  }
}