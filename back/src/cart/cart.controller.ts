/**
 * CartController - کنترلر سبد خرید
 */
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @ApiOperation({ summary: 'مشاهده سبد خرید' })
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Get('count')
  @ApiOperation({ summary: 'تعداد آیتم‌های سبد خرید' })
  async getCount(@CurrentUser('id') userId: string) {
    return this.cartService.getCartCount(userId);
  }

  @Post()
  @ApiOperation({ summary: 'افزودن به سبد خرید' })
  async addItem(@CurrentUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'به‌روزرسانی تعداد آیتم' })
  async updateItem(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'حذف آیتم از سبد خرید' })
  async removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @Delete()
  @ApiOperation({ summary: 'خالی کردن سبد خرید' })
  async clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
