/**
 * OrdersController - کنترلر سفارشات
 */
import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CreatePaymentDto, CreateRefundDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { OrdersService } from './orders.service';

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
}