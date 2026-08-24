import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // مسیر سرویس پرسیما پروژه خود را قرار دهید
import { SearchProductsDto, SortOption } from './dto/search.dto';
import { Prisma } from '@prisma/client';
import pagination from '@/common/utils/pagination';
import { productSelector } from '@/products/products.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { }

  async searchProducts(dto: SearchProductsDto) {
    const {
      category,
      q,
      brand,
      hasOffer,
      featured,
      condition,
      storeId,
      minPrice,
      maxPrice,
      sortBy = SortOption.NEWEST,
      page = 1,
      limit = 10,
    } = dto;
    const where: Prisma.ProductWhereInput = {
      status: 'approved',
    };

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { titleEn: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (brand) {
      where.brand = {
        OR: [
          { slug: { equals: brand, mode: 'insensitive' } },
          { name: { equals: brand, mode: 'insensitive' } },
        ],
      };
    }

    if (hasOffer) {
      where.discountPercent = { not: null };
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (condition) {
      where.condition = condition as any;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.minPrice = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {};

    switch (sortBy) {
      case SortOption.BEST_SELLING:
        orderBy = { saleCount: 'desc' };
        break;
      case SortOption.POPULAR:
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
        break;
      case SortOption.PRICE_HIGH:
        orderBy = { minPrice: 'desc' };
        break;
      case SortOption.PRICE_LOW:
        orderBy = { minPrice: 'asc' };
        break;
      case SortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
    const skip = (page - 1) * limit;
    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: productSelector,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: pagination(totalCount, page, limit)
    };
  }
}