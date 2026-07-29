/**
 * DiscountsController - کنترلر کدهای تخفیف
 */
import { Controller, Get, Post, Delete, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/discount.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ValidateDiscountDto } from './dto/validate.discount.dto';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) { }

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'اعتبارسنجی کد تخفیف' })
  @ApiBody({ type: ValidateDiscountDto })
  async validate(@Body() body: ValidateDiscountDto) {    
    return this.discountsService.validate(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست کدهای تخفیف (ادمین)' })
  async findAll(@Query('page') page?: number) {
    return this.discountsService.findAll(page || 1);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد کد تخفیف جدید (ادمین)' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateDiscountDto) {
    return this.discountsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف کد تخفیف (ادمین)' })
  async delete(@Param('id') id: string) {
    return this.discountsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'فعال/غیرفعال کردن کد تخفیف (ادمین)' })
  async toggleActive(@Param('id') id: string) {
    return this.discountsService.toggleActive(id);
  }
}
