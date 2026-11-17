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

      // فیلدهای responseRate / answeredResponses از StoreRating حذف شده‌اند
      // fallback امن به avgRating / totalReviews
      case SortOptionStore.BEST_RESPONSE_RATE:
        return { rating: { avgRating: 'desc' } }

      case SortOptionStore.LOW_RESPONSE_RATE:
        return { rating: { avgRating: 'asc' } }

      case SortOptionStore.LOW_ANSWERED:
        return { rating: { totalReviews: 'asc' } }

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
        name: { contains: search, mode: 'insensitive' }
        //  Change Lang
        // OR: [
        //   { name: { contains: search, mode: 'insensitive', } },
        //   { nameEn: { contains: search, mode: 'insensitive' } },
        // ],
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
          //  Change Lang
          // nameEn: true,
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
              productCount: true,
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
          //  Change Lang
          // nameEn: true,
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
        name: { contains: search, mode: 'insensitive' }
        // OR: [
        //   { name: { contains: search, mode: 'insensitive', } },
        //   { nameEn: { contains: search, mode: 'insensitive', } },
        // ],
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
          //  Change Lang
          // nameEn: true,
          slug: true,
          banner: true,
          isVerified: true,
          logo: true,
          businessType: true,
          province: {
            select: {
              name: true,
              //  Change Lang
              // nameEn: true
            }
          },
          city: {
            select: {
              name: true,
              //  Change Lang
              // nameEn: true
            }
          },
          createdAt: true,
          updatedAt: true,
          rating: {
            select: {
              avgRating: true,
              totalReviews: true,
              productQuality: true,
              productCount: true,
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
    const takeReview = Number(this.configService.get('limit.storeReview'))
    const store = await this.prisma.store.findUnique({
      where: { slug },
      select: {
        bale: true, banner: true, businessType: true, description: true,
        //  Change Lang
        // descriptionEn: true,
        email: true, hasPhysicalStore: true, instagram: true, isActive: true, isVerified: true, createdAt: true,
        logo: true, provinceId: true, cityId: true, id: true, name: true,
        //  Change Lang
        // nameEn: true,
        phone: true, robika: true, slug: true, status: true, telegram: true, workingHours: true, whatsApp: true, shippingTime: true, address: true,
        rating: {
          select: {
            avgRating: true,
            ratingTotal: true,
            totalReviews: true,
            productQuality: true,
            productCount: true,
            saleCount: true,
            returnCount: true,
            updatedAt: true,
          },
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
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
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
          take: takeReview,
        },
        province: {
          select: {
            name: true,
            //  Change Lang
            //  nameEn: true
          }
        },
        city: {
          select: {
            name: true,
            //  Change Lang
            //  nameEn: true
          }
        },
        _count: {
          select: { storeReview: { where: { status: 'approved' } } }
        }
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
    const { status, storeId, verifiedPurchase } = query
    const page = Number(query.page || 1)
    const limit = Number(query.limit) || Number(this.configService.get('limit.storeReview'))
    const skip = (page - 1) * limit;
    const where = {
      ...(status && status !== 'All' && { status }),
      ...(verifiedPurchase && verifiedPurchase !== 'All' && { verifiedPurchase: verifiedPurchase === 'true' ? true : false }),
      ...(storeId && { storeId }),
    }
    const [review, total] = await Promise.all([
      this.prisma.storeReview.findMany({
        where,
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          storeId: true,
          store: { select: { slug: true } },
          status: true,
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
      storesReview: review,
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
          storeId: storeId,
          status: 'approved'
        },
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
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
      this.prisma.storeReview.count({ where: { storeId: storeId, status: 'approved' } }),
    ]);
    return {
      storeReview: review,
      pagination: pagination(total, page, limit)
    }
  }

  /**
   * ثبت نظر فروشگاه
   * - کاربر لاگین‌شده (از controller با JwtAuthGuard)
   * - هر کاربر فقط یک بار می‌تواند به یک فروشگاه نظر بدهد (@@unique)
   * - حتی بدون خرید هم می‌تواند نظر بدهد
   * - اگر خرید کرده باشد: verifiedPurchase=true + productName = نام آخرین محصول خریداری‌شده
   *
   * کوئری: یک findFirst سبک روی orderItem
   */
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
      select: { id: true },
    })

    if (!store) {
      throw new NotFoundException('Store not found')
    }

    // یک کوئری سبک: آخرین خرید کاربر از این فروشگاه
    const lastPurchasedItem = await this.prisma.orderItem.findFirst({
      where: {
        storeId,
        order: {
          userId,
          status: {
            in: ['confirmed', 'processing', 'shipped', 'delivered'],
          },
        },
      },
      select: {
        name: true,
      },
      orderBy: [{ price: 'desc' }, { createdAt: 'desc' }],
    })

    const verifiedPurchase = Boolean(lastPurchasedItem)
    const productName = lastPurchasedItem?.name ?? null

    try {
      return await this.prisma.storeReview.create({
        data: {
          userId,
          storeId,
          rating: dto.rating,
          body: dto.body,
          productQuality: dto.productQuality,
          verifiedPurchase,
          productName,
          status: StoreStatus.pending,
        },
        select: {
          id: true,
          storeId: true,
          rating: true,
          body: true,
          productQuality: true,
          verifiedPurchase: true,
          productName: true,
          status: true,
          createdAt: true,
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'شما قبلاً برای این فروشگاه نظر ثبت کرده‌اید',
        )
      }
      throw error
    }
  }

  /**
   * Recalculate کامل امتیازهای فروشگاه از روی نظرات تاییدشده
   * (برای مواقعی که دیتا out-of-sync شده)
   * فقط admin / superAdmin
   */
  async recalculateStoreRating(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    })
    if (!store) throw new NotFoundException('Store not found')

    return this.prisma.$transaction(async (tx) => {
      const stats = await tx.storeReview.aggregate({
        where: {
          storeId,
          status: StoreStatus.approved,
        },
        _avg: {
          rating: true,
          productQuality: true,
        },
        _sum: {
          rating: true,
          productQuality: true,
        },
        _count: {
          rating: true,
          productQuality: true,
        },
      })

      const totalReviews = stats._count.rating || 0
      const ratingTotal = stats._sum.rating || 0
      const avgRating =
        totalReviews > 0 ? Number((ratingTotal / totalReviews).toFixed(2)) : 0

      const productQualityCount = stats._count.productQuality || 0
      const productQualityTotal = stats._sum.productQuality || 0
      const productQuality =
        productQualityCount > 0
          ? Number((productQualityTotal / productQualityCount).toFixed(2))
          : 5

      // upsert برای اطمینان از وجود ردیف StoreRating
      const rating = await tx.storeRating.upsert({
        where: { storeId },
        create: {
          storeId,
          avgRating,
          ratingTotal,
          totalReviews,
          productQuality,
          productQualityTotal,
          productQualityCount,
        },
        update: {
          avgRating,
          ratingTotal,
          totalReviews,
          productQuality,
          productQualityTotal,
          productQualityCount,
        },
        select: {
          storeId: true,
          avgRating: true,
          totalReviews: true,
          productQuality: true,
          ratingTotal: true,
          productQualityTotal: true,
          productQualityCount: true,
        },
      })

      return rating
    })
  }

  /**
   * تایید نظر فروشگاه — فقط فیلدهای موجود در مدل فعلی
   * ratingTotal / totalReviews / productQuality* آپدیت می‌شود
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
        },
      })

      if (!review) {
        throw new NotFoundException('Store review not found')
      }

      if (review.status === StoreStatus.approved) {
        return review
      }

      await this.addReviewRating(tx, {
        storeId: review.storeId,
        rating: review.rating,
        productQuality: review.productQuality,
      })

      return tx.storeReview.update({
        where: { id: reviewId },
        data: { status: StoreStatus.approved },
      })
    })
  }

  /**
   * رد نظر فروشگاه
   * اگر قبلاً approved بوده، از StoreRating کم می‌شود
   */
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
        },
      })

      if (!review) {
        throw new NotFoundException('Store review not found')
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
      }

      return tx.storeReview.update({
        where: { id: reviewId },
        data: { status: StoreStatus.rejected },
      })
    })
  }

  /**
   * پاسخ به نظر فروشگاه
   * اگر هنوز pending باشد، همزمان approve + اضافه کردن به StoreRating
   * فیلدهای answerAt / responseAt در مدل وجود ندارند → استفاده نمی‌شوند
   */
  async answerStoreReview(reviewId: string, answerReview: string) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.storeReview.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          storeId: true,
          status: true,
          answerReview: true,
          rating: true,
          productQuality: true,
        },
      })

      if (!review) {
        throw new NotFoundException('Store review not found')
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

      // قبلاً approved → فقط متن پاسخ
      if (review.status === StoreStatus.approved) {
        return tx.storeReview.update({
          where: { id: reviewId },
          data: { answerReview },
        })
      }

      // pending → approve + اضافه به rating
      await this.addReviewRating(tx, {
        storeId: review.storeId,
        rating: review.rating,
        productQuality: review.productQuality,
      })

      return tx.storeReview.update({
        where: { id: reviewId },
        data: {
          answerReview,
          status: StoreStatus.approved,
        },
      })
    })
  }

  /**
   * حذف نظر فروشگاه
   * اگر approved بوده از StoreRating کم می‌شود
   */
  async deleteStoreReview(reviewId: string) {
    await this.prisma.$transaction(async (tx) => {
      const review = await tx.storeReview.findUnique({
        where: { id: reviewId },
        select: {
          id: true,
          storeId: true,
          status: true,
          rating: true,
          productQuality: true,
        },
      })

      if (!review) {
        throw new NotFoundException('Store review not found')
      }

      if (review.status === StoreStatus.approved) {
        await this.removeReviewRating(tx, {
          storeId: review.storeId,
          rating: review.rating,
          productQuality: review.productQuality,
        })
      }

      await tx.storeReview.delete({
        where: { id: reviewId },
      })
    })

    return { success: true }
  }


  // -------------------------------------------------------
  // Qna / Response metrics
  // فیلدهای responseRate, answeredResponses, totalResponseRequests,
  // totalResponseTime, responseTime از مدل StoreRating حذف شده‌اند.
  // متدها no-op نگه داشته شده‌اند تا callerهای QnA نشکنند.
  // اگر بعداً metrics پاسخ لازم شد، فیلدها را به schema برگردان.
  // -------------------------------------------------------

  async registerQnaResponse(
    _storeId: string,
    _questionCreatedAt: Date,
    _answeredAt: Date,
  ) {
    return { counted: false, responseTime: 0 }
  }

  async registerApprovedQna(
    _storeId: string,
    _questionCreatedAt: Date,
    _sellerAnsweredAt?: Date,
  ) {
    return { counted: false, answered: false, responseTime: 0 }
  }

  // -------------------------------------------------------
  // Rating - Review (هم‌تراز با مدل فعلی StoreRating)
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

  /**
   * بازسازی کامل StoreRating از روی داده‌های واقعی
   * فقط فیلدهای موجود در مدل فعلی:
   * avgRating, ratingTotal, totalReviews, productCount,
   * productQuality*, saleCount, returnCount
   */
  async rebuildStoreRating(storeId: string) {
    return this.prisma.$transaction(async (tx) => {
      const [productCount, reviewStats, orderStats] =
        await Promise.all([
          tx.product.count({
            where: {
              storeId,
              status: 'approved',
            },
          }),

          tx.storeReview.aggregate({
            where: {
              storeId,
              status: StoreStatus.approved,
            },
            _count: { _all: true },
            _sum: {
              rating: true,
              productQuality: true,
            },
          }),

          tx.orderItem.aggregate({
            where: {
              storeId,
              order: {
                checkout: {
                  paymentStatus: 'paid',
                },
                status: {
                  not: 'cancelled',
                },
              },
            },
            _sum: {
              quantity: true,
              returnedQty: true,
            },
          }),
        ])

      const totalReviews = reviewStats._count._all
      const ratingTotal = reviewStats._sum.rating ?? 0
      const avgRating =
        totalReviews > 0 ? ratingTotal / totalReviews : 0

      const productQualityCount = await tx.storeReview.count({
        where: {
          storeId,
          status: StoreStatus.approved,
          productQuality: { not: null },
        },
      })
      const productQualityTotal =
        reviewStats._sum.productQuality ?? 0
      const productQuality =
        productQualityCount > 0
          ? productQualityTotal / productQualityCount
          : 5

      const totalQuantity = orderStats._sum.quantity ?? 0
      const returnedQuantity = orderStats._sum.returnedQty ?? 0
      const saleCount = Math.max(0, totalQuantity - returnedQuantity)
      const returnCount = Math.max(0, returnedQuantity)

      return tx.storeRating.upsert({
        where: { storeId },
        create: {
          storeId,
          avgRating,
          ratingTotal,
          totalReviews,
          productCount,
          productQuality,
          productQualityTotal,
          productQualityCount,
          saleCount,
          returnCount,
        },
        update: {
          avgRating,
          ratingTotal,
          totalReviews,
          productCount,
          productQuality,
          productQualityTotal,
          productQualityCount,
          saleCount,
          returnCount,
        },
      })
    })
  }
}