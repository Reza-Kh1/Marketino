/**
 * UsersService - سرویس مدیریت کاربران
 * مدیریت پروفایل، نقش‌ها، فروشندگان و داشبورد
 */
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, BecomeSellerDto, VerifySellerDto, UserFilterDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * دریافت کاربر با شناسه (بدون رمز عبور)
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, sellerStatus: true, sellerReason: true,
        commissionRate: true, storeName: true, storeLogo: true, storeDescription: true,
        storeDescriptionEn: true, isActive: true, isVerified: true, emailVerified: true,
        hasSetPassword: true, language: true, lastLogin: true, createdAt: true, updatedAt: true,
        _count: { select: { products: true, orders: true, wishlistItems: true } },
      },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  /**
   * دریافت لیست کاربران با فیلتر و صفحه‌بندی - مخصوص ادمین
   */
  async findAll(filters: UserFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 15;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.sellerStatus) where.sellerStatus = filters.sellerStatus;
    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { storeName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, username: true, email: true, firstName: true, lastName: true,
          phone: true, avatar: true, role: true, sellerStatus: true, storeName: true,
          isActive: true, isVerified: true, createdAt: true, lastLogin: true,
          _count: { select: { products: true, orders: true } },
        },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * به‌روزرسانی پروفایل کاربر
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, language: true,
      },
    });
  }

  /**
   * تغییر نقش کاربر - فقط ادمین
   */
  async updateRole(userId: string, role: UserRole) {
    if (!['buyer', 'seller', 'admin'].includes(role)) {
      throw new BadRequestException('نقش نامعتبر است');
    }
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  /**
   * فعال/غیرفعال کردن کاربر - فقط ادمین
   */
  async toggleActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  /**
   * تأیید یا رد فروشنده - فقط ادمین
   */
  async verifySeller(userId: string, dto: VerifySellerDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.role !== 'seller') throw new BadRequestException('این کاربر فروشنده نیست');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        sellerStatus: dto.status,
        sellerReason: dto.reason || null,
        commissionRate: dto.commissionRate ?? user.commissionRate,
      },
    });
  }

  /**
   * درخواست فروشنده شدن توسط کاربر
   */
  async becomeSeller(userId: string, dto: BecomeSellerDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.role === 'seller') throw new BadRequestException('شما قبلاً فروشنده هستید');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'seller',
        sellerStatus: 'pending',
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
        storeDescriptionEn: dto.storeDescriptionEn,
      },
    });
  }

  /**
   * دریافت آمار فروشنده
   */
  async getSellerStats(sellerId: string) {
    const [products, orders, reviews] = await Promise.all([
      this.prisma.product.count({ where: { sellerId } }),
      this.prisma.orderItem.count({ where: { sellerId } }),
      this.prisma.sellerReview.aggregate({
        where: { sellerId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    // محاسبه درآمد فروشنده از آیتم‌های سفارش
    const revenue = await this.prisma.orderItem.aggregate({
      where: { sellerId },
      _sum: { total: true },
    });

    return {
      totalProducts: products,
      totalOrders: orders,
      totalRevenue: revenue._sum.total || 0,
      rating: reviews._avg.rating || 0,
      reviewCount: reviews._count,
    };
  }
}
