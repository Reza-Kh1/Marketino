/**
 * ProductsService - سرویس مدیریت محصولات
 * CRUD کامل، مدیریت وضعیت، جستجو و فیلتر
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import slugifyLib = require('slugify');
import { CreateVariantDto } from './dto/variant.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }
  generateSku() {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part = () =>
      Array.from({ length: 4 }, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('');

    return `${part()}-${part()}-${part()}`;
  }
  /**
   * دریافت لیست محصولات با فیلتر و صفحه‌بندی
   */
  async findAll(filters: ProductFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;
    const where: any = { status: filters.status || 'approved' };

    if (filters.category) where.categoryId = filters.category;
    if (filters.seller) where.sellerId = filters.seller;
    // Price filtering via variants since price moved from Product to ProductVariant
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.variants = {};
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        (where.variants as any).price = {};
        if (filters.minPrice !== undefined) (where.variants as any).price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) (where.variants as any).price.lte = filters.maxPrice;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sort) {
      const sortMap = {
        price_asc: { price: 'asc' }, price_desc: { price: 'desc' },
        newest: { createdAt: 'desc' }, oldest: { createdAt: 'asc' },
        popular: { saleCount: 'desc' }, rating: { rating: 'desc' },
      };
      orderBy = sortMap[filters.sort] || orderBy;
    }
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
      select: {
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
          id: true,
          isFeatured: true,
          viewCount: true,
          saleCount: true,
          rating: true,
          reviewCount: true,
          sellerId: true,
          brandId: true,
          brand: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: true,
          seller: { select: { id: true, storeName: true, storeLogo: true } },
          variants: { select: { id: true, name: true, sku: true, price: true, quantity: true } },
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
      where: { OR: [{ slug }, { slugEn: slug }] },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        seller: { select: { id: true, username: true, storeName: true, storeLogo: true, storeDescription: true } },
        reviews: { include: { user: { select: { id: true, username: true, avatar: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  /**
   * دریافت یک محصول با id
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true, seller: { select: { id: true, storeName: true } } },
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
   * ایجاد Variant برای محصول
   */
  async createVariant(dto: CreateVariantDto) {
    const variant = await this.prisma.productVariant.create({
      data: {
        ...dto,
        quantity: Number(dto.quantity),
        price: Number(dto.price),
        sku: this.generateSku()
      },
    });

    return variant;
  }

  /**
   * دریافت لیست Variantهای محصول
   */
  async getVariants(productId: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
    return variants;
  }

  /**
   * به‌روزرسانی Variant
   */
  async updateVariant(variantId: string, dto: CreateVariantDto) {
    const updateData: any = { ...dto };

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        attributes: dto.attributes || undefined,
        attributesEn: dto.attributesEn || undefined,
        discountId: dto.discountId || null,
        image: dto.image || null,
        name: dto.name || undefined,
        nameEn: dto.nameEn || null,
        price: Number(dto.price) || undefined,
        quantity: Number(dto.quantity) || undefined,
      },
    });

    return updated;
  }

  /**
   * حذف Variant
   */
  async deleteVariant(variantId: string) {
    await this.prisma.productVariant.delete({
      where: { id: variantId },
    });

    return { success: true, message: 'تنوع محصول با موفقیت حذف شد' };
  }

  /**
   * تولید slug از عنوان
   */
  private generateSlug(text: string): string {
    const base = slugifyLib(text, { lower: true, strict: true, locale: 'en' });
    return `${base}-${Date.now().toString(36)}`;
  }
}
