/**
 * Category DTOs - اشیاء انتقال داده دسته‌بندی
 */
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, MaxLength, isBoolean, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ description: 'نام فارسی دسته‌بندی' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'نام انگلیسی' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'توضیحات فارسی' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'توضیحات انگلیسی' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'شناسه والد (برای ساختار درختی)' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'نام آیکون' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'ترتیب نمایش', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number;

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

  @ApiPropertyOptional({ description: 'آدرس تصویر' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'وضعیت دسته' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }
