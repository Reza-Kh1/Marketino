import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Qna, ReviewApproval, UserRole } from '@prisma/client';
import { CreateQnaDto, UpdateQnaDto } from './dto/qna.create.dto';
import { SearchQnaDto } from './dto/qna.search.dto';
import { ConfigService } from '@nestjs/config';
import pagination from '@/common/utils/pagination';

@Injectable()
export class QnaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,


  ) { }

  async create(userId: string, role: UserRole, dto: CreateQnaDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId }, select: { id: true } });
    if (!product) throw new NotFoundException('محصول مورد نظر پیدا نشد');
    if (dto.parentId) {
      const parent = await this.prisma.qna.findUnique({ where: { id: dto.parentId }, select: { id: true, productId: true } });
      if (!parent) throw new NotFoundException('پرسش یا پاسخ مورد نظر پیدا نشد');
      if (parent.productId !== dto.productId) throw new BadRequestException('پاسخ باید مربوط به همان محصول باشد');
    }
    await this.prisma.qna.create({
      data: {
        content: dto.content, productId: dto.productId, parentId: dto.parentId ?? null,
        userId, role, status: role === "admin" ? ReviewApproval.approved : ReviewApproval.pending
      },
    });
    return { success: true }
  }

  async findByProduct(productId: string, query: SearchQnaDto) {
    const { limit, order, page = 1 } = query
    const limitPage = Number(limit) || Number(this.configService.get('limit.qna'))
    const skip = (page - 1) * limitPage;
    const where = { productId, status: ReviewApproval.approved, parentId: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.qna.findMany({
        where, skip, take: limit, orderBy: { createdAt: order },
        include: {
          replies: {
            where: { status: ReviewApproval.approved },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, firstName: true, lastName: true } } }
          }
        }
      }),
      this.prisma.qna.count({ where })
    ]);
    return {
      items,
      pagination: pagination(total, page, limitPage),
    };
  }

  async findByAdmin(query: SearchQnaDto) {
    const { productId, limit, order, page = 1, parentId, status } = query
    const limitPage = Number(limit) || Number(this.configService.get('limit.qna'))
    const skip = (page - 1) * limitPage;
    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (parentId) where.parentId = parentId;
    if (productId) where.productId = productId
    const [items, total] = await this.prisma.$transaction([
      this.prisma.qna.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: order },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
          parent: {
            select: { content: true, role: true, userId: true, }
          },
          product: { select: { id: true, title: true, titleEn: true } }
        }
      }),
      this.prisma.qna.count({ where })
    ]);
    return {
      items,
      pagination: pagination(total, page, limitPage),
    };
  }

  async findOne(id: string) {
    const qna = await this.prisma.qna.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        replies: {
          where: { status: ReviewApproval.approved },
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, firstName: true, lastName: true } } }
        }
      }
    });
    if (!qna) throw new NotFoundException('پرسش یا پاسخ پیدا نشد');
    return qna;
  }

  async update(id: string, dto: UpdateQnaDto) {
    const qna = await this.prisma.qna.findUnique({ where: { id } });
    if (!qna) throw new NotFoundException('پرسش یا پاسخ پیدا نشد');
    return this.prisma.qna.update({ where: { id }, data: { content: dto.content, status: dto.status }, include: { sender: true } });
  }

  async remove(id: string, userId: string) {
    const qna = await this.prisma.qna.findUnique({ where: { id } });
    if (!qna) throw new NotFoundException('پرسش یا پاسخ پیدا نشد');
    if (qna.userId !== userId) throw new ForbiddenException('شما اجازه حذف این مورد را ندارید');
    return this.prisma.qna.delete({ where: { id } });
  }
}