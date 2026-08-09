/**
 * Product DTOs - اشیاء انتقال داده محصولات
 */
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength, IsBoolean, IsDateString, IsArray, IsJSON, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma, ProductCondition, ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'آرایه‌ای از شناسه‌ عکس‌های آپلودشده',
    type: [String],
    example: ['a1b2c3d4-...', 'e5f6g7h8-...'],
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ description: 'عنوان فارسی محصول' })
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiProperty({
    description: 'مشخصات محصول',
    example: { headers: ['ویژگی', 'مقدار'], rows: [['رنگ', 'مشکی']] },
  })
  @IsOptional()
  @IsObject()
  productTable?: Prisma.InputJsonValue;

  @IsOptional()
  @IsObject()
  productTableEn?: Prisma.InputJsonValue;

  @ApiProperty({ description: 'وضعیت محصول' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'عنوان انگلیسی محصول' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  titleEn?: string;

  @ApiProperty({ description: 'توضیحات فارسی محصول' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ description: 'توضیحات انگلیسی محصول' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'برند' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'وزن به گرم' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: 'ابعاد (مثال: 20x15x10)' })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({ description: 'وضعیت محصول', default: 'new', enum: ['new', 'used'] })
  @IsOptional()
  @IsString()
  condition?: ProductCondition;

  @ApiProperty({ description: 'شناسه دسته‌بندی' })
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional({ description: 'عنوان متا فارسی' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'عنوان متا انگلیسی' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaTitleEn?: string;

  @ApiPropertyOptional({ description: 'توضیحات متا فارسی' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'توضیحات متا انگلیسی' })
  @IsOptional()
  @IsString()
  metaDescriptionEn?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) { }

export class ProductFilterDto {
  @ApiPropertyOptional({ description: 'شناسه دسته‌بندی' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'شناسه فروشنده' })
  @IsOptional()
  @IsString()
  seller?: string;

  @ApiPropertyOptional({ description: 'وضعیت محصول' })
  @IsOptional()
  @IsString()
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'حداقل قیمت' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'حداکثر قیمت' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'مرتب‌سازی', enum: ['price_asc', 'price_desc', 'newest', 'oldest', 'popular', 'rating'] })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'شماره صفحه', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'تعداد در هر صفحه', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
