/**
 * WishlistController - کنترلر علاقه‌مندی‌ها
 */
import { Controller, Get, Post, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Get()
  @ApiOperation({ summary: 'لیست علاقه‌مندی‌ها' })
  async getWishlist(@CurrentUser('id') userId: string, @Query('page') page: number) {
    return this.wishlistService.getUserWishlist(userId, page);
  }


  @Get('ids')
  @ApiOperation({ summary: 'تمام آیدی محصولات علاقه مندی شده' })
  async allIds(@CurrentUser('id') userId: string) {
    return this.wishlistService.getAllIds(userId);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'افزودن به علاقه‌مندی‌ها' })
  async add(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.addItem(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'حذف از علاقه‌مندی‌ها' })
  async remove(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.removeItem(userId, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'بررسی وجود در علاقه‌مندی‌ها' })
  async check(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.checkItem(userId, productId);
  }
}
