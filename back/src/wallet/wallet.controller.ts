import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, BadRequestException, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WalletSearchDto, WalletTransactionSearchDto } from './dto/wallet.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get('my')
  @ApiOperation({ summary: 'دریافت کیف پول کاربر' })
  async getMyWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getMyWallet(userId);
  }

  @Get('profile/:id')
  @UseGuards(RolesGuard)
  @Roles('superAdmin')
  @ApiOperation({ summary: 'دریافت کیف پول کاربر' })
  async getWallet(@Param('id') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Post('my')
  @ApiOperation({ summary: 'ساخت کیف پول' })
  async createMyWallet(@CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole) {
    return this.walletService.createMyWallet(userId, role);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'درخواست برداشت از کیف پول' })
  async requestWithdrawal(@CurrentUser('id') userId: string, @Body('amount') amount: string) {
    if (!amount) throw new BadRequestException('مبلغ برداشت الزامی است');
    return this.walletService.requestWithdrawal(userId, amount);
  }

  @Get('my/transactions')
  @ApiOperation({ summary: 'لیست تراکنش‌های کاربر' })
  async getMyTransactions(@CurrentUser('id') userId: string, @Query() query: WalletTransactionSearchDto) {
    return this.walletService.getMyTransaction(userId, query);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'تمام کیف پول‌ها (ادمین)' })
  async getAdminWallets(@Query() query: WalletSearchDto) {
    return this.walletService.getAdminWallet(query);
  }

  @Get('admin/transactions')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'تمام تراکنش‌ها (ادمین)' })
  async getAdminTransactions(@Query() query: WalletTransactionSearchDto) {
    return this.walletService.getAdminTransaction(query);
  }

  @Put('admin/withdraw/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'تأیید درخواست برداشت (ادمین)' })
  async approveWithdrawal(@Param('id') id: string, @Body('description') description?: string) {
    return this.walletService.approveWithdrawal(id, description);
  }

  @Put('admin/withdraw/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'رد درخواست برداشت (ادمین)' })
  async rejectWithdrawal(@Param('id') id: string, @Body('description') description?: string) {
    return this.walletService.rejectWithdrawal(id, description);
  }

  @Put('admin/transactions/:id/complete')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'تکمیل تراکنش (ادمین)' })
  async completeTransaction(@Param('id') id: string, @Body('description') description?: string) {
    return this.walletService.completeTransaction(id, description);
  }

  @Put('admin/transactions/:id/fail')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'شکست تراکنش (ادمین)' })
  async failTransaction(@Param('id') id: string, @Body('description') description?: string) {
    return this.walletService.failTransaction(id, description);
  }

  @Delete('admin/transactions/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'حذف تراکنش (ادمین)' })
  async deleteTransaction(@Param('id') id: string) {
    return this.walletService.deleteTransaction(id);
  }
}