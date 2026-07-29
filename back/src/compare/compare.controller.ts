/**
 * CompareController - کنترلر مقایسه
 */
import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompareService } from './compare.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Compare')
@Controller('compare')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get()
  @ApiOperation({ summary: 'لیست مقایسه کاربر' })
  async getCompare(@CurrentUser('id') userId: string) {
    return this.compareService.getUserCompare(userId);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'افزودن به لیست مقایسه' })
  async add(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.compareService.addItem(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'حذف از لیست مقایسه' })
  async remove(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.compareService.removeItem(userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'خالی کردن لیست مقایسه' })
  async clear(@CurrentUser('id') userId: string) {
    return this.compareService.clearCompare(userId);
  }
}
