import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorDto, UpdateColorDto } from './dto/color.dto';
import slugify = require('slugify');
import { ColorSearchDto } from './dto/color.search.dto';
import { ConfigService } from '@nestjs/config';
import pagination from '@/common/utils/pagination';

@Injectable()
export class ColorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * دریافت تمام رنگ‌ها - عمومی
   */
  async findAll() {
    return this.prisma.color.findMany({
      select: { id: true, name: true, nameEn: true, hexCode: true, slug: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * دریافت تمام رنگ‌ها - ادمین
   */
  async findAllAdmin(query: ColorSearchDto) {
    const { search, limit, order, page = 1 } = query    
    const limitPage = Number(limit) || Number(this.configService.get('limit.color'))
    const skip = (Number(page) - 1) * limitPage;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameEn: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [colors, total] = await this.prisma.$transaction([
      this.prisma.color.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: order },
        include: { _count: { select: { productVariants: true } } },
      }),
      this.prisma.color.count({ where })
    ]);
    return {
      colors,
      pagination: pagination(total, page, limitPage),
    }
  }

  /**
   * دریافت یک رنگ
   */
  async findOne(slug: string) {
    const color = await this.prisma.color.findUnique({ where: { slug } });
    if (!color) throw new NotFoundException('رنگ یافت نشد');
    return color;
  }

  /**
   * ایجاد رنگ جدید
   */
  async create(dto: CreateColorDto) {
    return this.prisma.color.create({
      data: { ...dto },
    });
  }

  /**
   * به‌روزرسانی رنگ
   */
  async update(id: string, dto: UpdateColorDto) {
    const color = await this.prisma.color.findUnique({ where: { id } });
    if (!color) throw new NotFoundException('رنگ یافت نشد');  
    const data: any = { ...dto };
    return this.prisma.color.update({ where: { id }, data });
  }

  /**
   * حذف رنگ
   */
  async delete(id: string) {
    const color = await this.prisma.color.findUnique({
      where: { id },
      include: { _count: { select: { productVariants: true } } },
    });
    if (!color) throw new NotFoundException('رنگ یافت نشد');

    if (color._count.productVariants > 0) {
      throw new BadRequestException(
        `امکان حذف این رنگ وجود ندارد زیرا ${color._count.productVariants} محصول به آن متصل است.`
      );
    }

    return this.prisma.color.delete({ where: { id } });
  }
}