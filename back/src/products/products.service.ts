/**
 * ProductsService - سرویس مدیریت محصولات
 * CRUD کامل، مدیریت وضعیت، جستجو و فیلتر
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import slugifyLib = require('slugify');
import { Prisma } from '@prisma/client';
export interface BreadcrumbItem {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  slugEn: string | null;
}
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * دریافت لیست محصولات با فیلتر و صفحه‌بندی
   */
  async findAll(filters: ProductFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = { status: filters.status || 'approved' };

    if (filters.category) where.categoryId = filters.category;
    if (filters.seller) where.sellerId = filters.seller;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.minPrice = {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sort) {
      const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
        price_asc: { minPrice: 'asc' },
        price_desc: { minPrice: 'desc' },
        newest: { createdAt: 'desc' },
        oldest: { createdAt: 'asc' },
        popular: { saleCount: 'desc' },
        rating: { rating: 'desc' },
      };
      orderBy = sortMap[filters.sort] || orderBy;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: {
          id: true, title: true, titleEn: true, slug: true, slugEn: true,
          description: true, descriptionEn: true, categoryId: true,
          condition: true, status: true, updatedAt: true,
          isFeatured: true, viewCount: true, saleCount: true, rating: true,
          reviewCount: true, sellerId: true, brandId: true,
          originalPrice: true, minPrice: true, discountPercent: true,
          brand: { select: { name: true, nameEn: true, slug: true } },
          images: { select: { alt: true, sortOrder: true, url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
          category: { select: { name: true, nameEn: true, icon: true, slug: true, slugEn: true } },
          seller: { select: { id: true, storeName: true, storeLogo: true } },
        },
        skip, take: limit, orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * دریافت یک محصول با slug
   */
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug }, { slugEn: slug }],
        status: 'approved',
      },
      select: {
        condition: true, content: true, contentEn: true, description: true, descriptionEn: true, digitalFile: true, minPrice: true, isDigital: true,
        isFeatured: true, slug: true, slugEn: true, metaTitle: true, metaTitleEn: true, productTable: true, productTableEn: true, rating: true,
        saleCount: true, reviewCount: true, originalPrice: true, title: true, titleEn: true, viewCount: true, id: true, discountPercent: true,
        brand: { select: { name: true, nameEn: true, slug: true } },
        images: {
          select: { alt: true, url: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        seller: { select: { storeName: true } },
        reviews: {
          select: { body: true, answerReview: true, user: { select: { id: true, firstName: true, lastName: true } }, rating: true, updatedAt: true },
          where: { isApproved: true },
          take: 5,
          orderBy: { updatedAt: 'desc' }
        },
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            slug: true,
            slugEn: true,
            ancestorIds: true,
          },
        },
        variants: {
          select: {
            id: true,
            discountId: true,
            colorId: true,
            name: true,
            nameEn: true,
            image: true,
            price: true,
            quantity: true,
            sku: true,
            saleCount: true,
            color: { select: { hexCode: true, name: true, nameEn: true } },
            discount: {
              where: { isActive: true },
              select: { type: true, endsAt: true, startsAt: true, value: true, isActive: true },
            },
            attributes: {
              select: {
                value: true,
                attribute: { select: { key: true, label: true } },
              },
            },
          },
        },
        qnas: {
          select: {
            id: true, content: true, role: true, updatedAt: true, _count: true,
            replies: {
              where: { status: 'approved' },
              take: 5,
              select: {
                id: true, content: true, role: true, updatedAt: true,
              },
            }
          },
          where: { status: 'approved', parentId: null },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } },
            qnas: { where: { status: 'approved', parentId: null } },
          },
        },
      },
    });

    if (!product) throw new NotFoundException('محصول یافت نشد');
    let breadcrumbs: BreadcrumbItem[] = [];
    if (product.category) {
      const { ancestorIds } = product.category;
      const parentCategories = await this.prisma.category.findMany({
        where: { id: { in: ancestorIds } },
        select: { id: true, name: true, nameEn: true, slug: true, slugEn: true },
      });
      const parentMap = new Map(parentCategories.map((c) => [c.id, c]));
      const sortedParents = ancestorIds
        .map((ancestorId) => parentMap.get(ancestorId))
        .filter((item): item is BreadcrumbItem => Boolean(item));
      breadcrumbs = [
        ...sortedParents,
        {
          id: product.category.id,
          name: product.category.name,
          nameEn: product.category.nameEn,
          slug: product.category.slug,
          slugEn: product.category.slugEn,
        },
      ];
    }

    return { ...product, breadcrumbs, };
  }

  /**
   * دریافت یک محصول با id
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id }] },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: {
          select: { name: true, nameEn: true, icon: true, slug: true, slugEn: true, }
        },
        variants: {
          include: {
            discount: true,
            attributes: true,
          }
        },
        seller: { select: { id: true, username: true, storeName: true, storeLogo: true, storeDescription: true } },
        reviews: {
          include: { user: { select: { id: true, username: true, avatar: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' }, take: 10
        },
      },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  /**
   * ایجاد محصول جدید
    */
  async create(userId: string, dto: CreateProductDto) {
    const slug = this.generateSlug(dto.title);
    const slugEn = dto.titleEn ? this.generateSlug(dto.titleEn) : null;
    const { images, ...rest } = dto;
    // بررسی یکتا بودن slug
    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) throw new BadRequestException('محصولی با این عنوان وجود دارد');

    return this.prisma.product.create({
      data: {
        ...rest,
        slug,
        slugEn,
        sellerId: userId,
        status: 'pending',
        ...(images?.length && {
          images: {
            connect: images?.map((i) => ({ url: i }))
          }
        }),
      },
      include: { images: true, category: true },
    });
  }

  /**
   * به‌روزرسانی محصول (فقط فروشنده خود محصول)
    */
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    const { images, ...rest } = dto;
    const data: any = { ...rest };
    if (dto.title && dto.title !== product.title) {
      data.slug = this.generateSlug(dto.title);
    }
    if (dto.titleEn && dto.titleEn !== product.titleEn) {
      data.slugEn = this.generateSlug(dto.titleEn);
    }
    if (images !== undefined) {
      data.images = {
        set: images.map((imgId: string) => ({ url: imgId })),
      };
    }
    try {
      return await this.prisma.product.update({
        where: { id },
        data,
        include: { images: true, category: true },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('محصولی با این عنوان وجود دارد');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('یکی از عکس‌های انتخاب‌شده یافت نشد');
      }
      throw error;
    }
  }

  /**
   * حذف محصول (تغییر وضعیت به inactive)
   */
  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { status: 'inactive' } });
  }

  /**
   * تأیید محصول توسط ادمین
   */
  async approve(id: string) {
    return this.prisma.product.update({ where: { id }, data: { status: 'approved' } });
  }

  /**
   * تغییر وضعیت ویژه بودن محصول
   */
  async toggleFeature(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return this.prisma.product.update({ where: { id }, data: { isFeatured: !product.isFeatured } });
  }

  /**
   * افزایش تعداد بازدید محصول
   */
  async incrementViewCount(id: string) {
    return this.prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  }

  /**
   * دریافت محصولات مرتبط (هم‌دسته)
   */
  async getRelated(productId: string, limit: number = 6) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    return this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: productId }, status: 'approved' },
      include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      take: limit, orderBy: { saleCount: 'desc' },
    });
  }

  /**
   * تولید slug از عنوان
   */
  private generateSlug(text: string): string {
    const base = slugifyLib(text, { lower: true, strict: true, locale: 'en' });
    return `${base}-${Date.now().toString(36)}`;
  }
}