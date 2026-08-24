/**
 * UsersService - سرویس مدیریت کاربران
 * مدیریت پروفایل، نقش‌ها، فروشندگان و داشبورد
 */
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UserFilterDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
import pagination from '@/common/utils/pagination';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) { }

  /**
   * دریافت کاربر با شناسه (بدون رمز عبور)
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, store: { select: { commissionRate: true } },
        isActive: true, isVerified: true, emailVerified: true,
        hasSetPassword: true, language: true, lastLogin: true, createdAt: true, updatedAt: true,
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
    const limit = Number(this.configService.get('limit.users'))
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, username: true, email: true, firstName: true, lastName: true,
          phone: true, avatar: true, role: true,
          isActive: true, isVerified: true, createdAt: true, lastLogin: true,
        },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, pagination: pagination(total, page, limit) };
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
    if (!['buyer', 'seller', 'admin', 'superAdmin'].includes(role)) {
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
}
