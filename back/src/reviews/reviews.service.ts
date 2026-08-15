import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReviewDto,
  GetReviewsQueryDto,
  ModerateReviewDto,
  AnswerReviewDto,
} from './dto/review.dto';
import { Prisma } from '@prisma/client';
import { ReviewSearchDto } from './dto/review.search.dto';
import { ConfigService } from '@nestjs/config';
import pagination from '@/common/utils/pagination';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * دریافت نظرات تاییدشده یک محصول (همراه با Paging)
   */
  async getProductReviews(productId: string, query: GetReviewsQueryDto) {
    const page = query.page || 1;
    const limit = Number(query.limit) || Number(this.configService.get('limit.reviews'));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, isApproved: true },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          answerReview: true,
          createdAt: true,
          orderId: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              firstName: true,
              lastName: true,
            },
          },
          answer: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { productId, isApproved: true } }),
    ]);

    const formattedReviews = reviews.map(({ orderId, ...review }) => ({
      ...review,
      isBuyer: Boolean(orderId),
    }));

    return {
      reviews: formattedReviews,
      pagination: pagination(total, page, limit)
    };
  }

  /**
   * ثبت نظر جدید توسط کاربر
   */
  async create(userId: string, dto: CreateReviewDto) {
    const purchasedItem = await this.prisma.orderItem.findFirst({
      where: {
        productId: dto.productId,
        order: {
          userId,
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      },
      select: {
        orderId: true,
      },
    });

    try {
      const review = await this.prisma.review.create({
        data: {
          userId,
          productId: dto.productId,
          rating: dto.rating,
          title: dto.title,
          body: dto.body,
          orderId: purchasedItem?.orderId || null,
          isApproved: false,
        },
      });

      return {
        success: true
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('شما قبلاً برای این محصول نظر ثبت کرده‌اید.');
      }
      throw error;
    }
  }

  /**
   * تایید یا رد نظر توسط ادمین + بروزرسانی امتیاز محصول
   */
  async moderateReview(reviewId: string, dto: ModerateReviewDto) {
    return this.prisma.$transaction(async (tx) => {
      // ۱. دریافت نظر و قفل/بررسی آن داخل خود تراکنش
      const review = await tx.review.findUnique({
        where: { id: reviewId },
        select: { id: true, productId: true, isApproved: true },
      });

      if (!review) throw new NotFoundException('نظر یافت نشد');

      // ۲. اگر وضعیت تایید تغییر نکرده، نیازی به آپدیت دیتابیس و محاسبه مجدد نیست
      if (review.isApproved === dto.isApproved) {
        return review;
      }

      // ۳. آپدیت وضعیت نظر
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: { isApproved: dto.isApproved },
      });

      // ۴. محاسبه مجدد و بهینه میانگین محصول (چون وضعیت تغییر کرده)
      await this.updateProductRating(tx, review.productId);

      return updatedReview;
    });
  }

  async getAllReviewsForAdmin(query: ReviewSearchDto) {
    const page = query.page || 1;
    const limit = Number(query.limit) || Number(this.configService.get('limit.reviews'))
    const skip = (page - 1) * limit;

    // ساخت شرط‌های دینامیک جهت کاهش کوئری‌های بیهوده
    const where: Prisma.ReviewWhereInput = {};
    if (typeof query.isApproved === 'boolean') where.isApproved = query.isApproved;
    if (query.productId) where.productId = query.productId;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          isApproved: true,
          answerReview: true,
          createdAt: true,
          orderId: true,
          product: {
            select: { id: true, title: true, slug: true },
          },
          user: {
            select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
          },
          answer: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: pagination(total, page, limit)
    };
  }

  async getSellerProductReviews(sellerId: string, query: ReviewSearchDto) {
    const page = query.page || 1;
    const limit = Number(query.limit) || Number(this.configService.get('limit.reviews'))
    const skip = (page - 1) * limit;

    // فیلتر فقط روی محصولاتی که sellerId آن‌ها برابر با فروشنده جاری است
    const where: Prisma.ReviewWhereInput = {
      product: {
        sellerId: sellerId,
      },
    };

    if (typeof query.isApproved === 'boolean') where.isApproved = query.isApproved;
    if (query.productId) where.productId = query.productId;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          isApproved: true,
          answerReview: true,
          createdAt: true,
          orderId: true,
          product: {
            select: { id: true, title: true, slug: true },
          },
          user: {
            select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: pagination(total, page, limit)
    };
  }

  /**
   * پاسخ دادن به نظر توسط ادمین/فروشنده
   */
  async answerReview(reviewId: string, adminId: string, dto: AnswerReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('نظر یافت نشد');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        answerReview: dto.answer,
        answerId: adminId,
      },
    });
  }

  /**
   * حذف نظر توسط کاربر یا ادمین
   */
  async delete(reviewId: string, userId: string, isAdmin = false) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('نظر یافت نشد');

    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('شما دسترسی به حذف این نظر را ندارید');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });

      // اگر نظر قبلاً تاییدشده بود، با حذفش باید امتیاز محصول بازمحاسبه شود
      if (review.isApproved) {
        await this.updateProductRating(tx, review.productId);
      }

      return { message: 'نظر با موفقیت حذف شد' };
    });
  }

  /**
   * متد کمکی و بهینه برای محاسبه و به‌روزرسانی سریع امتیاز محصول
   */
  private async updateProductRating(tx: Prisma.TransactionClient, productId: string) {
    const stats = await tx.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
        reviewCount: stats._count.rating,
      },
    });
  }
}