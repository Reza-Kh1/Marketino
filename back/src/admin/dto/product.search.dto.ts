import { IsOptional, IsIn, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductCondition, ProductStatus } from '@prisma/client';

export class ProductSearchDto {
  @ApiPropertyOptional({ description: 'وضعیت محصول', enum: ['all', ...Object.values(ProductStatus)] })
  @IsOptional()
  @IsString()
  status?: ProductStatus | 'all';

  @ApiPropertyOptional({ description: 'وضعیت استفاده', enum: ['all', ...Object.values(ProductCondition)] })
  @IsOptional()
  @IsString()
  condition?: ProductCondition | 'all';

  @ApiPropertyOptional({ description: 'محصول ویژه است یا خیر' })
  @IsOptional()
  @IsString()
  featured?: string;

  @ApiPropertyOptional({ description: 'آیدی تخفیف' })
  @IsOptional()
  @IsString()
  discountId?: string;

  @ApiPropertyOptional({ description: 'جستجوی متن محصول' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'مرتب‌سازی محصولات',
    enum: ['updatedAt', 'saleCount-up', 'saleCount-down', 'rating-up', 'rating-down', 'reviewCount-up', 'reviewCount-down']
  })
  @IsOptional()
  @IsString()
  @IsIn(['updatedAt', 'saleCount-up', 'saleCount-down', 'rating-up', 'rating-down', 'reviewCount-up', 'reviewCount-down'])
  sort?: 'updatedAt' | 'saleCount-up' | 'saleCount-down' | 'rating-up' | 'rating-down' | 'reviewCount-up' | 'reviewCount-down';

  @ApiPropertyOptional({ description: 'بر اساس دسته‌بندی خاص' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'محصولات یک فروشنده خاص' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({ description: 'برند خاص' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ example: 1, description: 'شماره صفحه' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ example: 10, description: 'تعداد آیتم در هر صفحه' })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}