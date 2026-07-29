/**
 * BlogController - کنترلر وبلاگ
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'لیست پست‌های وبلاگ' })
  async findAll(@Query('page') page?: number) {
    return this.blogService.findAll(page);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'جزئیات پست وبلاگ' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد پست جدید (ادمین)' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateBlogDto) {
    return this.blogService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش پست (ادمین)' })
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف پست (ادمین)' })
  async delete(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تمام پست‌ها (ادمین)' })
  async findAllAdmin(@Query('page') page?: number) {
    return this.blogService.findAllAdmin(page);
  }
}
