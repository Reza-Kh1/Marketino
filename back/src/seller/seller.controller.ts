/**
 * SellerController - کنترلر پنل فروشنده
 */
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TrackingStatus } from '@prisma/client';

@ApiTags('Seller')
@Controller('seller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller', 'admin')
@ApiBearerAuth()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'داشبورد فروشنده' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.sellerService.getDashboard(userId);
  }

  @Get('products')
  @ApiOperation({ summary: 'محصولات فروشنده' })
  async getProducts(@CurrentUser('id') userId: string, @Query('status') status?: string, @Query('page') page?: number) {
    return this.sellerService.getSellerProducts(userId, status, page);
  }

  @Get('orders')
  @ApiOperation({ summary: 'سفارشات فروشنده' })
  async getOrders(@CurrentUser('id') userId: string, @Query('status') status?: string, @Query('page') page?: number) {
    return this.sellerService.getSellerOrders(userId, status, page);
  }

  /**
   * 🆕 به‌روزرسانی وضعیت سفارش و کد رهگیری
   */
  @Patch('orders/:orderId')
  @ApiOperation({ summary: 'بروزرسانی سفارش - وضعیت و کد رهگیری' })
  async updateOrder(
    @CurrentUser('id') sellerId: string,
    @Param('orderId') orderId: string,
    @Body() body: { status?: TrackingStatus; trackingCode?: string; sellerNotes?: string; trackingLocation?: string; trackingDescription?: string },
  ) {
    return this.sellerService.updateSellerOrder(sellerId, orderId, body);
  }

  /**
   * 🆕 دریافت رویدادهای رهگیری یک سفارش
   */
  @Get('orders/:orderId/tracking')
  @ApiOperation({ summary: 'رویدادهای رهگیری سفارش' })
  async getTrackingEvents(@CurrentUser('id') sellerId: string, @Param('orderId') orderId: string) {
    return this.sellerService.getTrackingEvents(sellerId, orderId);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'مدیریت موجودی فروشنده' })
  async getInventory(@CurrentUser('id') userId: string) {
    return this.sellerService.getInventory(userId);
  }

  @Patch('inventory/:productId/variants/:variantId')
  @ApiOperation({ summary: 'بروزرسانی موجودی تنوع محصول' })
  async updateInventory(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() body: { quantity: number },
  ) {
    return this.sellerService.updateInventory(userId, productId, variantId, body.quantity);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'آنالیتیکس فروشنده' })
  async getAnalytics(@CurrentUser('id') userId: string, @Query('period') period?: string) {
    return this.sellerService.getAnalytics(userId, period);
  }
}
