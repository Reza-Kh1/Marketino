/**
 * ReviewsService - سرویس مدیریت نظرات
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * دریافت نظرات یک محصول
   */
  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total, avgRating] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, isApproved: true },
        include: { user: { select: { id: true, username: true, avatar: true, firstName: true, lastName: true } } },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { productId, isApproved: true } }),
      this.prisma.review.aggregate({ where: { productId, isApproved: true }, _avg: { rating: true } }),
    ]);
    return { reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, avgRating: avgRating._avg.rating || 0 };
  }

  /**
   * ثبت نظر جدید
   */
  async create(userId: string, dto: CreateReviewDto) {
    // بررسی وجود محصول
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    // بررسی تکراری نبودن نظر
    const existing = await this.prisma.review.findFirst({ where: { userId, productId: dto.productId } });
    if (existing) throw new BadRequestException('شما قبلاً برای این محصول نظر ثبت کرده‌اید');

    const review = await this.prisma.review.create({
      data: { userId, productId: dto.productId, rating: dto.rating, title: dto.title, body: dto.body },
      include: { user: { select: { username: true, avatar: true, firstName: true, lastName: true } } },
    });

    // به‌روزرسانی میانگین امتیاز محصول
    const avgResult = await this.prisma.review.aggregate({
      where: { productId: dto.productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.product.update({
      where: { id: dto.productId },
      data: { rating: avgResult._avg.rating || 0, reviewCount: avgResult._count },
    });

    return review;
  }

  /**
   * حذف نظر
   */
  async delete(reviewId: string, userId: string) {
    const review = await this.prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review) throw new NotFoundException('نظر یافت نشد');
    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
