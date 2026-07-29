/**
 * AddressesController - کنترلر مدیریت آدرس‌های کاربران
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد آدرس جدید' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'لیست آدرس‌های کاربر' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.addressesService.getUserAddresses(userId);
  }

  @Get('default')
  @ApiOperation({ summary: 'آدرس پیش‌فرض کاربر' })
  async getDefault(@CurrentUser('id') userId: string) {
    return this.addressesService.getDefaultAddress(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات یک آدرس' })
  async findOne(@Param('id') addressId: string, @CurrentUser('id') userId: string) {
    return this.addressesService.findOne(addressId, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'به‌روزرسانی آدرس' })
  async update(@Param('id') addressId: string, @CurrentUser('id') userId: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(addressId, userId, dto);
  }

  @Put(':id/set-default')
  @ApiOperation({ summary: 'تنظیم آدرس به عنوان پیش‌فرض' })
  async setDefault(@Param('id') addressId: string, @CurrentUser('id') userId: string) {
    return this.addressesService.setDefault(addressId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف آدرس' })
  async delete(@Param('id') addressId: string, @CurrentUser('id') userId: string) {
    return this.addressesService.delete(addressId, userId);
  }
}