/**
 * BlogService - سرویس مدیریت وبلاگ
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import slugify = require('slugify');
@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * دریافت لیست پست‌های منتشر شده
   */
  async findAll(page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;
    const where = { status: 'published' } as any
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        include: { author: { select: { username: true, firstName: true, lastName: true, avatar: true } } },
        skip, take: limit, orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * دریافت یک پست با slug
   */
  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { OR: [{ slug }, { slugEn: slug }] },
      include: { author: { select: { username: true, firstName: true, lastName: true, avatar: true } } },
    });
    if (!post) throw new NotFoundException('پست یافت نشد');
    // افزایش بازدید
    await this.prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
    return post;
  }

  /**
   * دریافت تمام پست‌ها - ادمین
   */
  async findAllAdmin(page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        include: { author: { select: { username: true } } },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count(),
    ]);
    return { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * ایجاد پست جدید
   */
  async create(authorId: string, dto: CreateBlogDto) {
    const slug = `${slugify(dto.title, { lower: true, strict: true })}-${Date.now().toString(36)}`;
    const slugEn = dto.titleEn ? `${slugify(dto.titleEn, { lower: true, strict: true })}-${Date.now().toString(36)}` : null;

    return this.prisma.blogPost.create({
      data: {
        ...dto,
        slug, slugEn,
        authorId,
        publishedAt: dto.status === 'published' ? new Date() : null,
      },
    });
  }

  /**
   * به‌روزرسانی پست
   */
  async update(id: string, dto: UpdateBlogDto) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('پست یافت نشد');

    const data: any = { ...dto };
    if (dto.status === 'published' && post.status !== 'published') {
      data.publishedAt = new Date();
    }

    return this.prisma.blogPost.update({ where: { id }, data });
  }

  /**
   * حذف پست
   */
  async delete(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('پست یافت نشد');
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
