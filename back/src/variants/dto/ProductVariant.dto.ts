import { IsString, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeValueDto {
  @ApiProperty({ description: 'شناسه ویژگی', example: 'cmsncx2jv000012uu9ybj4kwi' })
  @IsString()
  attributeId!: string;

  @ApiProperty({ description: 'مقدار ویژگی', example: 'XL' })
  @IsString()
  value!: string;
}

export class CreateProductVariantDto {
  @ApiProperty({ description: 'نام تنوع', example: 'Samsung Galaxy S24 - Black' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'نام انگلیسی تنوع', example: 'Samsung Galaxy S24 - Black' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'قیمت (تومان)', example: 35000000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'تعداد موجودی', example: 15, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ description: 'شناسه رنگ', example: '001' })
  @IsOptional()
  @IsString()
  colorId?: string;

  @ApiPropertyOptional({ description: 'آدرس تصویر', example: 'https://example.com/images/s24-black.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'شناسه تخفیف', example: '2026' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? null : value)
  discountId?: string;

  @ApiProperty({ description: 'شناسه محصول والد', example: '001' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({
    description: 'ویژگی‌های تنوع',
    type: [CreateAttributeValueDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeValueDto)
  attributes?: CreateAttributeValueDto[];
}

import { PartialType, OmitType } from '@nestjs/swagger';

export class UpdateProductVariantDto extends PartialType(
  OmitType(CreateProductVariantDto, ['productId'] as const),
) { }