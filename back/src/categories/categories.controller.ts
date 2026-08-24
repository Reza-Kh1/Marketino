/**
 * CategoriesController - کنترلر دسته‌بندی‌ها
 */
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, SearchCategoryPublic, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  /**
   * دریافت تمام دسته‌بندی‌های فعال - عمومی
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'لیست دسته‌بندی‌های فعال (درختی)' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  /**
 * دریافت تمام دسته‌بندی‌های فعال - عمومی
 */
  @Public()
  @Get('/products')
  @ApiOperation({ summary: 'لیست دسته‌بندی‌های محصول دار' })
  async findNotChildren(@Query() query: SearchCategoryPublic) {
    return this.categoriesService.findNotChildren(query);
  }

  /**
 *دریافت تمام دسته‌بندی ادمین
 */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get('/admin')
  @ApiOperation({ summary: 'لیست دسته‌بندی‌های توسط ادمین' })
  async findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  /**
   * دریافت یک دسته‌بندی با slug - عمومی
   */
  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'جزئیات دسته‌بندی با محصولات' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * ایجاد دسته‌بندی جدید - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد دسته‌بندی جدید (ادمین)' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /**
   * ویرایش دسته‌بندی - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش دسته‌بندی (ادمین)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * حذف دسته‌بندی - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف دسته‌بندی (ادمین)' })
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
