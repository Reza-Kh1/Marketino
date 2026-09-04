/**
 * ProductsController - کنترلر محصولات
 * مدیریت محصولات شامل لیست، جزئیات، ایجاد، ویرایش و مدیریت وضعیت
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ProductSearchDto } from '@/admin/dto/product.search.dto';
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  /**
   * دریافت لیست محصولات با فیلتر و صفحه‌بندی - عمومی
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'لیست محصولات با فیلتر' })
  async findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'superAdmin')
  @Get('admin')
  @ApiOperation({ summary: 'لیست تمام محصولات' })
  async getProducts(@Query() query: ProductSearchDto) {
    return this.productsService.getProducts(query);
  }


  @Patch('admin/:id/approve')
  @ApiOperation({ summary: 'تأیید محصول' })
  async approveProduct(@Param('id') id: string) {
    return this.productsService.approveProduct(id);
  }

  @Patch('admin/:id/feature')
  @ApiOperation({ summary: 'ویژه کردن / خارج کردن محصول' })
  async featureProduct(@Param('id') id: any) {
    return this.productsService.featureProduct(id);
  }

  /**
   * دریافت جزئیات یک محصول با slug یا id - عمومی
   */
  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'جزئیات محصول' })
  async findOneOrBySlug(@Param('idOrSlug') idOrSlug: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const product = uuidRegex.test(idOrSlug)
      ? await this.productsService.findOne(idOrSlug)
      : await this.productsService.findBySlug(idOrSlug);
    // افزایش تعداد بازدید
    this.productsService.incrementViewCount(product.id);
    return product;
  }

  /**
   * دریافت محصولات مرتبط - عمومی
   */
  @Public()
  @Get(':idOrSlug/related')
  @ApiOperation({ summary: 'محصولات مرتبط' })
  async getRelated(@Param('idOrSlug') idOrSlug: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const product = uuidRegex.test(idOrSlug)
      ? await this.productsService.findOne(idOrSlug)
      : await this.productsService.findBySlug(idOrSlug);
    return this.productsService.getRelated(product.id);
  }

  /**
   * ایجاد محصول جدید - نیاز به ورود
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'superAdmin')
  @Post('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد محصول جدید' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /**
   * ویرایش محصول - فقط فروشنده خود محصول
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'superAdmin')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش محصول' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /**
   * حذف محصول - فقط فروشنده خود محصول
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'superAdmin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف محصول' })
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
