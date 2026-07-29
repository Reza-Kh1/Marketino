/**
 * ShopsController - کنترلر عمومی فروشگاه‌ها
 * نمایش پروفایل فروشنده، امتیازات و نظرات
 */
import { Controller, Get, Post, Body, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * لیست فروشگاه‌ها
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'لیست فروشگاه‌ها با امتیاز' })
  async list(@Query('page') page?: number, @Query('limit') limit?: number, @Query('q') q?: string) {
    const pageNum = page || 1;
    const limitNum = limit || 12;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      role: 'seller',
      sellerStatus: 'approved',
      isActive: true,
    };

    if (q) {
      where.storeName = { contains: q, mode: 'insensitive' };
    }

    const [shops, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          storeName: true,
          storeLogo: true,
          storeDescription: true,
          storeDescriptionEn: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { products: true } },
          sellerRating: {
            select: {
              avgRating: true,
              totalReviews: true,
              responseRate: true,
              onTimeDelivery: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const formattedShops = shops.map(shop => ({
      id: shop.id,
      username: shop.username,
      storeName: shop.storeName,
      storeLogo: shop.storeLogo || shop.avatar,
      storeDescription: shop.storeDescription,
      storeDescriptionEn: shop.storeDescriptionEn,
      isVerified: shop.isVerified,
      totalProducts: shop._count.products,
      avgRating: shop.sellerRating?.avgRating || 0,
      totalReviews: shop.sellerRating?.totalReviews || 0,
      responseRate: shop.sellerRating?.responseRate || 100,
      onTimeDelivery: shop.sellerRating?.onTimeDelivery || 100,
      joinedAt: shop.createdAt,
    }));

    return {
      shops: formattedShops,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    };
  }

  /**
   * فروشگاه‌های برتر
   */
  @Public()
  @Get('top')
  @ApiOperation({ summary: 'فروشگاه‌های برتر' })
  async topShops() {
    const shops = await this.prisma.user.findMany({
      where: { role: 'seller', sellerStatus: 'approved', isActive: true },
      select: {
        id: true,
        storeName: true,
        storeLogo: true,
        avatar: true,
        isVerified: true,
        _count: { select: { products: true } },
        sellerRating: {
          select: {
            avgRating: true,
            totalReviews: true,
          },
        },
      },
      orderBy: { sellerRating: { avgRating: 'desc' } },
      take: 6,
    });

    return shops.map(shop => ({
      id: shop.id,
      storeName: shop.storeName,
      storeLogo: shop.storeLogo || shop.avatar,
      isVerified: shop.isVerified,
      totalProducts: shop._count.products,
      avgRating: shop.sellerRating?.avgRating || 0,
      totalReviews: shop.sellerRating?.totalReviews || 0,
    }));
  }

  /**
   * پروفایل یک فروشگاه
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'پروفایل فروشگاه با محصولات و نظرات' })
  async getShop(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        sellerStatus: true,
        storeName: true,
        storeLogo: true,
        storeDescription: true,
        storeDescriptionEn: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { products: true } },
        sellerRating: {
          select: {
            avgRating: true,
            totalReviews: true,
            responseRate: true,
            responseTime: true,
            onTimeDelivery: true,
            productQuality: true,
            communication: true,
          },
        },
      },
    });

    if (!user || user.role !== 'seller') {
      throw new NotFoundException('فروشگاه یافت نشد');
    }

    // Get products
    const products = await this.prisma.product.findMany({
      where: { sellerId: id, status: 'approved' },
      include: {
        images: { take: 1, where: { isMain: true } },
        category: { select: { name: true, nameEn: true, slug: true } },
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
    });

    // Get reviews
    const reviews = await this.prisma.sellerReview.findMany({
      where: { sellerId: id },
      include: {
        reviewer: {
          select: { id: true, username: true, avatar: true, firstName: true, lastName: true },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // Total sales count
    const totalSales = await this.prisma.orderItem.count({
      where: { sellerId: id },
    });

    return {
      shop: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        storeName: user.storeName,
        storeLogo: user.storeLogo,
        storeDescription: user.storeDescription,
        storeDescriptionEn: user.storeDescriptionEn,
        isVerified: user.isVerified,
        joinedAt: user.createdAt,
        totalProducts: user._count.products,
        totalSales,
        rating: user.sellerRating?.avgRating || 0,
        reviewCount: user.sellerRating?.totalReviews || 0,
        responseRate: user.sellerRating?.responseRate || 100,
        responseTime: user.sellerRating?.responseTime || 0,
        onTimeDelivery: user.sellerRating?.onTimeDelivery || 100,
        productQuality: user.sellerRating?.productQuality || 5,
        communication: user.sellerRating?.communication || 5,
      },
      products,
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt,
        reviewer: r.reviewer,
      })),
    };
  }

  /**
   * 🆕 ارسال نظر برای فروشنده
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/review')
  @ApiOperation({ summary: 'ثبت نظر برای فروشنده' })
  async addReview(
    @Param('id') sellerId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { rating: number; body?: string },
  ) {
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      throw new NotFoundException('امتیاز باید بین ۱ تا ۵ باشد');
    }

    // Check seller exists
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
    });
    if (!seller || seller.role !== 'seller') {
      throw new NotFoundException('فروشنده یافت نشد');
    }

    // Check not reviewing self
    if (sellerId === userId) {
      throw new NotFoundException('نمی‌توانید به خودتان امتیاز دهید');
    }

    // Create review
    const review = await this.prisma.sellerReview.create({
      data: {
        reviewerId: userId,
        sellerId,
        rating: body.rating,
        body: body.body || null,
      },
    });

    // Update seller rating
    const reviews = await this.prisma.sellerReview.findMany({
      where: { sellerId },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.prisma.sellerRating.upsert({
      where: { sellerId },
      update: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
      create: {
        sellerId,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
    });

    // Notify seller
    await this.prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'seller',
        title: 'نظر جدید',
        body: `یک خریدار به فروشگاه شما ${body.rating} ستاره داد`,
        link: `/shops/${sellerId}`,
        referenceType: 'seller_review',
        referenceId: review.id,
      },
    });

    return { success: true, review, avgRating };
  }
}
