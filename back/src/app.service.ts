/**
 * AppService - سرویس اصلی برنامه
 * منطق صفحه اصلی، جستجو و sitemap
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * دریافت داده‌های صفحه اصلی
   * شامل محصولات ویژه، آخرین محصولات، بنرهای فعال و دسته‌بندی‌ها
   */
  async getHomePageData(lang: string = 'fa') {
    const isEn = lang === 'en';

    // دریافت همزمان تمام داده‌های مورد نیاز صفحه اصلی
    const [featuredProducts, latestProducts, banners, categories, siteSettings] = await Promise.all([
      // محصولات ویژه
      this.prisma.product.findMany({
        where: { status: 'approved', isFeatured: true },
        select: {
          variants: {
            where: {
              quantity: {
                gt: 0,
              },
            },
            orderBy: {
              price: 'asc',
            }, take: 1, select: { price: true, quantity: true, discountId: true, discount: { select: { endsAt: true, isActive: true, value: true, type: true, } } }
          },
          images: { where: { isMain: true }, take: 1 },
          category: { select: { name: true, nameEn: true, id: true, slug: true, slugEn: true, } },
          seller: { select: { id: true, storeName: true } },
          brand: { select: { name: true, nameEn: true, slug: true } },
          brandId: true,
          id: true,
          slug: true,
          slugEn: true,
          status: true,
          condition: true,
          description: true,
          descriptionEn: true,
          categoryId: true,
          updatedAt: true,
          isFeatured: true,
          rating: true,
          reviewCount: true,
          saleCount: true,
        },
        take: 12,
        orderBy: { createdAt: 'desc' },
      }),

      // آخرین محصولات
      this.prisma.product.findMany({
        where: { status: 'approved' },
        select: {
          variants: {
            where: {
              quantity: {
                gt: 0,
              },
            },
            orderBy: {
              price: 'asc',
            }, take: 1, select: { price: true, quantity: true, discountId: true, discount: { select: { endsAt: true, isActive: true, value: true, type: true, } } }
          },
          images: { where: { isMain: true }, take: 1 },
          category: { select: { name: true, nameEn: true, id: true, slug: true, slugEn: true, } },
          seller: { select: { id: true, storeName: true } },
          brand: { select: { name: true, nameEn: true, slug: true } },
          brandId: true,
          id: true,
          slug: true,
          slugEn: true,
          status: true,
          condition: true,
          description: true,
          descriptionEn: true,
          categoryId: true,
          updatedAt: true,
          isFeatured: true,
          rating: true,
          reviewCount: true,
          saleCount: true,
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),

      // بنرهای فعال
      this.prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),

      // دسته‌بندی‌های اصلی (بدون والد)
      this.prisma.category.findMany({
        where: { parentId: null, isActive: true },
        include: { children: { where: { isActive: true }, take: 6 } },
        orderBy: { sortOrder: 'asc' },
      }),

      // تنظیمات سایت
      this.prisma.siteSetting.findMany(),
    ]);

    // تبدیل تنظیمات به key-value object
    const settings = {};
    siteSettings.forEach(s => {
      settings[s.key] = s.value;
    });

    return {
      featuredProducts,
      latestProducts,
      banners,
      categories,
      settings,
    };
  }

  /**
   * جستجوی محصولات
   * جستجو در عنوان، توضیحات و نام فروشنده
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 20,
    filters?: { category?: string; minPrice?: number; maxPrice?: number; sort?: string },
  ) {
    const skip = (page - 1) * limit;

    // ساخت شرط‌های where
    const where: any = {
      status: 'approved',
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { titleEn: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { descriptionEn: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.categoryId = filters.category;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    // ترتیب‌بندی
    let orderBy: any = { createdAt: 'desc' };
    if (filters?.sort) {
      switch (filters.sort) {
        case 'price_asc': orderBy = { price: 'asc' }; break;
        case 'price_desc': orderBy = { price: 'desc' }; break;
        case 'newest': orderBy = { createdAt: 'desc' }; break;
        case 'oldest': orderBy = { createdAt: 'asc' }; break;
        case 'popular': orderBy = { saleCount: 'desc' }; break;
        case 'rating': orderBy = { rating: 'desc' }; break;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { where: { isMain: true }, take: 1 },
          category: true,
          seller: { select: { id: true, storeName: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  }

  /**
   * تولید Sitemap برای موتورهای جستجو
   */
  async generateSitemap(lang: string = 'fa') {
    const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
    const isEn = lang === 'en';

    const [products, categories, blogPosts, sellers] = await Promise.all([
      this.prisma.product.findMany({
        where: { status: 'approved' },
        select: { slug: true, slugEn: true, updatedAt: true },
      }),
      this.prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, slugEn: true, updatedAt: true },
      }),
      this.prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, slugEn: true, updatedAt: true },
      }),
      this.prisma.user.findMany({
        where: { role: 'seller', sellerStatus: 'approved', isActive: true },
        select: { storeName: true, updatedAt: true },
      }),
    ]);

    const urls: string[] = [];

    // صفحات ثابت
    urls.push(this.buildUrl(baseUrl, '', 'daily', '1.0'));
    urls.push(this.buildUrl(baseUrl, '/products', 'daily', '0.8'));
    urls.push(this.buildUrl(baseUrl, '/blog', 'weekly', '0.6'));

    // محصولات
    for (const p of products) {
      const slug = isEn && p.slugEn ? p.slugEn : p.slug;
      urls.push(this.buildUrl(baseUrl, `/products/${slug}`, 'weekly', '0.9', p.updatedAt));
    }

    // دسته‌بندی‌ها
    for (const c of categories) {
      const slug = isEn && c.slugEn ? c.slugEn : c.slug;
      urls.push(this.buildUrl(baseUrl, `/categories/${slug}`, 'daily', '0.7', c.updatedAt));
    }

    // وبلاگ
    for (const b of blogPosts) {
      const slug = isEn && b.slugEn ? b.slugEn : b.slug;
      urls.push(this.buildUrl(baseUrl, `/blog/${slug}`, 'monthly', '0.6', b.updatedAt));
    }

    // فروشنده‌ها
    for (const s of sellers) {
      if (s.storeName) {
        urls.push(this.buildUrl(baseUrl, `/seller/${encodeURIComponent(s.storeName)}`, 'weekly', '0.5'));
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  }

  /**
   * Sitemap Index
   */
  async generateSitemapIndex() {
    const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemap-fa.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-en.xml</loc></sitemap>
</sitemapindex>`;
  }

  /**
   * ساخت یک URL برای sitemap
   */
  private buildUrl(base: string, path: string, changefreq: string, priority: string, lastmod?: Date): string {
    const lastmodStr = lastmod ? `<lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>` : '';
    return `  <url>
    <loc>${this.escapeXml(base + path)}</loc>
    ${lastmodStr}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}
