/**
 * AdminController - کنترلر پنل مدیریت
 * مدیریت کامل سایت: کاربران، فروشندگان، محصولات، سفارشات، همکاران، سود خالص و معیارهای اعتماد
 */
import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UserRole } from '@prisma/client';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { ProductSearchDto } from './dto/product.search.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // ==========================================
  // 📊 DASHBOARD
  // ==========================================

  @Get('dashboard')
  @ApiOperation({ summary: 'داشبورد مدیریت - آمار کامل سایت' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  // ==========================================
  // 💰 NET PROFIT
  // ==========================================

  @Get('net-profit')
  @ApiOperation({ summary: 'سود خالص - کمیسیون منهای هزینه‌های پلتفرم' })
  async getNetProfit(@Query('period') period?: string) {
    return this.adminService.getNetProfit(period || 'month');
  }

  // ==========================================
  // 🛡️ TRUST METRICS
  // ==========================================

  @Get('trust-metrics')
  @ApiOperation({ summary: 'معیارهای اعتماد فروشندگان' })
  async getTrustMetrics() {
    return this.adminService.getTrustMetrics();
  }

  // ==========================================
  // 👥 COLLEAGUES
  // ==========================================

  @Get('colleagues')
  @ApiOperation({ summary: 'لیست همکاران ادمین' })
  async getColleagues(@CurrentUser('id') userId: string) {
    return this.adminService.getColleagues(userId);
  }

  @Post('colleagues')
  @ApiOperation({ summary: 'افزودن همکار جدید (فقط مدیر اصلی)' })
  async addColleague(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateColleagueDto,
  ) {
    return this.adminService.addColleague(userId, dto);
  }

  @Put('colleagues/:id/permissions')
  @ApiOperation({ summary: 'بروزرسانی دسترسی‌های همکار (فقط مدیر اصلی)' })
  async updateColleaguePermissions(
    @CurrentUser('id') userId: string,
    @Param('id') colleagueId: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.adminService.updateColleaguePermissions(userId, colleagueId, dto.permissions);
  }

  @Patch('colleagues/:id/toggle-active')
  @ApiOperation({ summary: 'فعال/غیرفعال کردن همکار (فقط مدیر اصلی)' })
  async toggleColleagueActive(
    @CurrentUser('id') userId: string,
    @Param('id') colleagueId: string,
  ) {
    return this.adminService.toggleColleagueActive(userId, colleagueId);
  }

  @Delete('colleagues/:id')
  @ApiOperation({ summary: 'حذف همکار (فقط مدیر اصلی)' })
  async removeColleague(
    @CurrentUser('id') userId: string,
    @Param('id') colleagueId: string,
  ) {
    return this.adminService.removeColleague(userId, colleagueId);
  }

  // ==========================================
  // 📝 SELLER REVIEWS
  // ==========================================

  @Get('seller-reviews')
  @ApiOperation({ summary: 'لیست تمام نظرات فروشندگان (مدیریت)' })
  async getSellerReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllSellerReviews(page || 1, limit || 20);
  }

  @Delete('seller-reviews/:id')
  @ApiOperation({ summary: 'حذف نظر فروشنده' })
  async deleteSellerReview(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
  ) {
    return this.adminService.deleteSellerReview(userId, reviewId);
  }

  // ==========================================
  // 👤 USERS MANAGEMENT
  // ==========================================

  @Get('users')
  @ApiOperation({ summary: 'لیست تمام کاربران' })
  async getUsers(
    @Query('page') page?: number,
    @Query('role') role?: string,
    @Query('q') q?: string,
  ) {
    return this.adminService.getUsers({ page, role, q });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'جزئیات یک کاربر' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/toggle-active')
  @ApiOperation({ summary: 'فعال/غیرفعال کردن کاربر' })
  async toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  @Patch('users/:id/verify-seller')
  @ApiOperation({ summary: 'تأیید یا رد فروشنده' })
  async verifySeller(
    @Param('id') id: string,
    @Body() data: { approved: boolean; reason?: string },
  ) {
    return this.adminService.verifySeller(id, data);
  }


  @Patch('users/:id/change-role')
  @ApiOperation({ summary: 'تغییر نقش کاربر' })
  async changeUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.adminService.changeUserRole(id, role);
  }

  // ==========================================
  // 🏪 SELLERS MANAGEMENT
  // ==========================================

  @Get('sellers')
  @ApiOperation({ summary: 'لیست فروشندگان' })
  async getSellers(
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSellers({ page, status });
  }

  @Get('seller-list')
  @ApiOperation({ summary: 'لیست فروشندگان برای سلکتور' })
  async getSellerList() {
    return this.adminService.getSellerList();
  }

  // ==========================================
  // 📦 PRODUCTS MANAGEMENT
  // ==========================================

  @Get('products')
  @ApiOperation({ summary: 'لیست تمام محصولات' })
  async getProducts(@Query() query: ProductSearchDto) {
    return this.adminService.getProducts(query);
  }

  @Patch('products/:id/approve')
  @ApiOperation({ summary: 'تأیید محصول' })
  async approveProduct(@Param('id') id: string) {
    return this.adminService.approveProduct(id);
  }

  @Patch('products/:id/feature')
  @ApiOperation({ summary: 'ویژه کردن / خارج کردن محصول' })
  async featureProduct(@Param('id') id: string) {
    return this.adminService.featureProduct(id);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'حذف محصول' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }


  // ==========================================
  // 📦 CARTS MANAGEMENT
  // ==========================================

  @Get('carts/')
  @ApiOperation({ summary: 'دریافت تمام سبد خرید ها' })
  async getCarts(@Query() query: DefaultQueryDto) {
    return this.adminService.getCarts(query);
  }

  // ==========================================
  // 📦 ORDERS MANAGEMENT
  // ==========================================

  @Get('orders')
  @ApiOperation({ summary: 'لیست تمام سفارشات' })
  async getOrders(
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getOrders({ page, status });
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'بروزرسانی وضعیت سفارش' })
  async updateOrder(
    @Param('id') id: string,
    @Body() data: { status?: string; trackingCode?: string },
  ) {
    return this.adminService.updateOrder(id, data);
  }

  // ==========================================
  // ⚙️ SETTINGS
  // ==========================================

  @Get('settings')
  @ApiOperation({ summary: 'تنظیمات سایت' })
  async getSettings() {
    return this.adminService.getSiteSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'به‌روزرسانی تنظیمات سایت' })
  async updateSettings(@Body() settings: Record<string, string>) {
    return this.adminService.updateSiteSettings(settings);
  }
}
