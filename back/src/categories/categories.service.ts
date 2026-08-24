import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, SearchCategoryPublic, UpdateCategoryDto } from './dto/category.dto';
import slugify = require('slugify');
import { BreadcrumbItem } from '@/products/products.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * دریافت تمام دسته‌بندی‌های فعال (برای کاربران عادی)
   * ساختار درختی با children
   */
  async findAll() {
    return this.prisma.category.findMany({
      where: { parentId: null, isActive: true },
      select: {
        name: true,
        nameEn: true,
        slug: true,
        slugEn: true,
        icon: true,
        id: true,
        image: true,
        parentId: true,
        sortOrder: true,
        children: {
          select: {
            name: true,
            nameEn: true,
            slug: true,
            slugEn: true,
            icon: true,
            id: true,
            image: true,
            parentId: true,
            sortOrder: true,
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              select: {
                name: true,
                nameEn: true,
                slug: true,
                slugEn: true,
                icon: true,
                id: true,
                image: true,
                parentId: true,
                sortOrder: true,
              }
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findNotChildren(query: SearchCategoryPublic) {
    const { parentId } = query
    const where = {
      ...(parentId === 'true' && { parentId: null }),
      children: {
        none: {},
      }, isActive: true
    }
    return this.prisma.category.findMany({
      where,
      select: {
        updatedAt: true,
        id: true,
        name: true,
        image: true,
        icon: true,
        nameEn: true,
        slug: true,
        slugEn: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * دریافت تمام دسته‌بندی‌ها (برای ادمین)
   * شامل غیرفعال‌ها
   */
  async findAllAdmin() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { products: true } },
            children: {
              include: {
                _count: { select: { products: true } },
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * دریافت یک دسته‌بندی با شناسه
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true, _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  /**
   * دریافت یک دسته‌بندی با slug
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ slug }, { slugEn: slug }] },
      include: {
        children: { where: { isActive: true } },
      },
    });

    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    let breadcrumbs: BreadcrumbItem[] = [];
    if (category.id) {
      const { ancestorIds } = category;
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
          id: category.id,
          name: category.name,
          nameEn: category.nameEn,
          slug: category.slug,
          slugEn: category.slugEn,
        },
      ];
    }
    return { ...category, breadcrumbs };
  }

  async create(dto: CreateCategoryDto) {
    const slug = this.generateSlug(dto.name);
    const slugEn = dto.nameEn ? this.generateSlug(dto.nameEn) : null;
    let ancestorIds: string[] = [];

    if (dto.parentId) {
      const parent = await this.prisma.category.findUniqueOrThrow({
        where: { id: dto.parentId },
        select: { ancestorIds: true },
      });
      ancestorIds = [...parent.ancestorIds, dto.parentId];
    }

    // اصلاح شد: اضافه شدن ancestorIds به دیتابیس
    return this.prisma.category.create({
      data: { ...dto, slug, slugEn, ancestorIds },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');

    const data: any = { ...dto };
    if (dto.name) data.slug = this.generateSlug(dto.name);
    if (dto.nameEn) data.slugEn = this.generateSlug(dto.nameEn);

    const parentChanged = dto.parentId !== undefined && dto.parentId !== category.parentId;

    if (!parentChanged) {
      return this.prisma.category.update({ where: { id }, data });
    }

    return this.prisma.$transaction(async (tx) => {
      let newAncestorIds: string[] = [];
      if (dto.parentId) {
        const parent = await tx.category.findUniqueOrThrow({
          where: { id: dto.parentId },
          select: { ancestorIds: true },
        });

        if (dto.parentId === id || parent.ancestorIds.includes(id)) {
          throw new BadRequestException('نمی‌توان دسته را زیر خودش یا فرزندش قرار داد');
        }
        newAncestorIds = [...parent.ancestorIds, dto.parentId];
      }

      const updated = await tx.category.update({
        where: { id },
        data: { ...data, ancestorIds: newAncestorIds },
      });

      // به‌روزرسانی فرزندان
      const descendants = await tx.category.findMany({
        where: { ancestorIds: { has: id } },
        select: { id: true, ancestorIds: true },
      });

      for (const d of descendants) {
        const idx = d.ancestorIds.indexOf(id);
        const rebuilt = [...newAncestorIds, id, ...d.ancestorIds.slice(idx + 1)];
        await tx.category.update({
          where: { id: d.id },
          data: { ancestorIds: rebuilt },
        });
      }

      return updated;
    });
  }

  /**
   * حذف دسته‌بندی (در صورت نداشتن محصول)
   */
  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');

    if (category._count.products > 0) {
      // به‌جای حذف، غیرفعال کن
      return this.prisma.category.update({ where: { id }, data: { isActive: false } });
    }

    return this.prisma.category.delete({ where: { id } });
  }

  /**
   * تولید slug از نام
   */
  private generateSlug(text: string): string {
    return slugify(text, { lower: true, strict: true, locale: 'en' });
  }
}
