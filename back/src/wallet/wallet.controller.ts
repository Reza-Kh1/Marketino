/**
 * WalletController - کنترلر کیف پول
 */
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'کیف پول و تراکنش‌ها' })
  async getWallet(@CurrentUser('id') userId: string, @Query('page') page?: number) {
    return this.walletService.getWallet(userId, page);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'درخواست برداشت' })
  async withdraw(@CurrentUser('id') userId: string, @Body('amount') amount: number) {
    return this.walletService.requestWithdrawal(userId, amount);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'درآمد فروشنده' })
  async getEarnings(@CurrentUser('id') userId: string) {
    return this.walletService.getSellerEarnings(userId);
  }
}
