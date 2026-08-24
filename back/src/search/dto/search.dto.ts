import { IsOptional, IsString, IsBoolean, IsNumber, IsEnum, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOption {
  BEST_SELLING = 'best_selling',
  POPULAR = 'popular',
  PRICE_HIGH = 'price_high',
  PRICE_LOW = 'price_low',
  NEWEST = 'newest',
}

export enum ProductConditionDto {
  NEW = 'new',
  USED = 'used',
}

export class SearchProductsDto {
  @ApiPropertyOptional({ description: 'عبارت مورد نظر برای جستجو در عنوان و توضیحات', example: 'lenovo' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'اسلاگ یا نام برند', example: 'adidas' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'فقط محصولات دارای تخفیف', type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasOffer?: boolean;

  @ApiPropertyOptional({ description: 'فقط محصولات ویژه', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  featured?: boolean;

  @ApiPropertyOptional({ description: 'وضعیت سلامت کالا', enum: ProductConditionDto })
  @IsOptional()
  @IsEnum(ProductConditionDto)
  condition?: ProductConditionDto;

  @ApiPropertyOptional({ description: 'ایدی دسته' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'شناسه فروشنده', example: 'uuid-seller-id' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ description: 'حداقل قیمت', type: Number, example: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'حداکثر قیمت', type: Number, example: 5000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'نوع مرتب‌سازی', enum: SortOption, default: SortOption.NEWEST })
  @IsOptional()
  @IsEnum(SortOption)
  sortBy?: SortOption = SortOption.NEWEST;

  @ApiPropertyOptional({ description: 'شماره صفحه', type: Number, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'تعداد آیتم در هر صفحه', type: Number, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}