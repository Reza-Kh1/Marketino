import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReviewDto,
  GetReviewsQueryDto,
  ModerateReviewDto,
  AnswerReviewDto,
  ReviewSearchDto,
} from './dto/review.dto';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import pagination from '@/common/utils/pagination';

/** وضعیت‌هایی که «خرید واقعی» محسوب می‌شوند */
const PURCHASED_ORDER_STATUSES = [
  'confirmed',
  'processing',
  'shipped',
  'delivered',
] as const;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * محاسبه و به‌روزرسانی میانگین امتیاز + تعداد نظرات تاییدشده محصول.
   * فقط داخل transaction صدا زده شود.
   */
  private async updateProductRating(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const stats = await tx.review.aggregate({
      where: {
        productId,
        isApproved: true,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = stats._avg.rating
      ? Number(Number(stats._avg.rating).toFixed(1))
      : 0;
    const reviewCount = stats._count.rating || 0;

    await tx.product.update({
      where: { id: productId },
      data: {
        rating: averageRating,
        reviewCount,
      },
    });
  }

  /**
   * Endpoint عمومی برای recalculate اجباری امتیاز محصول
   * (وقتی دیتا out-of-sync شده یا بعد از migration).
   * فقط admin/superAdmin.
   */
  async recalculateProductRating(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    return this.prisma.$transaction(async (tx) => {
      await this.updateProductRating(tx, productId);

      return tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          rating: true,
          reviewCount: true,
        },
      });
    });
  }

  /**
   * دریافت نظرات تاییدشده یک محصول (عمومی)
   */
  async getProductReviews(productId: string, query: GetReviewsQueryDto) {
    const page = Number(query.page) || 1;
    const limit =
      Number(query.limit) ||
      Number(this.configService.get('limit.reviews')) ||
      10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      productId,
      isApproved: true,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          body: true,
          title: true,
          answerReview: true,
          rating: true,
          verifiedPurchase: true,
          variantInfo: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: pagination(total, page, limit),
    };
  }

  /**
   * ثبت نظر جدید
   * - هر کاربر فقط یک بار می‌تواند برای یک محصول نظر بدهد (unique + P2002)
   * - حتی بدون خرید هم می‌تواند نظر بدهد
   * - اگر خرید کرده باشد: verifiedPurchase=true و حداکثر ۲ وریانت + رنگ در variantInfo
   *
   * کوئری خرید: یک findMany با take:2 + select محدود → بدون N+1
   */
  async create(userId: string, dto: CreateReviewDto) {
    // یک کوئری سبک برای تشخیص خرید + گرفتن حداکثر ۲ وریانت
    const purchasedItems = await this.prisma.orderItem.findMany({
      where: {
        productId: dto.productId,
        order: {
          userId,
          status: { in: [...PURCHASED_ORDER_STATUSES] },
        },
      },
      select: {
        name: true,
        colorName: true,
        colorHex: true,
        attributes: true,
        sku: true,
        variantId: true,
        quantity: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 2, // فقط دو وریانت آخر
    });

    const verifiedPurchase = purchasedItems.length > 0;
    const variantInfo = verifiedPurchase
      ? {
          variants: purchasedItems.map((item) => ({
            variantId: item.variantId,
            name: item.name,
            sku: item.sku,
            colorName: item.colorName,
            colorHex: item.colorHex,
            attributes: item.attributes,
            quantity: item.quantity,
          })),
        }
      : Prisma.JsonNull;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // محصول وجود دارد؟
        const product = await tx.product.findUnique({
          where: { id: dto.productId },
          select: { id: true },
        });
        if (!product) throw new NotFoundException('محصول یافت نشد');

        const review = await tx.review.create({
          data: {
            productId: dto.productId,
            userId,
            rating: dto.rating,
            title: dto.title,
            body: dto.body,
            isApproved: false, // همیشه pending تا ادمین/فروشنده تایید کند
            verifiedPurchase,
            variantInfo,
          },
          select: {
            id: true,
            productId: true,
            rating: true,
            title: true,
            body: true,
            verifiedPurchase: true,
            variantInfo: true,
            isApproved: true,
            createdAt: true,
          },
        });

        // چون isApproved=false است، rating محصول هنوز آپدیت نمی‌شود
        return review;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'شما قبلاً برای این محصول نظر ثبت کرده‌اید',
        );
      }
      throw error;
    }
  }

  /**
   * تایید / رد نظر توسط ادمین یا فروشنده
   */
  async moderateReview(reviewId: string, dto: ModerateReviewDto) {
    const isApprovedBoolean =
      dto.isApproved === 'true' || dto.isApproved === '1';

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id: reviewId },
        select: { id: true, productId: true, isApproved: true },
      });

      if (!review) throw new NotFoundException('نظر یافت نشد');

      if (review.isApproved === isApprovedBoolean) {
        return review; // no-op
      }

      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: { isApproved: isApprovedBoolean },
      });

      await this.updateProductRating(tx, review.productId);

      return updatedReview;
    });
  }

  /**
   * پاسخ به نظر
   */
  async answerReview(
    reviewId: string,
    adminId: string,
    dto: AnswerReviewDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

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
   * حذف نظر
   */
  async delete(reviewId: string, userId: string, isAdmin: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          userId: true,
          productId: true,
          isApproved: true,
        },
      });

      if (!review) throw new NotFoundException('نظر یافت نشد');

      if (!isAdmin && review.userId !== userId) {
        throw new ForbiddenException('شما مجاز به حذف این نظر نیستید');
      }

      await tx.review.delete({ where: { id: reviewId } });

      if (review.isApproved) {
        await this.updateProductRating(tx, review.productId);
      }

      return { message: 'نظر با موفقیت حذف شد' };
    });
  }

  /**
   * لیست نظرات برای پنل ادمین
   */
  async getAllReviewsForAdmin(query: ReviewSearchDto) {
    const page = Number(query.page) || 1;
    const limit =
      Number(query.limit) ||
      Number(this.configService.get('limit.reviews')) ||
      10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.isApproved !== undefined && query.isApproved !== '') {
      where.isApproved =
        query.isApproved === 'true' || query.isApproved === '1';
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, title: true, slug: true },
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: pagination(total, page, limit),
    };
  }

  /**
   * لیست نظرات محصولات یک فروشگاه (پنل فروشنده)
   */
  async getAllReviewsForStore(storeId: string, query: ReviewSearchDto) {
    const page = Number(query.page) || 1;
    const limit =
      Number(query.limit) ||
      Number(this.configService.get('limit.reviews')) ||
      10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      product: { storeId },
    };

    if (query.isApproved !== undefined && query.isApproved !== '') {
      where.isApproved =
        query.isApproved === 'true' || query.isApproved === '1';
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, title: true, slug: true },
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: pagination(total, page, limit),
    };
  }
}
