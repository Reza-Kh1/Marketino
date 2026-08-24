import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ColorsService } from './colors.service';
import { CreateColorDto, UpdateColorDto } from './dto/color.dto';
import { ColorSearchDto } from './dto/color.search.dto';

@ApiTags('Colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'لیست رنگ‌ها' })
  async findAll() {
    return this.colorsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get('/admin')
  @ApiOperation({ summary: 'لیست رنگ‌ها (ادمین)' })
  async findAllAdmin(@Query() query: ColorSearchDto) {
    return this.colorsService.findAllAdmin(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'جزئیات رنگ' })
  async findOne(@Param('id') id: string) {
    return this.colorsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد رنگ جدید (ادمین)' })
  async create(@Body() dto: CreateColorDto) {
    return this.colorsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش رنگ (ادمین)' })
  async update(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    return this.colorsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف رنگ (ادمین)' })
  async delete(@Param('id') id: string) {
    return this.colorsService.delete(id);
  }
}