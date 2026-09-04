/**
 * ProductsService - سرویس مدیریت محصولات
 * CRUD کامل، مدیریت وضعیت، جستجو و فیلتر
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import slugifyLib = require('slugify');
import { Prisma, ProductCondition, ProductStatus } from '@prisma/client';
import { ProductSearchDto } from '@/admin/dto/product.search.dto';
import { ConfigService } from '@nestjs/config';
import pagination from '@/common/utils/pagination';

export const productSelector: Prisma.ProductSelect = {
  id: true, title: true, titleEn: true, slug: true, slugEn: true, categoryId: true,
  condition: true, status: true, updatedAt: true,
  isFeatured: true, viewCount: true, saleCount: true, rating: true,
  reviewCount: true, storeId: true, brandId: true,
  originalPrice: true, minPrice: true, discountPercent: true,
  brand: { select: { name: true, nameEn: true, slug: true } },
  images: { select: { alt: true, sortOrder: true, url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
  category: { select: { name: true, nameEn: true, icon: true, slug: true, slugEn: true } },
}
export interface BreadcrumbItem {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  slugEn: string | null;
}
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) { }

  /**
   * دریافت لیست محصولات با فیلتر و صفحه‌بندی
   */
  async findAll(filters: ProductFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = { status: filters.status || 'approved' };

    if (filters.category) where.categoryId = filters.category;
    if (filters.seller) where.storeId = filters.seller;
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
        select: productSelector,
        skip, take: limit, orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getProducts(params: ProductSearchDto) {
    const { brandId, categoryId, condition, featured, limit, sort, page = 1, search, sellerId, status, discountId, maxPrice, minPrice } = params;

    const limitPage = Number(limit) || Number(this.configService.get('limit.product') || 10);
    const skip = (Number(page) - 1) * limitPage;
    const where: Prisma.ProductWhereInput = {
      ...(brandId && { brandId }),
      ...(categoryId && { categoryId }),
      ...(sellerId && { storeId: sellerId }),
      ...((condition && condition !== 'all') && { condition: condition as ProductCondition }),
      ...((status && status !== 'all') && { status: status as ProductStatus }),
      ...((featured && featured === 'true') && { isFeatured: true }),
      // ✅ شرط درست برای discountId
      ...(discountId && discountId !== 'all' && discountId !== 'undefined' && {
        variants: {
          some: { discountId }
        }
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
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

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
          orderBy = { createdAt: 'desc' };
          break;
      }
    }
    const [productss, total] = await Promise.all([
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
    const products = productss.map((product) => {
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
      products,
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
        store: { select: { name: true, nameEn: true, logo: true, slug: true, } },
        images: {
          select: { alt: true, url: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          select: { body: true, answerReview: true, user: { select: { id: true, firstName: true, lastName: true } }, rating: true, createdAt: true },
          where: { isApproved: true },
          take: 3,
          orderBy: { createdAt: 'desc' }
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
            id: true, content: true, role: true, createdAt: true, _count: true,
            replies: {
              where: { status: 'approved' },
              take: 3,
              select: {
                id: true, content: true, role: true, createdAt: true,
              },
            }
          },
          where: { status: 'approved', parentId: null },
          take: 3,
          orderBy: { createdAt: 'desc' },
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
        store: { select: { id: true, name: true, slug: true, logo: true, description: true } },
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
  async create(dto: CreateProductDto) {
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
        storeId: dto.storeId,
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
    return this.prisma.product.delete({ where: { id } });
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