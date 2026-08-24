import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma, StoreStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateStoreDto,
  CreateStoreReviewDto,
  SearchAdminStore,
  SearchUserStore,
  SortOptionStore,
  UpdateStoreDto,
  UpdateStoreStatusDto,
} from './dto/store.dto'
import { ConfigService } from '@nestjs/config'
import pagination from '@/common/utils/pagination'
import { productSelector } from '@/products/products.service'

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) { }

  private buildStoreOrderBy(sortBy: SortOptionStore): Prisma.StoreOrderByWithRelationInput {
    switch (sortBy) {
      case SortOptionStore.OLDEST:
        return { createdAt: 'asc' };
      case SortOptionStore.NEWEST:
        return { createdAt: 'desc' };
      case SortOptionStore.BEST_SELLING:
        return { rating: { saleCount: 'desc' } };
      case SortOptionStore.BAD_SELLING:
        return { rating: { saleCount: 'asc' } };
      case SortOptionStore.MORE_REVIEWS:
        return { rating: { totalReviews: 'desc' } };
      case SortOptionStore.LOW_REVIEWS:
        return { rating: { totalReviews: 'asc' } };
      case SortOptionStore.MORE_RATE:
        return { rating: { avgRating: 'desc' } };
      case SortOptionStore.LOW_RATE:
        return { rating: { avgRating: 'asc' } };
      case SortOptionStore.MORE_QUALITY:
        return { rating: { productQuality: 'desc' } };
      case SortOptionStore.LOW_QUALITY:
        return { rating: { productQuality: 'asc' } };
      case SortOptionStore.BEST_RESPONSE_RATE:
        return { rating: { responseRate: 'desc' } };
      case SortOptionStore.LOW_RESPONSE_RATE:
        return { rating: { responseRate: 'asc' } };
      case SortOptionStore.LOW_ANSWERED:
        return { rating: { answeredResponses: 'asc' } };
      case SortOptionStore.MORE_PRODUCTS:
        return { rating: { productCount: 'desc' } };
      case SortOptionStore.LOW_PRODUCTS:
        return { rating: { productCount: 'asc' } };
      default:
        return { createdAt: 'desc' };
    }
  }

  async getStoreAdmin(query: SearchAdminStore) {
    const { search, page = 1, sortBy = SortOptionStore.NEWEST, isActive, isVerified, status } = query;
    const limit = Number(query.limit) || Number(this.configService.get('limit.store'));
    const skip = (page - 1) * limit;
    const where: Prisma.StoreWhereInput = {
      ...(search
        ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { nameEn: { contains: search as string, mode: 'insensitive' } },
          ],
        }
        : {}),
      ...(status !== undefined ? { status } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(isVerified !== undefined ? { isVerified } : {}),
    };
    const orderBy = this.buildStoreOrderBy(sortBy);
    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          nameEn: true,
          slug: true,
          logo: true,
          status: true,
          statusReason: true,
          isActive: true,
          isVerified: true,
          businessType: true,
          commissionRate: true,
          province: true,
          city: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: { id: true, username: true },
          },
          rating: {
            select: {
              avgRating: true,
              totalReviews: true,
              productQuality: true,
              answeredResponses: true,
              totalResponseRequests: true,
              responseRate: true,
              responseTime: true,
              saleCount: true,
            },
          },
        },
      }),
      this.prisma.store.count({ where }),
    ]);
    return {
      stores,
      pagination: pagination(total, page, limit),
    };
  }

  async getStoreUsers(query: SearchUserStore) {
    const { search, page = 1, sortBy = SortOptionStore.NEWEST, forSelect } = query;
    const limit = Number(query.limit) || Number(this.configService.get('limit.store'));
    const skip = (page - 1) * limit;
    if (forSelect === 'true') {
      return this.prisma.store.findMany({
        where: { isActive: true, status: 'approved' },
        select: {
          name: true, nameEn: true, id: true,
        }
      })
    }
    const where: Prisma.StoreWhereInput = {
      ...(search
        ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { nameEn: { contains: search as string, mode: 'insensitive' } },
          ],
        }
        : {}),
      status: StoreStatus.approved
    };
    const orderBy = this.buildStoreOrderBy(sortBy);
    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          nameEn: true,
          slug: true,
          banner: true,
          isVerified: true,
          logo: true,
          businessType: true,
          province: true,
          city: true,
          createdAt: true,
          updatedAt: true,
          rating: {
            select: {
              avgRating: true,
              totalReviews: true,
              responseRate: true,
              saleCount: true,
            },
          },
        },
      }),
      this.prisma.store.count({ where }),
    ]);
    return {
      stores,
      pagination: pagination(total, page, limit),
    };

  }

  async createStore(ownerId: string, dto: CreateStoreDto) {
    const existingStore = await this.prisma.store.findUnique({
      where: { ownerId },
      select: { id: true },
    })

    if (existingStore) {
      throw new BadRequestException('User already has a store')
    }

    const slugExists = await this.prisma.store.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    })

    if (slugExists) {
      throw new BadRequestException('Store slug already exists')
    }

    return this.prisma.store.create({
      data: {
        ...dto,
        ownerId,
        status: StoreStatus.pending,
        isActive: false,
        isVerified: false,
        commissionRate: 0,
        rating: { create: {} }
      },
    })
  }

  async getStore(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        rating: true,
        products: {
          select: productSelector,
          take: 6,
          orderBy: { createdAt: 'desc' }
        },
        storeReview: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
    })
    if (!store) {
      throw new NotFoundException('Store not found')
    }
    return store
  }

  async updateStore(id: string, dto: UpdateStoreDto) {
    return this.prisma.store.update({
      where: { id },
      data: dto,
    })
  }

  async updateStoreStatus(
    id: string,
    dto: UpdateStoreStatusDto,
  ) {
    const isApproved = dto.status === StoreStatus.approved

    return this.prisma.store.update({
      where: { id },
      data: {
        status: dto.status,
        statusReason: dto.statusReason,
        isActive: isApproved,
      },
    })
  }

  // -------------------------------------------------------
  // Store Review
  // -------------------------------------------------------

  async createStoreReview(
    userId: string,
    storeId: string,
    dto: CreateStoreReviewDto,
  ) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    })

    if (!store) {
      throw new NotFoundException('Store not found')
    }

    return this.prisma.storeReview.create({
      data: {
        userId,
        storeId,
        rating: dto.rating,
        body: dto.body,
        productQuality: dto.productQuality,
        status: StoreStatus.pending,
      },
    })
  }

  /**
   * Approve Store Review
   *
   * فقط Reviewهای approved وارد:
   * - avgRating
   * - totalReviews
   * - productQuality
   * می‌شوند.
   *
   * اگر Review قبلاً پاسخ داشته باشد، همان لحظه
   * Response Statistics هم وارد محاسبه می‌شود.
   */
  async approveStoreReview(reviewId: string) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.storeReview.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          storeId: true,
          status: true,
          rating: true,
          productQuality: true,
          answerAt: true,
          createdAt: true,
          answerReview: true,
        },
      })

      if (!review) {
        throw new NotFoundException('Store review not found')
      }

      if (review.status === StoreStatus.approved) {
        return review
      }

      const approvedReview = await tx.storeReview.update({
        where: { id: reviewId },
        data: {
          status: StoreStatus.approved,
        },
      })

      await this.recalculateRatingAfterReviewApproval(tx, review)

      return approvedReview
    })
  }

  /**
   * Reject Store Review
   *
   * اگر Review قبلاً approved بوده:
   * آمار مربوط به همان Review از StoreRating برگردانده می‌شود.
   */
  async rejectStoreReview(
    reviewId: string,
    statusReason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.storeReview.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          storeId: true,
          status: true,
          rating: true,
          productQuality: true,
          answerAt: true,
          createdAt: true,
          answerReview: true,
        },
      })

      if (!review) {
        throw new NotFoundException('Store review not found')
      }

      if (review.status === StoreStatus.rejected) {
        return review
      }

      if (review.status === StoreStatus.approved) {
        await this.removeReviewFromRating(tx, review)
      }

      return tx.storeReview.update({
        where: { id: reviewId },
        data: {
          status: StoreStatus.rejected,
        },
      })
    })
  }

  /**
   * فروشنده پاسخ Review را ثبت می‌کند.
   *
   * این تابع فقط Rating را زمانی تغییر می‌دهد
   * که Review قبلاً approved باشد.
   */
  async answerStoreReview(
    reviewId: string,
    answerReview: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.storeReview.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          storeId: true,
          status: true,
          answerReview: true,
          answerAt: true,
          createdAt: true,
        },
      })

      if (!review) {
        throw new NotFoundException('Store review not found')
      }

      if (review.answerReview) {
        throw new BadRequestException(
          'Store review has already been answered',
        )
      }

      const answerAt = new Date()

      const updatedReview = await tx.storeReview.update({
        where: { id: reviewId },
        data: {
          answerReview,
          answerAt,
        },
      })

      // Review هنوز تأیید نشده.
      // پس Response Statistics نباید تغییر کند.
      if (review.status !== StoreStatus.approved) {
        return updatedReview
      }

      const responseTime = this.getResponseTime(
        review.createdAt,
        answerAt,
      )

      await this.incrementResponseStats(
        tx,
        review.storeId,
        responseTime,
      )

      return updatedReview
    })
  }

  // -------------------------------------------------------
  // Qna Response
  // -------------------------------------------------------

  /**
   * این تابع را QnaService بعد از ساخت پاسخ فروشنده صدا می‌زند.
   *
   * فقط replyId لازم است.
   *
   * ساختار Qna:
   *
   * question
   *   id = A
   *   parentId = null
   *
   * seller reply
   *   id = B
   *   parentId = A
   *
   * تابع از replyId به question می‌رسد.
   */
  async registerQnaResponse(replyId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reply = await tx.qna.findUnique({
        where: { id: replyId },
        select: {
          id: true,
          parentId: true,
          role: true,
          createdAt: true,
          parent: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              product: {
                select: {
                  storeId: true,
                },
              },
            },
          },
        },
      })

      if (!reply || !reply.parent) {
        throw new NotFoundException('Qna reply not found')
      }

      /**
       * QnaService خودش seller بودن را چک می‌کند.
       * اینجا فقط ساختار پاسخ را بررسی می‌کنیم.
       */
      if (reply.role !== 'seller') {
        throw new BadRequestException(
          'Qna reply is not from seller',
        )
      }

      const question = reply.parent

      /**
       * Question باید approved باشد.
       */
      if (question.status !== 'approved') {
        return {
          counted: false,
          reason: 'Qna is not approved',
        }
      }

      if (!question.product.storeId) {
        throw new BadRequestException(
          'Product does not belong to a store',
        )
      }

      const responseTime = this.getResponseTime(
        question.createdAt,
        reply.createdAt,
      )

      await this.incrementResponseStats(
        tx,
        question.product.storeId,
        responseTime,
      )

      return {
        counted: true,
        responseTime,
      }
    })
  }

  /**
   * وقتی سؤال Qna approved می‌شود.
   *
   * اگر قبلاً فروشنده پاسخ داده باشد،
   * همان پاسخ باید وارد Response Statistics شود.
   */
  async approveQna(qnaId: string) {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.qna.findUnique({
        where: { id: qnaId },
        select: {
          id: true,
          parentId: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              storeId: true,
            },
          },
          replies: {
            where: {
              role: 'seller',
            },
            orderBy: {
              createdAt: 'asc',
            },
            take: 1,
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      })

      if (!question) {
        throw new NotFoundException('Qna not found')
      }

      if (question.status === 'approved') {
        return question
      }

      const updated = await tx.qna.update({
        where: { id: qnaId },
        data: {
          status: 'approved',
        },
      })

      /**
       * اگر seller قبلاً جواب داده باشد،
       * حالا که سؤال approved شده باید محاسبه شود.
       */
      const sellerReply = question.replies[0]

      if (sellerReply && question.product.storeId) {
        const responseTime = this.getResponseTime(
          question.createdAt,
          sellerReply.createdAt,
        )

        await this.incrementResponseStats(
          tx,
          question.product.storeId,
          responseTime,
        )
      }

      return updated
    })
  }

  /**
   * Reject Qna
   *
   * اگر قبلاً approved بوده و پاسخ فروشنده داشته،
   * آمار Response باید برگردد.
   */
  async rejectQna(qnaId: string) {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.qna.findUnique({
        where: { id: qnaId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              storeId: true,
            },
          },
          replies: {
            where: {
              role: 'seller',
            },
            orderBy: {
              createdAt: 'asc',
            },
            take: 1,
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      })

      if (!question) {
        throw new NotFoundException('Qna not found')
      }

      if (question.status === 'rejected') {
        return question
      }

      if (
        question.status === 'approved' &&
        question.replies[0] &&
        question.product.storeId
      ) {
        const responseTime = this.getResponseTime(
          question.createdAt,
          question.replies[0].createdAt,
        )

        await this.decrementResponseStats(
          tx,
          question.product.storeId,
          responseTime,
        )
      }

      return tx.qna.update({
        where: { id: qnaId },
        data: {
          status: 'rejected',
        },
      })
    })
  }

  // -------------------------------------------------------
  // Rating
  // -------------------------------------------------------

  /**
   * این متد Public Controller ندارد.
   *
   * StoreRating مستقیماً Update نمی‌شود.
   */
  private async incrementResponseStats(
    tx: Prisma.TransactionClient,
    storeId: string,
    responseTime: number,
  ) {
    const rating = await tx.storeRating.upsert({
      where: {
        storeId: storeId,
      },
      create: {
        storeId: storeId,
        totalResponseRequests: 1,
        answeredResponses: 1,
        totalResponseTime: responseTime,
        responseRate: 100,
        responseTime: responseTime,
      },
      update: {
        totalResponseRequests: {
          increment: 1,
        },
        answeredResponses: {
          increment: 1,
        },
        totalResponseTime: {
          increment: responseTime,
        },
      },
      select: {
        totalResponseRequests: true,
        answeredResponses: true,
        totalResponseTime: true,
      },
    })

    await this.updateResponseValues(tx, storeId, rating)
  }

  /**
   * برای Qna/Review جدیدی که هنوز جواب داده نشده.
   *
   * مثلاً User یک Review approved ثبت می‌کند.
   */
  private async incrementResponseRequest(
    tx: Prisma.TransactionClient,
    storeId: string,
  ) {
    const rating = await tx.storeRating.upsert({
      where: {
        storeId: storeId,
      },
      create: {
        storeId: storeId,
        totalResponseRequests: 1,
        answeredResponses: 0,
        totalResponseTime: 0,
        responseRate: 0,
        responseTime: 0,
      },
      update: {
        totalResponseRequests: {
          increment: 1,
        },
      },
      select: {
        totalResponseRequests: true,
        answeredResponses: true,
        totalResponseTime: true,
      },
    })

    await this.updateResponseValues(tx, storeId, rating)
  }

  private async decrementResponseStats(
    tx: Prisma.TransactionClient,
    storeId: string,
    responseTime: number,
  ) {
    const rating = await tx.storeRating.update({
      where: {
        storeId: storeId,
      },
      data: {
        totalResponseRequests: {
          decrement: 1,
        },
        answeredResponses: {
          decrement: 1,
        },
        totalResponseTime: {
          decrement: responseTime,
        },
      },
      select: {
        totalResponseRequests: true,
        answeredResponses: true,
        totalResponseTime: true,
      },
    })

    await this.updateResponseValues(tx, storeId, rating)
  }

  private async updateResponseValues(
    tx: Prisma.TransactionClient,
    storeId: string,
    data: {
      totalResponseRequests: number
      answeredResponses: number
      totalResponseTime: number
    },
  ) {
    const responseRate =
      data.totalResponseRequests > 0
        ? (data.answeredResponses /
          data.totalResponseRequests) *
        100
        : 100

    const responseTime =
      data.answeredResponses > 0
        ? data.totalResponseTime / data.answeredResponses
        : 0

    await tx.storeRating.update({
      where: {
        storeId: storeId,
      },
      data: {
        responseRate,
        responseTime,
      },
    })
  }

  // -------------------------------------------------------
  // Review Rating
  // -------------------------------------------------------

  private async recalculateRatingAfterReviewApproval(
    tx: Prisma.TransactionClient,
    review: {
      storeId: string
      rating: number
      productQuality: number | null
      answerAt: Date | null
      createdAt: Date
    },
  ) {
    const current = await tx.storeRating.findUnique({
      where: {
        storeId: review.storeId,
      },
      select: {
        avgRating: true,
        totalReviews: true,
        productQuality: true,
      },
    })

    const totalReviews = (current?.totalReviews ?? 0) + 1

    const currentRatingTotal =
      (current?.avgRating ?? 0) *
      (current?.totalReviews ?? 0)

    const avgRating =
      (currentRatingTotal + review.rating) /
      totalReviews

    let productQuality = current?.productQuality ?? 5

    if (review.productQuality !== null) {
      const oldQualityCount = await tx.storeReview.count({
        where: {
          storeId: review.storeId,
          status: StoreStatus.approved,
          productQuality: {
            not: null,
          },
        },
      })

      const oldQualityTotal =
        productQuality * oldQualityCount

      productQuality =
        (oldQualityTotal + review.productQuality) /
        (oldQualityCount + 1)
    }

    await tx.storeRating.upsert({
      where: {
        storeId: review.storeId,
      },
      create: {
        storeId: review.storeId,
        avgRating,
        totalReviews: 1,
        productQuality:
          review.productQuality ?? 5,
      },
      update: {
        avgRating,
        totalReviews,
        productQuality,
      },
    })

    /**
     * Review approved شده، پس یک request جدید
     * برای Response Statistics داریم.
     */
    await this.incrementResponseRequest(
      tx,
      review.storeId,
    )

    /**
     * اگر قبل از Approval جواب داده شده باشد،
     * پاسخ را هم وارد آمار می‌کنیم.
     */
    if (review.answerAt) {
      const responseTime = this.getResponseTime(
        review.createdAt,
        review.answerAt,
      )

      await this.incrementResponseStats(
        tx,
        review.storeId,
        responseTime,
      )
    }
  }

  private async removeReviewFromRating(
    tx: Prisma.TransactionClient,
    review: {
      storeId: string
      rating: number
      productQuality: number | null
      answerAt: Date | null
      createdAt: Date
    },
  ) {
    const current = await tx.storeRating.findUnique({
      where: {
        storeId: review.storeId,
      },
      select: {
        avgRating: true,
        totalReviews: true,
        productQuality: true,
      },
    })

    if (!current || current.totalReviews <= 0) {
      return
    }

    const totalReviews = current.totalReviews - 1

    const currentRatingTotal =
      current.avgRating * current.totalReviews

    const avgRating =
      totalReviews > 0
        ? (currentRatingTotal - review.rating) /
        totalReviews
        : 0

    let productQuality = current.productQuality

    if (review.productQuality !== null) {
      const qualityReviews = await tx.storeReview.findMany({
        where: {
          storeId: review.storeId,
          status: StoreStatus.approved,
          id: {
            not: review.storeId,
          },
          productQuality: {
            not: null,
          },
        },
        select: {
          productQuality: true,
        },
      })

      if (qualityReviews.length > 0) {
        const totalQuality = qualityReviews.reduce(
          (sum, item) =>
            sum + (item.productQuality ?? 0),
          0,
        )

        productQuality =
          totalQuality / qualityReviews.length
      } else {
        productQuality = 5
      }
    }

    await tx.storeRating.update({
      where: {
        storeId: review.storeId,
      },
      data: {
        avgRating,
        totalReviews,
        productQuality,
      },
    })

    /**
     * Response Statistics
     */
    await this.decrementResponseRequest(
      tx,
      review.storeId,
      review.answerAt
        ? this.getResponseTime(
          review.createdAt,
          review.answerAt,
        )
        : null,
    )
  }

  private async decrementResponseRequest(
    tx: Prisma.TransactionClient,
    storeId: string,
    responseTime: number | null,
  ) {
    const data: Prisma.StoreRatingUpdateInput = {
      totalResponseRequests: {
        decrement: 1,
      },
    }

    if (responseTime !== null) {
      data.answeredResponses = {
        decrement: 1,
      }

      data.totalResponseTime = {
        decrement: responseTime,
      }
    }

    const rating = await tx.storeRating.update({
      where: {
        storeId: storeId,
      },
      data,
      select: {
        totalResponseRequests: true,
        answeredResponses: true,
        totalResponseTime: true,
      },
    })

    await this.updateResponseValues(
      tx,
      storeId,
      rating,
    )
  }

  private getResponseTime(
    createdAt: Date,
    answeredAt: Date,
  ): number {
    return Math.max(
      0,
      (answeredAt.getTime() - createdAt.getTime()) /
      60000,
    )
  }

  // -------------------------------------------------------
  // Sale Count
  // -------------------------------------------------------

  async incrementSaleCount(storeId: string) {
    return this.prisma.storeRating.upsert({
      where: {
        storeId: storeId,
      },
      create: {
        storeId: storeId,
        saleCount: 1,
      },
      update: {
        saleCount: {
          increment: 1,
        },
      },
    })
  }
}