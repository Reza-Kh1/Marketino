/**
 * AdminService - سرویس پنل مدیریت
 * مدیریت کامل سایت شامل همکاران، سود خالص، معیارهای اعتماد و نظرات فروشندگان
 */
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Prisma, ProductCondition, ProductStatus, UserRole } from '@prisma/client';
import pagination from '@/common/utils/pagination';
import { ConfigService } from '@nestjs/config';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { ProductSearchDto } from './dto/product.search.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) { }


  /* ============================================================
   * 📊 DASHBOARD
   * ============================================================ */

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalBuyers, totalSellers, pendingSellers, approvedSellers, rejectedSellers,
      totalProducts, pendingProducts, activeProducts,
      totalOrders, ordersByStatusRaw, ordersToday, revenueTodayRaw,
      totalRevenueResult, monthlyRevenueResult, totalCommissionResult,
      walletBalanceResult,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'buyer' } }),
      this.prisma.user.count({ where: { role: 'seller' } }),
      this.prisma.user.count({ where: { role: 'seller', store: { status: 'pending' } } }),
      this.prisma.user.count({ where: { role: 'seller', store: { status: 'approved' } } }),
      this.prisma.user.count({ where: { role: 'seller', store: { status: 'rejected' } } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'pending' } }),
      this.prisma.product.count({ where: { status: 'approved' } }),
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: true }),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({ where: { createdAt: { gte: today } }, _sum: { totalPrice: true } }),
      this.prisma.order.aggregate({ _sum: { totalPrice: true } }),
      this.prisma.order.aggregate({ where: { createdAt: { gte: thirtyDaysAgo } }, _sum: { totalPrice: true } }),
      this.prisma.order.aggregate({ _sum: { commissionAmount: true } }),
      this.prisma.walletTransaction.aggregate({ _sum: { amount: true } }),
    ]);

    // New users today
    const newUsersToday = await this.prisma.user.count({ where: { createdAt: { gte: today } } });

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    ordersByStatusRaw.forEach(g => { ordersByStatus[g.status] = g._count; });

    // Recent orders
    const recentOrders = await this.prisma.order.findMany({
      include: { user: { select: { username: true, firstName: true, lastName: true } } },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Recent users
    const recentUsers = await this.prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Revenue chart (30 days)
    const dailyRevenue = await this.prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { totalPrice: true, commissionAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const chartData: { date: string; total: number; count: number; commission: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = dailyRevenue.filter(o => o.createdAt.toISOString().split('T')[0] === dateStr);
      chartData.push({
        date: dateStr,
        total: dayOrders.reduce((s, o) => s + Number(o.totalPrice), 0),
        count: dayOrders.length,
        commission: dayOrders.reduce((s, o) => s + Number(o.commissionAmount), 0),
      });
    }

    // Top sellers - از طریق Store باrelation
    const topSellers = await this.prisma.user.findMany({
      where: { role: 'seller', store: { status: 'approved' } },
      select: {
        id: true,
        username: true,
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            commissionRate: true,
            products: { select: { _count: { select: { orderItems: true } } } },
            _count: { select: { products: true } },
            rating: { select: { avgRating: true, totalReviews: true } },
            storeReview: { select: { rating: true } },
          },
        },
      },
      take: 5,
    });

    const topSellersFormatted = topSellers.map(s => {
      const store = s.store;
      if (!store) return null;
      const totalSales = store.products.reduce((sum: number, p: any) => sum + p._count.orderItems, 0);
      const ratings = (store.storeReview as any[]).map((r: any) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      return {
        id: s.id,
        storeName: store.name || s.username,
        storeLogo: store.logo,
        totalSales,
        productCount: store._count.products,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      };
    }).filter(Boolean);

    // Pending sellers
    const pendingSellerList = await this.prisma.user.findMany({
      where: { role: 'seller', store: { status: 'pending' } },
      select: {
        id: true,
        username: true,
        store: { select: { name: true, businessType: true } },
        createdAt: true,
      },
      take: 10,
    });

    // Count of seller reviews
    const totalSellerReviews = await this.prisma.storeReview.count();

    return {
      stats: {
        totalUsers, totalBuyers, totalSellers,
        pendingSellers, approvedSellers, rejectedSellers,
        totalProducts, pendingProducts, activeProducts,
        totalOrders, pendingOrders: ordersByStatus['pending'] || 0,
        confirmedOrders: ordersByStatus['confirmed'] || 0,
        processingOrders: ordersByStatus['processing'] || 0,
        shippedOrders: ordersByStatus['shipped'] || 0,
        deliveredOrders: ordersByStatus['delivered'] || 0,
        ordersByStatus,
        totalRevenue: totalRevenueResult._sum.totalPrice || 0,
        monthlyRevenue: monthlyRevenueResult._sum.totalPrice || 0,
        totalCommission: totalCommissionResult._sum.commissionAmount || 0,
        walletBalance: walletBalanceResult._sum.amount || 0,
        newUsersToday,
        ordersToday,
        revenueToday: revenueTodayRaw._sum.totalPrice || 0,
        totalSellerReviews,
      },
      recentOrders,
      recentUsers,
      chartData,
      topSellers: topSellersFormatted,
      pendingSellers: pendingSellerList,
    };
  }

  /* ============================================================
   * 💰 NET PROFIT
   * ============================================================ */

  async getNetProfit(period: string = 'month') {
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Total commission
    const commissionResult = await this.prisma.order.aggregate({
      where: { createdAt: { gte: startDate } },
      _sum: { commissionAmount: true },
    });

    // Platform costs (from wallet transactions or settings)
    const costsResult = await this.prisma.walletTransaction.aggregate({
      where: {
        type: { in: ['withdraw', 'commission'] },
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
    });

    // All-time totals
    const allTimeCommission = await this.prisma.order.aggregate({
      _sum: { commissionAmount: true },
    });

    const totalCommission = commissionResult._sum.commissionAmount || 0;
    const totalCosts = Math.abs(Number(costsResult._sum.amount) || 0);
    const netProfit = Number(totalCommission) - totalCosts;

    // Monthly breakdown
    const monthlyOrders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { totalPrice: true, commissionAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyBreakdown: { month: string; revenue: number; commission: number; orders: number }[] = [];
    const months = this.generateMonthList(startDate, now);

    for (const month of months) {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const monthOrders = monthlyOrders.filter(
        o => o.createdAt >= startOfMonth && o.createdAt <= endOfMonth,
      );
      monthlyBreakdown.push({
        month: month.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' }),
        revenue: monthOrders.reduce((s, o) => s + Number(o.totalPrice), 0),
        commission: monthOrders.reduce((s, o) => s + Number(o.commissionAmount), 0),
        orders: monthOrders.length,
      });
    }

    return {
      totalCommission,
      totalCosts,
      netProfit,
      allTimeCommission: allTimeCommission._sum.commissionAmount || 0,
      period,
      monthlyBreakdown,
    };
  }

  private generateMonthList(start: Date, end: Date): Date[] {
    const months: Date[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }

  /* ============================================================
   * 🛡️ TRUST METRICS
   * ============================================================ */

  async getTrustMetrics() {
    const sellers = await this.prisma.user.findMany({
      where: { role: 'seller' },
      select: {
        id: true,
        username: true,
        store: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            status: true,
            _count: { select: { storeReview: true } },
            rating: {
              select: {
                avgRating: true, totalReviews: true, responseRate: true,
                productQuality: true,
              },
            },
            storeReview: { select: { rating: true } },
          },
        },
      },
    });

    const totalSellers = sellers.length;
    const verifiedSellers = sellers.filter(s => s.store?.isVerified).length;
    const approvedSellers = sellers.filter(s => s.store?.status === 'approved').length;

    // Average rating
    const allRatings = sellers.flatMap(s => s.store?.storeReview?.map((r: any) => r.rating) || []);
    const avgRating = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : 0;

    // Average response rate
    const responseRates: number[] = [];
    const deliveryRates: number[] = [];
    for (const s of sellers) {
      const rating = s.store?.rating as any;
      if (rating) {
        responseRates.push(rating.responseRate);
        deliveryRates.push(rating.onTimeDelivery);
      }
    }
    const avgResponseRate = responseRates.length > 0
      ? responseRates.reduce((a, b) => a + b, 0) / responseRates.length
      : 0;
    const avgOnTimeDelivery = deliveryRates.length > 0
      ? deliveryRates.reduce((a, b) => a + b, 0) / deliveryRates.length
      : 0;

    // Total reviews
    const totalReviews = sellers.reduce((sum, s) => sum + (s.store?._count?.storeReview || 0), 0);

    // Rating tiers
    const ratingTiers = {
      fiveStar: allRatings.filter(r => r >= 5).length,
      fourStar: allRatings.filter(r => r >= 4 && r < 5).length,
      threeStar: allRatings.filter(r => r >= 3 && r < 4).length,
      belowThree: allRatings.filter(r => r < 3).length,
    };

    // Top rated sellers (with most reviews)
    const topRatedSellers = sellers
      .filter(s => s.store && (s.store._count?.storeReview || 0) > 0)
      .sort((a, b) => ((b.store?._count?.storeReview || 0) - (a.store?._count?.storeReview || 0)))
      .slice(0, 5)
      .map(s => {
        const reviews = (s.store?.storeReview || []) as any[];
        const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        return {
          id: s.id,
          storeName: s.store?.name,
          isVerified: s.store?.isVerified,
          reviewCount: s.store?._count?.storeReview || 0,
          avgRating: Math.round(avg * 10) / 10,
        };
      });

    // Low rated sellers (needs review)
    const lowRatedSellers = sellers
      .filter(s => s.store && (s.store._count?.storeReview || 0) >= 3)
      .map(s => {
        const reviews = (s.store?.storeReview || []) as any[];
        const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        return {
          id: s.id,
          storeName: s.store?.name,
          isVerified: s.store?.isVerified,
          reviewCount: s.store?._count?.storeReview || 0,
          avgRating: Math.round(avg * 10) / 10,
        };
      })
      .filter((s: any) => s.avgRating < 3)
      .sort((a, b) => a.avgRating - b.avgRating)
      .slice(0, 5);

    return {
      totalSellers,
      verifiedSellers,
      approvedSellers,
      verifiedPercent: totalSellers > 0 ? Math.round((verifiedSellers / totalSellers) * 100) : 0,
      avgRating: Math.round(avgRating * 10) / 10,
      avgResponseRate: Math.round(avgResponseRate * 10) / 10,
      avgOnTimeDelivery: Math.round(avgOnTimeDelivery * 10) / 10,
      totalReviews,
      ratingTiers,
      topRatedSellers,
      lowRatedSellers,
    };
  }

  /* ============================================================
   * 👥 COLLEAGUES MANAGEMENT
   * ============================================================ */

  async getColleagues(currentUserId: string) {
    const currentUser = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser || currentUser.role !== 'superAdmin') {
      throw new ForbiddenException('فقط مدیر اصلی می‌تواند همکاران را مدیریت کند');
    }

    return this.prisma.user.findMany({
      where: { role: 'admin', createdBy: currentUserId },
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        permissions: true, isActive: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addColleague(currentUserId: string, data: {
    username: string; email: string; password: string;
    permissions: string[]; firstName?: string; lastName?: string;
  }) {
    const currentUser = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser || currentUser.role !== 'superAdmin') {
      throw new ForbiddenException('فقط مدیر اصلی می‌تواند همکار جدید اضافه کند');
    }

    // Check existing
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
    });
    if (existing) {
      throw new BadRequestException('نام کاربری یا ایمیل قبلاً ثبت شده است');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const colleague = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: 'admin',
        permissions: JSON.stringify(data.permissions),
        createdBy: currentUserId,
        isVerified: true,
        isActive: true,
        hasSetPassword: true,
      },
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        permissions: true, isActive: true, createdAt: true,
      },
    });

    return { message: 'همکار جدید با موفقیت اضافه شد', colleague };
  }

  async updateColleaguePermissions(currentUserId: string, colleagueId: string, permissions: string[]) {
    const currentUser = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser || currentUser.role !== 'superAdmin') {
      throw new ForbiddenException('فقط مدیر اصلی می‌تواند دسترسی‌ها را تغییر دهد');
    }

    const colleague = await this.prisma.user.findFirst({
      where: { id: colleagueId, role: 'admin', createdBy: currentUserId },
    });
    if (!colleague) {
      throw new NotFoundException('همکار یافت نشد');
    }

    await this.prisma.user.update({
      where: { id: colleagueId },
      data: { permissions: JSON.stringify(permissions) },
    });

    return { message: 'دسترسی‌های همکار با موفقیت بروزرسانی شد' };
  }

  async toggleColleagueActive(currentUserId: string, colleagueId: string) {
    const currentUser = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser || currentUser.role !== 'superAdmin') {
      throw new ForbiddenException('فقط مدیر اصلی می‌تواند وضعیت همکار را تغییر دهد');
    }

    const colleague = await this.prisma.user.findFirst({
      where: { id: colleagueId, role: 'admin', createdBy: currentUserId },
    });
    if (!colleague) {
      throw new NotFoundException('همکار یافت نشد');
    }

    const updated = await this.prisma.user.update({
      where: { id: colleagueId },
      data: { isActive: !colleague.isActive },
      select: { id: true, isActive: true },
    });

    return {
      message: updated.isActive ? 'اکانت همکار فعال شد' : 'اکانت همکار غیرفعال شد',
      isActive: updated.isActive,
    };
  }

  async removeColleague(currentUserId: string, colleagueId: string) {
    const currentUser = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser || currentUser.role !== 'superAdmin') {
      throw new ForbiddenException('فقط مدیر اصلی می‌تواند همکار را حذف کند');
    }

    const colleague = await this.prisma.user.findFirst({
      where: { id: colleagueId, role: 'admin', createdBy: currentUserId },
    });
    if (!colleague) {
      throw new NotFoundException('همکار یافت نشد');
    }

    await this.prisma.user.delete({ where: { id: colleagueId } });

    return { message: 'همکار با موفقیت حذف شد' };
  }

  /* ============================================================
   * 📝 SELLER REVIEWS MODERATION
   * ============================================================ */

  async getAllSellerReviews(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.storeReview.findMany({
        include: {
          user: { select: { id: true, username: true, firstName: true, lastName: true } },
          store: { select: { id: true, name: true, slug: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.storeReview.count(),
    ]);

    return { reviews, total, page, pages: Math.ceil(total / limit) };
  }

  async deleteSellerReview(currentUserId: string, reviewId: string) {
    const review = await this.prisma.storeReview.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('نظر یافت نشد');
    }

    await this.prisma.storeReview.delete({ where: { id: reviewId } });

    // Recalculate seller rating
    const sellerReviews = await this.prisma.storeReview.findMany({
      where: { storeId: review.storeId },
      select: { rating: true },
    });

    if (sellerReviews.length > 0) {
      const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
      await this.prisma.storeRating.upsert({
        where: { storeId: review.storeId },
        update: { avgRating, totalReviews: sellerReviews.length },
        create: { storeId: review.storeId, avgRating, totalReviews: sellerReviews.length },
      });
    }

    return { message: 'نظر با موفقیت حذف شد' };
  }

  /* ============================================================
   * 📊 USERS MANAGEMENT (ADMIN)
   * ============================================================ */

  async getUsers(params: { page?: number; role?: string; q?: string }) {
    const page = params.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.q) {
      where.OR = [
        { username: { contains: params.q } },
        { email: { contains: params.q } },
        { firstName: { contains: params.q } },
        { lastName: { contains: params.q } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, username: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, isVerified: true,
          permissions: true, createdAt: true,
          store: { select: { name: true } },
          _count: { select: { orders: true } },
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      users: users.map(u => ({
        ...u,
        storeName: u.store?.name,
        permissions: u.permissions ? JSON.parse(u.permissions) : [],
        orderCount: u._count.orders,
      })),
      pagination: { ...pagination(total, page, limit) }
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, isActive: true,
        isVerified: true, permissions: true,
        store: {
          select: {
            id: true, name: true, slug: true, logo: true,
            description: true, businessType: true,
            commissionRate: true, status: true, isActive: true,
          },
        },
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    if (!user) throw new NotFoundException('کاربر یافت نشد');

    return {
      ...user,
      storeName: user.store?.name,
      storeLogo: user.store?.logo,
      storeDescription: user.store?.description,
      businessType: user.store?.businessType,
      commissionRate: user.store?.commissionRate,
      sellerStatus: user.store?.status,
      permissions: user.permissions ? JSON.parse(user.permissions) : [],
      orderCount: user._count.orders,
      productCount: 0,
    };
  }

  async toggleUserActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.role === 'superAdmin') throw new BadRequestException('نمی‌توان مدیر اصلی را غیرفعال کرد');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return { message: `کاربر ${updated.isActive ? 'فعال' : 'غیرفعال'} شد`, user: updated };
  }

  async verifySeller(id: string, data: { approved: boolean; reason?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.role !== 'seller') throw new BadRequestException('کاربر فروشنده نیست');

    // بررسی اینکه آیا store وجود دارد یا خیر
    let store = await this.prisma.store.findUnique({ where: { ownerId: id } });
    if (!store) {
      // ایجاد store اگر وجود ندارد
      store = await this.prisma.store.create({
        data: {
          ownerId: id,
          name: `${user.firstName || user.username} فروشگاه`,
          nameEn: `${user.firstName || user.username}'s Store`,
          slug: `${user.username}-store`,
          status: data.approved ? 'approved' : 'rejected',
          statusReason: data.reason || null,
          isActive: data.approved,
          isVerified: data.approved,
          commissionRate: 10,
        },
      });
    } else {
      store = await this.prisma.store.update({
        where: { ownerId: id },
        data: {
          status: data.approved ? 'approved' : 'rejected',
          statusReason: data.reason || null,
          isActive: data.approved,
          isVerified: data.approved,
        },
      });
    }

    // 📧 ارسال ایمیل تأیید / رد فروشگاه
    if (user.email) {
      this.emailService.sendSellerApprovalEmail(
        user.email,
        store.name || 'فروشگاه',
        data.approved,
        data.reason,
        'fa',
      ).catch(() => { });
    }

    return { message: data.approved ? 'فروشنده تأیید شد' : 'فروشنده رد شد', user: { ...user, store } };
  }

  async changeUserRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.role === 'superAdmin') throw new BadRequestException('نمی‌توان نقش مدیر اصلی را تغییر داد');
    if (!Object.values(UserRole).includes(role)) throw new BadRequestException('نقش نامعتبر است');

    const updated = await this.prisma.user.update({ where: { id }, data: { role } });

    return { message: `نقش کاربر به ${role} تغییر کرد`, user: updated };
  }

  /* ============================================================
   * 📦 PRODUCTS MANAGEMENT (ADMIN)
   * ============================================================ */

  async getProducts(params: ProductSearchDto) {
    const { brandId, categoryId, condition, featured, limit, sort, page = 1, search, sellerId, status, discountId, maxPrice, minPrice } = params;

    const limitPage = Number(limit) || Number(this.configService.get('limit.product') || 10);
    const skip = (Number(page) - 1) * limitPage;
    // ۱. ساخت شرط‌های فیلتر (Where)
    const where: Prisma.ProductWhereInput = {
      ...(brandId && { brandId }),
      ...(categoryId && { categoryId }),
      ...(sellerId && { storeId: sellerId }),
      ...((condition && condition !== 'all') && { condition: condition as ProductCondition }),
      ...((status && status !== 'all') && { status: status as ProductStatus }),
      ...((featured && featured === 'true') && { isFeatured: true }),
      ...((discountId && discountId === 'true') ? {
        discountPercent: {
          not: null,
          notIn: ['', '0'],
        }
      } : {
        variants: { some: { discountId }, }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { titleEn: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { descriptionEn: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        minPrice: {
          ...(minPrice !== undefined && { gte: Number(minPrice) }),
          ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
        },
      }),
    };
    let orderBy: Prisma.ProductOrderByWithRelationInput = { updatedAt: 'desc' };

    if (sort) {
      switch (sort) {
        case 'saleCount-up':
          orderBy = { saleCount: 'desc' };
          break;
        case 'saleCount-down':
          orderBy = { saleCount: 'asc' };
          break;
        case 'rating-up':
          orderBy = { rating: 'desc' };
          break;
        case 'rating-down':
          orderBy = { rating: 'asc' };
          break;
        case 'reviewCount-up':
          orderBy = { reviewCount: 'desc' };
          break;
        case 'reviewCount-down':
          orderBy = { reviewCount: 'asc' };
          break;
        case 'updatedAt':
          orderBy = { updatedAt: 'asc' };
          break;
        default:
          orderBy = { updatedAt: 'desc' };
          break;
      }
    }
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          titleEn: true,
          slug: true,
          slugEn: true,
          description: true,
          descriptionEn: true,
          categoryId: true,
          condition: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          isFeatured: true,
          viewCount: true,
          saleCount: true,
          rating: true,
          reviewCount: true,
          storeId: true,
          originalPrice: true,
          minPrice: true,
          discountPercent: true,
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              alt: true,
              url: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              slug: true,
              slugEn: true,
              parentId: true,
            },
          },
          store: { select: { id: true, name: true } },

          variants: {
            where: {
              quantity: { gt: 0 },
            },
            orderBy: { price: 'asc' },
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              quantity: true,
              discountId: true,
              discount: {
                select: {
                  type: true,
                  value: true,
                  isActive: true,
                  startsAt: true,
                  endsAt: true,
                },
              },
            },
          },
        },
        skip,
        take: limitPage,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const now = new Date();
    const data = products.map((product) => {
      const displayVariant =
        product.variants.find(
          (v) =>
            v.discount &&
            v.discount.isActive &&
            (!v.discount.startsAt || new Date(v.discount.startsAt) <= now) &&
            (!v.discount.endsAt || new Date(v.discount.endsAt) >= now)
        ) ??
        product.variants[0] ??
        null;

      return {
        ...product,
        variants: displayVariant ? [displayVariant] : [],
      };
    });

    return {
      data,
      pagination: pagination(total, Number(page), limitPage),
    };
  }

  async approveProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    await this.prisma.product.update({ where: { id }, data: { status: 'approved' } });
    return { message: 'محصول تأیید شد' };
  }

  async featureProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured, status: product.isFeatured ? product.status : 'approved' },
    });

    return { message: updated.isFeatured ? 'محصول ویژه شد' : 'محصول از ویژه خارج شد' };
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    await this.prisma.product.delete({ where: { id } });
    return { message: 'محصول با موفقیت حذف شد' };
  }


  /* ============================================================
   * 📦 CARTS MANAGEMENT (ADMIN)
   * ============================================================ */

  async getCarts(query: DefaultQueryDto) {
    const { limit, order, page = 1 } = query
    const limitPage = limit || Number(this.configService.get('limit.carts'))
    const skip = (page - 1) * limitPage;

    const [data, total] = await Promise.all([
      this.prisma.cartItem.findMany({
        skip,
        select: {
          product: {
            select: {
              id: true,
              slug: true,
              slugEn: true,
              title: true,
              titleEn: true,
            },
          },
          quantity: true,
          createdAt: true,
          id: true,
          variant: {
            select: {
              name: true,
              nameEn: true,
              id: true,
              image: true,
              price: true,
              quantity: true,
              sku: true,
              updatedAt: true,
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
              avatar: true,
              email: true,
              phone: true,
              id: true,
              isVerified: true,
              isActive: true,
            }
          },
        },
        take: limitPage,
        orderBy: { createdAt: order || 'desc' },
      }),
      this.prisma.order.count(),
    ]);
    return { data, pagination: { ...pagination(total, page, limitPage) } };
  }

  /* ============================================================
   * 📦 ORDERS MANAGEMENT (ADMIN)
   * ============================================================ */

  async getOrders(params: { page?: number; status?: string }) {
    const page = params.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, firstName: true, lastName: true } },
          items: { include: { store: { select: { id: true, name: true } } } },
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async updateOrder(id: string, data: { status?: string; trackingCode?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.trackingCode !== undefined) updateData.trackingCode = data.trackingCode;

    const updated = await this.prisma.order.update({ where: { id }, data: updateData });

    return { message: 'سفارش بروزرسانی شد', order: updated };
  }

  /* ============================================================
   * 🏪 SELLERS LIST (ADMIN)
   * ============================================================ */

  async getSellerList() {
    const sellers = await this.prisma.user.findMany({
      where: { role: 'seller' },
      select: {
        id: true,
        username: true,
        store: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sellers.map(s => ({
      id: s.id,
      username: s.username,
      storeName: s.store?.name,
      storeSlug: s.store?.slug,
    }));
  }

  async getSellers(params: { page?: number; status?: string }) {
    const page = params.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = { role: 'seller' };
    if (params.status) where.store = { status: params.status };

    const [sellers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, username: true, email: true, firstName: true, lastName: true,
          isActive: true, isVerified: true, createdAt: true,
          store: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
              businessType: true,
              status: true,
              isActive: true,
              isVerified: true,
              commissionRate: true,
              _count: { select: { products: true, storeReview: true } },
              rating: { select: { avgRating: true, totalReviews: true } },
              storeReview: { select: { rating: true } },
            },
          },
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const sellersFormatted = sellers.map(s => {
      const store = s.store;
      const ratings = store?.storeReview?.map(r => r.rating) || [];
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

      return {
        id: s.id,
        username: s.username,
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        storeName: store?.name,
        storeLogo: store?.logo,
        storeSlug: store?.slug,
        businessType: store?.businessType,
        sellerStatus: store?.status,
        isActive: store?.isActive ?? s.isActive,
        isVerified: store?.isVerified ?? s.isVerified,
        commissionRate: store?.commissionRate,
        createdAt: s.createdAt,
        productCount: store?._count.products,
        totalSales: store?._count.storeReview,
        rating: avgRating,
        reviewCount: ratings.length,
      };
    });

    return { sellers: sellersFormatted, total, page, pages: Math.ceil(total / limit) };
  }

  /* ============================================================
   * ⚙️ SITE SETTINGS
   * ============================================================ */

  async getSiteSettings() {
    const settings = await this.prisma.siteSetting.findMany();
    const result: Record<string, any> = {};
    settings.forEach(s => {
      if (s.type === 'number') result[s.key] = Number(s.value);
      else if (s.type === 'boolean') result[s.key] = s.value === 'true';
      else if (s.type === 'json') result[s.key] = JSON.parse(s.value);
      else result[s.key] = s.value;
    });
    return result;
  }

  async updateSiteSettings(settings: Record<string, string>) {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    return { success: true, message: 'تنظیمات با موفقیت بروزرسانی شد' };
  }
}