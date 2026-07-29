/**
 * Category DTOs - اشیاء انتقال داده دسته‌بندی
 */
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, MaxLength, isBoolean, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class BrandDto {
    @ApiProperty({ description: 'نام فارسی دسته‌بندی' })
    @IsString()
    @MaxLength(200)
    name!: string;

    @ApiPropertyOptional({ description: 'نام انگلیسی' })
    @IsString()
    @MaxLength(200)
    nameEn!: string;

    @ApiProperty({ description: 'اسلاگ برند' })
    @IsString()
    @MaxLength(200)
    slug!: string;

    @ApiPropertyOptional({ description: 'لوگو' })
    @IsOptional()
    @IsString()
    logo?: string;

    @ApiPropertyOptional({ description: 'توضیحات برند' })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    description?: string;
}