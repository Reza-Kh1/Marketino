/**
 * OrdersController - کنترلر سفارشات
 */
import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CreatePaymentDto, CreateRefundDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ثبت سفارش جدید' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست سفارشات کاربر' })
  async getUserOrders(@CurrentUser('id') userId: string, @Query() query: DefaultQueryDto) {
    return this.ordersService.getUserOrders(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لغو سفارش توسط خریدار' })
  async cancelOrder(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.cancelOrder(id, userId);
  }

  /**
   * 🆕 رهگیری سفارش (عمومی با شماره سفارش)
   */
  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'رهگیری سفارش با شماره سفارش' })
  async trackByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.trackOrder(orderNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جزئیات سفارش' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  /**
   * 🆕 رهگیری سفارش کاربر
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/tracking')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'رهگیری سفارش با آیدی' })
  async trackById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.trackOrderById(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Get('seller/items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'سفارشات فروشنده' })
  async getSellerOrders(@CurrentUser('id') userId: string, @Query('page') page?: number) {
    return this.ordersService.getSellerOrders(userId, page);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تغییر وضعیت سفارش' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تمام سفارشات (ادمین)' })
  async getAllOrders(@Query('status') status?: string, @Query('page') page?: number) {
    return this.ordersService.getAllOrders(status, page);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'آمار سفارشات (ادمین)' })
  async getStats() {
    return this.ordersService.getOrderStats();
  }

  /**
   * 🆕 ایجاد پرداخت برای سفارش
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/payments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد پرداخت برای سفارش' })
  async createPayment(@Param('id') orderId: string, @CurrentUser('id') userId: string, @Body() dto: CreatePaymentDto) {
    const order = await this.ordersService.findOne(orderId);
    if (order.userId !== userId) throw new BadRequestException('دسترسی ندارید');
    return this.ordersService.createPayment(orderId, dto);
  }

  /**
   * 🆕 تأیید پرداخت
   */
  @UseGuards(JwtAuthGuard)
  @Patch('payments/:paymentId/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تأیید پرداخت' })
  async confirmPayment(@Param('paymentId') paymentId: string, @Body('gatewayRef') gatewayRef?: string) {
    return this.ordersService.confirmPayment(paymentId, gatewayRef);
  }

  /**
   * 🆕 دریافت پرداخت‌های سفارش
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/payments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست پرداخت‌های سفارش' })
  async getOrderPayments(@Param('id') orderId: string) {
    return this.ordersService.getOrderPayments(orderId);
  }

  /**
   * 🆕 ایجاد درخواست مرجوعی
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/refunds')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'درخواست مرجوعی سفارش' })
  async createRefund(@Param('id') orderId: string, @CurrentUser('id') userId: string, @Body() dto: CreateRefundDto) {
    return this.ordersService.createRefund(orderId, userId, dto);
  }

  /**
   * 🆕 لیست مرجوعی‌های کاربر
   */
  @UseGuards(JwtAuthGuard)
  @Get('refunds')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست مرجوعی‌های کاربر' })
  async getUserRefunds(@CurrentUser('id') userId: string) {
    return this.ordersService.getUserRefunds(userId);
  }

  /**
   * 🆕 پردازش مرجوعی (ادمین)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('refunds/:refundId/process')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'پردازش مرجوعی توسط ادمین' })
  async processRefund(@Param('refundId') refundId: string, @Body('status') status: 'paid' | 'cancelled') {
    return this.ordersService.processRefund(refundId, status);
  }
}
