/**
 * Cart DTOs - اشیاء انتقال داده سبد خرید
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({ description: 'شناسه محصول' })
  @IsString()
  productId!: string;

  @ApiProperty({ description: 'شناسه ویژگی محصول' })
  @IsString()
  variantId!: string;

  @ApiPropertyOptional({ description: 'تعداد', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'تعداد جدید' })
  @Type(() => Number)
  @IsNumber()
  quantity!: number;
}
