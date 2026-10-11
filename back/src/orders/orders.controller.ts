/**
 * OrdersController - کنترلر سفارشات
 */
import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, BadRequestException, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCheckoutDto, SearchCheckouts, SearchOrders, UpdateCheckoutDto, updateStoreOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { OrdersService } from './orders.service';
import { UserRole } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'ثبت سفارش جدید' })
    async create(@CurrentUser('id') userId: string, @Body() dto: CreateCheckoutDto) {
        return this.ordersService.createCheckout(userId, dto);
    }

    @Get('/me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'لیست سفارشات کاربر' })
    async getMyChekout(@CurrentUser('id') userId: string, @Query() query: SearchCheckouts) {
        return this.ordersService.getMyChekout(userId, query);
    }

    @Get('/admin')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'لیست سفارشات ادمین' })
    async getAdminChekout(@Query() query: SearchCheckouts) {
        return this.ordersService.getAdminChekout(query);
    }

    @Get('/admin/order')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'لیست سفارش فروشگاه توسط ادمین' })
    async getAllAdminOrder(@Query() query: SearchOrders) {
        return this.ordersService.getAdminOrder(query);
    }

    @Get('/store/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'لیست سفارشات فروشنده' })
    async getStoresOrder(@Param('id') storeId: string, @Query() query: SearchOrders) {
        return this.ordersService.getStoresOrder(storeId, query);
    }

    @Get('/id/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'نمایش جزئیات سفارش کاربر و ادمین' })
    async getOrderDetail(@Param('id') id: string) {
        return this.ordersService.getDetailCheckout(id);
    }

    @Put('/edit/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'آپدیت وضعیت سفارش' })
    async updateOrderStore(@Param('id') orderId: string, @Body() body: updateStoreOrderDto) {
        return this.ordersService.updateOrderStore(orderId, body);
    }

    @Put('/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'ویرایش سفارش توسط ادمین و کاربر' })
    async updateCheckout(@Param('id') idCheckout: string, @Body() body: UpdateCheckoutDto, @CurrentUser('role') role: UserRole,) {
        return this.ordersService.updateCheckout(idCheckout, body, role);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'پرداخت سفارش' })
    async updatePayment(@Param('id') chekoutId: string) {
        return this.ordersService.updatePaymentCheckout(chekoutId);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'حذف سفارش توسط کاربر و ادمین' })
    async deleteCheckout(@Param('id') id: string) {
        return this.ordersService.deleteCheckout(id);
    }
}