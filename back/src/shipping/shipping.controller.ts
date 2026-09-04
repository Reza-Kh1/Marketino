import { Controller, Get, Post, Body, Delete, Param, HttpCode, HttpStatus, Put, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateShippingMethodDto, CreateStoreShippingDto, CreateStoreShippingRateDto, UpdateStoreShippingDto } from './dto/shipping.dto';
import { ShippingService } from './shipping.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { query } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    @Get('order/:provinceId')
    @ApiOperation({ summary: 'Get all shipping methods' })
    @ApiResponse({ status: 200, description: 'Success' })
    shippingForOrder(@Param('provinceId') provinceId: string, @CurrentUser('id') userId: string) {
        return this.shippingService.getShippingWithProvince(provinceId, userId);
    }

    @Post('/')
    @ApiOperation({ summary: 'Create a new shipping method' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    createShipping(@Body() dto: CreateShippingMethodDto) {
        return this.shippingService.createShipping(dto);
    }

    @Put('/:id')
    @ApiOperation({ summary: 'Create a new shipping method' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    updateShipping(@Param('id') id: string, @Body() dto: CreateShippingMethodDto) {
        return this.shippingService.updateShipping(id, dto);
    }

    @Get('/')
    @ApiOperation({ summary: 'Get all shipping methods' })
    @ApiResponse({ status: 200, description: 'Success' })
    findAllShipping(@CurrentUser('role') userId: UserRole) {
        return this.shippingService.findAllShipping(userId);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete a shipping method' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 204, description: 'Deleted' })
    @ApiResponse({ status: 404, description: 'Not found' })
    removeShipping(@Param('id') id: string) {
        return this.shippingService.removeShipping(id);
    }

    // شیوه ارسال شخصی سازی شده توسط فروشنده StoreShippingMethod
    @Post('store')
    @ApiOperation({ summary: 'Create a new shipping method' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    createStoreShipping(@CurrentUser('id') userId: string,
        @Body() dto: CreateStoreShippingDto) {
        return this.shippingService.createStoreShipping(userId, dto);
    }

    @Get('store')
    @ApiOperation({ summary: 'Get all shipping store methods' })
    @ApiResponse({ status: 200, description: 'Success' })
    getAllMeStoreShipping(@CurrentUser('id') userId: UserRole) {
        return this.shippingService.getAllMeStoreShipping(userId);
    }

    @Get('store/:id')
    @ApiOperation({ summary: 'Get all shipping store methods' })
    @ApiResponse({ status: 200, description: 'Success' })
    getOneStoreShipping(@Param('id') id: string) {
        return this.shippingService.getOneStoreShipping(id);
    }

    @Put('store/:id')
    @ApiOperation({ summary: 'Create a new shipping method' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    updateStoreShipping(@Param('id') id: string, @Body() dto: UpdateStoreShippingDto) {
        return this.shippingService.updateStoreShipping(id, dto);
    }

    @Delete('store/:id')
    @ApiOperation({ summary: 'Delete a shipping method' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 204, description: 'Deleted' })
    @ApiResponse({ status: 404, description: 'Not found' })
    removeStoreShipping(@Param('id') id: string) {
        return this.shippingService.removeStoreShipping(id);
    }

    // ثبت قیمت مختص به استان ها StoreShippingRate
    @Post('rate/')
    @ApiOperation({ summary: 'Create a new shipping method' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    createShippingRate(@Body() dto: CreateStoreShippingRateDto) {
        return this.shippingService.createShippingRate(dto);
    }

    @Put('rate/:id')
    @ApiOperation({ summary: 'Create a new shipping method' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    updateShippingRate(@Param('id') id: string, @Body() dto: CreateStoreShippingRateDto) {
        return this.shippingService.updateShippingRate(id, dto);
    }

    @Delete('rate/:id')
    @ApiOperation({ summary: 'Delete a shipping method' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 204, description: 'Deleted' })
    @ApiResponse({ status: 404, description: 'Not found' })
    removeShippingRate(@Param('id') id: string) {
        return this.shippingService.removeShippingRate(id);
    }
}