/**
 * UsersController - کنترلر کاربران
 */
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, BecomeSellerDto, VerifySellerDto, UserFilterDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * پروفایل کاربر فعلی
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'پروفایل کاربر فعلی' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  /**
   * به‌روزرسانی پروفایل کاربر
   */
  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش پروفایل' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  /**
   * درخواست فروشنده شدن
   */
  @UseGuards(JwtAuthGuard)
  @Post('become-seller')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'درخواست فروشنده شدن' })
  async becomeSeller(@CurrentUser('id') userId: string, @Body() dto: BecomeSellerDto) {
    return this.usersService.becomeSeller(userId, dto);
  }

  /**
   * آمار فروشنده
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Get('seller/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'آمار داشبورد فروشنده' })
  async getSellerStats(@CurrentUser('id') userId: string) {
    return this.usersService.getSellerStats(userId);
  }

  /**
   * لیست کاربران - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست کاربران (ادمین)' })
  async findAll(@Query() filters: UserFilterDto) {
    return this.usersService.findAll(filters);
  }

  /**
   * جزئیات کاربر - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جزئیات کاربر (ادمین)' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * تغییر نقش کاربر - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تغییر نقش کاربر (ادمین)' })
  async updateRole(@Param('id') id: string, @Body('role') role:UserRole ) {
    return this.usersService.updateRole(id, role);
  }

  /**
   * فعال/غیرفعال کردن کاربر - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'فعال/غیرفعال کردن کاربر (ادمین)' })
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  /**
   * تأیید/رد فروشنده - فقط ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/verify-seller')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تأیید یا رد فروشنده (ادمین)' })
  async verifySeller(@Param('id') id: string, @Body() dto: VerifySellerDto) {
    return this.usersService.verifySeller(id, dto);
  }
}
