/**
 * AppController - کنترلر اصلی برنامه
 * مدیریت صفحه اصلی، جستجو و sitemap
 */
import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * صفحه اصلی سایت
   * نمایش محصولات ویژه، دسته‌بندی‌ها و بنرها
   */
  @Get()
  @ApiOperation({ summary: 'صفحه اصلی', description: 'محصولات ویژه، دسته‌بندی‌ها و بنرهای صفحه اصلی' })
  async homePage(@Query('lang') lang: string) {
    return this.appService.getHomePageData(lang);
  }

  /**
   * جستجوی محصولات
   * پشتیبانی از جستجوی فارسی و انگلیسی
   */
  @Get('search')
  @ApiOperation({ summary: 'جستجوی محصولات' })
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sort') sort?: string,
  ) {
    return this.appService.search(query, page, limit, { category, minPrice, maxPrice, sort });
  }

  /**
   * Sitemap XML
   * برای موتورهای جستجو - نسخه فارسی
   */
  @Get('sitemap-fa.xml')
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Sitemap فارسی' })
  async sitemapFa(@Res() res: Response) {
    const xml = await this.appService.generateSitemap('fa');
    return res.send(xml);
  }

  /**
   * Sitemap XML - نسخه انگلیسی
   */
  @Get('sitemap-en.xml')
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Sitemap انگلیسی' })
  async sitemapEn(@Res() res: Response) {
    const xml = await this.appService.generateSitemap('en');
    return res.send(xml);
  }

  /**
   * Sitemap Index - فهرست sitemapها
   */
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Sitemap Index' })
  async sitemapIndex(@Res() res: Response) {
    const xml = await this.appService.generateSitemapIndex();
    return res.send(xml);
  }
}
