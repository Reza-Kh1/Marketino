import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, StoreStatus } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateStoreDto,
  CreateStoreReviewDto,
  SearchAdminStore,
  SearchAdminStoreReview,
  SearchUserStore,
  SortOptionStore,
  UpdateStoreDto,
  UpdateStoreStatusDto,
} from './dto/store.dto'
import pagination from '@/common/utils/pagination'
import { productSelector } from '@/products/products.service'
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto'

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  private buildStoreOrderBy(
    sortBy: SortOptionStore,
  ): Prisma.StoreOrderByWithRelationInput {
    switch (sortBy) {
      case SortOptionStore.OLDEST:
        return { createdAt: 'asc' }

      case SortOptionStore.NEWEST:
        return { createdAt: 'desc' }

      case SortOptionStore.BEST_SELLING:
        return { rating: { saleCount: 'desc' } }

      case SortOptionStore.BAD_SELLING:
        return { rating: { saleCount: 'asc' } }

      case SortOptionStore.MORE_REVIEWS:
        return { rating: { totalReviews: 'desc' } }

      case SortOptionStore.LOW_REVIEWS:
        return { rating: { totalReviews: 'asc' } }

      case SortOptionStore.MORE_RATE:
        return { rating: { avgRating: 'desc' } }

      case SortOptionStore.LOW_RATE:
        return { rating: { avgRating: 'asc' } }

      case SortOptionStore.MORE_QUALITY:
        return { rating: { productQuality: 'desc' } }

      case SortOptionStore.LOW_QUALITY:
        return { rating: { productQuality: 'asc' } }

      case SortOptionStore.BEST_RESPONSE_RATE:
        return { rating: { responseRate: 'desc' } }

      case SortOptionStore.LOW_RESPONSE_RATE:
        return { rating: { responseRate: 'asc' } }

      case SortOptionStore.LOW_ANSWERED:
        return { rating: { answeredResponses: 'asc' } }

      case SortOptionStore.MORE_PRODUCTS:
        return { rating: { productCount: 'desc' } }

      case SortOptionStore.LOW_PRODUCTS:
        return { rating: { productCount: 'asc' } }

      default:
        return { createdAt: 'desc' }
    }
  }

  async getStoreAdmin(query: SearchAdminStore) {
    const {
      search,
      page = 1,
      sortBy = SortOptionStore.NEWEST,
      isActive,
      isVerified,
      status,
    } = query

    const limit =
      Number(query.limit) ||
      Number(this.configService.get('limit.store'))

    const skip = (page - 1) * limit

    const where: Prisma.StoreWhereInput = {
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            nameEn: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(status !== undefined && { status }),
      ...(isActive !== undefined && { isActive }),
      ...(isVerified !== undefined && { isVerified }),
    }

    const orderBy = this.buildStoreOrderBy(sortBy)

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
            select: {
              id: true,
              username: true,
            },
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
              returnCount: true,
            },
          },
        },
      }),

      this.prisma.store.count({ where }),
    ])

    return {
      stores,
      pagination: pagination(total, page, limit),
    }
  }

  async getStoreUsers(query: SearchUserStore) {
    const {
      search,
      page = 1,
      sortBy = SortOptionStore.NEWEST,
      forSelect,
    } = query

    const limit =
      Number(query.limit) ||
      Number(this.configService.get('limit.store'))

    const skip = (page - 1) * limit

    if (forSelect === 'true') {
      return this.prisma.store.findMany({
        where: {
          isActive: true,
          status: StoreStatus.approved,
        },
        select: {
          id: true,
          name: true,
          nameEn: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
    }

    const where: Prisma.StoreWhereInput = {
      status: StoreStatus.approved,
      isActive: true,
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            nameEn: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    }
    const orderBy = this.buildStoreOrderBy(sortBy)
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
              responseTime: true,
              saleCount: true,
              returnCount: true,
            },
          },
        },
      }),

      this.prisma.store.count({ where }),
    ])

    return {
      stores,
      pagination: pagination(total, page, limit),
    }
  }

  async createStore(
    ownerId: string,
    dto: CreateStoreDto,
  ) {
    try {
      return await this.prisma.store.create({
        data: {
          ...dto,
          ownerId,
          status: StoreStatus.pending,
          isActive: false,
          isVerified: false,
          commissionRate: 0,
          rating: {
            create: {},
          },
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Store owner or slug already exists',
        )
      }

      throw error
    }
  }

  async getStore(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      select: {
        bale: true, banner: true, city: true, businessType: true, description: true, descriptionEn: true, email: true, hasPhysicalStore: true, instagram: true, isActive: true, isVerified: true, createdAt: true,
        logo: true, id: true, name: true, nameEn: true, phone: true, province: true, robika: true, slug: true, status: true, telegram: true, workingHours: true, whatsApp: true, shippingTime: true, address: true,
        rating: {
          select: {
            totalReviews: true,
            answeredResponses: true,
            returnCount: true,
            responseTime: true,
            productQuality: true,
            responseRate: true,
            productCount: true,
            saleCount: true,
            updatedAt: true, avgRating: true,
            ratingTotal: true,
          }
        },
        products: {
          select: productSelector,
          take: 6,
          orderBy: {
            createdAt: 'desc',
          },
        },
        storeReview: {
          where: {
            status: StoreStatus.approved,
          },
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            answerAt: true,
            responseAt: true,
            body: true,
            answerReview: true,
            createdAt: true,
            productName: true,
            productQuality: true,
            rating: true,
            verifiedPurchase: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })
    if (!store) {
      throw new NotFoundException('Store not found')
    }
    return store
  }

  async updateStore(
    id: string,
    dto: UpdateStoreDto,
  ) {
    return this.prisma.store.update({
      where: { id },
      data: dto,
    })
  }

  async updateStoreStatus(
    id: string,
    dto: UpdateStoreStatusDto,
  ) {
    const isApproved =
      dto.status === StoreStatus.approved

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

  async getStoreReviewAdmin(query: SearchAdminStoreReview) {    
    const { status, storId, verifiedPurchase } = query
    const page = Number(query.page || 1)
    const limit = Number(query.limit) || Number(this.configService.get('limit.storeReview'))
    const skip = (page - 1) * limit;
    const verify = (verifiedPurchase === 'true' || true) ? true : verifiedPurchase === 'false' || false ? false : undefined
    const where = {
      ...(status !== 'All' && { status }),
      ...(verify && { verifiedPurchase: verify }),
      ...(storId && { storId }),
    }
    const [review, total] = await Promise.all([
      this.prisma.storeReview.findMany({
        where,
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          answerAt: true,
          responseAt: true,
          body: true,
          answerReview: true,
          createdAt: true,
          productName: true,
          productQuality: true,
          rating: true,
          verifiedPurchase: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.storeReview.count({ where }),
    ]);
    return {
      storeReview: review,
      pagination: pagination(total, page, limit)
    }
  }

  async getStoreReview(storeId: string, pageNumber: string) {    
    const page = Number(pageNumber || 1) + 1
    const limit = Number(this.configService.get('limit.storeReview'))
    const skip = (page - 1) * limit;
    const [review, total] = await Promise.all([
      this.prisma.storeReview.findMany({
        where: {
          id: storeId,
          status: 'approved'
        },
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          answerAt: true,
          responseAt: true,
          body: true,
          answerReview: true,
          createdAt: true,
          productName: true,
          productQuality: true,
          rating: true,
          verifiedPurchase: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.storeReview.count({ where: { id: storeId } }),
    ]);
    return {
      storeReview: review,
      pagination: pagination(total, page, limit)
    }
  }

  async createStoreReview(
    userId: string,
    storeId: string,
    dto: CreateStoreReviewDto,
  ) {
    const store = await this.prisma.store.findFirst({
      where: {
        id: storeId,
        status: StoreStatus.approved,
        isActive: true,
      },
      select: {
        id: true,
      },
    })

    if (!store) {
      throw new NotFoundException(
        'Store not found',
      )
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
          responseAt: true,
          createdAt: true,
        },
      })

      if (!review) {
        throw new NotFoundException(
          'Store review not found',
        )
      }

      if (review.status === StoreStatus.approved) {
        return review
      }

      const responseAt =
        review.responseAt ??
        review.answerAt ??
        new Date()

      await this.addReviewRating(tx, {
        storeId: review.storeId,
        rating: review.rating,
        productQuality: review.productQuality,
      })

      await this.addResponseRequest(
        tx,
        review.storeId,
        true,
        this.getResponseTime(
          review.createdAt,
          responseAt,
        ),
      )

      return tx.storeReview.update({
        where: { id: reviewId },
        data: {
          status: StoreStatus.approved,
          responseAt,
        },
      })
    })
  }

  async rejectStoreReview(reviewId: string) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.storeReview.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          storeId: true,
          status: true,
          rating: true,
          productQuality: true,
          responseAt: true,
          createdAt: true,
        },
      })

      if (!review) {
        throw new NotFoundException(
          'Store review not found',
        )
      }

      if (review.status === StoreStatus.rejected) {
        return review
      }

      if (review.status === StoreStatus.approved) {
        await this.removeReviewRating(tx, {
          storeId: review.storeId,
          rating: review.rating,
          productQuality: review.productQuality,
        })

        const responseTime = review.responseAt
          ? this.getResponseTime(
            review.createdAt,
            review.responseAt,
          )
          : null

        await this.removeResponseRequest(
          tx,
          review.storeId,
          responseTime,
        )
      }

      return tx.storeReview.update({
        where: { id: reviewId },
        data: {
          status: StoreStatus.rejected,
        },
      })
    })
  }

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
          responseAt: true,
          rating: true,
          productQuality: true,
          createdAt: true,
        },
      })

      if (!review) {
        throw new NotFoundException(
          'Store review not found',
        )
      }

      if (review.status === StoreStatus.rejected) {
        throw new BadRequestException(
          'Rejected store review cannot be answered',
        )
      }

      if (review.answerReview) {
        throw new BadRequestException(
          'Store review has already been answered',
        )
      }

      const answerAt = new Date()

      if (review.status === StoreStatus.approved) {
        return tx.storeReview.update({
          where: { id: reviewId },
          data: {
            answerReview,
            answerAt,
          },
        })
      }

      await this.addReviewRating(tx, {
        storeId: review.storeId,
        rating: review.rating,
        productQuality: review.productQuality,
      })

      await this.addResponseRequest(
        tx,
        review.storeId,
        true,
        this.getResponseTime(
          review.createdAt,
          answerAt,
        ),
      )

      return tx.storeReview.update({
        where: { id: reviewId },
        data: {
          answerReview,
          answerAt,
          responseAt: answerAt,
          status: StoreStatus.approved,
        },
      })
    })
  }

  // -------------------------------------------------------
  // Qna
  // -------------------------------------------------------

  /**
   * QnaService بعد از ثبت پاسخ فروشنده صدا می‌زند.
   *
   * اینجا دیگر Qna را Query نمی‌کنیم.
   * QnaService از قبل این اطلاعات را دارد.
   */
  async registerQnaResponse(
    storeId: string,
    questionCreatedAt: Date,
    answeredAt: Date,
  ) {
    const responseTime = this.getResponseTime(
      questionCreatedAt,
      answeredAt,
    )

    await this.registerResponseAnswer(
      storeId,
      responseTime,
    )

    return {
      counted: true,
      responseTime,
    }
  }

  /**
   * وقتی Qna approved می‌شود.
   *
   * اگر seller قبلاً جواب داده:
   * request + answer همزمان ثبت می‌شود.
   *
   * اگر جواب نداده:
   * فقط request ثبت می‌شود.
   *
   * اطلاعات reply را QnaService یا Controller
   * می‌تواند به این متد بدهد.
   */
  async registerApprovedQna(
    storeId: string,
    questionCreatedAt: Date,
    sellerAnsweredAt?: Date,
  ) {
    const answered = Boolean(sellerAnsweredAt)

    const responseTime = answered
      ? this.getResponseTime(
        questionCreatedAt,
        sellerAnsweredAt!,
      )
      : 0

    await this.prisma.$transaction(async (tx) => {
      await this.addResponseRequest(
        tx,
        storeId,
        answered,
        responseTime,
      )
    })

    return {
      counted: true,
      answered,
      responseTime,
    }
  }

  // -------------------------------------------------------
  // Rating - Response
  // -------------------------------------------------------

  private async addResponseRequest(
    tx: Prisma.TransactionClient,
    storeId: string,
    answered: boolean,
    responseTime = 0,
  ) {
    const rating = await tx.storeRating.update({
      where: { storeId },
      data: {
        totalResponseRequests: {
          increment: 1,
        },

        ...(answered && {
          answeredResponses: {
            increment: 1,
          },
          totalResponseTime: {
            increment: responseTime,
          },
        }),
      },
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

  private async registerResponseAnswer(
    storeId: string,
    responseTime: number,
  ) {
    const rating =
      await this.prisma.storeRating.update({
        where: { storeId },
        data: {
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

    await this.updateResponseValues(
      this.prisma,
      storeId,
      rating,
    )
  }

  private async removeResponseRequest(
    tx: Prisma.TransactionClient,
    storeId: string,
    responseTime: number | null,
  ) {
    const rating = await tx.storeRating.update({
      where: { storeId },
      data: {
        totalResponseRequests: {
          decrement: 1,
        },

        ...(responseTime !== null && {
          answeredResponses: {
            decrement: 1,
          },
          totalResponseTime: {
            decrement: responseTime,
          },
        }),
      },
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

  private async updateResponseValues(
    tx: Prisma.TransactionClient | PrismaService,
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
        ? data.totalResponseTime /
        data.answeredResponses
        : 0

    await tx.storeRating.update({
      where: { storeId },
      data: {
        responseRate,
        responseTime,
      },
    })
  }

  // -------------------------------------------------------
  // Rating - Review
  // -------------------------------------------------------

  private async addReviewRating(
    tx: Prisma.TransactionClient,
    review: {
      storeId: string
      rating: number
      productQuality: number | null
    },
  ) {
    const rating = await tx.storeRating.update({
      where: {
        storeId: review.storeId,
      },
      data: {
        ratingTotal: {
          increment: review.rating,
        },
        totalReviews: {
          increment: 1,
        },

        ...(review.productQuality !== null && {
          productQualityTotal: {
            increment: review.productQuality,
          },
          productQualityCount: {
            increment: 1,
          },
        }),
      },
      select: {
        ratingTotal: true,
        totalReviews: true,
        productQualityTotal: true,
        productQualityCount: true,
        productQuality: true,
      },
    })

    const avgRating =
      rating.totalReviews > 0
        ? rating.ratingTotal /
        rating.totalReviews
        : 0

    const productQuality =
      rating.productQualityCount > 0
        ? rating.productQualityTotal /
        rating.productQualityCount
        : 5

    await tx.storeRating.update({
      where: {
        storeId: review.storeId,
      },
      data: {
        avgRating,
        productQuality,
      },
    })
  }

  private async removeReviewRating(
    tx: Prisma.TransactionClient,
    review: {
      storeId: string
      rating: number
      productQuality: number | null
    },
  ) {
    const rating = await tx.storeRating.update({
      where: {
        storeId: review.storeId,
      },
      data: {
        ratingTotal: {
          decrement: review.rating,
        },
        totalReviews: {
          decrement: 1,
        },

        ...(review.productQuality !== null && {
          productQualityTotal: {
            decrement: review.productQuality,
          },
          productQualityCount: {
            decrement: 1,
          },
        }),
      },
      select: {
        ratingTotal: true,
        totalReviews: true,
        productQualityTotal: true,
        productQualityCount: true,
      },
    })

    const avgRating =
      rating.totalReviews > 0
        ? rating.ratingTotal /
        rating.totalReviews
        : 0

    const productQuality =
      rating.productQualityCount > 0
        ? rating.productQualityTotal /
        rating.productQualityCount
        : 5

    await tx.storeRating.update({
      where: {
        storeId: review.storeId,
      },
      data: {
        avgRating,
        productQuality,
      },
    })
  }

  private getResponseTime(
    createdAt: Date,
    responseAt: Date,
  ): number {
    return Math.max(
      0,
      (responseAt.getTime() -
        createdAt.getTime()) /
      60000,
    )
  }

  // -------------------------------------------------------
  // Rating - Product
  // -------------------------------------------------------
  // if (
  //   oldStatus !== ProductStatus.approved &&
  //   newStatus === ProductStatus.approved &&
  //   product.storeId
  // ) {
  //   await this.storeService.incrementProductCount(
  //     product.storeId,
  //   )
  // }
  async incrementProductCount(
    storeId: string,
  ) {
    return this.prisma.storeRating.update({
      where: { storeId },
      data: {
        productCount: {
          increment: 1,
        },
      },
    })
  }
  //   if (
  //   oldStatus === ProductStatus.approved &&
  //   newStatus !== ProductStatus.approved &&
  //   product.storeId
  // ) {
  //   await this.storeService.decrementProductCount(
  //     product.storeId,
  //   )
  // }
  async decrementProductCount(
    storeId: string,
  ) {
    return this.prisma.storeRating.update({
      where: { storeId },
      data: {
        productCount: {
          decrement: 1,
        },
      },
    })
  }

  // -------------------------------------------------------
  // Rating - Sale / Return
  // -------------------------------------------------------
  // await this.storeService.incrementSaleCount(
  //   orderItem.storeId,
  //   orderItem.quantity,
  // )
  async incrementSaleCount(
    storeId: string,
    quantity: number,
  ) {
    if (quantity <= 0) return

    return this.prisma.storeRating.update({
      where: { storeId },
      data: {
        saleCount: {
          increment: quantity,
        },
      },
    })
  }
  // await this.storeService.registerReturn(
  //   orderItem.storeId,
  //   returnItem.quantity,
  // )
  async registerReturn(
    storeId: string,
    quantity: number,
  ) {
    if (quantity <= 0) return

    return this.prisma.storeRating.update({
      where: { storeId },
      data: {
        saleCount: {
          decrement: quantity,
        },
        returnCount: {
          increment: quantity,
        },
      },
    })
  }
}